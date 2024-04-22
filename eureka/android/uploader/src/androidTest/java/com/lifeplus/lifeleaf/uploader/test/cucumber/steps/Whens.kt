package com.lifeplus.lifeleaf.uploader.test.cucumber.steps

import com.lifeplus.lifeleaf.uploader.FirmwareUploader
import com.lifeplus.lifeleaf.uploader.UpdateResult
import com.lifeplus.lifeleaf.uploader.test.CucumberCtx
import io.cucumber.java.en.When
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeoutOrNull

class Whens {

    @When("firmware uploader uploads the file")
    fun when_firmware_uploader_uploads_the_file() {
        val callback = { result: UpdateResult ->
            CucumberCtx.updateResult = result
        }
        FirmwareUploader.upload(CucumberCtx.contextMock, CucumberCtx.updateFile!!, CucumberCtx.btDeviceMock, callback)
    }

    @When("watch installs firmware update")
    fun when_watch_installs_firmware_update() {
        runBlocking {
            withTimeoutOrNull(30000) {
                while (CucumberCtx.fwUpdateSuccess == null) {
                    delay(1000)
                }
            }
            assert(CucumberCtx.fwUpdateSuccess == true) { "Firmware should have been installed." }
        }
    }
}
