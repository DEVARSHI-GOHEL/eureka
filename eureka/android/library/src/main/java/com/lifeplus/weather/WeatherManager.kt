package com.lifeplus.weather

import android.content.Context
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequest
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class WeatherManager(val context: Context) {
    private val workManager = WorkManager.getInstance(context)
    private var request: PeriodicWorkRequest? = null

    fun start() {
        stop()
        gpsTracker.startLocationUpdates(context)
        val builder = PeriodicWorkRequestBuilder<OpenWeatherWorker>(
            PeriodicWorkRequest.MIN_PERIODIC_INTERVAL_MILLIS,
            TimeUnit.MILLISECONDS
        )
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        request = builder
            .setConstraints(constraints)
            .setInitialDelay(TimeUnit.SECONDS.toSeconds(5), TimeUnit.SECONDS)
            .build()
        workManager.enqueue(request!!)
    }

    fun stop() {
        request?.also {
            workManager.cancelWorkById(it.id)
        }
        request = null
        gpsTracker.stopLocationUpdates(context)
    }

    companion object {
        val gpsTracker = GPSTracker()
    }
}
