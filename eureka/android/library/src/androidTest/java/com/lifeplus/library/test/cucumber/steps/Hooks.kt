package com.lifeplus.library.test.cucumber.steps

import android.Manifest
import android.database.sqlite.SQLiteException
import android.os.Build
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.runner.permission.PermissionRequester
import com.lifeplus.Ble.BleServices
import com.lifeplus.Ble.GattCallback
import com.lifeplus.Database.DbAccess
import com.lifeplus.Events.StatusChangeEvent
import com.lifeplus.LifePlusReactModule
import com.lifeplus.Pojo.Enum.BleProcEnum
import com.lifeplus.Pojo.Enum.BleProcStateEnum
import com.lifeplus.Util.ConnectErrorHandler
import com.lifeplus.Util.SharedPrefUtils
import com.lifeplus.library.test.CucumberCtx
import io.cucumber.java.After
import io.cucumber.java.Before
import io.mockk.clearAllMocks
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.greenrobot.eventbus.EventBus

class Hooks {
    @Before
    fun before() {
        CucumberCtx.init()
        SharedPrefUtils.saveString(
            InstrumentationRegistry.getInstrumentation().targetContext,
            ConnectErrorHandler.SHARED_PREFS_SCAN_TIMEOUT,
            ""
        )
        SharedPrefUtils.saveString(
            InstrumentationRegistry.getInstrumentation().targetContext,
            ConnectErrorHandler.SHARED_PREFS_CONNECT_TIMEOUT,
            ""
        )

        // never send 023, 025, 027 events if not true
        val field = BleServices::class.java.declaredFields.first { it.name == "_appFirstBoot" }
        field.isAccessible = true
        field.setBoolean(null, false)

        GattCallback._devicePrevStatus = -1

        val requester = PermissionRequester()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requester.addPermissions(Manifest.permission.BLUETOOTH_CONNECT)
            requester.addPermissions(Manifest.permission.BLUETOOTH_SCAN)
        }
        requester.addPermissions(Manifest.permission.ACCESS_COARSE_LOCATION)
        requester.addPermissions(Manifest.permission.ACCESS_FINE_LOCATION)
        requester.requestPermissions()
    }

    @After
    fun after() {
        EventBus.getDefault().unregister(LifePlusReactModule._bleService)
        BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE)

        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val dbAccess = DbAccess.getInstance(context)
        try { dbAccess.getWritableDatabase(byteArrayOf()).close() } catch (_: SQLiteException) {}
        context.deleteDatabase(dbAccess.databaseName)

        LifePlusReactModule._bleService.connectedDevice?.cancelConnectTimer()
        CucumberCtx.slotScanCallback.clear()

        StatusChangeEvent.reset()

        // because of issue to LpLogger static mock
        runBlocking { delay(500) }
        clearAllMocks()
    }
}
