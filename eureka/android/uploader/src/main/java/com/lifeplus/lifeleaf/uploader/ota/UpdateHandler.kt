package com.lifeplus.lifeleaf.uploader.ota

import android.bluetooth.BluetoothGattCharacteristic
import android.content.Context
import android.os.Bundle
import com.cypress.cysmart.CommonUtils.CheckSumUtils
import com.cypress.cysmart.CommonUtils.Constants
import com.cypress.cysmart.CommonUtils.ConvertUtils
import com.cypress.cysmart.CommonUtils.Logger
import com.cypress.cysmart.CommonUtils.Utils
import com.cypress.cysmart.OTAFirmwareUpdate.BootLoaderCommands_v1
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFUHandler
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFirmwareWrite_v1
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.AppInfo
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.EIV
import com.lifeplus.lifeleaf.uploader.UpdateResultListener
import com.lifeplus.lifeleaf.uploader.ble.BleService
import java.io.File
import java.util.Arrays

class UpdateHandler(
    private val context: Context,
    private val mOtaCharacteristic: BluetoothGattCharacteristic,
    private val mBleService: BleService,
    private val mFile: File,
    private val resultListener: UpdateResultListener
) : OTAFUHandler {

    private var mActiveApp = Constants.ACTIVE_APP_NO_CHANGE
    private var mOtaFirmwareWrite: OTAFirmwareWrite_v1? = null
    private var mFileContents: Map<String, List<OTAFlashRowModel_v1>>? = null
    private var mCheckSumType: Byte = 0
    private var mSyncRetryNum = 0
    private var mProgramRetryNum = 0
    private var mFlowRetryNum = 0
    private var mReprogramCurrentRow = false
    private val mMaxDataSize =
        if (mOtaCharacteristic.properties and BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE != 0) {
            BootLoaderCommands_v1.WRITE_NO_RESP_MAX_DATA_SIZE
        } else {
            BootLoaderCommands_v1.WRITE_WITH_RESP_MAX_DATA_SIZE
        }

    private val otaStatusReceiver = object : ResponseListener {
        override fun onResponse(action: String, extras: Bundle) {
            synchronized(this) {
                val bootloaderState = Utils.getStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE)
                if (action == BleService.ACTION_OTA_STATUS_V1) {
                    processOTAStatus(bootloaderState, extras)
                }
            }
        }
    }
    private val otaDataReceiver =
        ResponseReceiver(
            context,
            otaStatusReceiver
        )

    init {
        mBleService.statusReceiver = otaStatusReceiver
        mBleService.dataReceiver = otaDataReceiver
    }

    override fun prepareFileWrite() {
        mOtaFirmwareWrite = OTAFirmwareWrite_v1(mOtaCharacteristic, mBleService)
        val customFileReader = UpdateFileReader(mFile)
        /*
         * Reads the file content and provides a 1 second delay
         */
        try {
            mFileContents = customFileReader.readLines()
            startOTA()
        } catch (e: Exception) {
            resultListener.onFileParseError(e)
        }
    }

    private fun startOTA() {
        mFlowRetryNum = 0
        mProgramRetryNum = mFlowRetryNum
        mSyncRetryNum = mProgramRetryNum
        mReprogramCurrentRow = false
        processOTAStatus(BEGIN, Bundle())
    }

    override fun processOTAStatus(strStatus: String, extras: Bundle) {
        var status = strStatus
        if (extras.containsKey(Constants.EXTRA_ERROR_OTA) && FLOW_RETRY_LIMIT > mFlowRetryNum) {
            if (status.equals("" + BootLoaderCommands_v1.SYNC, ignoreCase = true) ||
                status.equals(BootLoaderCommands_v1.POST_SYNC_ENTER_BOOTLOADER, ignoreCase = true)
            ) {
                if (SYNC_RETRY_LIMIT > mSyncRetryNum) {
                    ++mSyncRetryNum
                    Logger.d(
                        String.format("Sync retry# %d; Flow retry# %d", mSyncRetryNum, mFlowRetryNum)
                    )
                } else {
                    // Fail
                    reportError(status, extras)
                    return
                }
            } else if (
                (
                    status.equals("" + BootLoaderCommands_v1.SEND_DATA, ignoreCase = true) ||
                        status.equals("" + BootLoaderCommands_v1.PROGRAM_DATA, ignoreCase = true)
                    ) &&
                PROGRAM_RETRY_LIMIT > mProgramRetryNum
            ) {
                mReprogramCurrentRow = true
                ++mProgramRetryNum
                val rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO) // Get current row
                Logger.d(
                    String.format("Reprogramming row# %d; Command retry# %d; Flow retry# %d", rowNum, mProgramRetryNum, mFlowRetryNum)
                )
            } else {
                mReprogramCurrentRow = false
                ++mFlowRetryNum
                Logger.d(String.format("Flow retry# %d", mFlowRetryNum))
            }

            // Send SYNC(unacknowledged) ...
            mBleService.setSyncCommandFlag(true)
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.SYNC)
            mOtaFirmwareWrite!!.OTASyncCmd(mCheckSumType)
            return
        }

        // Fail
        if (extras.containsKey(Constants.EXTRA_ERROR_OTA)) {
            reportError(status, extras)
            return
        }

        // ... followed by ENTER_BOOTLOADER
        if (status.equals("" + BootLoaderCommands_v1.SYNC, ignoreCase = true)) {
            // Send Enter Bootloader command
            val headerRow = mFileContents!![UpdateFileReader.KEY_HEADER]!![0] as OTAFlashRowModel_v1.Header
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, BootLoaderCommands_v1.POST_SYNC_ENTER_BOOTLOADER)
            mOtaFirmwareWrite!!.OTAEnterBootLoaderCmd(mCheckSumType, headerRow.mProductId)
            return
        }
        mSyncRetryNum = 0
        if (status.equals(BootLoaderCommands_v1.POST_SYNC_ENTER_BOOTLOADER, ignoreCase = true)) {
            if (mReprogramCurrentRow) {
                mReprogramCurrentRow = false
                // Re-send failed row
                Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0) // Start with position 0 in the row
                val rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO) // Get current row
                writeEivOrData(rowNum)
                return
            } else {
                Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO, 0) // Start with row 0
                Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0) // Start with position 0 in the row
                status = BEGIN
            }
        }
        if (status.equals(BEGIN, ignoreCase = true)) {
            /*
             * Always start the programming from the first line
             */
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO, 0)
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0)
            val headerRow = mFileContents!![UpdateFileReader.KEY_HEADER]!![0] as OTAFlashRowModel_v1.Header
            mCheckSumType = headerRow.mCheckSumType
            mActiveApp = headerRow.mAppId

            // Send Enter Bootloader command
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.ENTER_BOOTLOADER)
            mOtaFirmwareWrite!!.OTAEnterBootLoaderCmd(mCheckSumType, headerRow.mProductId)
        } else if (status.equals("" + BootLoaderCommands_v1.ENTER_BOOTLOADER, ignoreCase = true)) {
            if (extras.containsKey(Constants.EXTRA_SILICON_ID) && extras.containsKey(Constants.EXTRA_SILICON_REV)) {
                val headerRow = mFileContents!![UpdateFileReader.KEY_HEADER]!![0] as OTAFlashRowModel_v1.Header
                val siliconIdReceived = extras.getByteArray(Constants.EXTRA_SILICON_ID)
                val siliconRevReceived = extras.getByte(Constants.EXTRA_SILICON_REV)
                if (Arrays.equals(headerRow.mSiliconId, siliconIdReceived) &&
                    headerRow.mSiliconRev == siliconRevReceived
                ) {
                    // Send Set Application Metadata command
                    val appInfoRow = mFileContents!![UpdateFileReader.KEY_APPINFO]!![0] as AppInfo
                    Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.SET_APP_METADATA)
                    mOtaFirmwareWrite!!.OTASetAppMetadataCmd(mCheckSumType, mActiveApp, appInfoRow.mAppStart, appInfoRow.mAppSize)
                } else {
                    // Wrong SiliconId and SiliconRev
                    resultListener.onFileParseError(Exception("Wrong SiliconId or SiliconRev."))
                }
            } else {
                // No SiliconId and SiliconRev
                if (FLOW_RETRY_LIMIT > mFlowRetryNum) {
                    Logger.d("ENTER_BOOTLOADER returned no SiliconId and SiliconRev hence retrying the whole flow")
                    extras.putString(Constants.EXTRA_ERROR_OTA, "CYRET_ERR_UNK") // Emulate error
                    processOTAStatus(BEGIN, extras) // Re-try complete flow
                } else {
                    resultListener.onFileParseError(Exception("No SiliconId or SiliconRev."))
                }
            }
        } else if (status.equals("" + BootLoaderCommands_v1.SET_APP_METADATA, ignoreCase = true)) {
            val rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO)
            writeEivOrData(rowNum)
        } else if (status.equals("" + BootLoaderCommands_v1.SET_EIV, ignoreCase = true)) {
            programNextRow()
        } else if (status.equals("" + BootLoaderCommands_v1.SEND_DATA, ignoreCase = true)) {
            val rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO)
            writeData(rowNum) // Program data row
        } else if (status.equals("" + BootLoaderCommands_v1.SEND_DATA_WITHOUT_RESPONSE, ignoreCase = true)) {
            val rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO)
            writeData(rowNum) // Program data row
        } else if (status.equals("" + BootLoaderCommands_v1.PROGRAM_DATA, ignoreCase = true)) {
            programNextRow()
        } else if (status.equals("" + BootLoaderCommands_v1.VERIFY_APP, ignoreCase = true)) {
            if (extras.containsKey(Constants.EXTRA_VERIFY_APP_STATUS)) {
                val statusReceived = extras.getByte(Constants.EXTRA_VERIFY_APP_STATUS)
                if (statusReceived.toInt() == 1) {
                    // Send ExitBootloader command
                    Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.EXIT_BOOTLOADER)
                    mOtaFirmwareWrite!!.OTAExitBootloaderCmd(mCheckSumType)
                } else {
                    resultListener.onVerifyAppError()
                }
            }
        } else if (status.equals("" + BootLoaderCommands_v1.EXIT_BOOTLOADER, ignoreCase = true)) {
            mBleService.bleTimeoutHandler.cancel()
            resultListener.onSuccess()
        }
    }

    private fun programNextRow() {
        var rowNum = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO)
        rowNum++ // Increment row number
        mProgramRetryNum = 0
        val dataRows = mFileContents!![UpdateFileReader.KEY_DATA]!!
        // Update progress bar
        val totalLines = dataRows.size
        if (rowNum < totalLines) { // Process next row
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO, rowNum)
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0)
            writeEivOrData(rowNum)
        }
        if (rowNum == totalLines) { // All rows have been processed
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_NO, 0)
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0)
            // Programming done, send VerifyApplication command
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.VERIFY_APP)
            mOtaFirmwareWrite!!.OTAVerifyAppCmd(mCheckSumType, mActiveApp)
        }
    }

    private fun reportError(status: String, extras: Bundle) {
        val errorString = extras.getString(Constants.EXTRA_ERROR_OTA)
        var statusString = status
        try {
            statusString = "0x" + Integer.toHexString(status.toInt())
        } catch (e: NumberFormatException) {
            e.printStackTrace()
        }
        Logger.e(String.format("command %s failed with error: %s", statusString, errorString))
        resultListener.onCommunicationError(Exception("Error in communication with remote device"))
    }

    private fun writeEivOrData(rowNum: Int) {
        val dataRows = mFileContents!![UpdateFileReader.KEY_DATA]!!
        val dataRow = dataRows[rowNum]
        if (dataRow is EIV) {
            writeEiv(rowNum) // Set EIV
        } else if (dataRow is OTAFlashRowModel_v1.Data) {
            writeData(rowNum) // Program data row
        }
    }

    private fun writeData(rowNum: Int) {
        var startPosition = Utils.getIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS)
        val dataRow = mFileContents!![UpdateFileReader.KEY_DATA]!![rowNum] as OTAFlashRowModel_v1.Data
        var payloadLength = dataRow.mData.size - startPosition
        val isLastPacket = payloadLength <= mMaxDataSize
        if (!isLastPacket) {
            payloadLength = mMaxDataSize
        }
        val payload = ByteArray(payloadLength)
        for (i in 0 until payloadLength) {
            val b = dataRow.mData[startPosition]
            payload[i] = b
            startPosition++
        }
        if (!isLastPacket) {
            // Send SendData command
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, startPosition)
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.SEND_DATA)
            mOtaFirmwareWrite!!.OTASendDataCmd(mCheckSumType, payload)
        } else {
            // Send ProgramData command
            val crc32 = CheckSumUtils.crc32(dataRow.mData, dataRow.mData.size.toLong())
            val baCrc32 = ConvertUtils.intToByteArray(crc32.toInt())
            Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0)
            Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.PROGRAM_DATA)
            mOtaFirmwareWrite!!.OTAProgramDataCmd(mCheckSumType, dataRow.mAddress, baCrc32, payload)
        }
    }

    private fun writeEiv(rowNum: Int) {
        val eivRow = mFileContents!![UpdateFileReader.KEY_DATA]!![rowNum] as EIV
        // Send SetEiv command
        Utils.setIntSharedPreference(context, Constants.PREF_PROGRAM_ROW_START_POS, 0)
        Utils.setStringSharedPreference(context, Constants.PREF_BOOTLOADER_STATE, "" + BootLoaderCommands_v1.SET_EIV)
        mOtaFirmwareWrite!!.OTASetEivCmd(mCheckSumType, eivRow.mEiv)
    }

    companion object {
        private const val SYNC_RETRY_LIMIT = 100
        private const val PROGRAM_RETRY_LIMIT = 10
        private const val FLOW_RETRY_LIMIT = 1 // 10
        private const val BEGIN = "OTAFUHandler_v1.BEGIN"
    }
}
