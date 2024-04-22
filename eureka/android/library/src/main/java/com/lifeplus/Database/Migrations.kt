package com.lifeplus.Database

import android.database.Cursor
import android.database.SQLException
import android.util.Log
import net.sqlcipher.database.SQLiteDatabase
import kotlin.jvm.Throws

object Migrations {
    @Throws(SQLException::class)
    fun start(db: SQLiteDatabase, oldVersion: Int) {
        if (oldVersion < 2) MIGRATION_1_2(db)
    }

    internal fun MIGRATION_1_2(db: SQLiteDatabase) {
        Log.i("Migration", "Migration 1 -> 2 launched")
        var cursor: Cursor? = null
        try {
            // check if column is present
            var query = "SELECT COUNT(*) AS HAS_SKIN_COL FROM pragma_table_info('users') WHERE name='skin_tone_id'"
            cursor = db.rawQuery(query, null)
            if (cursor != null && cursor.count > 0) {
                cursor.moveToFirst()
                val hasColumn = cursor.getInt(0) == 1

                // add column if missing
                if (!hasColumn) {
                    query = "ALTER TABLE users ADD COLUMN skin_tone_id INTEGER"
                    db.execSQL(query, arrayOfNulls(0))
                }
                Log.i("Migration", "Migration 1 -> 2 finished successfully.")
                db.version = 2
            }
        } finally {
            cursor?.close()
        }
    }
}
