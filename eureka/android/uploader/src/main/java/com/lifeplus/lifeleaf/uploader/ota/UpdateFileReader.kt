package com.lifeplus.lifeleaf.uploader.ota

import com.cypress.cysmart.CommonUtils.ConvertUtils
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1
import java.io.BufferedReader
import java.io.File
import java.io.FileReader
import java.io.IOException
import java.util.ArrayList
import java.util.HashMap

/**
 * Parse .cyacd2 file according to 002-13924 *B
 * APPINFO is in Big Endian format
 * The rest of multi-byte values is in Little Endian format
 */
class UpdateFileReader(private val mFile: File) {
    /**
     * Parses the .cyacd2 file
     *
     * @return parsed data
     */
    @Throws(IOException::class)
    fun readLines(): Map<String, List<OTAFlashRowModel_v1>> {
        val rows: MutableMap<String, MutableList<OTAFlashRowModel_v1>> = HashMap()
        rows[KEY_DATA] = ArrayList()
        BufferedReader(FileReader(mFile)).use { reader ->
            var lineCount = 0
            lateinit var line: String
            while (reader.readLine()?.also { line = it } != null) {
                if (lineCount == 0) {
                    rows[KEY_HEADER] = mutableListOf(line.asRowModelHeader())
                } else { // data rows
                    when {
                        line.startsWith(OTAFlashRowModel_v1.AppInfo.DISCRIMINATOR) -> {
                            rows[KEY_APPINFO] = mutableListOf(line.asRowModelAppInfo())
                        }
                        line.startsWith(OTAFlashRowModel_v1.EIV.DISCRIMINATOR) -> {
                            rows[KEY_DATA]!!.add(line.asRowModelEiv())
                        }
                        line.startsWith(OTAFlashRowModel_v1.Data.DISCRIMINATOR) -> {
                            rows[KEY_DATA]!!.add(line.asRowModelData())
                        }
                    }
                }
                lineCount++
            }
        }
        if (!rows.containsKey(KEY_APPINFO)) {
            var appStart = 0xffffffffL
            var appSize: Long = 0
            for (row in rows[KEY_DATA]!!) {
                if (row is OTAFlashRowModel_v1.Data) {
                    val addr = ConvertUtils.byteArrayToLongLittleEndian(row.mAddress)
                    if (addr < appStart) {
                        appStart = addr
                    }
                    appSize += row.mData.size.toLong()
                }
            }
            val baAppStart = ConvertUtils.intToByteArray(appStart.toInt())
            val baAppSize = ConvertUtils.intToByteArray(appSize.toInt())
            val appInfo = OTAFlashRowModel_v1.AppInfo(baAppStart, baAppSize)
            rows[KEY_APPINFO] = mutableListOf(appInfo)
        }
        return rows
    }

    companion object {
        const val KEY_HEADER = "HEADER"
        const val KEY_APPINFO = "APPINFO"
        const val KEY_DATA = "DATA"
    }
}
