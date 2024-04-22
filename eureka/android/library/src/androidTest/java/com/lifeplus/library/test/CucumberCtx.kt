package com.lifeplus.library.test

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import com.lifeplus.Ble.GattCallback
import com.lifeplus.EventEmittersToReact
import com.lifeplus.Events.NoParamEvent
import com.lifeplus.LifePlusReactModule
import com.lifeplus.Pojo.Enum.BleCommandEnum
import com.lifeplus.Pojo.Enum.GattCharEnum
import com.lifeplus.Pojo.Enum.GattServiceEnum
import com.lifeplus.Pojo.Enum.NoParamEventEnum
import com.lifeplus.Pojo.Responses.AppSyncResponse
import com.lifeplus.Pojo.Responses.CalibrationResponse
import com.lifeplus.Pojo.Responses.CommonResponse
import com.lifeplus.Pojo.Responses.ConnectResponse
import com.lifeplus.Pojo.Responses.FirmwareUpdateResponse
import com.lifeplus.Pojo.Responses.InstantMeasureResponse
import com.lifeplus.Pojo.Responses.StepGoalResponse
import com.lifeplus.Util.ErrorLoggerProvider
import com.lifeplus.lifeleaf.uploader.FirmwareUploader
import com.lifeplus.lifeleaf.uploader.Success
import com.lifeplus.lifeleaf.uploader.UpdateResult
import io.cucumber.junit.CucumberOptions
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.spyk
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.greenrobot.eventbus.EventBus
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

