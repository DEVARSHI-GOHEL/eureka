package com.lifeplus.lifeleaf.uploader.test

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import androidx.test.platform.app.InstrumentationRegistry
import com.cypress.cysmart.CommonUtils.GattAttributes
import com.cypress.cysmart.CommonUtils.UUIDDatabase
import com.cypress.cysmart.OTAFirmwareUpdate.BootLoaderCommands_v1
import com.lifeplus.lifeleaf.uploader.UpdateResult
import io.cucumber.junit.CucumberOptions
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.util.UUID

@CucumberOptions(
    features = ["features"],
    plugin = ["pretty"],
    glue = ["com.lifeplus.lifeleaf.uploader.test.cucumber.steps"],
    tags = ""
)
internal class CucumberCtx {
    companion object {
        var contextMock: Context = mockk()
        var btManagerMock: BluetoothManager = mockk()
        var watchName: String? = null
        var updateFile: File? = null
        var updateResult: UpdateResult? = null
        var btGatt: BluetoothGatt = mockk()
        var btDeviceMock: BluetoothDevice = mockk()
        var gattCallback: BluetoothGattCallback? = null
        var verifyAppSuccess: Boolean? = null
        var fwUpdateSuccess: Boolean? = null
        var shouldVerifySucceed = true
        var validSiliconId = true
        var validData = true
        var exitBootloaderSuccess = true
        var loseOneResponse = false

        fun initObjects() {
            watchName = null
            updateFile = null
            updateResult = null
            verifyAppSuccess = null
            fwUpdateSuccess = null
            shouldVerifySucceed = true
            validSiliconId = true
            validData = true
            exitBootloaderSuccess = true
            loseOneResponse = false
        }

        fun initMocks() {
            contextMock = mockk()
            btManagerMock = mockk()
            btGatt = mockk()
            initGattMock()

            every { contextMock.getSharedPreferences(any(), any()) } answers {
                InstrumentationRegistry.getInstrumentation().targetContext.getSharedPreferences(
                    SHARED_PREF_NAME,
                    Context.MODE_PRIVATE
                )
            }

            btDeviceMock = mockk()
            val gattCallbackSlot = slot<BluetoothGattCallback>()
            every { btDeviceMock.connectGatt(any(), any(), capture(gattCallbackSlot)) } answers {
                gattCallback = gattCallbackSlot.captured

                CoroutineScope(Dispatchers.IO).launch {
                    gattCallback?.onConnectionStateChange(btGatt, BluetoothGatt.GATT_SUCCESS, BluetoothProfile.STATE_CONNECTED)
                }
                btGatt
            }
            every { btDeviceMock.address } answers {
                "11:22:33:44:55:66"
            }
            every { btDeviceMock.name } answers {
                "MockedDevice"
            }
        }

        private fun initGattMock() {
            every { btGatt.discoverServices() } answers {
                CoroutineScope(Dispatchers.IO).launch {
                    gattCallback?.onServicesDiscovered(btGatt, BluetoothGatt.GATT_SUCCESS)
                }
                true
            }

            every { btGatt.requestMtu(any()) } answers {
                CoroutineScope(Dispatchers.IO).launch {
                    gattCallback?.onMtuChanged(btGatt, 150, BluetoothGatt.GATT_SUCCESS)
                }
                true
            }

            every { btManagerMock.getConnectedDevices(BluetoothProfile.GATT) } answers {
                listOf(btDeviceMock)
            }
            every { btManagerMock.adapter } answers {
                mockk()
            }
            every { contextMock.getSystemService(Context.BLUETOOTH_SERVICE) } answers {
                btManagerMock
            }

            val descriptor = mockk<BluetoothGattDescriptor>()
            every { descriptor.uuid } answers { UUID.fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG) }
            val characteristic = mockk<BluetoothGattCharacteristic>()
            every { characteristic.uuid } answers { UUIDDatabase.UUID_OTA_CHARACTERISTIC }
            every { characteristic.descriptors } answers { listOf(descriptor) }
            every { characteristic.properties } answers { BluetoothGattCharacteristic.PROPERTY_NOTIFY }
            val charValue = slot<ByteArray>()
            every { characteristic.setValue(capture(charValue)) } answers { true }
            every { characteristic.value } answers { charValue.captured }
            every { characteristic.writeType } answers { 0 }
            every { characteristic.writeType = any() } answers { }
            every { characteristic.instanceId } answers { 0 }
            val otaService = BluetoothGattService(UUIDDatabase.UUID_OTA_UPDATE_SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY)
                .also { gattService -> gattService.characteristics.add(characteristic) }
            every { characteristic.service } answers { otaService }
            every { characteristic.getDescriptor(any()) } answers { descriptor }
            every { descriptor.characteristic } answers { characteristic }
            every { descriptor.setValue(any()) } answers { true }
            every { descriptor.value } answers { BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE }

            every { btGatt.getService(any()) } answers { otaService }
            every {
                btGatt.setCharacteristicNotification(
                    any(),
                    any()
                )
            } answers {
                true
            }
            val descriptorSlot = slot<BluetoothGattDescriptor>()
            every { btGatt.writeDescriptor(capture(descriptorSlot)) } answers {
                CoroutineScope(Dispatchers.IO).launch {
                    gattCallback?.onDescriptorWrite(
                        btGatt,
                        descriptorSlot.captured,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            val characteristicSlot = slot<BluetoothGattCharacteristic>()
            every { btGatt.writeCharacteristic(capture(characteristicSlot)) } answers {
                CoroutineScope(Dispatchers.IO).launch {
                    gattCallback?.onCharacteristicWrite(
                        btGatt,
                        characteristicSlot.captured,
                        if (characteristicSlot.captured.value[1] == BootLoaderCommands_v1.EXIT_BOOTLOADER.toByte() &&
                            !exitBootloaderSuccess
                        ) {
                            BluetoothGatt.GATT_FAILURE
                        } else {
                            BluetoothGatt.GATT_SUCCESS
                        }
                    )
                }

                val data = characteristicSlot.captured.value
                when (data[1].toInt()) {
                    BootLoaderCommands_v1.ENTER_BOOTLOADER -> {
                        val response = if (validSiliconId) {
                            byteArrayOf(0, 0, 0, 0, 1, 0, 0, 0, 1, 3, 3, 3)
                        } else {
                            byteArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
                        }
                        characteristicSlot.captured.value = response
                    }
                    BootLoaderCommands_v1.SET_APP_METADATA -> {
                        characteristicSlot.captured.value = byteArrayOf(0, 0)
                    }
                    BootLoaderCommands_v1.SET_EIV -> {
                        characteristicSlot.captured.value = byteArrayOf(0, 0)
                    }
                    BootLoaderCommands_v1.SEND_DATA -> {
                        characteristicSlot.captured.value = byteArrayOf(0, 0)
                    }
                    BootLoaderCommands_v1.PROGRAM_DATA -> {
                        val response = if (validData) {
                            byteArrayOf(0, 0)
                        } else {
                            byteArrayOf(0, 4) // CY_DFU_ERROR_DATA
                        }
                        characteristicSlot.captured.value = response
                    }
                    BootLoaderCommands_v1.VERIFY_APP -> {
                        if (shouldVerifySucceed) {
                            characteristicSlot.captured.value = byteArrayOf(0, 0, 0, 0, 1) // verify success
                            verifyAppSuccess = true
                        } else {
                            characteristicSlot.captured.value = byteArrayOf(0, 0, 0, 0, 0) // verify failure
                            verifyAppSuccess = false
                        }
                    }
                    BootLoaderCommands_v1.EXIT_BOOTLOADER -> {
                        fwUpdateSuccess = exitBootloaderSuccess
                    }
                }

                if (loseOneResponse) {
                    loseOneResponse = false
                } else if (data[1].toInt() != BootLoaderCommands_v1.EXIT_BOOTLOADER) {
                    CoroutineScope(Dispatchers.IO).launch {
                        gattCallback?.onCharacteristicChanged(btGatt, characteristicSlot.captured)
                    }
                }
                true
            }
        }

        private val SHARED_PREF_NAME = "CySmart Shared Preference"
    }
}
