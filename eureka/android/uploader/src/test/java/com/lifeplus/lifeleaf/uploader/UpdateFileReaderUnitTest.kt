package com.lifeplus.lifeleaf.uploader

import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1
import com.lifeplus.lifeleaf.uploader.ota.UpdateFileReader
import com.lifeplus.lifeleaf.uploader.ota.asRowModelAppInfo
import com.lifeplus.lifeleaf.uploader.ota.asRowModelData
import com.lifeplus.lifeleaf.uploader.ota.asRowModelEiv
import com.lifeplus.lifeleaf.uploader.ota.asRowModelHeader
import org.junit.Test
import java.io.File

class UpdateFileReaderUnitTest {

    @Test
    fun headerParsingTest() {
        val headerString = "01002144E221000104030201"

        headerString.asRowModelHeader().run {
            assert(mFileVersion == 0x01.toByte()) { "Incorrect FileVersion." }
            assert(mSiliconId.contentEquals(byteArrayOf(0x00, 0x21, 0x44, 0xE2.toByte()))) { "Incorrect SiliconId." }
            assert(mSiliconRev == 0x21.toByte()) { "Incorrect SiliconRev." }
            assert(mCheckSumType == 0x00.toByte()) { "Incorrect ChecksumType." }
            assert(mAppId == 0x01.toByte()) { "Incorrect AppId." }
            assert(mProductId.contentEquals(byteArrayOf(0x04, 0x03, 0x02, 0x01))) { "Incorrect ProductId." }
        }
    }

    @Test
    fun appInfoParsingTest() {
        val appInfoString = "@APPINFO:0x19000000,0x1fffc"

        appInfoString.asRowModelAppInfo().run {
            assert(mAppSize.contentEquals(byteArrayOf(0xFC.toByte(), 0xFF.toByte(), 0x01, 0x00))) { "Incorrect AppSize." }
            assert(mAppStart.contentEquals(byteArrayOf(0x00, 0x00, 0x00, 0x19))) { "Incorrect AppStart." }
        }
    }

    @Test
    fun eivParsingTest() {
        val eivString = "@EIV:0123456789"

        eivString.asRowModelEiv().run {
            assert(mEiv.contentEquals(byteArrayOf(0x01, 0x23, 0x45, 0x67, 0x89.toByte()))) { "Incorrect EIV." }
        }
    }

    @Test
    fun dataParsingTest() {
        val dataString = ":0000001900400208230100190D00000085010019000000000000000000000000000000000000000000000000000000008101001900000000000000008101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001981010019810100198101001910B5064C2378002B07D1054B002B02D0044800E000BF0123237010BD3C07000800000000C8200019084B10B5002B03D00749084800E000BF07480368002B00D110BD064B002BFBD09847F9E70000000040070008C8200019E8010008000000007047FFF7FDFF72B60F4C104DAC4209DA21686268A368043B02DBC858D050FAE70C34F3E70A490B4A0020521A02DD043A8850FCDC084809490860BFF34F8F00F005F900F01DF8FEE7CC200019E42000193C070008140900080001000808ED00E0FEE7FEE700B504207146084202D0EFF3098001E0EFF30880043001F079F9FEE710B562B6014800F067F9FEE70000081010B5002000F0EAFE10BDC04670B56249E0239B00CB580F2213401A00D0329200525807210A40032A05D0042A06D0002A12D15A4814E05A4A106811E01A00C0329200554952581F210A40112A06D0132A"

        dataString.asRowModelData().run {
            assert(mAddress.contentEquals(byteArrayOf(0x00, 0x00, 0x00, 0x19))) { "Incorrect data Address." }
            assert(mData.size == 512) { "Incorrect data." }
        }
    }

