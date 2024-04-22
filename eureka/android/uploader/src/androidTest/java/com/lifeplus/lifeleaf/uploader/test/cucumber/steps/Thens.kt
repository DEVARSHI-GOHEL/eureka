package com.lifeplus.lifeleaf.uploader.test.cucumber.steps

import com.lifeplus.lifeleaf.uploader.CommunicationError
import com.lifeplus.lifeleaf.uploader.ConnectionError
import com.lifeplus.lifeleaf.uploader.CrcError
import com.lifeplus.lifeleaf.uploader.FileParseError
import com.lifeplus.lifeleaf.uploader.FileReadError
import com.lifeplus.lifeleaf.uploader.InstallationError
import com.lifeplus.lifeleaf.uploader.Success
import com.lifeplus.lifeleaf.uploader.test.CucumberCtx
import io.cucumber.java.en.Then
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull

class Thens {

    @Then("firmware update is fully uploaded")
    fun then_firmware_update_is_fully_uploader() {
        runBlocking {
            withTimeoutOrNull(30000) {
                while (CucumberCtx.verifyAppSuccess == null) {
                    delay(1000)
                }
            }
            assert(CucumberCtx.verifyAppSuccess == true) { "Firmware should have been fully uploaded." }
        }
    }

    @Then("firmware uploader will report {string}")
    fun then_firmware_uploader_will_report_success(resultString: String) {
        runBlocking {
            withTimeout(60000) {
                while (CucumberCtx.updateResult == null) {
                    delay(1000)
                }
            }

            when (CucumberCtx.updateResult) {
                is Success -> {
                    assert(resultString == "success") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is FileReadError -> {
                    assert(resultString == "fileReadError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is FileParseError -> {
                    assert(resultString == "fileParseError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is ConnectionError -> {
                    assert(resultString == "connectionError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is CommunicationError -> {
                    assert(resultString == "communicationError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is CrcError -> {
                    assert(resultString == "crcError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                is InstallationError -> {
                    assert(resultString == "installationError") { "Result should have been $resultString, but got ${CucumberCtx.updateResult!!::class.java}" }
                }
                else -> throw IllegalArgumentException("Unknown expected update result: $resultString.")
            }
        }
    }
}
