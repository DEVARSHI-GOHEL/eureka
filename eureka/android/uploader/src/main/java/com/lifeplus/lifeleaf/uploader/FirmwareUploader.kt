package com.lifeplus.lifeleaf.uploader

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattDescriptor.ENABLE_INDICATION_VALUE
import android.bluetooth.BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
import android.content.Context
import com.cypress.cysmart.CommonUtils.Logger
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFUHandler
import com.lifeplus.lifeleaf.uploader.ble.BleEventListener
import com.lifeplus.lifeleaf.uploader.ble.BleService
import com.lifeplus.lifeleaf.uploader.ota.UpdateHandler
import java.io.File
import java.io.FileNotFoundException

object FirmwareUploader {
    val nameInDfuMode = "BLE DFU Device"
    private var otaHandler: OTAFUHandler? = null
    private var updateCharacteristic: BluetoothGattCharacteristic? = null

    fun upload(
        context: Context,
        file: File,
        device: BluetoothDevice,
        callback: (UpdateResult) -> Unit
    ) {
        // check if file exists
        if (file.exists().not()) {
            callback.invoke(FileReadError(FileNotFoundException(file.name)))
            return
        }

        val updateResultListener = object : UpdateResultListener {
            override fun onCommunicationError(ex: Exception) {
                callback.invoke(CommunicationError(ex))
            }
            override fun onFileParseError(ex: Exception) {
                callback.invoke(FileParseError(ex))
            }
            override fun onVerifyAppError() {
                callback.invoke(CrcError())
            }
            override fun onSuccess() {
                callback.invoke(Success())
            }
        }
        lateinit var bleService: BleService
        val bleEventListener = object : BleEventListener {
            override fun onOtaCharacteristicDiscovered(otaCharacteristic: BluetoothGattCharacteristic) {
                updateCharacteristic = otaCharacteristic
                bleService.enableSelectedCharacteristics(listOf(otaCharacteristic))
            }

            override fun onDescriptorWriteSuccess(descriptor: BluetoothGattDescriptor) {
                if (descriptor.characteristic.uuid == updateCharacteristic?.uuid &&
                    descriptor.value in listOf(ENABLE_NOTIFICATION_VALUE, ENABLE_INDICATION_VALUE)
                ) {
                    otaHandler = UpdateHandler(
                        context,
                        updateCharacteristic!!,
                        bleService,
                        file,
                        updateResultListener
                    )
                    // starts the OTA flow
                    otaHandler?.prepareFileWrite()
                }
            }

            override fun onDescriptorWriteError(descriptor: BluetoothGattDescriptor) {
                if (descriptor.characteristic.uuid == updateCharacteristic?.uuid &&
                    descriptor.value in listOf(ENABLE_NOTIFICATION_VALUE, ENABLE_INDICATION_VALUE)
                ) {
                    callback.invoke(CommunicationError(Exception("Failed to enable notifications on OTA characteristic.")))
                }
            }

            override fun bleDeviceNotConnected() {
                callback.invoke(ConnectionError())
            }
            override fun otaCharacteristicNotFound(ex: Exception) {
                callback.invoke(CommunicationError(ex))
            }
            override fun onCommunicationError(ex: Exception, isExitBootloaderCmd: Boolean) {
                Logger.d("onCommunicationError with $isExitBootloaderCmd")
                if (isExitBootloaderCmd) {
                    callback.invoke(InstallationError())
                } else {
                    callback.invoke(CommunicationError(ex))
                }
            }
        }

        bleService = BleService(context, bleEventListener)
        bleService.connect(device)
    }
}
