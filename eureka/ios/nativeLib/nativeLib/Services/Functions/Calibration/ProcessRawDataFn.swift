//
//  ProcessRawDataFn.swift
//  eureka
//
//  Created by work on 09/03/21.
//

import Foundation

internal class ProcessRawDataFn: FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }

  internal override func doOperation() -> Any? {
//    if let mError = params["error"] as? Error {
//      MeasureProcess.resetProcessState()
//      EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
//      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessRawDataFn", pEventDescription: "Unable to fire vital read command (\(mError.localizedDescription)"))
//      return nil
//    }
//
//    if let mCharctData = params["data"] as? [UInt8] {
//
//      processRawData(pCharValue: mCharctData)
//
//    } else {
//      MeasureProcess.resetProcessState()
//      EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ERROR))
//    }
    return nil
  }

  func processRawData(pCharValue: [UInt8]) {
    MeasureProcess.appendRawData(pRawRow: pCharValue)
    if (MeasureProcess.rawDataCount() < ((pCharValue.count > 100) ? 500 : 1500)) {
      return
    }

    var mArrayToUpload:[[String:Any]] = []
    for i in 0..<MeasureProcess.rawDataCount() {
      if let mCharctData = MeasureProcess.getDataAt(pIndex: i) {
        if (mCharctData.count == 31) {
          mArrayToUpload.append(convertRawDataOldFormat(mCharctData: mCharctData))
        } else if (mCharctData.count == 175){
          let mStatus = LpUtility.byteToInt(pByte: mCharctData[0])

          var mUploadToServerAndSaveInDB = convertRawData175Format(mCharctData[1...58])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)
          
          mUploadToServerAndSaveInDB = convertRawData175Format(mCharctData[59...116])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)

          if (i == MeasureProcess.rawDataCount() - 1) {
            mUploadToServerAndSaveInDB = convertRawData175Format(mCharctData[117...174], includeVitals: true)
          } else {
            mUploadToServerAndSaveInDB = convertRawData175Format(mCharctData[117...174])
          }
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)
        } else if (mCharctData.count == 211){
          let mStatus = LpUtility.byteToInt(pByte: mCharctData[0])

          var mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[1...70])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)
          
          mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[71...140])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)

          mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[141...210])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mArrayToUpload.append(mUploadToServerAndSaveInDB)
        }
      }
    }

    do {
      try DbAccess.addRawData(pValues: mArrayToUpload)
    } catch let error {
      print(error.localizedDescription)
    }

    do {
      let mData = ["data" : mArrayToUpload]
      let jsonData = try JSONSerialization.data(withJSONObject: mData, options: [])
      let mRawDataToCloud = String(data: jsonData, encoding: String.Encoding.ascii)!

      // measurementTime get from last vitals, if not found then pass empty to use the same upload ts value.
      var measurementTime = ""
      if let vitals = mArrayToUpload.last?["vitals"] as? [String : Any], let time = vitals["measure_time"] {
        measurementTime = "\(time)"
      }

      LpLogger.logInfo(LoggerStruct("processRawData", pFileName: "ProcessRawDataFn", pEventDescription: "Raw data processed"))

      DispatchQueue.global().async {
        do {
          try LpUtility.uploadRawDataOnCloud(pReturnJson: mRawDataToCloud, measurementTime: measurementTime)
          LpLogger.logInfo(LoggerStruct("processRawData", pFileName: "ProcessRawDataFn", pEventDescription: "Raw data uploaded"))
          MeasureProcess.clearRawData()
        } catch _ {
          // no code required
        }
      }
    } catch _ {
      // no code required
    }
  }

  private func convertRawData175Format(_ pCharctData: ArraySlice<UInt8>, includeVitals: Bool = false) -> [String:Any] {
    let mCharctData = Array(pCharctData)
    var mUploadToServerAndSaveInDB:[String:Any] = convertRawData(pCharctData: mCharctData[0...29])
    
    mUploadToServerAndSaveInDB["AFEPHASE1"] = get4ByteLong(mCharctData: mCharctData[30...33])
    mUploadToServerAndSaveInDB["AFEPHASE2"] = get4ByteLong(mCharctData: mCharctData[34...37])
    mUploadToServerAndSaveInDB["AFEPHASE3"] = get4ByteLong(mCharctData: mCharctData[38...41])
    mUploadToServerAndSaveInDB["AFEPHASE4"] = get4ByteLong(mCharctData: mCharctData[42...45])
    mUploadToServerAndSaveInDB["AFEPHASE5"] = get4ByteLong(mCharctData: mCharctData[46...49])
    mUploadToServerAndSaveInDB["AFEPHASE6"] = get4ByteLong(mCharctData: mCharctData[50...53])
    mUploadToServerAndSaveInDB["AFEPHASE7"] = get4ByteLong(mCharctData: mCharctData[54...57])
    if (includeVitals) {
      if let mGoldParams = MeasureProcess.getGoldParams()["data"] as? [String : Any] {
        mUploadToServerAndSaveInDB["vitals"] = mGoldParams
      }
    }

    return mUploadToServerAndSaveInDB
  }

  private func convertRawDataNewFormat(pCharctData: ArraySlice<UInt8>) -> [String:Any] {
    let mCharctData = Array(pCharctData)
    var mUploadToServerAndSaveInDB:[String:Any] = convertRawData(pCharctData: mCharctData[0...29])

    mUploadToServerAndSaveInDB["AFEPHASE1"] = get4ByteLong(mCharctData: mCharctData[30...33])
    mUploadToServerAndSaveInDB["AFEPHASE2"] = get4ByteLong(mCharctData: mCharctData[34...37])
    mUploadToServerAndSaveInDB["AFEPHASE3"] = get4ByteLong(mCharctData: mCharctData[38...41])
    mUploadToServerAndSaveInDB["AFEPHASE4"] = get4ByteLong(mCharctData: mCharctData[42...45])
    mUploadToServerAndSaveInDB["AFEPHASE5"] = get4ByteLong(mCharctData: mCharctData[46...49])
    mUploadToServerAndSaveInDB["AFEPHASE6"] = get4ByteLong(mCharctData: mCharctData[50...53])
    mUploadToServerAndSaveInDB["AFEPHASE7"] = get4ByteLong(mCharctData: mCharctData[54...57])

    mUploadToServerAndSaveInDB["Gyro1a1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[58], pSecondByte: mCharctData[59] )
    mUploadToServerAndSaveInDB["Gyro2a1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[60], pSecondByte: mCharctData[61] )
    mUploadToServerAndSaveInDB["Gyro3a1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[62], pSecondByte: mCharctData[63] )

    mUploadToServerAndSaveInDB["Accelerometer_X1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[64], pSecondByte: mCharctData[65] )
    mUploadToServerAndSaveInDB["Accelerometer_Y1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[66], pSecondByte: mCharctData[67] )
    mUploadToServerAndSaveInDB["Accelerometer_Z1"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[68], pSecondByte: mCharctData[69] )

    return mUploadToServerAndSaveInDB
  }

  private func get2ByteInt(mCharctData: ArraySlice<UInt8>) -> Int {
    let mArray = Array(mCharctData)
    return LpUtility.byteArrToInt(pFirstByte: mArray[0], pSecondByte: mArray[1])
  }

  private func get4ByteLong(mCharctData: ArraySlice<UInt8>) -> Int32 {
    let mArray = Array(mCharctData)
    return LpUtility.convertBytes(bytes: mArray, into: Int32.self)
  }

  private func convertRawDataOldFormat(mCharctData: [UInt8]) -> [String:Any] {
    var mUploadToServerAndSaveInDB:[String:Any] = convertRawData(pCharctData: mCharctData[1...30])

    let mStatus = LpUtility.byteToInt(pByte: mCharctData[0])
    mUploadToServerAndSaveInDB["OpStatus"] = mStatus

    return mUploadToServerAndSaveInDB
  }

  private func convertRawData(pCharctData: ArraySlice<UInt8>) -> [String:Any] {
    var mUploadToServerAndSaveInDB:[String:Any] = [:]

    let mCharctData = Array(pCharctData)
    let mCurrentIndex = LpUtility.byteArrToInt( pFirstByte: mCharctData[0], pSecondByte: mCharctData[1] )
    mUploadToServerAndSaveInDB["CurrentIndex"] = mCurrentIndex

    mUploadToServerAndSaveInDB["AFEData1"] = get4ByteLong(mCharctData: mCharctData[2...5])
    mUploadToServerAndSaveInDB["AFEData2"] = get4ByteLong(mCharctData: mCharctData[6...9])
    mUploadToServerAndSaveInDB["AFEData3"] = get4ByteLong(mCharctData: mCharctData[10...13])
    mUploadToServerAndSaveInDB["AFEData4"] = get4ByteLong(mCharctData: mCharctData[14...17])

    mUploadToServerAndSaveInDB["Gyro1a"] = LpUtility.convertBytes(bytes: [mCharctData[18],mCharctData[19]], into: Int16.self)
    mUploadToServerAndSaveInDB["Gyro2a"] = LpUtility.convertBytes(bytes: [mCharctData[20],mCharctData[21]], into: Int16.self)
    mUploadToServerAndSaveInDB["Gyro3a"] = LpUtility.convertBytes(bytes: [mCharctData[22],mCharctData[23]], into: Int16.self)

    mUploadToServerAndSaveInDB["Accelerometer_X"] = LpUtility.convertBytes(bytes: [mCharctData[24],mCharctData[25]], into: Int16.self)
    mUploadToServerAndSaveInDB["Accelerometer_Y"] = LpUtility.convertBytes(bytes: [mCharctData[26],mCharctData[27]], into: Int16.self)
    mUploadToServerAndSaveInDB["Accelerometer_Z"] = LpUtility.convertBytes(bytes: [mCharctData[28],mCharctData[29]], into: Int16.self)

    return mUploadToServerAndSaveInDB
  }
}
