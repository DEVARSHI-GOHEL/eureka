//
//  StepCountFn.swift
//  eureka
//
//  Created by Harshada Memane on 26/04/21.
//

import Foundation



internal class ProcessStepCountFn: FunctionBase {
  
  var mCurrProc:BleProcEnum

  internal override init(_ pParams:[String:Any?], currentProc: BleProcEnum) {
    mCurrProc = currentProc
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    
    if let mError = params["error"] as? Error {
      MeasureProcess.resetProcessState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessStepCountFn", pEventDescription: "Unable to read meal (\(mError.localizedDescription))"))
      return nil
    }
    
    if let mCharData = params["data"] as? [UInt8] {
      processStepCount(charData: mCharData)
    }
        
    return nil
  }
  
  private func processStepCount(charData: [UInt8]) {
    if (charData.count == 10) {
      // Unused for now, uncomment if need OpStatus
//      let opStatus = LpUtility.byteToInt(pByte: charData[0])
      let steps = Int(LpUtility.byteArrayToLong(pByte1: charData[4], pByte2: charData[3], pByte3: charData[2], pByte4: charData[1]))

      let year = LpUtility.byteArrToInt(pFirstByte: charData[5], pSecondByte: charData[6])
      let month = LpUtility.byteToInt(pByte: charData[7])
      let day = LpUtility.byteToInt(pByte: charData[8])
      let dayOfWeek = LpUtility.byteToInt(pByte: charData[9])
      let hour = getHourFor(year: year, month: month, day: day)
        
      let mMap = ["Year": year, "Month": month, "Day": day, "Day_of_Week": dayOfWeek, "Hour": hour, "Steps": steps]
        
      let stepsTimeMs = getTimeStampMs(year: year, month: month, day: day, hour: hour)
          
      do {
          try DbAccess.updateStepsCount(pValues: mMap, pTime: stepsTimeMs)
            
          LpLogger.logInfo( LoggerStruct("StepCountReadEvent", pFileName: "ProcessStepCountFn", pEventDescription: "data added to the database"))
      } catch let error {
          LpLogger.logInfo( LoggerStruct("StepCountReadEvent", pFileName: "ProcessStepCountFn", pErrorCode:ResultCodeEnum.DB_OP_ERR, pEventDescription: "data NOT added to the database \(error.localizedDescription)", pLineNumber: "53"))
      }

      do {
          try LpUtility.uploadStepsOnCloud(steps: steps, ts: stepsTimeMs)
          LpLogger.logInfo( LoggerStruct("StepCountReadEvent", pFileName: "ProcessStepCountFn", pEventDescription: "data uploaded to Cloud"))
      } catch let error {
          LpLogger.logInfo( LoggerStruct("StepCountReadEvent", pFileName: "ProcessStepCountFn", pErrorCode: ResultCodeEnum.DB_OP_ERR, pEventDescription: "Error uploading data to cloud \(error.localizedDescription)", pLineNumber: ""))
      }
    }
  }
    
  private func getHourFor(year: Int, month: Int, day: Int) -> Int {
      let now = Date()
      let cal = Calendar.current
      if cal.component(.year, from: now) == year && cal.component(.month, from: now) == month && cal.component(.day, from: now) == day {
          return Calendar.current.component(.hour, from: Date())
      } else {
          return 23
      }
  }
    
  private func getTimeStampMs(year: Int, month: Int, day: Int, hour: Int) -> Int64 {
      var dateComps = DateComponents()
      dateComps.year = year
      dateComps.month = month
      dateComps.day = day
      dateComps.hour = hour
      return Int64(Calendar.current.date(from: dateComps)!.timeIntervalSince1970 * 1000)
  }
}
