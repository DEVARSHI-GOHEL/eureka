package com.lifeplus.lifeleaf.uploader

interface UpdateResultListener {
    fun onCommunicationError(ex: Exception)
    fun onFileParseError(ex: Exception)
    fun onVerifyAppError()
    fun onSuccess()
}
