package com.lifeplus.library.test.cucumber.steps

import com.lifeplus.Ble.BleServices
import com.lifeplus.Pojo.Enum.BleCommandEnum
import com.lifeplus.Pojo.Enum.BleProcEnum
import com.lifeplus.Pojo.Enum.BleProcStateEnum
import com.lifeplus.Pojo.Enum.GattCharEnum
import com.lifeplus.exceptions.ApiException
import com.lifeplus.exceptions.BluetoothException
import com.lifeplus.exceptions.DatabaseException
import com.lifeplus.library.test.CucumberCtx
import io.cucumber.datatable.DataTable
import io.cucumber.java.en.Then
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class Thens {
    @Then("BLE scan shall be started")
    fun then_ble_scan_shall_be_started() {
        assert(CucumberCtx.slotScanCallback.isCaptured)
    }

    @Then("event with message {string} should be emitted to the app")
    fun then_event_with_message_x_should_be_emitted_to_the_app(message: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.emittedEvents.isEmpty()) {
                    delay(200)
                }
            }
        }
        val event = CucumberCtx.emittedEvents.removeFirst()
        assert(event.second.contains("\"message\":\"$message\"")) {
            "Event: $event doesn't contain message: $message"
        }
    }

    @Then("watch shall be connected")
    fun then_watch_shall_be_connected() {
        assert(CucumberCtx.slotGattCallback.isCaptured)
    }

    @Then("services and characteristics {string} be discovered")
    fun then_services_and_characteristics_x_be_discovered(action: String) {
        val shouldBeDiscovered = when (action) {
            "shall" -> true
            "shall not" -> false
            else -> throw IllegalArgumentException("Invalid action $action, expected 'shall' or 'shall not'.")
        }
        runBlocking { delay(200) }
        assert(
            BleServices.getCurrentProcState() in listOf(
                BleProcStateEnum.SET_MAX_MTU,
                BleProcStateEnum.SUBSCRIBE_INDICATION,
                BleProcStateEnum.SUBSCRIBE_MEAL_INDICATION
            ) == shouldBeDiscovered
        ) {
            "Wrong state: ${BleServices.getCurrentProcState()}"
        }
    }

    @Then("MTU size change should be requested")
    fun then_MTU_size_change_should_be_requested() {
        assert(CucumberCtx.mtuRequested)
    }

    @Then("descriptor of {string} characteristic should be set to {string} value")
    fun then_descriptor_of_x_characteristic_should_be_set_to_y_value(charName: String, value: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.updatedDescriptors.isEmpty()) {
                    delay(200)
                }
            }
        }
        val char = GattCharEnum.valueOf(charName)
        val desc = CucumberCtx.updatedDescriptors.removeFirst()
        assert(desc.uuid == UUID.fromString(char.id)) {
            "${char.id} expected, but ${desc.uuid} found"
        }
        assert(desc.value.joinToString(":") == value) {
            "$value expected, but ${desc.value.joinToString(":")} found"
        }
    }

    @Then("characteristic {string} value should be read")
    fun then_characteristic_x_value_should_be_read(charName: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.readChars.isEmpty()) {
                    delay(100)
                }
            }
        }
        val char = GattCharEnum.valueOf(charName)
        val uuid = CucumberCtx.readChars.removeFirst()
        assert(uuid == UUID.fromString(char.id)) {
            "${char.id} expected, but $uuid found"
        }
    }

    @Then("characteristic {string} value should be written")
    fun then_characteristic_x_value_should_be_written(charName: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.writeChars.isEmpty()) {
                    delay(200)
                }
            }
        }
        val char = GattCharEnum.valueOf(charName)
        val uuid = CucumberCtx.writeChars.removeFirst().first
        assert(uuid == UUID.fromString(char.id)) {
            "${char.id} expected, but $uuid found"
        }
    }

    @Then("characteristic {string} should be written with value {string}")
    fun then_characteristic_x_should_be_written_with_value(charName: String, value: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.writeChars.isEmpty()) {
                    delay(200)
                }
            }
        }
        val char = GattCharEnum.valueOf(charName)
        val (uuid, data) = CucumberCtx.writeChars.removeFirst()
        assert(uuid == UUID.fromString(char.id)) {
            "${char.id} expected, but $uuid found with data ${data.joinToString(":")}"
        }
        value.split(",").forEachIndexed { index, item ->
            if (item != ".") {
                assert(data[index].toUByte() == item.toInt().toUByte()) {
                    "$item expected, but ${data[index].toUByte()} found at index $index"
                }
            }
        }
    }

    @Then("characteristic {string} should not be written")
    fun then_characteristic_x_value_should_not_be_written(charName: String) {
        val char = GattCharEnum.valueOf(charName)
        assert(
            CucumberCtx.writeChars.firstOrNull
            { it.first.toString().lowercase() == char.id.lowercase() } == null
        ) {
            "${char.id} should not have been written"
        }
    }

    @Then("watch shall receive current time")
    fun then_watch_shall_receive_current_time() {
        then_characteristic_x_value_should_be_written("CURRENT_TIME")
        assert(CucumberCtx.timeSet)
    }

    @Then("watch shall receive time zone")
    fun then_watch_shall_receive_time_zone() {
        then_characteristic_x_value_should_be_written("LOCAL_TIME_INFORMATION")
        assert(CucumberCtx.timeZoneSet)
    }

    @Then("watch shall receive step goal")
    fun then_watch_shall_receive_step_goal() {
        then_characteristic_x_value_should_be_written("STEP_COUNTER")
        assert(CucumberCtx.stepGoalSet)
    }

    @Then("watch shall receive command {string} on command characteristic")
    fun then_watch_shall_receive_command_x_on_command_characteristic(command: String) {
        then_characteristic_x_value_should_be_written("COMMAND")

        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.processedCommands.isEmpty()) {
                    delay(200)
                }
            }
        }
        val cmd = CucumberCtx.processedCommands.removeFirst()
        if (command == "GET_STEP_COUNTER_*") {
            assert(
                cmd in listOf(
                    BleCommandEnum.GET_STEP_COUNTER_SUN.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_MON.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_TUE.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_WED.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_THU.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_FRI.value[0],
                    BleCommandEnum.GET_STEP_COUNTER_SAT.value[0]
                )
            ) {
                "Received command is $cmd, but $command expected."
            }
        } else {
            val expected = BleCommandEnum.valueOf(command)
            assert(cmd == expected.value[0]) {
                "Received command is $cmd, but ${expected.value[0]} expected."
            }
        }
    }

    @Then("watch shall not receive any command on command characteristic")
    fun then_watch_shall_not_receive_any_command_on_command_characteristic() {
        assert(CucumberCtx.processedCommands.isEmpty()) {
            "Commands list contains: ${CucumberCtx.processedCommands.joinToString(":")}"
        }
    }

    @Then("app shall receive devices")
    fun then_app_shall_receive_devices(data: DataTable) {
        val map = data.asMaps()

        val responseJson = JSONObject(CucumberCtx.promiseResponse ?: "")
        val resultJson = if (responseJson.has("databaseTunnel")) {
            (responseJson["databaseTunnel"] as JSONObject)["result"] as JSONObject
        } else {
            val jsonArr = responseJson["results"] as JSONArray
            (jsonArr.get(jsonArr.length() - 1) as JSONObject)["result"] as JSONObject
        }

        assert(resultJson["status"] == "success")
        val rows = resultJson["rows"] as JSONArray

        assert(map.size == rows.length())
        map.forEachIndexed { index, obj ->
            val row = rows[index] as JSONObject
            assert(obj["id"] == row["id"])
            assert(obj["hw_id"] == row["hw_id"])
            assert(obj["date_added"] == row["date_added"])
            assert((obj["update_date"] ?: "") == row["update_date"])
        }
    }

    @Then("app shall receive error response")
    fun then_app_shall_receive_error_response() {
        val resultJson = (JSONObject(CucumberCtx.promiseResponse ?: "")["databaseTunnel"] as JSONObject)["result"] as JSONObject
        assert(resultJson["status"] == "failed")
    }

    @Then("app shall receive empty response")
    fun then_app_shall_receive_empty_response() {
        val resultJson = (JSONObject(CucumberCtx.promiseResponse ?: "")["databaseTunnel"] as JSONObject)["result"] as JSONObject
        assert(resultJson["status"] == "success")

        val rows = resultJson["rows"] as JSONArray
        assert(rows.length() == 0)
    }

    @Then("BLE scan shall not be started")
    fun then_ble_scan_shall_not_be_started() {
        assert(!CucumberCtx.scanStarted)
    }

    @Then("instant measure shall start")
    fun then_instant_measure_shall_start() {
        assert(BleServices.getCurrentProc() == BleProcEnum.INSTANT_MEASURE)
        assert(
            BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_BEFORE ||
                BleServices.getCurrentProcState() == BleProcStateEnum.MEASURE_START
        )
    }

    @Then("instant measure shall not start")
    fun then_instant_measure_shall_not_start() {
        assert(
            BleServices.getCurrentProc() != BleProcEnum.INSTANT_MEASURE || (
                BleServices.getCurrentProcState() != BleProcStateEnum.SET_MEASURE_CALC_BEFORE &&
                    BleServices.getCurrentProcState() != BleProcStateEnum.MEASURE_START
                )
        )
    }

    @Then("calibration shall start")
    fun then_calibration_shall_start() {
        assert(BleServices.getCurrentProc() == BleProcEnum.CALIBRATE)
        assert(
            BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_BEFORE ||
                BleServices.getCurrentProcState() == BleProcStateEnum.CALIBRATION_REFERENCE_WRITE ||
                BleServices.getCurrentProcState() == BleProcStateEnum.CALIBRATION_START ||
                BleServices.getCurrentProcState() == BleProcStateEnum.MEASURE_COMMAND_FIRED
        )
    }

    @Then("calibration shall not start")
    fun then_calibration_shall_not_start() {
        assert(
            BleServices.getCurrentProc() != BleProcEnum.CALIBRATE ||
                BleServices.getCurrentProcState() !in
                listOf(BleProcStateEnum.CALIBRATION_START, BleProcStateEnum.MEASURE_COMMAND_FIRED)
        )
    }

    @Then("app sync response shall start")
    fun then_app_sync_shall_start() {
        assert(CucumberCtx.promiseResponse?.contains("298: Request is being processed") == true)
    }

    @Then("app sync response shall not start")
    fun then_app_sync_shall_not_start() {
        assert(CucumberCtx.promiseResponse?.contains("298: Request is being processed") != true)
    }

    @Then("update daily step goal shall not start")
    fun then_update_daily_step_goal_shall_not_start() {
        assert(CucumberCtx.promiseResponse?.contains("521: Request is being processed") != true)
    }

    @Then("app shall initiate DFU mode on the watch")
    fun then_app_shall_initiate_dfu_mode_on_the_watch() {
        assert(BleServices.getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE)
        assert(BleServices.getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_INITIATE_DFU)
    }

    @Then("firmware update shall start")
    fun then_firmware_update_shall_start() {
        runBlocking {
            withTimeout(5000) {
                while (BleServices.getCurrentProcState() != BleProcStateEnum.FIRMWARE_UPDATE_START) {
                    delay(500)
                }
            }
        }
        assert(BleServices.getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE)
        assert(BleServices.getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_START)
    }

    @Then("app shall report {string} error with message {string}")
    fun then_app_shall_report_x_error_with_message_y(errorType: String, message: String) {
        runBlocking {
            withTimeout(5000) {
                while (CucumberCtx.lastError == null) {
                    delay(200)
                }
            }
        }
        when (errorType) {
            "database" -> assert(CucumberCtx.lastError?.first is DatabaseException)
            "bluetooth" -> assert(CucumberCtx.lastError?.first is BluetoothException)
            "api" -> assert(CucumberCtx.lastError?.first is ApiException)
            else -> throw IllegalArgumentException("Invalid error type '$errorType', expected 'database', 'bluetooth' or 'api'.")
        }
        assert(CucumberCtx.lastError?.first?.message?.contains(message) == true)
    }

    @Then("error shall contain key {string} with value {string}")
    fun then_error_shall_contain_key_x_with_value_y(key: String, value: String) {
        if (value.isBlank()) {
            val recordedValue = CucumberCtx.lastError?.second?.get(key)
            assert(recordedValue == null || recordedValue.isBlank())
        } else {
            assert(CucumberCtx.lastError?.second?.get(key)?.lowercase()?.contains(value.lowercase()) == true)
        }
    }

    @Then("app shall not report any error")
    fun then_app_shall_not_report_any_error() {
        assert(CucumberCtx.lastError == null)
    }

    @Then("app shall receive response {string}")
    fun then_app_shall_receive_response(response: String) {
        assert(CucumberCtx.promiseResponse?.contains(response) == true)
    }

    @Then("event {string} shall be emitted to the app")
    fun then_event_x_shall_be_emitted_to_the_app(eventType: String) {
        runBlocking {
            withTimeout(16000) {
                while (CucumberCtx.emittedEvents.isEmpty()) {
                    delay(200)
                }
            }
        }
        val event = CucumberCtx.emittedEvents.removeFirst()
        assert(event.first == eventType) {
            "Event: $event doesn't contain event: $eventType"
        }
    }

    @Then("app shall receive unsuccessful measurement type")
    fun then_app_shall_receive_unsuccessful_measurement_type() {
        val responseJson = JSONObject(CucumberCtx.promiseResponse ?: "")
        val resultJson = if (responseJson.has("databaseTunnel")) {
            (responseJson["databaseTunnel"] as JSONObject)["result"] as JSONObject
        } else {
            val jsonArr = responseJson["results"] as JSONArray
            (jsonArr.get(jsonArr.length() - 1) as JSONObject)["result"] as JSONObject
        }

        assert(resultJson["status"] == "success")
        val rows = resultJson["rows"] as JSONArray

        assert(rows.length() == 1)
        val row = rows[0] as JSONObject
        assert(row["type"] == "U")
    }
}
