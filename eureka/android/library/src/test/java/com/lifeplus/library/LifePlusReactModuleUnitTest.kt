package com.lifeplus.library

import android.content.IntentFilter
import com.facebook.react.bridge.ReactApplicationContext
import com.lifeplus.LifePlusReactModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import org.junit.Before
import org.junit.Test

class LifePlusReactModuleUnitTest {
    private lateinit var lifePlusReactModule: LifePlusReactModule

    @Before
    fun before() {
        val context = mockk<ReactApplicationContext>(relaxed = true)

        mockkConstructor(IntentFilter::class)
        every { anyConstructed<IntentFilter>().addAction(any()) } returns Unit
        every { anyConstructed<IntentFilter>().addDataScheme(any()) } returns Unit

        lifePlusReactModule = LifePlusReactModule(context, null)
    }

    @Test
    fun moduleNameUnitTest() {
        assert(lifePlusReactModule.name == "LifePlusReactModule")
    }
}
