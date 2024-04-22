package com.lifeplus.lifeleaf.uploader.ota

import android.content.Context
import android.os.Bundle
import com.cypress.cysmart.CommonUtils.Constants
import com.cypress.cysmart.CommonUtils.ConvertUtils
import com.cypress.cysmart.CommonUtils.Logger
import com.cypress.cysmart.CommonUtils.Utils
import com.cypress.cysmart.OTAFirmwareUpdate.BootLoaderCommands_v1
import com.lifeplus.lifeleaf.uploader.ble.BleService.Companion.ACTION_OTA_DATA_AVAILABLE_V1
import com.lifeplus.lifeleaf.uploader.ble.BleService.Companion.ACTION_OTA_STATUS_V1

/**
 * Receiver class for OTA response
 */
class ResponseReceiver(
    private val mContext: Context,
    private val mStatusReceiver: ResponseListener
) : ResponseListener {

    override fun onResponse(action: String, extras: Bundle) {
        if (ACTION_OTA_DATA_AVAILABLE_V1 == action) {
            val state = Utils.getStringSharedPreference(mContext, Constants.PREF_BOOTLOADER_STATE)
            val respBytes = extras.getByteArray(Constants.EXTRA_BYTE_VALUE)
            when {
                state.equals("" + BootLoaderCommands_v1.ENTER_BOOTLOADER, ignoreCase = true) -> {
                    parseEnterBootLoaderCmdResponse(respBytes)
                }
                state.equals(BootLoaderCommands_v1.POST_SYNC_ENTER_BOOTLOADER, ignoreCase = true) -> {
                    parseEnterBootLoaderCmdResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.SET_APP_METADATA, ignoreCase = true) -> {
                    parseSetAppMetadataResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.SEND_DATA, ignoreCase = true) -> {
                    parseSendDataCmdResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.SET_EIV, ignoreCase = true) -> {
                    parseSetEivCmdResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.PROGRAM_DATA, ignoreCase = true) -> {
                    parseProgramDataCmdResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.VERIFY_APP, ignoreCase = true) -> {
                    parseVerifyAppResponse(respBytes)
                }
                state.equals("" + BootLoaderCommands_v1.EXIT_BOOTLOADER, ignoreCase = true) -> {
                    parseExitBootloaderCmdResponse(respBytes)
                }
                else -> {
                    Logger.e("Unknown PREF_BOOTLOADER_STATE: $state")
                }
            }
        }
    }

    private fun parseEnterBootLoaderCmdResponse(response: ByteArray?) {
        Logger.e("EnterBootloader response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            var dataPos = RESP_DATA_START
            val siliconIdLength = 4
            val siliconId = ConvertUtils.byteArraySubset(response, dataPos, siliconIdLength)
            dataPos += siliconIdLength
            val siliconRevLength = 1
            val siliconRev = ConvertUtils.byteArraySubset(response, dataPos, siliconRevLength)
            val siliconRevision = if (siliconRev.isNotEmpty()) siliconRev[0] else 0
            dataPos += siliconRevLength
            val btldrSdkVerLength = 3
            val btldrSdkVer = ConvertUtils.byteArraySubset(response, dataPos, btldrSdkVerLength)
            val bundle = Bundle()
            bundle.putByteArray(Constants.EXTRA_SILICON_ID, siliconId)
            bundle.putByte(Constants.EXTRA_SILICON_REV, siliconRevision)
            bundle.putByteArray(Constants.EXTRA_BTLDR_SDK_VER, btldrSdkVer)
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, bundle)
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseSetAppMetadataResponse(response: ByteArray?) {
        Logger.e("SetActiveApplication response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, Bundle())
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseSendDataCmdResponse(response: ByteArray?) {
        Logger.e("SendData response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, Bundle())
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseSetEivCmdResponse(response: ByteArray?) {
        Logger.e("SetEiv response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, Bundle())
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseProgramDataCmdResponse(response: ByteArray?) {
        Logger.e("ProgramData response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, Bundle())
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseVerifyAppResponse(response: ByteArray?) {
        Logger.e("VerifyApplication response>>>>>" + Utils.byteArrayToHex(response))
        val statusCode = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_STATUS_CODE_START, RESP_STATUS_CODE_SIZE)
        if (statusCode == CASE_SUCCESS) {
            Logger.i("CYRET_SUCCESS")
            val bundle = Bundle()
            val verifyStatus = ConvertUtils.byteArrayToIntLittleEndian(response, RESP_DATA_START, 1)
            bundle.putByte(Constants.EXTRA_VERIFY_APP_STATUS, verifyStatus.toByte())
            mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, bundle)
        } else {
            broadCastErrors(statusCode)
            Logger.i("CYRET_ERROR")
        }
    }

    private fun parseExitBootloaderCmdResponse(response: ByteArray?) {
        Logger.e("ExitBootloader response>>>>>" + Utils.byteArrayToHex(response))
        mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, Bundle())
    }

    private fun broadCastErrorMessage(errorMessage: String) {
        val bundle = Bundle()
        bundle.putString(Constants.EXTRA_ERROR_OTA, errorMessage)
        mStatusReceiver.onResponse(ACTION_OTA_STATUS_V1, bundle)
    }

    private fun broadCastErrors(errorKey: Int) {
        when (errorKey) {
            CASE_ERR_FILE -> {
                Logger.i("CYRET_ERR_FILE")
                broadCastErrorMessage(CYRET_ERR_FILE)
            }
            CASE_ERR_EOF -> {
                Logger.i("CYRET_ERR_EOF")
                broadCastErrorMessage(CYRET_ERR_EOF)
            }
            CASE_ERR_LENGTH -> {
                Logger.i("CYRET_ERR_LENGTH")
                broadCastErrorMessage(CYRET_ERR_LENGTH)
            }
            CASE_ERR_DATA -> {
                Logger.i("CYRET_ERR_DATA")
                broadCastErrorMessage(CYRET_ERR_DATA)
            }
            CASE_ERR_CMD -> {
                Logger.i("CYRET_ERR_CMD")
                broadCastErrorMessage(CYRET_ERR_CMD)
            }
            CASE_ERR_DEVICE -> {
                Logger.i("CYRET_ERR_DEVICE")
                broadCastErrorMessage(CYRET_ERR_DEVICE)
            }
            CASE_ERR_VERSION -> {
                Logger.i("CYRET_ERR_VERSION")
                broadCastErrorMessage(CYRET_ERR_VERSION)
            }
            CASE_ERR_CHECKSUM -> {
                Logger.i("CYRET_ERR_CHECKSUM")
                broadCastErrorMessage(CYRET_ERR_CHECKSUM)
            }
            CASE_ERR_ARRAY -> {
                Logger.i("CYRET_ERR_ARRAY")
                broadCastErrorMessage(CYRET_ERR_ARRAY)
            }
            CASE_ERR_ROW -> {
                Logger.i("CYRET_ERR_ROW")
                broadCastErrorMessage(CYRET_ERR_ROW)
            }
            CASE_BTLDR -> {
                Logger.i("CYRET_BTLDR")
                broadCastErrorMessage(CYRET_BTLDR)
            }
            CASE_ERR_APP -> {
                Logger.i("CYRET_ERR_APP")
                broadCastErrorMessage(CYRET_ERR_APP)
            }
            CASE_ERR_ACTIVE -> {
                Logger.i("CYRET_ERR_ACTIVE")
                broadCastErrorMessage(CYRET_ERR_ACTIVE)
            }
            CASE_ERR_UNK -> {
                Logger.i("CYRET_ERR_UNK")
                broadCastErrorMessage(CYRET_ERR_UNK)
            }
            CASE_ABORT -> {
                Logger.i("CYRET_ABORT")
                broadCastErrorMessage(CYRET_ABORT)
            }
            else -> Logger.i("CYRET_DEFAULT")
        }
    }

    companion object {
        const val RESP_STATUS_CODE_START = 1
        const val RESP_STATUS_CODE_SIZE = 1
        const val RESP_DATA_START = 4

        // Switch case Constants
        private const val CASE_SUCCESS = 0
        private const val CASE_ERR_FILE = 1
        private const val CASE_ERR_EOF = 2
        private const val CASE_ERR_LENGTH = 3
        private const val CASE_ERR_DATA = 4
        private const val CASE_ERR_CMD = 5
        private const val CASE_ERR_DEVICE = 6
        private const val CASE_ERR_VERSION = 7
        private const val CASE_ERR_CHECKSUM = 8
        private const val CASE_ERR_ARRAY = 9
        private const val CASE_ERR_ROW = 10
        private const val CASE_BTLDR = 11
        private const val CASE_ERR_APP = 12
        private const val CASE_ERR_ACTIVE = 13
        private const val CASE_ERR_UNK = 14
        private const val CASE_ABORT = 15

        // Error Constants
        private const val CYRET_ERR_FILE = "CYRET_ERR_FILE"
        private const val CYRET_ERR_EOF = "CYRET_ERR_EOF"
        private const val CYRET_ERR_LENGTH = "CYRET_ERR_LENGTH"
        private const val CYRET_ERR_DATA = "CYRET_ERR_DATA"
        private const val CYRET_ERR_CMD = "CYRET_ERR_CMD"
        private const val CYRET_ERR_DEVICE = "CYRET_ERR_DEVICE"
        private const val CYRET_ERR_VERSION = "CYRET_ERR_VERSION"
        private const val CYRET_ERR_CHECKSUM = "CYRET_ERR_CHECKSUM"
        private const val CYRET_ERR_ARRAY = "CYRET_ERR_ARRAY"
        private const val CYRET_BTLDR = "CYRET_BTLDR"
        private const val CYRET_ERR_APP = "CYRET_ERR_APP"
        private const val CYRET_ERR_ACTIVE = "CYRET_ERR_ACTIVE"
        private const val CYRET_ERR_UNK = "CYRET_ERR_UNK"
        private const val CYRET_ERR_ROW = "CYRET_ERR_ROW"
        private const val CYRET_ABORT = "CYRET_ABORT"
    }
}
