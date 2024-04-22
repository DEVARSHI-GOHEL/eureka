package com.lifeplus.library.test.cucumber.steps

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.pm.PackageManager
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.ReactApplicationContext
import com.lifeplus.Ble.BleDevice
import com.lifeplus.Ble.BleServices
import com.lifeplus.Ble.GattCallback
import com.lifeplus.Database.DbAccess
import com.lifeplus.LifePlusReactModule
import com.lifeplus.Pojo.Enum.BleProcEnum
import com.lifeplus.Pojo.Enum.GattCharEnum
import com.lifeplus.Pojo.Enum.GattServiceEnum
import com.lifeplus.Util.Global
import com.lifeplus.library.test.CucumberCtx
import com.lifeplus.library.test.CucumberCtx.Companion.mockGatt
import com.lifeplus.lifeleaf.uploader.CommunicationError
import com.lifeplus.lifeleaf.uploader.ConnectionError
import com.lifeplus.lifeleaf.uploader.CrcError
import com.lifeplus.lifeleaf.uploader.FileParseError
import com.lifeplus.lifeleaf.uploader.FileReadError
import com.lifeplus.lifeleaf.uploader.InstallationError
import com.lifeplus.lifeleaf.uploader.Success
import io.cucumber.java.en.Given
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.spyk
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.UUID

class Givens {
    @Given("app creates native module")
    fun given_app_creates_native_module() {
        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        val spyCtx = spyk(context)
        every { spyCtx.checkCallingOrSelfPermission(any()) } returns PackageManager.PERMISSION_GRANTED
        every { spyCtx.checkSelfPermission(any()) } returns PackageManager.PERMISSION_GRANTED
        every { spyCtx.startService(any()) } returns mockk(relaxed = true)

        CucumberCtx.nativeModule = LifePlusReactModule(spyCtx, CucumberCtx.errorLoggerProvider)

        every { spyCtx.currentActivity } returns mockk(relaxed = true)

        val btManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val spyManager = CucumberCtx.spyBle(btManager)
        every { spyCtx.getSystemService(Context.BLUETOOTH_SERVICE) } returns spyManager
    }

    @Given("app is busy with {string}")
    fun given_app_is_busy_with_x(process: String) {
        BleServices.setCurrentProc(BleProcEnum.values().first { it.name == process })
    }

    @Given("watch with MSN {string} is already connected")
    fun given_watch_is_already_connected(msn: String) {
        CucumberCtx.watchName = "LPW2-$msn"
        Global.setWatchMSNForScan(msn)
        Global.setWatchMSN(msn)

        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        DbAccess.getInstance(context).addTestUser(CucumberCtx.testUserId)
        Global.setUserId(CucumberCtx.testUserId)

        every { CucumberCtx.mockBtDevice["isConnected"]() } returns true
        every { CucumberCtx.mockBtDevice.bondState } returns BluetoothDevice.BOND_BONDED

        val bleDevice = BleDevice(
            context,
            CucumberCtx.mockBtDevice,
            true
        )

        LifePlusReactModule._bleService.connectedDevice = bleDevice

        val gattCallback = GattCallback()
        gattCallback.setBleDevice(bleDevice)
        val field = BleServices::class.java.declaredFields.first { it.name == "_gattCallback" }
        field.isAccessible = true
        field.set(LifePlusReactModule._bleService, gattCallback)

        CucumberCtx.slotGattCallback.captured = gattCallback
        LifePlusReactModule._bleService.setBleDevice(bleDevice)
        BleDevice._blueToothGatt = CucumberCtx.mockGatt
    }

    @Given("watch auto-measure switch is {string}")
    fun watch_auto_measure_switch_is_x(autoMeasure: String) {
        CucumberCtx.autoMeasure = autoMeasure == "ON"
    }

    @Given("firmware update will complete with {string}")
    fun given_firmware_update_will_complete_with_x(result: String) {
        CucumberCtx.fwUpdateResult = when (result) {
            "FileParseError" -> FileParseError(Exception())
            "FileReadError" -> FileReadError(Exception())
            "ConnectionError" -> ConnectionError()
            "CommunicationError" -> CommunicationError(Exception())
            "CrcError" -> CrcError()
            "InstallationError" -> InstallationError()
            "Success" -> Success()
            else -> throw IllegalArgumentException("Invalid update result: $result.")
        }
    }

    @Given("characteristic read failure is {string}")
    fun given_characteristic_read_failure_is_x(failType: String) {
        when (failType) {
            "initiate" -> {
                every { CucumberCtx.mockGatt.readCharacteristic(any()) } answers {
                    false
                }
            }
            "complete" -> {
                val slotReadChar = slot<BluetoothGattCharacteristic>()
                every { CucumberCtx.mockGatt.readCharacteristic(capture(slotReadChar)) } answers {
                    CoroutineScope(Dispatchers.Default).launch {
                        delay(100)
                        CucumberCtx.slotGattCallback.captured.onCharacteristicRead(
                            CucumberCtx.mockGatt,
                            slotReadChar.captured,
                            BluetoothGatt.GATT_FAILURE
                        )
                    }
                    true
                }
            }
            else -> throw IllegalArgumentException("Invalid fail type: '$failType', expected 'initiate' or 'complete'.")
        }
    }

