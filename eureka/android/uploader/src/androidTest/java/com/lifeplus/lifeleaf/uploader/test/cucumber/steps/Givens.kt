package com.lifeplus.lifeleaf.uploader.test.cucumber.steps

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothProfile
import androidx.test.platform.app.InstrumentationRegistry
import com.cypress.cysmart.CommonUtils.UUIDDatabase
import com.lifeplus.lifeleaf.uploader.test.CucumberCtx
import io.cucumber.java.en.Given
import io.mockk.every
import io.mockk.slot
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

class Givens {

    @Given("watch with MDN {string} is connected")
    fun given_watch_with_mdn_x_is_connected(deviceName: String) {
        CucumberCtx.watchName = deviceName
    }

    @Given("there is new firmware update in file {string}")
    fun given_there_is_new_firmware_update_in_file_x(filename: String) {
        val updateStream = InstrumentationRegistry.getInstrumentation().targetContext.assets.open(filename)
        CucumberCtx.updateFile = File.createTempFile(filename, ".cyacd2")
        updateStream.copyTo(CucumberCtx.updateFile!!.outputStream())
    }

    @Given("there is a problem {string} during firmware upload")
    fun given_there_is_a_problem_x_during_firmware_upload(problem: String) {
        when (problem) {
            "unreadable file" -> {
                CucumberCtx.updateFile = File("non-existent-file.cyacd2")
            }
            "unparsable file" -> {
                val updateStream = InstrumentationRegistry.getInstrumentation().targetContext.assets.open("unparsable_test_file.cyacd2")
                CucumberCtx.updateFile = File.createTempFile("unparsable_test_file", ".cyacd2")
                updateStream.copyTo(CucumberCtx.updateFile!!.outputStream())
            }
            "watch disconnected" -> {
                every { CucumberCtx.btManagerMock.getConnectedDevices(BluetoothProfile.GATT) } answers {
                    emptyList()
                }
            }
            "ota characteristic not found" -> {
                every { CucumberCtx.btGatt.getService(any()) } answers {
                    BluetoothGattService(UUIDDatabase.UUID_OTA_UPDATE_SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY)
                }
            }
            "crc check failed" -> {
                CucumberCtx.shouldVerifySucceed = false
            }
            "invalid silicon id" -> {
                CucumberCtx.validSiliconId = false
            }
            "invalid data" -> {
                CucumberCtx.validData = false
            }
            "lost packet" -> {
                every { CucumberCtx.btGatt.writeCharacteristic(any()) } answers {
                    false
                }
            }
            "exit bootloader write failed" -> {
                CucumberCtx.exitBootloaderSuccess = false
            }
            "fail to enable OTA char notifications" -> {
                val descriptorSlot = slot<BluetoothGattDescriptor>()
                every { CucumberCtx.btGatt.writeDescriptor(capture(descriptorSlot)) } answers {
                    CoroutineScope(Dispatchers.IO).launch {
                        CucumberCtx.gattCallback?.onDescriptorWrite(
                            CucumberCtx.btGatt,
                            descriptorSlot.captured,
                            BluetoothGatt.GATT_FAILURE
                        )
                    }
                    true
                }
            }
            "one response lost from remote device" -> {
                CucumberCtx.loseOneResponse = true
            }
        }
    }
}