    @Test
    fun exampleUpdateFileTest() {
        val updateFile = File("src/test/resources/example_update.cyacd2")
        val reader = UpdateFileReader(updateFile)

        val result = reader.readLines()
        assert(result.containsKey("HEADER")) { "Parsed file must contain HEADER" }
        assert(result["HEADER"]!!.size == 1) { "Parsed file must contain only one header" }

        (result["HEADER"]!![0] as OTAFlashRowModel_v1.Header).run {
            assert(mFileVersion == 0x00.toByte()) { "Incorrect FileVersion." }
            assert(mSiliconId.contentEquals(byteArrayOf(0x01, 0x00, 0x00, 0x00))) { "Incorrect SiliconId." }
            assert(mSiliconRev == 0x01.toByte()) { "Incorrect SiliconRev." }
            assert(mCheckSumType == 0x33.toByte()) { "Incorrect ChecksumType." }
            assert(mAppId == 0x44.toByte()) { "Incorrect AppId." }
            assert(mProductId.contentEquals(byteArrayOf(0x55, 0x55, 0x55, 0x55))) { "Incorrect ProductId." }
        }

        assert(result.containsKey("APPINFO")) { "Parsed file must contain APPINFO" }
        assert(result["APPINFO"]!!.size == 1) { "Parsed file should contain only one APPINFO" }

        (result["APPINFO"]!![0] as OTAFlashRowModel_v1.AppInfo).run {
            assert(mAppSize.contentEquals(byteArrayOf(0x02, 0x00, 0x00, 0x00))) { "Incorrect AppSize." }
            assert(mAppStart.contentEquals(byteArrayOf(0x01, 0x00, 0x00, 0x00))) { "Incorrect AppStart." }
        }

        assert(result.containsKey("DATA")) { "Parsed file must contain DATA." }
        assert(result["DATA"]!!.size == 2) { "Parsed file should contain two DATA entries." }

        (result["DATA"]!![0] as OTAFlashRowModel_v1.EIV).run {
            assert(mEiv.contentEquals(byteArrayOf(0x01, 0x23, 0x45, 0x67, 0x89.toByte()))) { "Incorrect AppSize." }
        }

        (result["DATA"]!![1] as OTAFlashRowModel_v1.Data).run {
            assert(mAddress.contentEquals(byteArrayOf(0x11, 0x22, 0x33, 0x44))) { "Incorrect data Address." }
            assert(mData.contentEquals(byteArrayOf(0x55, 0x66, 0x77))) { "Incorrect data." }
        }
    }

    @Test
    fun realUpdateFileTest() {
        val updateFile = File("src/test/resources/Weights.cyacd2")
        val reader = UpdateFileReader(updateFile)

        val result = reader.readLines()
        assert(result.containsKey("HEADER")) { "Parsed file must contain HEADER" }
        assert(result["HEADER"]!!.size == 1) { "Parsed file must contain only one header" }

        (result["HEADER"]!![0] as OTAFlashRowModel_v1.Header).run {
            assert(mFileVersion == 0x01.toByte()) { "Incorrect FileVersion." }
            assert(mSiliconId.contentEquals(byteArrayOf(0x0, 0x21, 0x44, 0xE2.toByte()))) { "Incorrect SiliconId." }
            assert(mSiliconRev == 0x21.toByte()) { "Incorrect SiliconRev." }
            assert(mCheckSumType == 0x00.toByte()) { "Incorrect ChecksumType." }
            assert(mAppId == 0x01.toByte()) { "Incorrect AppId." }
            assert(mProductId.contentEquals(byteArrayOf(0x04, 0x03, 0x02, 0x01))) { "Incorrect ProductId." }
        }

        assert(result.containsKey("APPINFO")) { "Parsed file must contain APPINFO" }
        assert(result["APPINFO"]!!.size == 1) { "Parsed file should contain only one APPINFO" }

        (result["APPINFO"]!![0] as OTAFlashRowModel_v1.AppInfo).run {
            assert(mAppSize.contentEquals(byteArrayOf(0xFC.toByte(), 0xFF.toByte(), 0x01, 0x00))) { "Incorrect AppSize." }
            assert(mAppStart.contentEquals(byteArrayOf(0x00, 0x00, 0x00, 0x19))) { "Incorrect AppStart." }
        }

        assert(result.containsKey("DATA")) { "Parsed file must contain DATA." }
        assert(result["DATA"]!!.size == 15821) { "Parsed file should contain two DATA entries." }
    }
}
