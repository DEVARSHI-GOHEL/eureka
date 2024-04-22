package com.lifeplus.library

import android.util.Log
import com.lifeplus.Database.Migrations
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import net.sqlcipher.Cursor
import net.sqlcipher.database.SQLiteDatabase
import org.junit.After
import org.junit.Before
import org.junit.Test

class MigrationsUnitTest {

    private val cursorMock = mockk<Cursor>()
    private val dbMock = mockk<SQLiteDatabase>(relaxed = true)
    private val versionSlot = slot<Int>()

    @Before
    fun before() {
        every { cursorMock.count } returns 1
        every { cursorMock.getInt(0) } returns 0
        every { cursorMock.moveToFirst() } returns true
        every { cursorMock.close() } returns Unit

        every { dbMock.version = capture(versionSlot) } returns Unit
        every { dbMock.rawQuery(any(), any()) } returns cursorMock

        mockkStatic(Log::class)
        every { Log.i(any(), any()) } returns 0
    }

    @After
    fun after() {
        clearAllMocks()
    }

    @Test
    fun startUnitTest() {
        val oldVersion = 1
        val newVersion = 2
        Migrations.start(dbMock, oldVersion)

        verify(exactly = newVersion - oldVersion) { dbMock.version = any() }
        assert(versionSlot.captured == newVersion) { "Database was not updated to latest version." }
    }

    @Test
    fun migration1to2() {
        Migrations.MIGRATION_1_2(dbMock)
        verify(exactly = 1) { dbMock.execSQL(any(), any()) }
        assert(versionSlot.captured == 2) { "This migration should have updated database version to 2." }
    }
}
