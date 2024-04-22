package com.lifeplus.lifeleaf.uploader

import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import com.lifeplus.lifeleaf.uploader.ble.BleEventListener
import com.lifeplus.lifeleaf.uploader.ble.BleTimeoutHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import org.junit.Test
import java.util.concurrent.TimeUnit

class BleTimeoutHandlerUnitTest {

    @Test
    fun bleTimeoutHandlerUnitTest() {
        var communicationError: Exception? = null
        val bleEventListener = object : BleEventListener {
            override fun onOtaCharacteristicDiscovered(otaCharacteristic: BluetoothGattCharacteristic) {}
            override fun onDescriptorWriteSuccess(descriptor: BluetoothGattDescriptor) {}
            override fun onDescriptorWriteError(descriptor: BluetoothGattDescriptor) {}
            override fun bleDeviceNotConnected() {}
            override fun otaCharacteristicNotFound(ex: Exception) {}
            override fun onCommunicationError(ex: Exception, isExitBootloaderCmd: Boolean) {
                communicationError = ex
            }
        }

        val handler = BleTimeoutHandler(bleEventListener, 50, CoroutineScope(Dispatchers.IO))
        handler.onCommandSent()
        TimeUnit.MILLISECONDS.sleep(25)
        assert(communicationError == null) { "Communication error should be null" }

        handler.onCommandSent()
        TimeUnit.MILLISECONDS.sleep(30)
        assert(communicationError == null) { "Communication error should be null" }

        handler.onCommandSent()
        TimeUnit.MILLISECONDS.sleep(35)
        assert(communicationError == null) { "Communication error should be null" }

        handler.cancel()
        TimeUnit.MILLISECONDS.sleep(80)
        assert(communicationError == null) { "Communication error should not be reported after cancel" }

        handler.onCommandSent()
        TimeUnit.MILLISECONDS.sleep(80)
        assert(communicationError != null) { "Communication error should be reported" }
    }
}
