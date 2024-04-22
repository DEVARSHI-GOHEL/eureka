package com.lifeplus.lifeleaf.uploader.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.cypress.cysmart.CommonUtils.Constants
import com.cypress.cysmart.CommonUtils.GattAttributes
import com.cypress.cysmart.CommonUtils.Logger
import com.cypress.cysmart.CommonUtils.UUIDDatabase
import com.cypress.cysmart.CommonUtils.Utils
import com.lifeplus.lifeleaf.uploader.ota.ResponseListener
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import java.util.UUID
import java.util.concurrent.Semaphore
import kotlin.math.max

@SuppressLint("MissingPermission")
class BleService(
    private val mContext: Context,
    private val bleEventListener: BleEventListener
) {

    private var mBluetoothDeviceAddress: String? = null
    private var mBluetoothDeviceName: String? = null

    private var mDisableEnabledCharacteristicsFlag = false
    private var mEnableSelectedCharacteristicsFlag = false
    private var mDisableSelectedCharacteristicsFlag = false
    private var mOtaExitBootloaderCmdInProgress = false

    private val writeSemaphore = Semaphore(1)
    private val mHandler = Handler(Looper.getMainLooper())
    private val mEnabledCharacteristics = ArrayList<BluetoothGattCharacteristic>()
    private var mSelectedCharacteristicsToEnable = ArrayList<BluetoothGattCharacteristic>()
    private var mSelectedCharacteristicsToDisable = ArrayList<BluetoothGattCharacteristic>()

    private var mBluetoothAdapter: BluetoothAdapter? = null
    private var mBluetoothGatt: BluetoothGatt? = null
    private var mClearCacheOnDisconnect = false
    private var mSyncCommandFlag = false

    var statusReceiver: ResponseListener? = null
    var dataReceiver: ResponseListener? = null

    val bleCommandHandler = BleCommandHandler(bleEventListener)
    val bleTimeoutHandler = BleTimeoutHandler(bleEventListener)

    init {
        // For API level 18 and above, get a reference to BluetoothAdapter through BluetoothManager.
        val mBluetoothManager = mContext.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
            ?: throw IllegalStateException("Bluetooth service is not available")

        mBluetoothAdapter = mBluetoothManager.adapter
        if (mBluetoothAdapter == null) {
            throw IllegalStateException("Bluetooth adapter is not available")
        }
    }

    private val mGattCallback: BluetoothGattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            Logger.i("onConnectionStateChange: status: $status, newState: $newState")
            // GATT Server connected
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Logger.dataLog(
                        " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Connection established "
                    )
                    var deviceConnected = false
                    val mBluetoothManager = mContext.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
                    val connectedDevices = mBluetoothManager?.getConnectedDevices(BluetoothProfile.GATT) ?: emptyList()
                    for (bluetoothDevice in connectedDevices) {
                        if (bluetoothDevice.address == mBluetoothDeviceAddress) {
                            deviceConnected = true
                            break
                        }
                    }
                    if (!deviceConnected) {
                        bleEventListener.bleDeviceNotConnected()
                        bleTimeoutHandler.cancel()
                        return
                    }

                    mBluetoothGatt?.requestMtu(MTU_NEGOTIATE_SIZE)
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Logger.dataLog(
                        " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Disconnected "
                    )

                    // mBluetoothGatt should only be accessed from within the main thread.
                    mHandler.post { // The connection might drop due to the kit being manually reset (CONFIGURATORS-899)
                        // For such cases we need to do the cleanup here
                        if (mClearCacheOnDisconnect) {
                            // Clearing Bluetooth cache before disconnecting from the device
                            if (mBluetoothGatt != null) {
                                refreshDeviceCache(mBluetoothGatt!!)
                            }
                        }
                        // ... and release connection handler
                        close()
                    }
                }
                BluetoothProfile.STATE_CONNECTING -> {
                    Logger.dataLog(
                        " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Connection establishing "
                    )
                }
                BluetoothProfile.STATE_DISCONNECTING -> {
                    Logger.dataLog(
                        " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Disconnecting "
                    )
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            // GATT Services discovered
            val dataLog = if (status == BluetoothGatt.GATT_SUCCESS) {
                " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Service discovery status - Success"
            } else {
                " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Service discovery status - Failed with error code : $status"
            }
            Logger.dataLog(dataLog)

            // get OTA service/characteristic
            var otaCharFound = false
            val otaService = mBluetoothGatt!!.getService(UUIDDatabase.UUID_OTA_UPDATE_SERVICE)
            if (otaService != null) {
                val otaCharacteristic = otaService.getCharacteristic(UUIDDatabase.UUID_OTA_CHARACTERISTIC)
                if (otaCharacteristic != null) {
                    bleEventListener.onOtaCharacteristicDiscovered(otaCharacteristic)
                    otaCharFound = true
                }
            }
            if (!otaCharFound) {
                bleEventListener.otaCharacteristicNotFound(Exception("OTA characteristic not found."))
                bleTimeoutHandler.cancel()
            }
        }

        override fun onDescriptorWrite(
            gatt: BluetoothGatt,
            descriptor: BluetoothGattDescriptor,
            status: Int
        ) {
            val serviceUUID = descriptor.characteristic.service.uuid.toString()
            val serviceName =
                GattAttributes.lookupUUID(descriptor.characteristic.service.uuid, serviceUUID)
            val characteristicUUID = descriptor.characteristic.uuid.toString()
            val characteristicName =
                GattAttributes.lookupUUID(descriptor.characteristic.uuid, characteristicUUID)
            val descriptorUUID = descriptor.uuid.toString()
            val descriptorName = GattAttributes.lookupUUID(descriptor.uuid, descriptorUUID)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                bleEventListener.onDescriptorWriteSuccess(descriptor)
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request status  , [00]"
                )
                if (descriptor.value != null) {
                    addRemoveData(descriptor)
                }
                if (mDisableEnabledCharacteristicsFlag) {
                    disableAllEnabledCharacteristics()
                } else if (mDisableSelectedCharacteristicsFlag) {
                    disableSelectedCharacteristics()
                } else if (mEnableSelectedCharacteristicsFlag) {
                    if (mSelectedCharacteristicsToEnable.size > 0) {
                        mSelectedCharacteristicsToEnable.removeAt(0)
                        enableSelectedCharacteristics()
                    }
                }
            } else {
                bleEventListener.onDescriptorWriteError(descriptor)
                bleTimeoutHandler.cancel()
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request status - Failed with error code : $status"
                )
                if (status != BluetoothGatt.GATT_INSUFFICIENT_AUTHENTICATION && status != BluetoothGatt.GATT_INSUFFICIENT_ENCRYPTION) {
                    mDisableEnabledCharacteristicsFlag = false
                    mDisableSelectedCharacteristicsFlag = false
                    mEnableSelectedCharacteristicsFlag = false
                }
            }
        }

        override fun onDescriptorRead(
            gatt: BluetoothGatt,
            descriptor: BluetoothGattDescriptor,
            status: Int
        ) {
            val serviceUUID = descriptor.characteristic.service.uuid.toString()
            val serviceName =
                GattAttributes.lookupUUID(descriptor.characteristic.service.uuid, serviceUUID)
            val characteristicUUID = descriptor.characteristic.uuid.toString()
            val characteristicName =
                GattAttributes.lookupUUID(descriptor.characteristic.uuid, characteristicUUID)
            val descriptorUUIDText = descriptor.uuid.toString()
            val descriptorName = GattAttributes.lookupUUID(descriptor.uuid, descriptorUUIDText)
            val descriptorValue = " " + Utils.byteArrayToHex(descriptor.value) + " "
            val dataLog = if (status == BluetoothGatt.GATT_SUCCESS) {
                " , [$serviceName|$characteristicName|$descriptorName]  Read response received with value  , [$descriptorValue]"
            } else {
                " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Read request status - Failed with error code : $status"
            }
            Logger.dataLog(dataLog)
        }

        override fun onCharacteristicWrite(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            status: Int
        ) {
            val serviceUUID = characteristic.service.uuid.toString()
            val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
            val characteristicUUID = characteristic.uuid.toString()
            val characteristicName = GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                if (!mOtaExitBootloaderCmdInProgress) {
                    bleTimeoutHandler.onCommandSent()
                    bleCommandHandler.onCommandSent()
                }
                Logger.dataLog(
                    " , [$serviceName|$characteristicName]  Write request status - Success"
                )
            } else {
                Logger.dataLog(
                    " , [$serviceName|$characteristicName]  Write request status - Failed with error code : $status"
                )

                bleEventListener.onCommunicationError(
                    Exception("Error writing to OTA characteristic."),
                    mOtaExitBootloaderCmdInProgress
                )
                bleTimeoutHandler.cancel()
                return
            }
            var isExitBootloaderCmd: Boolean
            var isSyncCommandFlag: Boolean
            synchronized(this) {
                isExitBootloaderCmd = mOtaExitBootloaderCmdInProgress
                isSyncCommandFlag = mSyncCommandFlag
                mOtaExitBootloaderCmdInProgress = false
                mSyncCommandFlag = false
            }
            if (isExitBootloaderCmd) {
                onOtaExitBootloaderComplete(status)
            }
            if (characteristic.uuid.toString()
                .equals(GattAttributes.OTA_CHARACTERISTIC, ignoreCase = true)
            ) {
                Logger.v("Release semaphore")
                writeSemaphore.release()
            }
            if (isSyncCommandFlag) {
                val extras = Bundle()
                if (BluetoothGatt.GATT_SUCCESS != status) {
                    extras.putString(Constants.EXTRA_ERROR_OTA, "" + status)
                }
                statusReceiver?.onResponse(ACTION_OTA_STATUS_V1, extras)
            }
        }

        override fun onCharacteristicRead(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            status: Int
        ) {
            val serviceUUID = characteristic.service.uuid.toString()
            val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
            val characteristicUUID = characteristic.uuid.toString()
            val characteristicName =
                GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
            val characteristicValue = " " + Utils.byteArrayToHex(characteristic.value) + " "

            // GATT Characteristic read
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Logger.dataLog(
                    " , [$serviceName|$characteristicName]  Read response received with value  , [$characteristicValue]"
                )
                broadcastNotifyUpdate(characteristic)
            } else {
                Logger.dataLog(
                    " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Read request status - Failed with error code : $status"
                )
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            bleCommandHandler.onResponse()
            val serviceUUID = characteristic.service.uuid.toString()
            val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
            val characteristicUUID = characteristic.uuid.toString()
            val characteristicName =
                GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
            val characteristicValue = Utils.byteArrayToHex(characteristic.value)
            Logger.dataLog(
                " , [$serviceName|$characteristicName]  Notification received with value  , [ $characteristicValue ]"
            )
            broadcastNotifyUpdate(characteristic)
        }

        override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
            Logger.dataLog(
                Utils.formatForRootLocale(
                    "[%1\$s | %2\$s] %3\$s request completed, MTU: %4\$d, Status: %5\$d",
                    mBluetoothDeviceName,
                    mBluetoothDeviceAddress,
                    "Exchange GATT MTU",
                    mtu,
                    status
                )
            )
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Utils.setIntSharedPreference(mContext, Constants.PREF_MTU_NEGOTIATED, mtu)
            }

            mBluetoothGatt?.discoverServices()
            Logger.dataLog(
                " , [$mBluetoothDeviceName|$mBluetoothDeviceAddress]  Connection request sent "
            )
        }
    }

    fun connect(device: BluetoothDevice) {
        Utils.setIntSharedPreference(mContext, Constants.PREF_MTU_NEGOTIATED, 0) // The actual value will be set in hte onMtuChanged callback method
        if (mBluetoothAdapter == null) {
            return
        }

        // We want to directly connect to the device, so we are setting the autoConnect parameter to false.
        mBluetoothGatt = device.connectGatt(mContext, false, mGattCallback)
        mBluetoothDeviceAddress = device.address
        mBluetoothDeviceName = device.name
        mClearCacheOnDisconnect = Utils.getBooleanSharedPreference(mContext, Constants.PREF_CLEAR_CACHE_ON_DISCONNECT)
    }

    fun writeOTABootLoaderCommand(
        characteristic: BluetoothGattCharacteristic,
        value: ByteArray,
        isExitBootloaderCmd: Boolean
    ) {
        synchronized(mGattCallback) {
            if (isExitBootloaderCmd) {
                mOtaExitBootloaderCmdInProgress = true
            }
            writeOTABootLoaderCommand(characteristic, value)
        }
    }

    fun writeOTABootLoaderCommand(characteristic: BluetoothGattCharacteristic, value: ByteArray) {
        if (characteristic.properties and BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE != 0) {
            Logger.d("WriteOTABootLoaderCommand NoResponse")
            writeOTABootLoaderCommandNoResponse(characteristic, value)
        } else {
            if (mOtaExitBootloaderCmdInProgress) {
                Logger.d("WriteOTABootLoaderCommand WithResponse exit bootloader")
                writeOTABootLoaderCommandWithResponse(characteristic, value)
            } else {
                Logger.d("WriteOTABootLoaderCommand WithResponse")
                bleCommandHandler.sendCommand {
                    writeOTABootLoaderCommandWithResponse(characteristic, value)
                }
            }
        }
    }

    private fun writeOTABootLoaderCommandNoResponse(
        characteristic: BluetoothGattCharacteristic,
        value: ByteArray
    ) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            return
        }
        val serviceUUID = characteristic.service.uuid.toString()
        val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
        val characteristicUUID = characteristic.uuid.toString()
        val characteristicName = GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
        val characteristicValue = Utils.byteArrayToHex(value)
        val mtuValue: Int = if (MTU_USE_NEGOTIATED) {
            val negotiatedMtu = Utils.getIntSharedPreference(mContext, Constants.PREF_MTU_NEGOTIATED)
            max(MTU_DEFAULT, negotiatedMtu - MTU_NUM_BYTES_TO_SUBTRACT)
        } else {
            MTU_DEFAULT
        }
        var totalLength = value.size
        var localLength = 0
        val localValue = ByteArray(mtuValue)
        do {
            try {
                Logger.v("Acquire semaphore")
                writeSemaphore.acquire()
            } catch (ie: InterruptedException) {
                ie.printStackTrace()
            }
            if (totalLength >= mtuValue) {
                for (i in 0 until mtuValue) {
                    localValue[i] = value[localLength + i]
                }
                characteristic.value = localValue
                totalLength -= mtuValue
                localLength += mtuValue
            } else {
                val lastValue = ByteArray(totalLength)
                for (i in 0 until totalLength) {
                    lastValue[i] = value[localLength + i]
                }
                characteristic.value = lastValue
                totalLength = 0
            }
            var counter = 10
            var status: Boolean
            do {
                characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                bleTimeoutHandler.onCommandSent()
                status = mBluetoothGatt!!.writeCharacteristic(characteristic)
                if (!status) {
                    Logger.v("writeCharacteristic() status: False")
                    runBlocking { delay(200) }
                }
                counter--
            } while (!status && counter > 0)
            if (status) {
                val dataLog = " , [$serviceName|$characteristicName]  Write request sent with value  , [ $characteristicValue ]"
                Logger.dataLog(dataLog)
                Logger.v(dataLog)
            } else {
                Logger.v("Release semaphore")
                writeSemaphore.release()
                Logger.v("writeOTABootLoaderCommand failed!")
            }
        } while (totalLength > 0)
    }

    private fun writeOTABootLoaderCommandWithResponse(
        characteristic: BluetoothGattCharacteristic,
        value: ByteArray
    ) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            return
        }
        val serviceUUID = characteristic.service.uuid.toString()
        val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
        val characteristicUUID = characteristic.uuid.toString()
        val characteristicName = GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
        val characteristicValue = Utils.byteArrayToHex(value)
        characteristic.value = value
        var counter = 10
        var status: Boolean
        do {
            characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
            status = mBluetoothGatt!!.writeCharacteristic(characteristic)
            if (!status) {
                Logger.v("writeCharacteristic() status: False")
                runBlocking { delay(200) }
            }
            counter--
        } while (!status && counter > 0)
        if (status) {
            val dataLog = " , [$serviceName|$characteristicName]  Write request sent with value  , [ $characteristicValue ]"
            Logger.dataLog(dataLog)
            Logger.v(dataLog)
        } else {
            Logger.v("writeOTABootLoaderCommand failed!")
            bleEventListener.onCommunicationError(
                Exception("Error writing to OTA characteristic."),
                mOtaExitBootloaderCmdInProgress
            )
            bleTimeoutHandler.cancel()
        }
    }

    fun setSyncCommandFlag(value: Boolean) {
        synchronized(mGattCallback) {
            mSyncCommandFlag = value
        }
    }

    private fun broadcastNotifyUpdate(characteristic: BluetoothGattCharacteristic) {
        val bundle = Bundle()
        // Putting the byte value read for GATT Db
        bundle.putByteArray(Constants.EXTRA_BYTE_VALUE, characteristic.value)
        bundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristic.uuid.toString())
        bundle.putInt(Constants.EXTRA_BYTE_INSTANCE_VALUE, characteristic.instanceId)
        bundle.putString(Constants.EXTRA_BYTE_SERVICE_UUID_VALUE, characteristic.service.uuid.toString())
        bundle.putInt(Constants.EXTRA_BYTE_SERVICE_INSTANCE_VALUE, characteristic.service.instanceId)
        // case for OTA characteristic received
        if (characteristic.uuid == UUIDDatabase.UUID_OTA_UPDATE_CHARACTERISTIC) {
            dataReceiver?.onResponse(ACTION_OTA_DATA_AVAILABLE_V1, bundle)
        }
    }

    private fun onOtaExitBootloaderComplete(status: Int) {
        val bundle = Bundle()
        bundle.putByteArray(Constants.EXTRA_BYTE_VALUE, byteArrayOf(status.toByte()))
        dataReceiver?.onResponse(ACTION_OTA_DATA_AVAILABLE_V1, bundle)
    }

    private fun refreshDeviceCache(gatt: BluetoothGatt): Boolean {
        try {
            val refresh = gatt.javaClass.getMethod("refresh")
            return refresh.invoke(gatt) as Boolean
        } catch (ex: Exception) {
            Logger.i("An exception occurred while refreshing device")
        }
        return false
    }

    private fun close() {
        if (mBluetoothGatt != null) {
            mBluetoothGatt!!.close()
            mBluetoothGatt = null
        }
    }

    private fun addRemoveData(descriptor: BluetoothGattDescriptor) {
        when (descriptor.value[0].toInt()) {
            0 -> {
                // Disabled notification and indication
                removeEnabledCharacteristic(descriptor.characteristic)
                Logger.e("Removed characteristic, size: " + mEnabledCharacteristics.size)
            }
            1 -> {
                // Enabled notification
                addEnabledCharacteristic(descriptor.characteristic)
                Logger.e("Added notify characteristic, size: " + mEnabledCharacteristics.size)
            }
            2 -> {
                // Enabled indication
                addEnabledCharacteristic(descriptor.characteristic)
                Logger.e("Added indicate characteristic, size: " + mEnabledCharacteristics.size)
            }
        }
    }

    private fun addEnabledCharacteristic(characteristic: BluetoothGattCharacteristic) {
        if (!mEnabledCharacteristics.contains(characteristic)) {
            mEnabledCharacteristics.add(characteristic)
        }
    }

    private fun removeEnabledCharacteristic(characteristic: BluetoothGattCharacteristic) {
        if (mEnabledCharacteristics.contains(characteristic)) {
            mEnabledCharacteristics.remove(characteristic)
        }
    }

    private fun disableAllEnabledCharacteristics() {
        if (mEnabledCharacteristics.size > 0) {
            mDisableEnabledCharacteristicsFlag = true
            val c = mEnabledCharacteristics[0]
            Utils.debug("Disabling characteristic " + c.uuid)
            when {
                c.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0 -> {
                    setCharacteristicNotification(c, false)
                }
                c.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE != 0 -> {
                    setCharacteristicIndication(c, false)
                }
                else -> {
                    Logger.e("Disabling characteristic failed as it is neither notify nor indicate")
                }
            }
        } else {
            mDisableEnabledCharacteristicsFlag = false
        }
    }

    private fun disableSelectedCharacteristics(): Boolean {
        // remove characteristics which (either/or)
        // - were never enabled
        // - have been disabled as a result of previous invocation of this method
        val it = mSelectedCharacteristicsToDisable.iterator()
        while (it.hasNext()) {
            val c = it.next()
            if (!mEnabledCharacteristics.contains(c)) {
                it.remove()
            }
        }
        if (mSelectedCharacteristicsToDisable.size > 0) {
            mDisableSelectedCharacteristicsFlag = true
            val c = mSelectedCharacteristicsToDisable[0]
            Utils.debug("Selected characteristics: disabling characteristic " + c.uuid)
            when {
                c.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0 -> {
                    setCharacteristicNotification(c, false)
                }
                c.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE != 0 -> {
                    setCharacteristicIndication(c, false)
                }
                else -> {
                    Logger.e("Disabling characteristic failed as it is neither notify nor indicate")
                }
            }
        } else {
            Utils.debug("Selected characteristics: all disabled")
            mDisableSelectedCharacteristicsFlag = false
        }
        return mDisableSelectedCharacteristicsFlag
    }

    fun enableSelectedCharacteristics(enableList: Collection<BluetoothGattCharacteristic>): Boolean {
        mSelectedCharacteristicsToEnable = ArrayList(enableList)
        return enableSelectedCharacteristics()
    }

    private fun enableSelectedCharacteristics(): Boolean {
        if (mSelectedCharacteristicsToEnable.size > 0) {
            mEnableSelectedCharacteristicsFlag = true
            val c = mSelectedCharacteristicsToEnable[0]
            Utils.debug("Selected characteristics: enabling characteristic " + c.uuid)
            when {
                c.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0 -> {
                    setCharacteristicNotification(c, true)
                }
                c.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE != 0 -> {
                    setCharacteristicIndication(c, true)
                }
                else -> {
                    Logger.e("Enabling characteristic failed as it is neither notify nor indicate")
                }
            }
        } else {
            Utils.debug("Selected characteristics: all enabled")
            mEnableSelectedCharacteristicsFlag = false
        }
        return mEnableSelectedCharacteristicsFlag
    }

    private fun setCharacteristicNotification(
        characteristic: BluetoothGattCharacteristic,
        enabled: Boolean
    ) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null || characteristic.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY == 0) {
            return
        }

        // Setting default write type according to CDT 222486
        characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
        val serviceUUID = characteristic.service.uuid.toString()
        val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
        val characteristicUUID = characteristic.uuid.toString()
        val characteristicName = GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
        val descriptorUUID = GattAttributes.CLIENT_CHARACTERISTIC_CONFIG
        val descriptorName = GattAttributes.lookupUUID(
            UUIDDatabase.UUID_CLIENT_CHARACTERISTIC_CONFIG,
            descriptorUUID
        )
        if (characteristic.getDescriptor(UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG)) != null) {
            if (enabled) {
                val descriptor = characteristic.getDescriptor(UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG))
                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                mBluetoothGatt!!.writeDescriptor(descriptor)
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request sent with value  , [${
                    Utils.byteArrayToHex(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                    }]"
                )
            } else {
                val descriptor =
                    characteristic.getDescriptor(UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG))
                descriptor.value = BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE
                mBluetoothGatt!!.writeDescriptor(descriptor)
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request sent with value  , [${
                    Utils.byteArrayToHex(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE)
                    }]"
                )
            }
        }
        mBluetoothGatt!!.setCharacteristicNotification(characteristic, enabled)
        val dataLog = if (enabled) {
            " , [$serviceName|$characteristicName]  Start notification request sent "
        } else {
            " , [$serviceName|$characteristicName]  Stop notification request sent "
        }
        Logger.dataLog(dataLog)
    }

    private fun setCharacteristicIndication(
        characteristic: BluetoothGattCharacteristic,
        enabled: Boolean
    ) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null || characteristic.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE == 0) {
            return
        }

        // Setting default write type according to CDT 222486
        characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
        val serviceUUID = characteristic.service.uuid.toString()
        val serviceName = GattAttributes.lookupUUID(characteristic.service.uuid, serviceUUID)
        val characteristicUUID = characteristic.uuid.toString()
        val characteristicName = GattAttributes.lookupUUID(characteristic.uuid, characteristicUUID)
        val descriptorUUID = GattAttributes.CLIENT_CHARACTERISTIC_CONFIG
        val descriptorName = GattAttributes.lookupUUID(
            UUIDDatabase.UUID_CLIENT_CHARACTERISTIC_CONFIG,
            descriptorUUID
        )
        if (characteristic.getDescriptor(UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG)) != null) {
            val descriptor = characteristic.getDescriptor(UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG))
            if (enabled) {
                descriptor.value = BluetoothGattDescriptor.ENABLE_INDICATION_VALUE
                mBluetoothGatt!!.writeDescriptor(descriptor)
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request sent with value  , [${
                    Utils.byteArrayToHex(BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)
                    }]"
                )
            } else {
                descriptor.value = BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE
                mBluetoothGatt!!.writeDescriptor(descriptor)
                Logger.dataLog(
                    " , [$serviceName|$characteristicName|$descriptorName]  Write request sent with value  , [${
                    Utils.byteArrayToHex(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE)
                    }]"
                )
            }
        }
        mBluetoothGatt!!.setCharacteristicNotification(characteristic, enabled)
        var dataLog = " , [$serviceName|$characteristicName] "
        dataLog += if (enabled) {
            " Start indication request sent "
        } else {
            " Stop indication request sent "
        }
        Logger.dataLog(dataLog)
    }

    companion object {
        const val ACTION_OTA_DATA_AVAILABLE_V1 = "com.cysmart.bluetooth.le.ACTION_OTA_DATA_AVAILABLE_V1"

        const val ACTION_OTA_STATUS_V1 = "com.cysmart.bluetooth.le.ACTION_OTA_STATUS_V1"

        const val MTU_USE_NEGOTIATED = true // Use negotiated MTU vs MTU_DEFAULT(20)
        const val MTU_DEFAULT = 20 // MIN_MTU(23) - 3
        const val MTU_NUM_BYTES_TO_SUBTRACT = 3 // 3 bytes need to be subtracted
        const val MTU_NEGOTIATE_SIZE = 512
    }
}