    @Given("characteristic write failure is {string}")
    fun given_characteristic_write_failure_is_x(failType: String) {
        when (failType) {
            "initiate" -> {
                every { CucumberCtx.mockGatt.writeCharacteristic(any()) } answers {
                    false
                }
            }
            "complete" -> {
                val slotWriteChar = slot<BluetoothGattCharacteristic>()
                every { CucumberCtx.mockGatt.writeCharacteristic(capture(slotWriteChar)) } answers {
                    CoroutineScope(Dispatchers.Default).launch {
                        delay(100)
                        CucumberCtx.slotGattCallback.captured.onCharacteristicWrite(
                            CucumberCtx.mockGatt,
                            slotWriteChar.captured,
                            BluetoothGatt.GATT_FAILURE
                        )
                    }
                    true
                }
            }
            else -> throw IllegalArgumentException("Invalid fail type: '$failType', expected 'initiate' or 'complete'.")
        }
    }

    @Given("failure for enabling indications on characteristic is {string}")
    fun given_enabling_indications_characteristic_fails_to_x(failType: String) {
        when (failType) {
            "initiate" -> {
                every { CucumberCtx.mockGatt.writeDescriptor(any()) } answers {
                    false
                }
            }
            "complete" -> {
                val slotDescriptor = slot<BluetoothGattDescriptor>()
                every { CucumberCtx.mockGatt.writeDescriptor(capture(slotDescriptor)) } answers {
                    CoroutineScope(Dispatchers.Default).launch {
                        delay(100)
                        CucumberCtx.slotGattCallback.captured.onDescriptorWrite(
                            CucumberCtx.mockGatt,
                            slotDescriptor.captured,
                            BluetoothGatt.GATT_FAILURE
                        )
                    }
                    true
                }
            }
            else -> throw IllegalArgumentException("Invalid fail type: '$failType', expected 'initiate' or 'complete'.")
        }
    }

    @Given("changing MTU size failure is {string}")
    fun given_changing_mtu_size_failure_is_x(failType: String) {
        when (failType) {
            "initiate" -> {
                every { CucumberCtx.mockGatt.requestMtu(any()) } answers {
                    false
                }
            }
            "complete" -> {
                val slotMtu = slot<Int>()
                every { CucumberCtx.mockGatt.requestMtu(capture(slotMtu)) } answers {
                    CoroutineScope(Dispatchers.Default).launch {
                        delay(100)
                        CucumberCtx.slotGattCallback.captured.onMtuChanged(
                            CucumberCtx.mockGatt,
                            slotMtu.captured,
                            BluetoothGatt.GATT_FAILURE
                        )
                    }
                    true
                }
            }
            else -> throw IllegalArgumentException("Invalid fail type: '$failType', expected 'initiate' or 'complete'.")
        }
    }

    @Given("scan timeout is {long} ms")
    fun given_scan_timeout_is_x_ms(timeoutMs: Long) {
        LifePlusReactModule._bleService.SCAN_TIMEOUT_MS = timeoutMs
    }

    @Given("connect timeout is {long} ms")
    fun given_connect_timeout_is_x_ms(timeoutMs: Long) {
        LifePlusReactModule._bleService.CONNECT_TIMEOUT_MS = timeoutMs
    }

    @Given("connection attempt failure is timeout")
    fun given_connection_attempt_failure_is_timeout() {
        every { CucumberCtx.mockBtDevice.connectGatt(any(), any(), any()) } returns CucumberCtx.mockGatt
    }

    @Given("device cannot discover services")
    fun given_device_cannot_discover_services() {
        every { CucumberCtx.mockGatt.discoverServices() } returns true
    }

    @Given("device cannot request max MTU")
    fun given_device_cannot_request_max_mtu() {
        every { CucumberCtx.mockGatt.requestMtu(any()) } answers {
            CucumberCtx.mtuRequested = true
            true
        }
    }

    @Given("user with step goal {int} is logged in")
    fun given_user_with_step_goal_x_is_logged_in(stepGoal: Int) {
        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        DbAccess.getInstance(context).addTestUser(CucumberCtx.testUserId, stepGoal)
        Global.setUserId(CucumberCtx.testUserId)
    }

    @Given("writing to STEP_COUNTER char is failing")
    fun given_writing_to_step_counter_char_is_failing() {
        val char = mockGatt.getService(CucumberCtx.customService.uuid)
            .getCharacteristic(UUID.fromString(GattCharEnum.STEP_COUNTER.id))

        every { mockGatt.writeCharacteristic(char) } answers {
            false
        }
    }

    @Given("watch does not have {string} characteristic")
    fun given_watch_does_not_have_x_characteristic(charName: String) {
        val char = mockGatt.getService(CucumberCtx.customService.uuid)
            .getCharacteristic(UUID.fromString(GattCharEnum.valueOf(charName).id))

        val updatedCustomService = BluetoothGattService(CucumberCtx.customService.uuid, CucumberCtx.customService.type)
        CucumberCtx.customService.characteristics.forEach {
            if (it.uuid != char.uuid) {
                updatedCustomService.addCharacteristic(it)
            }
        }
        every { mockGatt.services } returns listOf(
            CucumberCtx.currentTimeService,
            updatedCustomService,
            CucumberCtx.immediateAlertService,
            CucumberCtx.deviceInformationService
        )
        every { mockGatt.getService(UUID.fromString(GattServiceEnum.CUSTOM_SERVICE.id)) } returns updatedCustomService
    }
}
