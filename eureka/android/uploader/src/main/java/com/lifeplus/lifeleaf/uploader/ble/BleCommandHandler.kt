package com.lifeplus.lifeleaf.uploader.ble

import com.cypress.cysmart.CommonUtils.Logger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class BleCommandHandler(
    private val bleEventListener: BleEventListener,
    private val commandTimeout: Long = 5000L,
    private var scope: CoroutineScope = CoroutineScope(Dispatchers.Main)
) {
    private val maxAttempts = 10
    private var attempt = 1
    private var job: Job? = null

    private var cmd: (() -> Unit)? = null

    fun sendCommand(cmd: () -> Unit) {
        Logger.d("$this: sendCommand")
        attempt = 1
        this.cmd = cmd
        cmd.invoke()
    }

    fun onCommandSent() {
        Logger.d("$this: onCommandSent")
        cmd?.let {
            job = scope.launch {
                nextAttemptWithTimeout()
            }
        }
    }

    fun onResponse() {
        Logger.d("$this: onResponse")
        cmd = null
        runBlocking { job?.cancelAndJoin() }
        job = null
    }

    private suspend fun nextAttemptWithTimeout() {
        delay(commandTimeout)
        if (attempt < maxAttempts) {
            attempt++
            Logger.d("$this: attempt $attempt")
            cmd?.invoke()
        } else {
            Logger.d("$this: timeout")
            bleEventListener.onCommunicationError(Exception("Response not received from remote device."), false)
        }
    }
}
