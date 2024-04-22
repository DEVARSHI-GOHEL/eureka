package com.lifeplus.lifeleaf.uploader.ble

import com.cypress.cysmart.CommonUtils.Logger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class BleTimeoutHandler(
    private val bleEventListener: BleEventListener,
    private val timeout: Long = 10000L,
    private var scope: CoroutineScope = CoroutineScope(Dispatchers.Main)
) {
    private var job: Job? = null

    fun onCommandSent() {
        Logger.d("$this: onCommandSent")
        runBlocking { job?.cancelAndJoin() }
        job = scope.launch {
            delay(timeout)
            Logger.d("$this: timeout")
            bleEventListener.onCommunicationError(Exception("Communication with watch timed out."), false)
        }
    }

    fun cancel() {
        runBlocking { job?.cancelAndJoin() }
        job = null
    }
}
