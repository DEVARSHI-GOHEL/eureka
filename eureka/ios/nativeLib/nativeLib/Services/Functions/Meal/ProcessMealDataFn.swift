//
//  ProcessMealDataFn.swift
//  eureka
//
//  Created by Harshada Memane on 25/04/21.
//

import Foundation


internal class ProcessMealDataFn: FunctionBase {
  
  var mCurrProc:BleProcEnum

  internal override init(_ pParams:[String:Any?], currentProc: BleProcEnum) {
    mCurrProc = currentProc
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    
    if let mError = params["error"] as? Error {
      MeasureProcess.resetProcessState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessMealDataFn", pEventDescription: "Unable to read meal (\(mError.localizedDescription))"))
      return nil
    }
    
    if let mCharctData = params["data"] as? [UInt8] {
      return processMealData(pCharValue: mCharctData)
    }
        
    return nil
  }
  
  private func processMealData(pCharValue:[UInt8]) -> Bool? {
    if (pCharValue.count == 9) {
      let mStatus = LpUtility.byteToInt(pByte: pCharValue[0])
      let mealType = LpUtility.byteToInt(pByte: pCharValue[1]) + 1          // Watch sends 0, 1 or 3. Application need 1, 2 or 3 respectively. Hence + 1

      let mYER = LpUtility.byteArrToInt(pFirstByte: pCharValue[2], pSecondByte: pCharValue[3])
      let mMon = LpUtility.byteToInt(pByte: pCharValue[4])
      let mDay = LpUtility.byteToInt(pByte: pCharValue[5])
      let mHour = LpUtility.byteToInt(pByte: pCharValue[6])
      let mMinute = LpUtility.byteToInt(pByte: pCharValue[7])
      let mSecond = LpUtility.byteToInt(pByte: pCharValue[8])
      let mYERStr = "\(mYER)-\(mMon)-\(mDay) \(mHour):\(mMinute):\(mSecond)"
      
        var mealTimeMillis: Int64!
        if let date = LpUtility.parseToDate(timestamp: mYERStr) {
            mealTimeMillis = Int64(date.timeIntervalSince1970 * 1000)
        } else {
            LpLogger.logInfo( LoggerStruct("MealReadEvent", pFileName: "ProcessMealDataFn", pEventDescription: "Cannot process meal data, invalid date \(mYERStr)"))
            return true
        }
        
      if let mAService = ServiceDefs.getService(pUUID: GattServiceEnum.CUSTOM_SERVICE.code) {
        if let mCharacteristics = mAService.getCharacteristic(pUUID: GattCharEnum.MEAL_DATA.code) {
          var mMap: [String: Int] = [:]
          for i in 0..<mCharacteristics.getMembers().count {
            if (mCharacteristics.getMembers()[i].name == "UTC_Month") {
              mMap[mCharacteristics.getMembers()[i].name] = mMon
            } else if (mCharacteristics.getMembers()[i].name == "UTC_Year") {
              mMap[mCharacteristics.getMembers()[i].name] = mYER
            } else if (mCharacteristics.getMembers()[i].name == "UTC_Day") {
              mMap[mCharacteristics.getMembers()[i].name] = mDay
            } else if (mCharacteristics.getMembers()[i].name == "UTC_Hours") {
              mMap[mCharacteristics.getMembers()[i].name] = mHour
            } else if (mCharacteristics.getMembers()[i].name == "UTC_Minutes") {
              mMap[mCharacteristics.getMembers()[i].name] = mMinute
            } else if (mCharacteristics.getMembers()[i].name == "UTC_Seconds") {
              mMap[mCharacteristics.getMembers()[i].name] = mSecond
            } else if (mCharacteristics.getMembers()[i].name == "OpStatus") {
              mMap[mCharacteristics.getMembers()[i].name] = 1
            } else if (mCharacteristics.getMembers()[i].name == "Meal_Type") {
              mMap[mCharacteristics.getMembers()[i].name] = mealType
            } else {
              let randomNumber = 68     // (int) (50 + (Math.random() * ((100 - 50))))
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            }
          }
            
          var mAlreadyPresent = false
          do {
            try DbAccess.addMealData(pValues: mMap, pTime: mealTimeMillis)
            LpLogger.logInfo( LoggerStruct("MealReadEvent", pFileName: "ProcessMealDataFn", pEventDescription: "data added to the database"))
          } catch let error {
            if (error.localizedDescription.contains("UNIQUE ")) {
              mAlreadyPresent = true
            } else {
              LpLogger.logInfo( LoggerStruct("MealReadEvent", pFileName: "ProcessMealDataFn", pErrorCode:ResultCodeEnum.DB_OP_ERR, pEventDescription: "data NOT added to the database \(error.localizedDescription)", pLineNumber: ""))
            }
          }
          if (!mAlreadyPresent) {
            do {
              try LpUtility.uploadMealsOnCloud(size: mealType, ts: mealTimeMillis)
              LpLogger.logInfo( LoggerStruct("MealReadEvent", pFileName: "ProcessMealDataFn", pEventDescription: "data uploaded to Cloud"))
            } catch let error {
              LpLogger.logInfo( LoggerStruct("MealReadEvent", pFileName: "ProcessMealDataFn", pErrorCode:ResultCodeEnum.DB_OP_ERR, pEventDescription: "Error uploading data to cloud \(error.localizedDescription)", pLineNumber: ""))
            }
          } else {
              return true
          }
        }
      }
    }
    return nil
  }
}
