package com.lifeplus.lifeleaf.uploader.ble

import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor

interface BleEventListener {
    fun onOtaCharacteristicDiscovered(otaCharacteristic: BluetoothGattCharacteristic)
    fun onDescriptorWriteSuccess(descriptor: BluetoothGattDescriptor)
    fun onDescriptorWriteError(descriptor: BluetoothGattDescriptor)
    fun bleDeviceNotConnected()
    fun otaCharacteristicNotFound(ex: Exception)
    fun onCommunicationError(ex: Exception, isExitBootloaderCmd: Boolean)
}
