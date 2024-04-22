package com.lifeplus.lifeleaf.uploader

import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import com.lifeplus.lifeleaf.uploader.ble.BleCommandHandler
import com.lifeplus.lifeleaf.uploader.ble.BleEventListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.junit.Test
import java.util.concurrent.TimeUnit

class BleCommandHandlerUnitTest {

    @Test
    fun bleCommandHandlerUnitTest() {
        var exception: Exception? = null
        val bleEventListener = object : BleEventListener {
            override fun onOtaCharacteristicDiscovered(otaCharacteristic: BluetoothGattCharacteristic) {}
            override fun onDescriptorWriteSuccess(descriptor: BluetoothGattDescriptor) {}
            override fun onDescriptorWriteError(descriptor: BluetoothGattDescriptor) {}
            override fun bleDeviceNotConnected() {}
            override fun otaCharacteristicNotFound(ex: Exception) {}
            override fun onCommunicationError(ex: Exception, isExitBootloaderCmd: Boolean) {
                exception = ex
            }
        }
        val handler = BleCommandHandler(bleEventListener, 50, CoroutineScope(Dispatchers.IO))
        var commandExecutedCount = 0
        val command: () -> Unit = {
            commandExecutedCount++
            CoroutineScope(Dispatchers.IO).launch {
                handler.onCommandSent()
            }
        }
        handler.sendCommand(command)
        TimeUnit.MILLISECONDS.sleep(25)
        handler.onResponse()
        assert(commandExecutedCount == 1) { "Command should have been executed exactly once." }
        assert(exception == null) { "Exception should not have been thrown." }
        TimeUnit.MILLISECONDS.sleep(100)
        assert(commandExecutedCount == 1) { "Timer should not be running after response is received. $commandExecutedCount" }

        commandExecutedCount = 0
        handler.sendCommand(command)
        TimeUnit.MILLISECONDS.sleep(175)
        handler.onResponse()
        assert(commandExecutedCount in 3..4) { "Command should have been executed 3 or 4 times, but was $commandExecutedCount" }
        assert(exception == null) { "Exception should not have been thrown." }

        commandExecutedCount = 0
        handler.sendCommand(command)
        TimeUnit.MILLISECONDS.sleep(1000)
        assert(commandExecutedCount == 10) { "Command should have been executed 10 times, but was $commandExecutedCount" }
        assert(exception != null) { "Exception should have been thrown." }
    }
}
