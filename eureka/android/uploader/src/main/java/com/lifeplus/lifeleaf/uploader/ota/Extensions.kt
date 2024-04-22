package com.lifeplus.lifeleaf.uploader.ota

import com.cypress.cysmart.CommonUtils.ConvertUtils
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.AppInfo
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.Data
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.EIV
import com.cypress.cysmart.OTAFirmwareUpdate.OTAFlashRowModel_v1.Header

/**
 * @return FileVersion(1) + SiliconId(4) + SiliconRev(1) + CheckSumType(1) + AppId(1) + ProductId(4) parsed from the line
 * @throws IllegalArgumentException if the line is invalid
 */
@Throws(IllegalArgumentException::class)
internal fun String.asRowModelHeader(): Header {
    val fileVersionLength = 2 // 2 hex digits (1 byte)
    val siliconIdLength = 8 // 4 bytes
    val siliconRevLength = 2 // 1 byte
    val checkSumTypeLength = 2 // 1 byte
    val appIdLength = 2 // 1 byte
    val productIdLength = 8 // 4 byte
    if (this.length == fileVersionLength + siliconIdLength + siliconRevLength + checkSumTypeLength + appIdLength + productIdLength) {
        var offset = 0
        val fileVersion = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, fileVersionLength)[0]
        offset += fileVersionLength
        val siliconId = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, siliconIdLength)
        offset += siliconIdLength
        val siliconRev = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, siliconRevLength)[0]
        offset += siliconRevLength
        val checkSumType = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, checkSumTypeLength)[0]
        offset += checkSumTypeLength
        val appId = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, appIdLength)[0]
        offset += appIdLength
        val productId = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, productIdLength)

        return Header(fileVersion, siliconId, siliconRev, checkSumType, appId, productId)
    }
    throw IllegalArgumentException("Invalid Header line")
}

/**
 * @return AppStart(4) + AppSize(4) parsed from the line
 * @throws IllegalArgumentException if the line is invalid
 */
@Throws(IllegalArgumentException::class)
internal fun String.asRowModelAppInfo(): AppInfo {
    val separatorIndex = this.indexOf(AppInfo.SEPARATOR)
    var offset = AppInfo.DISCRIMINATOR.length
    if (separatorIndex >= offset) { // This check covers valid string "@APPINFO:0x,0x" which gets parsed to [0,0,0,0] for address and [0,0,0,0] for size
        val appStartLength = separatorIndex - offset
        val appStart =
            ConvertUtils.hexStringToByteArrayBigEndian(this, offset, appStartLength, 8)
        offset += appStartLength + AppInfo.SEPARATOR.length
        val appSizeLength = this.length - offset // Remaining bytes for appSize
        val appSize =
            ConvertUtils.hexStringToByteArrayBigEndian(this, offset, appSizeLength, 8)
        return AppInfo(appStart, appSize)
    }
    throw IllegalArgumentException("Invalid AppInfo line")
}

/**
 * @return EIV(0, 8, or 16) parsed from the line
 */
internal fun String.asRowModelEiv(): EIV {
    val offset = EIV.DISCRIMINATOR.length
    val length = this.length - offset // Remaining bytes for EIV
    val eiv = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, length)
    return EIV(eiv)
}

/**
 * @return Address(4) + Data(N) parsed from the line
 * @throws IllegalArgumentException if the line is invalid
 */
@Throws(IllegalArgumentException::class)
internal fun String.asRowModelData(): Data {
    var offset = Data.DISCRIMINATOR.length
    val addressLength = 8 // 4 bytes
    if (offset + addressLength <= this.length) { // Address is required, data is optional
        val address =
            ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, addressLength)
        offset += addressLength
        val dataLength = this.length - offset // Remaining bytes for data
        val data = ConvertUtils.hexStringToByteArrayLittleEndian(this, offset, dataLength)
        return Data(address, data)
    }
    throw IllegalArgumentException("Invalid Data line")
}
