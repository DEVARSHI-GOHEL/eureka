package com.lifeplus.library.test.cucumber.steps

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanRecord
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.lifeplus.Ble.BleServices
import com.lifeplus.Database.DbAccess
import com.lifeplus.LifePlusReactModule
import com.lifeplus.Pojo.Enum.BleProcEnum
import com.lifeplus.Pojo.Enum.BleProcStateEnum
import com.lifeplus.Pojo.Enum.GattCharEnum
import com.lifeplus.Pojo.Enum.NoParamEventEnum
import com.lifeplus.Util.Global
import com.lifeplus.library.test.CucumberCtx
import com.lifeplus.lifeleaf.uploader.FirmwareUploader
import io.cucumber.datatable.DataTable
import io.cucumber.java.en.When
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.UUID
import java.util.concurrent.TimeUnit

class Whens {
    @When("app requests connect to watch with MSN {string}")
    fun when_app_requests_connect_to_device_with_msn_x(msn: String) {
        val request = "{\"userId\":\"3008\",\"AuthenticationId\":\"$msn\"}"
        val promise = mockk<Promise>(relaxed = true)

        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        DbAccess.getInstance(context).addTestUser(3008)
        Global.setUserId(3008)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "deviceConnect" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, request, promise)

        CucumberCtx.watchName = "LPW2-$msn"
        every { CucumberCtx.mockBtDevice.name } returns CucumberCtx.watchName
    }

    @When("app connects to watch")
    fun when_app_connects_to_ble_dfu_device() {
        runBlocking {
            withTimeout(TimeUnit.SECONDS.toMillis(5000)) {
                while (LifePlusReactModule._bleService.connectedDevice == null) {
                    delay(500)
                }
            }
        }
    }

    @When("watch was found")
    fun when_watch_was_found() {
        runBlocking {
            withTimeout(30000) {
                while (!CucumberCtx.slotScanCallback.isCaptured) {
                    delay(1000)
                }
                val scanRecord: ScanRecord = mockk()
                every { scanRecord.deviceName } returns CucumberCtx.mockBtDevice.name
                val mockScanResult = mockk<ScanResult>(relaxed = true)
                every { mockScanResult.device } returns CucumberCtx.mockBtDevice
                every { mockScanResult.scanRecord } returns scanRecord
                CucumberCtx.slotScanCallback.captured.onScanResult(
                    ScanSettings.CALLBACK_TYPE_FIRST_MATCH,
                    mockScanResult
                )
            }
        }
    }

    @When("watch has {int} records of vital data")
    fun when_watch_has_x_records_of_vital_data(count: Int) {
        val data = mutableListOf<ByteArray>()
        data.add(byteArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0))
        repeat(count) {
            data.add(byteArrayOf(0, 70, 0, 15, 0, 85, 0, 120, 0, 90, 0, 60, 0, 9, 7, 12, 10, 5, 15, it.toByte()))
            data.last()[13] = 229.toByte() // year 2021
        }
        CucumberCtx.vitalData = data
    }

    @When("watch has {int} records of meal data")
    fun when_watch_has_x_records_of_meal_data(count: Int) {
        val data = mutableListOf<ByteArray>()
        data.add(byteArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 0))
        repeat(count) {
            data.add(byteArrayOf(0, 0, 12, 7, 12, 10, 5, 15, it.toByte()))
            data.last()[2] = 229.toByte() // year 2021
        }
        CucumberCtx.mealData = data
    }

    @When("app executes following SQL query: {string}")
    fun when_app_executes_following_sql_query(queryString: String) {
        val pInputJson = JSONObject()
        pInputJson.put("queryName", "query")
        pInputJson.put("queryType", queryString.split(" ").first())
        pInputJson.put("query", queryString)

        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "dbTunnel" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pInputJson.toString(), promise)

        runBlocking {
            withTimeout(30000) {
                while (!responseSlot.isCaptured) {
                    delay(500)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("app prepares following SQL query: {string}")
    fun when_app_prepares_following_sql_query(queryString: String) {
        CucumberCtx.preparedSqlQueries.add(queryString)
    }

    @When("app executes prepared queries")
    fun when_app_executes_prepared_queries() {
        val wrapperJson = JSONObject()
        val queriesArray = JSONArray()

        CucumberCtx.preparedSqlQueries.forEach {
            val pInputJson = JSONObject()
            pInputJson.put("queryName", "query")
            pInputJson.put("queryType", it.split(" ").first())
            pInputJson.put("query", it)
            queriesArray.put(pInputJson)
        }

        wrapperJson.put("Queries", queriesArray)

        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "dbTunnelForMultipleQueries" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, wrapperJson.toString(), promise)

        runBlocking {
            withTimeout(30000) {
                while (!responseSlot.isCaptured) {
                    delay(500)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("app requests disconnect from the watch")
    fun when_app_requests_disconnect_from_the_watch() {
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "disConnectDevice" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule)
    }

    @When("app requests start instant measure")
    fun when_app_requests_start_instant_measure() {
        val promise = mockk<Promise>(relaxed = true)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "startInstantMeasure" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, promise)
    }

    @When("watch updates {string} characteristic value to {short}")
    fun when_updates_x_characteristic_value_to_y(charName: String, value: Short) {
        val characteristic = CucumberCtx.customService.getCharacteristic(UUID.fromString(GattCharEnum.valueOf(charName).id))
        characteristic.value = byteArrayOf(value.toByte())
        CucumberCtx.slotGattCallback.captured.onCharacteristicChanged(CucumberCtx.mockGatt, characteristic)
        runBlocking { delay(500) } // give EventBus time to deliver the event
    }

    @When("app requests start calibration with {string} params")
    fun when_app_requests_start_calibration_with_x(invalidParam: String) {
        val pRequest = if (invalidParam == "json") {
            "-"
        } else {
            val json = JSONObject()
            json.put("userId", if (invalidParam == "userId") "-" else CucumberCtx.testUserId.toString())
            json.put("deviceMsn", if (invalidParam == "deviceMsn") "" else "SEQ001")
            json.put("SPO2", if (invalidParam == "SPO2") "-" else "93")
            json.put("RR", if (invalidParam == "RR") "-" else "16")
            json.put("HR", if (invalidParam == "HR") "-" else "70")
            json.put("SBP", if (invalidParam == "SBP") "-" else "140")
            json.put("DBP", if (invalidParam == "DBP") "-" else "80")
            json.put(
                "Glucose",
                when (invalidParam) {
                    "Glucose" -> "-"
                    "validDecimalGlucose" -> "5.5"
                    else -> "75"
                }
            )
            if (invalidParam == "error id to throw") json.put("errorIdToThrow", 0)
            json.toString()
        }

        val promise = mockk<Promise>(relaxed = true)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "calibrate" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pRequest, promise)
    }

    @When("app requests start calibration with params")
    fun when_app_requests_start_calibration_with_params(data: DataTable) {
        val dataMap = data.asMaps()[0]
        val json = JSONObject()
        json.put("userId", CucumberCtx.testUserId.toString())
        json.put("deviceMsn", "SEQ001")
        json.put("SPO2", dataMap.getOrDefault("oxygenSaturation", "0"))
        json.put("RR", dataMap.getOrDefault("respirationRate", "0"))
        json.put("HR", dataMap.getOrDefault("heartRate", "0"))
        json.put("SBP", dataMap.getOrDefault("sysPressure", "0"))
        json.put("DBP", dataMap.getOrDefault("diaPressure", "0"))
        json.put("Glucose", dataMap.getOrDefault("glucose", "0"))

        val promise = mockk<Promise>(relaxed = true)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "calibrate" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, json.toString(), promise)
    }

    @When("raw data index is {short}")
    fun when_raw_data_index_is_x(index: Short) {
        CucumberCtx.rawDataIndex = index
    }

    @When("app requests app sync write with params")
    fun when_app_requests_app_sync_write_with_params(data: DataTable) {
        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val dataMap = data.asMaps()[0]

        Global.setUserId(CucumberCtx.testUserId)
        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        val db = DbAccess.getInstance(context)
        db.addTestUser(CucumberCtx.testUserId)
        val settings = db.getAppSyncData(CucumberCtx.testUserId)
        settings.height_ft = dataMap["height_ft"]!!.toInt()
        settings.height_in = dataMap["height_in"]!!.toInt()
        settings.weight = dataMap["weight"]!!.toFloat()
        settings.weightUnit = "MKS"
        settings.ethnicity = dataMap["ethnicity"]!!.toInt()
        settings.gender = dataMap["gender"]!!
        settings.skinTone = dataMap["skin_tone"]!!.toInt()
        db.updateAppSync(CucumberCtx.testUserId, settings)

        val json = JSONObject()
        json.put("userId", CucumberCtx.testUserId.toString())
        json.put("deviceMsn", "SEQ001")
        json.put("autoMeasure", "Y")
        val pRequest = json.toString()

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "appSync" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pRequest, promise)

        runBlocking {
            withTimeoutOrNull(3000) {
                while (!responseSlot.isCaptured) {
                    delay(500)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("app requests app sync write with {string} params")
    fun when_app_requests_app_sync_write(invalidParam: String) {
        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val pRequest = if (invalidParam == "json") {
            "-"
        } else {
            val json = JSONObject()
            json.put("userId", if (invalidParam == "userId") "" else CucumberCtx.testUserId.toString())
            json.put("deviceMsn", if (invalidParam == "deviceMsn") "" else "SEQ001")
            json.put("autoMeasure", "Y")
            if (invalidParam == "error id to throw") json.put("errorIdToThrow", 0)
            json.toString()
        }

        val context = ReactApplicationContext(
            InstrumentationRegistry.getInstrumentation().targetContext
        )
        DbAccess.getInstance(context).addTestUser(CucumberCtx.testUserId)
        Global.setUserId(CucumberCtx.testUserId)

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "appSync" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pRequest, promise)

        runBlocking {
            withTimeoutOrNull(3000) {
                while (!responseSlot.isCaptured) {
                    delay(500)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("app requests to start firmware update")
    fun when_app_requests_to_start_firmware_update() {
        val pRequest = JSONObject()
        val tempFile = File.createTempFile("update", ".cyacd2")
        pRequest.put("FirmwareUpdateFilePath", tempFile.absolutePath)
        val promise = mockk<Promise>(relaxed = true)

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "startFirmwareUpdate" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pRequest.toString(), promise)
    }

    @When("app requests to start firmware update with invalid file path")
    fun when_app_requests_to_start_firmware_update_with_invalid_file_path() {
        val pRequest = JSONObject()
        pRequest.put("FirmwareUpdateFilePath", "invalid/path/to/update/file/someFile.cyacd2")

        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "startFirmwareUpdate" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, pRequest.toString(), promise)

        runBlocking {
            withTimeoutOrNull(3000) {
                while (!responseSlot.isCaptured) {
                    delay(200)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("app requests to update daily step goal")
    fun when_app_requests_to_update_daily_step_goal() {
        val promise = mockk<Promise>()
        val responseSlot = CapturingSlot<String>()
        every { promise.resolve(capture(responseSlot)) } answers {}

        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "updateDailyStepGoal" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, promise)

        runBlocking {
            withTimeoutOrNull(3000) {
                while (!responseSlot.isCaptured) {
                    delay(200)
                }
                CucumberCtx.promiseResponse = responseSlot.captured
            }
        }
    }

    @When("watch enters DFU mode")
    fun when_watch_enters_dfu_mode() {
        every { CucumberCtx.mockBtDevice.name } returns FirmwareUploader.nameInDfuMode

        runBlocking {
            withTimeout(5000) {
                while (BleServices.getCurrentProcState() != BleProcStateEnum.NONE) {
                    delay(500)
                }
            }
        }
    }

    @When("watch reboots in standard mode")
    fun when_watch_in_standard_mode() {
        CucumberCtx.slotGattCallback.captured.onConnectionStateChange(
            CucumberCtx.mockGatt,
            BluetoothGatt.GATT_SUCCESS,
            BluetoothProfile.STATE_DISCONNECTED
        )
        every { CucumberCtx.mockBtDevice.name } returns CucumberCtx.watchName
        CucumberCtx.slotGattCallback.clear()
    }

    @When("app reads {string} characteristic")
    fun when_app_reads_x_characteristic(charName: String) {
        val char = GattCharEnum.values().first { it.name == charName }
        val device = LifePlusReactModule._bleService.connectedDevice
        device.readCustomServiceCharacteristic(char)
    }

    @When("app writes {byte} to command characteristic")
    fun when_app_writes_x_to_y_characteristic(value: Byte) {
        val device = LifePlusReactModule._bleService.connectedDevice
        device.writeCommand(byteArrayOf(value))
    }

    @When("app tries to enable indications on status characteristic")
    fun when_app_tries_to_enable_indicastions_on_status_characteristic() {
        val device = LifePlusReactModule._bleService.connectedDevice
        device.subscribe(NoParamEventEnum.SUBSCRIBE_CUSTOM_STATUS_INDICATION)
    }

    @When("app tries to change MTU size")
    fun when_app_tries_to_change_mtu_size() {
        val device = LifePlusReactModule._bleService.connectedDevice
        device.requestMaxMTUSize()
    }

    @When("{long} ms goes by")
    fun when_x_ms_goes_by(time: Long) {
        TimeUnit.MILLISECONDS.sleep(time)
    }

    @When("current process is {string}")
    fun when_current_process_is_x(procName: String) {
        BleProcEnum.values().firstOrNull { it.name == procName }?.let {
            BleServices.setCurrentProc(it)
        } ?: throw IllegalArgumentException("Invalid process name: $procName.")
    }

    @When("app reports API error with type {string}, url {string}, data {string}, options {string} and status {int}")
    fun when_app_reports_api_error_with_type_v_url_w_data_x_option_y_status_z(type: String, url: String, data: String, options: String, status: Int) {
        val json = JSONObject()
        json.put("type", type)
        json.put("url", url)
        json.put("data", data)
        json.put("options", options)
        json.put("status", status)
        json.toString()

        val promise = mockk<Promise>(relaxed = true)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "apiError" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, json.toString(), promise)
    }

    @When("user removes bluetooth bond")
    fun when_user_removes_bluetooth_bond() {
        every { CucumberCtx.spyAdapter.bondedDevices } answers { emptySet() }
    }

    @When("app requests to initiate DFU mode")
    fun when_app_requests_to_initiate_dfu_mode() {
        val promise = mockk<Promise>(relaxed = true)
        val method = LifePlusReactModule::class.java.declaredMethods.first { it.name == "startDfuMode" }
        method.isAccessible = true
        method.invoke(CucumberCtx.nativeModule, promise)
    }
}
