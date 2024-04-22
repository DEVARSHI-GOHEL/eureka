package com.lifeplus.lifeleaf.uploader.test.runner

import android.os.Bundle
import com.lifeplus.lifeleaf.uploader.BuildConfig
import io.cucumber.android.runner.CucumberAndroidJUnitRunner

class CucumberTestRunner : CucumberAndroidJUnitRunner() {
    private val cucumberTagsKey = "tags"

    override fun onCreate(bundle: Bundle) {
        val tags: String = BuildConfig.TEST_TAGS
        if (tags.isNotEmpty()) {
            bundle.putString(cucumberTagsKey, tags.replace("\\s".toRegex(), ""))
        }
        super.onCreate(bundle)
    }
}
