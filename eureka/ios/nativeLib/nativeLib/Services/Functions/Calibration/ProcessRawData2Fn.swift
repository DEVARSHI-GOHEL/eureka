//
//  ProcessRawData2Fn.swift
//  eureka
//
//  Created by work on 17/05/21.
//

import Foundation

internal class ProcessRawData2Fn: FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    return nil
  }
  
  func processRawData2() {
    var mArraysToUpload:[Int64:[[String:Any]]] = [:]
    for i in 0..<MeasureProcess.rawDataCount() {
      if let mCharctData = MeasureProcess.getDataAt(pIndex: i) {
        if (mCharctData.count == 218){
          let mStatus = LpUtility.byteToInt(pByte: mCharctData[0])
          
          let mYER = LpUtility.byteArrToInt(pFirstByte: mCharctData[1], pSecondByte: mCharctData[2])
          let mMon = LpUtility.byteToInt(pByte: mCharctData[3])
          let mDay = LpUtility.byteToInt(pByte: mCharctData[4])
          let mHour = LpUtility.byteToInt(pByte: mCharctData[5])
          let mMinute = LpUtility.byteToInt(pByte: mCharctData[6])
          let mSecond = LpUtility.byteToInt(pByte: mCharctData[7])
          let mYERStr:String = "\(mYER)-\(mMon)-\(mDay) \(mHour):\(mMinute):\(mSecond)"
          
          let date = LpUtility.parseToDate(timestamp: mYERStr)!
          let currentMillisStr = Int64(date.timeIntervalSince1970 * 1000)

          var mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[8...77])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mUploadToServerAndSaveInDB["Time"] = currentMillisStr
          if (mArraysToUpload[currentMillisStr] == nil) {
            mArraysToUpload[currentMillisStr] = []
          }
          mArraysToUpload[currentMillisStr]!.append(mUploadToServerAndSaveInDB)
          
          mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[78...147])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mUploadToServerAndSaveInDB["Time"] = currentMillisStr
          mArraysToUpload[currentMillisStr]!.append(mUploadToServerAndSaveInDB)
          
          mUploadToServerAndSaveInDB = convertRawDataNewFormat(pCharctData: mCharctData[148...217])
          mUploadToServerAndSaveInDB["OpStatus"] = mStatus
          mUploadToServerAndSaveInDB["Time"] = currentMillisStr
          mArraysToUpload[currentMillisStr]!.append(mUploadToServerAndSaveInDB)
        }
      }
    }

    do {
      try DbAccess.addRawData2(pArraysToUpload: mArraysToUpload)
    } catch let error {
      print(error.localizedDescription)
    }
    
    for (timeStamp, mArrayToUpload) in mArraysToUpload {
      do {
//      var mVitalGold:[String:Any] = [:]
//      if let mGoldParams = MeasureProcess.getGoldParams()["data"] as? [String : Any] {
//        mVitalGold["vitals"] = mGoldParams
//        mArrayToUpload.append(mVitalGold)
//      }

        var mData:[String:[[String:Any]]] = [:]
        mData["data"] = mArrayToUpload
       
        
        let jsonData = try JSONSerialization.data(withJSONObject: mData, options: [])
        let mRawDataToCloud = String(data: jsonData, encoding: String.Encoding.ascii)!
        LpLogger.logInfo(LoggerStruct("processRawData", pFileName: "ProcessRawDataFn", pEventDescription: "Raw data prcessed"))
        
        DispatchQueue.global().async {
          do {
            try LpUtility.uploadRawDataOnCloud(pReturnJson: mRawDataToCloud, measurementTime: "\(timeStamp)")
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
  }
  
  private func convertRawDataNewFormat(pCharctData: ArraySlice<UInt8>) -> [String:Any] {
    let mCharctData = Array(pCharctData)
    var mUploadToServerAndSaveInDB:[String:Any] = [:]

    mUploadToServerAndSaveInDB["CurrentIndex"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[0], pSecondByte: mCharctData[1] )

    mUploadToServerAndSaveInDB["AFEData1"] = get4ByteLong(mCharctData: mCharctData[2...5])
    mUploadToServerAndSaveInDB["AFEData2"] = get4ByteLong(mCharctData: mCharctData[6...9])
    mUploadToServerAndSaveInDB["AFEData3"] = get4ByteLong(mCharctData: mCharctData[10...13])
    mUploadToServerAndSaveInDB["AFEData4"] = get4ByteLong(mCharctData: mCharctData[14...17])

    mUploadToServerAndSaveInDB["Gyro1a"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[18], pSecondByte: mCharctData[19] )
    mUploadToServerAndSaveInDB["Gyro2a"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[20], pSecondByte: mCharctData[21] )
    mUploadToServerAndSaveInDB["Gyro3a"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[22], pSecondByte: mCharctData[23] )

    mUploadToServerAndSaveInDB["Accelerometer_X"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[24], pSecondByte: mCharctData[25] )
    mUploadToServerAndSaveInDB["Accelerometer_Y"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[26], pSecondByte: mCharctData[27] )
    mUploadToServerAndSaveInDB["Accelerometer_Z"] = LpUtility.byteArrToInt( pFirstByte: mCharctData[28], pSecondByte: mCharctData[29] )
    
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
  
  private func get4ByteLong(mCharctData: ArraySlice<UInt8>) -> Int64 {
    let mArray = Array(mCharctData)
    return LpUtility.byteArrayToLong(pByte1: mArray[0], pByte2: mArray[1], pByte3: mArray[2], pByte4: mArray[3])
  }
}