@CucumberOptions(
    features = ["features"],
    plugin = ["pretty"],
    glue = ["com.lifeplus.library.test.cucumber.steps"],
    tags = ""
)
internal class CucumberCtx {
    companion object {
        lateinit var nativeModule: LifePlusReactModule
        val slotScanCallback = slot<ScanCallback>()
        lateinit var mockBtDevice: BluetoothDevice
        lateinit var mockGatt: BluetoothGatt
        lateinit var spyAdapter: BluetoothAdapter
        val slotGattCallback = slot<GattCallback>()
        val processedCommands = mutableListOf<Byte>()
        lateinit var vitalData: List<ByteArray>
        private var vitalDataIndex = 0
        lateinit var mealData: List<ByteArray>
        private var mealDataIndex = 0
        val emittedEvents = mutableListOf<Pair<String, String>>()
        var mtuRequested = false
        val updatedDescriptors = mutableListOf<BluetoothGattDescriptor>()
        val readChars = mutableListOf<UUID>()
        val writeChars = mutableListOf<Pair<UUID, ByteArray>>()
        var timeSet = false
        var timeZoneSet = false
        var stepGoalSet = false
        var promiseResponse: String? = null
        val preparedSqlQueries = mutableListOf<String>()
        var scanStarted = false
        var rawDataIndex: Short = 0
        private val errorLoggerKeys = HashMap<String, String>()
        var lastError: Pair<Throwable, Map<String, String>>? = null
        var fwUpdateResult: UpdateResult = Success()
        var watchName = "LPW2-"
        const val testUserId = 123

        private var receivedCommand: Byte = 0

        internal val currentTimeService = BluetoothGattService(
            UUID.fromString("00001805-0000-1000-8000-00805f9b34fb"),
            BluetoothGattService.SERVICE_TYPE_SECONDARY
        ).apply {
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString("00002a0f-0000-1000-8000-00805f9b34fb"),
                    0x08,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString("00002a2b-0000-1000-8000-00805f9b34fb"),
                    0x08,
                    0x21
                )
            )
        }
        internal val immediateAlertService = BluetoothGattService(
            UUID.fromString("00001802-0000-1000-8000-00805f9b34fb"),
            BluetoothGattService.SERVICE_TYPE_SECONDARY
        ).apply {
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString("00002A06-0000-1000-8000-00805f9b34fb"),
                    0x04,
                    0x21
                )
            )
        }
        internal val deviceInformationService = BluetoothGattService(
            UUID.fromString("0000180a-0000-1000-8000-00805f9b34fb"),
            BluetoothGattService.SERVICE_TYPE_SECONDARY
        ).apply {
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString("00002A26-0000-1000-8000-00805F9B34FB"),
                    0x02,
                    0x21
                )
            )
        }
        val customService = BluetoothGattService(
            UUID.fromString("4C505732-5F43-5553-544F-4D5F53525600"),
            BluetoothGattService.SERVICE_TYPE_SECONDARY
        ).apply {
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.STATUS.id),
                    0x22,
                    0x21
                ).apply {
                    addDescriptor(
                        BluetoothGattDescriptor(
                            UUID.fromString(GattCharEnum.STATUS.id),
                            0x21
                        )
                    )
                }
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.MEAL_DATA.id),
                    0x02,
                    0x21
                ).apply {
                    addDescriptor(
                        BluetoothGattDescriptor(
                            UUID.fromString(GattCharEnum.MEAL_DATA.id),
                            0x21
                        )
                    )
                }
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.STEP_COUNTER.id),
                    0x02,
                    0x21
                ).apply {
                    addDescriptor(
                        BluetoothGattDescriptor(
                            UUID.fromString(GattCharEnum.STEP_COUNTER.id),
                            0x21
                        )
                    )
                }
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.USER_INFO.id),
                    0x0a,
                    0x21
                ).apply {
                    addDescriptor(
                        BluetoothGattDescriptor(
                            UUID.fromString(GattCharEnum.USER_INFO.id),
                            0x21
                        )
                    )
                }
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.COMMAND.id),
                    0x08,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.NOTIFICATIONS.id),
                    0x08,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.VITAL_DATA.id),
                    0x02,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.RAW_DATA.id),
                    0x02,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.LAST_MEASURE_TIME.id),
                    0x02,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.WEATHER.id),
                    0x08,
                    0x21
                )
            )
            addCharacteristic(
                BluetoothGattCharacteristic(
                    UUID.fromString(GattCharEnum.REFERENCE_VITAL_DATA.id),
                    0x0a,
                    0x21
                )
            )
        }

        val errorLoggerProvider = object : ErrorLoggerProvider {
            override fun log(message: String) {
            }
            override fun setKeys(keysAndValues: Map<String, String>) {
                errorLoggerKeys.putAll(keysAndValues)
            }
            override fun setKey(key: String, value: String) {
                errorLoggerKeys[key] = value
            }
            override fun recordException(throwable: Throwable) {
                lastError = throwable to HashMap(errorLoggerKeys)
            }
        }

        fun init() {
            mockBtDevice = mockk(relaxed = true)

            mockGatt = mockk(relaxed = true)
            initGatt(mockGatt)
            slotGattCallback.clear()

            every {
                mockBtDevice.connectGatt(any(), any(), capture(slotGattCallback))
            } answers {
                CoroutineScope(Dispatchers.Default).launch {
                    every { mockBtDevice["isConnected"]() } returns true
                    every { mockBtDevice.name } returns watchName
                    every { mockBtDevice.bondState } returns BluetoothDevice.BOND_BONDED
                    delay(100)
                    slotGattCallback.captured.onConnectionStateChange(
                        mockGatt,
                        BluetoothGatt.GATT_SUCCESS,
                        BluetoothProfile.STATE_CONNECTED
                    )
                }
                mockGatt
            }
            every { mockBtDevice.createBond() } answers {
                every { spyAdapter.bondedDevices } answers { setOf(mockBtDevice) }
                EventBus.getDefault().post(NoParamEvent(NoParamEventEnum.DEVICE_BONDED))
                true
            }

            scanStarted = false
            rawDataIndex = 0
            promiseResponse = null
            emittedEvents.clear()
            processedCommands.clear()
            preparedSqlQueries.clear()
            mockEventEmitter()
            mockUploader()
            errorLoggerKeys.clear()
            readChars.clear()
            writeChars.clear()
            lastError = null
            updatedDescriptors.clear()
        }

        fun spyBle(btManager: BluetoothManager): BluetoothManager {
            val spyManager = spyk(btManager)

            val btAdapter = btManager.adapter
            spyAdapter = spyk(btAdapter)
            every { spyManager.adapter } returns spyAdapter

            val btScanner = btAdapter.bluetoothLeScanner
            val spyScanner = spyk(btScanner)
            every { spyAdapter.bluetoothLeScanner } returns spyScanner
            every { spyScanner.startScan(any(), any(), capture(slotScanCallback)) } answers {
                scanStarted = true
            }
            every { spyAdapter.bondedDevices } answers { setOf(mockBtDevice) }
            every { spyScanner.stopScan(any<ScanCallback>()) } answers { }

            return spyManager
        }

        private fun initGatt(mockGatt: BluetoothGatt) {
            every { mockGatt.device } returns mockBtDevice
            every { mockGatt.discoverServices() } answers {
                CoroutineScope(Dispatchers.Default).launch {
                    delay(100)
                    slotGattCallback.captured.onServicesDiscovered(
                        mockGatt,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            every { mockGatt.services } returns listOf(currentTimeService, customService, immediateAlertService, deviceInformationService)
            every { mockGatt.getService(UUID.fromString(GattServiceEnum.CUSTOM_SERVICE.id)) } returns customService
            every { mockGatt.getService(UUID.fromString(GattServiceEnum.IMMEDIATE_ALERT_SERVICE.id)) } returns immediateAlertService
            every { mockGatt.getService(UUID.fromString(GattServiceEnum.DEVICE_INFORMATION_SERVICE.id)) } returns deviceInformationService
            val slotUuid = slot<UUID>()
            every { mockGatt.getService(capture(slotUuid)) } answers {
                mockGatt.services.firstOrNull { it.uuid == slotUuid.captured }
            }
            every { mockGatt.requestMtu(any()) } answers {
                mtuRequested = true
                CoroutineScope(Dispatchers.Default).launch {
                    delay(100)
                    slotGattCallback.captured.onMtuChanged(
                        mockGatt,
                        512,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            val slotDescriptor = slot<BluetoothGattDescriptor>()
            every { mockGatt.writeDescriptor(capture(slotDescriptor)) } answers {
                updatedDescriptors.add(slotDescriptor.captured)
                CoroutineScope(Dispatchers.Default).launch {
                    delay(100)
                    slotGattCallback.captured.onDescriptorWrite(
                        mockGatt,
                        slotDescriptor.captured,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            val slotWriteChar = slot<BluetoothGattCharacteristic>()
            every { mockGatt.writeCharacteristic(capture(slotWriteChar)) } answers {
                writeChars.add(slotWriteChar.captured.uuid to slotWriteChar.captured.value)
                when (slotWriteChar.captured.uuid) {
                    UUID.fromString(GattCharEnum.COMMAND.id) -> {
                        receivedCommand = slotWriteChar.captured.value[0]
                        println("Command received: ${slotWriteChar.captured.value[0]}")

                        if (receivedCommand == BleCommandEnum.START_MEASUREMENT.value[0]) {
                            processedCommands.add(receivedCommand)
                        }
                    }
                    UUID.fromString(GattCharEnum.CURRENT_TIME.id) -> {
                        timeSet = true
                        println("Time received: ${slotWriteChar.captured.value.joinToString(":")}")
                    }
                    UUID.fromString(GattCharEnum.LOCAL_TIME_INFORMATION.id) -> {
                        timeZoneSet = true
                        println("Time zone received: ${slotWriteChar.captured.value.joinToString(":")}")
                    }
                    UUID.fromString(GattCharEnum.ALERT_LEVEL.id) -> {
                        if (slotWriteChar.captured.value.contentEquals(INITIATE_DFU_ALERT)) {
                            println("Starting the DFU mode.")
                            CoroutineScope(Dispatchers.Default).launch {
                                delay(1000)
                                slotGattCallback.captured.onConnectionStateChange(
                                    Companion.mockGatt,
                                    BluetoothGatt.GATT_SUCCESS,
                                    BluetoothProfile.STATE_DISCONNECTED
                                )
                            }
                        }
                    }
                    UUID.fromString(GattCharEnum.STEP_COUNTER.id) -> {
                        stepGoalSet = true
                        println("Step goal received: ${slotWriteChar.captured.value.joinToString(":")}")
                    }
                }
                CoroutineScope(Dispatchers.Default).launch {
                    delay(100)
                    slotGattCallback.captured.onCharacteristicWrite(
                        mockGatt,
                        slotWriteChar.captured,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            val slotReadChar = slot<BluetoothGattCharacteristic>()
            every { mockGatt.readCharacteristic(capture(slotReadChar)) } answers {
                readChars.add(slotReadChar.captured.uuid)
                println("Char read: ${slotReadChar.captured.uuid}")
                when (slotReadChar.captured.uuid) {
                    UUID.fromString(GattCharEnum.USER_INFO.id) -> {
                        slotReadChar.captured.value = byteArrayOf(1, 0, 0, 0, 0, 0, 0, 0, 0, 0)
                    }
                    UUID.fromString(GattCharEnum.STATUS.id) -> {
                        slotReadChar.captured.value = byteArrayOf(128.toByte())
                    }
                    UUID.fromString(GattCharEnum.VITAL_DATA.id) -> {
                        println("Processing command: $receivedCommand")
                        when (receivedCommand) {
                            BleCommandEnum.GET_LAST_VITAL.value[0] -> {
                                vitalDataIndex = vitalData.size - 1
                                slotReadChar.captured.value = vitalData[vitalDataIndex]
                            }
                            BleCommandEnum.GET_NEXT_VITAL.value[0] -> {
                                vitalDataIndex++
                                if (vitalDataIndex >= vitalData.size) {
                                    vitalDataIndex = vitalData.size - 1
                                }
                                slotReadChar.captured.value = vitalData[vitalDataIndex]
                            }
                            BleCommandEnum.GET_PREV_VITAL.value[0] -> {
                                vitalDataIndex--
                                if (vitalDataIndex < 0) {
                                    vitalDataIndex = 0
                                }
                                slotReadChar.captured.value = vitalData[vitalDataIndex]
                            }
                            else -> {
                                slotReadChar.captured.value = byteArrayOf()
                            }
                        }
                        processedCommands.add(receivedCommand)
                    }
                    UUID.fromString(GattCharEnum.MEAL_DATA.id) -> {
                        println("Processing command: $receivedCommand")
                        when (receivedCommand) {
                            BleCommandEnum.GET_LAST_MEAL.value[0] -> {
                                mealDataIndex = mealData.size - 1
                                slotReadChar.captured.value = mealData[mealDataIndex]
                            }
                            BleCommandEnum.GET_NEXT_MEAL.value[0] -> {
                                mealDataIndex++
                                if (mealDataIndex >= mealData.size) {
                                    mealDataIndex = mealData.size - 1
                                }
                                slotReadChar.captured.value = mealData[mealDataIndex]
                            }
                            BleCommandEnum.GET_PREV_MEAL.value[0] -> {
                                mealDataIndex--
                                if (mealDataIndex < 0) {
                                    mealDataIndex = 0
                                }
                                slotReadChar.captured.value = mealData[mealDataIndex]
                            }
                            else -> {
                                slotReadChar.captured.value = byteArrayOf()
                            }
                        }
                        processedCommands.add(receivedCommand)
                    }
                    UUID.fromString(GattCharEnum.STEP_COUNTER.id) -> {
                        println("Processing command: $receivedCommand")
                        when (receivedCommand) {
                            BleCommandEnum.GET_STEP_COUNTER_SUN.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_MON.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_TUE.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_WED.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_THU.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_FRI.value[0],
                            BleCommandEnum.GET_STEP_COUNTER_SAT.value[0] -> {
                                slotReadChar.captured.value = byteArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
                            }
                            else -> {
                                slotReadChar.captured.value = byteArrayOf()
                            }
                        }
                        processedCommands.add(receivedCommand)
                    }
                    UUID.fromString(GattCharEnum.LAST_MEASURE_TIME.id) -> {
                        slotReadChar.captured.value = byteArrayOf(0, 0, 0, 0, 0, 0, 0)
                    }

                    UUID.fromString(GattCharEnum.RAW_DATA.id) -> {
                        println("Processing command: $receivedCommand")
                        when (receivedCommand) {
                            BleCommandEnum.GET_FIRST_RAW.value[0] -> {
                                slotReadChar.captured.value = ByteArray(175)
                            }
                            BleCommandEnum.GET_NEXT_RAW.value[0] -> {
                                slotReadChar.captured.value =
                                    ByteBuffer
                                        .allocate(175)
                                        .order(ByteOrder.LITTLE_ENDIAN)
                                        .put(0)
                                        .putShort(rawDataIndex)
                                        .array()
                            }
                        }
                        processedCommands.add(receivedCommand)
                    }
                    UUID.fromString(GattCharEnum.FIRMWARE_REVISION.id) -> {
                        slotReadChar.captured.value = "abcdefg".toByteArray()
                    }
                }
                CoroutineScope(Dispatchers.Default).launch {
                    delay(100)
                    slotGattCallback.captured.onCharacteristicRead(
                        mockGatt,
                        slotReadChar.captured,
                        BluetoothGatt.GATT_SUCCESS
                    )
                }
                true
            }
            every { mockGatt.setCharacteristicNotification(any(), any()) } returns true
        }

        private fun mockEventEmitter() {
            val mockEventEmitter = mockk<EventEmittersToReact>()
            mockkStatic(EventEmittersToReact::getInstance)
            every { EventEmittersToReact.getInstance() } returns mockEventEmitter

            every { mockEventEmitter.isReady } returns true
            every { mockEventEmitter.setReactContext(any()) } answers { }
            every { mockEventEmitter.percentStatus(any()) } answers { println("EventEmitter: percentStatus") }
            every { mockEventEmitter.uploadOnCloud(any()) } answers { println("EventEmitter: uploadOnCloud") }
            every { mockEventEmitter.debugLog(any()) } answers { println("EventEmitter: debugLog") }
            val slotConnectResponse = slot<ConnectResponse>()
            every { mockEventEmitter.EmitConnectResult(capture(slotConnectResponse)) } answers {
                val eventStr = slotConnectResponse.captured.responseStr
                emittedEvents.add(Pair("ScanResult", eventStr))
                println("EventEmitter: EmitConnectResult ($eventStr)")
            }
            val slotCommonResponse = slot<CommonResponse>()
            every { mockEventEmitter.EmitCommonResult(capture(slotCommonResponse)) } answers {
                val eventStr = slotCommonResponse.captured.responseStr
                emittedEvents.add(Pair("CommonResult", eventStr))
                println("EventEmitter: EmitCommonResult ($eventStr)")
            }
            val slotInstantMeasureResponse = slot<InstantMeasureResponse>()
            every { mockEventEmitter.EmitInstantMeasureResult(capture(slotInstantMeasureResponse)) } answers {
                val eventStr = slotInstantMeasureResponse.captured.responseStr
                emittedEvents.add(Pair("InstantMeasureResult", eventStr))
                println("EventEmitter: EmitInstantMeasureResult ($eventStr)")
            }
            val slotCalibrationResponse = slot<CalibrationResponse>()
            every { mockEventEmitter.EmitCalibrationResult(capture(slotCalibrationResponse)) } answers {
                val eventStr = slotCalibrationResponse.captured.responseStr
                emittedEvents.add(Pair("CalibrationResult", eventStr))
                println("EventEmitter: EmitCalibrationResult ($eventStr)")
            }
            val slotAppSyncResponse = slot<AppSyncResponse>()
            val slotFirmwareRevision = slot<String>()
            every { mockEventEmitter.EmitAppSyncResult(capture(slotAppSyncResponse), capture(slotFirmwareRevision)) } answers {
                val eventStr = slotAppSyncResponse.captured.responseStr
                emittedEvents.add(Pair("InstantMeasureResult", eventStr))
                println("EventEmitter: EmitAppSyncResult ($eventStr), firmware revision: ${slotFirmwareRevision.captured}")
            }
            every { mockEventEmitter.EmitStepCount(any()) } answers { println("EventEmitter: EmitStepCount") }
            every { mockEventEmitter.EmitMealData(any()) } answers { println("EventEmitter: EmitMealData") }
            val slotFwUpdateResponse = slot<FirmwareUpdateResponse>()
            every { mockEventEmitter.emitFwUpdate(capture(slotFwUpdateResponse)) } answers {
                val eventStr = slotFwUpdateResponse.captured.responseStr
                emittedEvents.add(Pair("FwUpdate", eventStr))
                println("EventEmitter: emitFwUpdate ($eventStr)")
            }
            every { mockEventEmitter.emitIncompatibleDevice() } answers {
                emittedEvents.add(Pair("IncompatibleDevice", ""))
                println("EventEmitter: emitIncompatibleDevice")
            }
            val slotStepGoalResponse = slot<StepGoalResponse>()
            every { mockEventEmitter.emitStepGoal(capture(slotStepGoalResponse)) } answers {
                val eventStr = slotStepGoalResponse.captured.responseStr
                emittedEvents.add(Pair("StepGoalResult", eventStr))
                println("EventEmitter: emitStepGoal")
            }
        }

        private fun mockUploader() {
            mockkObject(FirmwareUploader)

            val fwUpdateCallback = slot<(UpdateResult) -> Unit>()
            every { FirmwareUploader.upload(any(), any(), any(), capture(fwUpdateCallback)) } answers {
                println("Firmware update started")

                CoroutineScope(Dispatchers.IO).launch {
                    delay(3000)
                    fwUpdateCallback.captured.invoke(fwUpdateResult)
                }
            }
        }

        private val INITIATE_DFU_ALERT = byteArrayOf(1)
    }
}
