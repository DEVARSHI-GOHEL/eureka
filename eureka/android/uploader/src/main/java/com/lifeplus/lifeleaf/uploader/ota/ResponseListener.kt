package com.lifeplus.lifeleaf.uploader.ota

import android.os.Bundle

interface ResponseListener {
    fun onResponse(action: String, extras: Bundle)
}
