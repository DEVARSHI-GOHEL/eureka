package com.lifeplus.lifeleaf.uploader.test.cucumber.steps

import android.Manifest
import androidx.test.runner.permission.PermissionRequester
import com.lifeplus.lifeleaf.uploader.test.CucumberCtx
import io.cucumber.java.After
import io.cucumber.java.Before
import java.util.concurrent.TimeUnit

class Hooks {

    @Before
    fun before() {
        CucumberCtx.initObjects()
        CucumberCtx.initMocks()

        val requester = PermissionRequester()
        requester.addPermissions(Manifest.permission.BLUETOOTH_CONNECT)
        requester.requestPermissions()
    }

    @After
    fun after() {
        TimeUnit.SECONDS.sleep(2)
    }
}
