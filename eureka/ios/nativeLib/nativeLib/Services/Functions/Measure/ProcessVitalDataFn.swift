//
//  ProcessVitalDataFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class ProcessVitalDataFn: FunctionBase {
  
  var mCurrProc:BleProcEnum

  internal override init(_ pParams:[String:Any?], currentProc: BleProcEnum) {
    mCurrProc = currentProc
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      MeasureProcess.resetProcessState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessVitalDataFn", pEventDescription: "Unable to read vital (\(mError.localizedDescription))"))
      return nil
    }
    
    if let mCharctData = params["data"] as? [UInt8] {
      processVitalData(pCharValue: mCharctData)
    }
    
//    StartInstantMeasureFn.stopMeasureTimer()
    
    return nil
  }
  
  private func processVitalData(pCharValue:[UInt8]) {
    var shouldStop: Bool = false

    do {

      //     BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.NONE)
      let mCharctData:[UInt8] = pCharValue

      if (mCharctData.count == 20) {
        var mUploadToServer:[String:Any] = [:]

        let mStatus = LpUtility.byteToInt(pByte: mCharctData[0])
        mUploadToServer["OpStatus"] = mStatus

        let mHR = LpUtility.byteArrToInt(pFirstByte: mCharctData[1], pSecondByte: mCharctData[2])
        mUploadToServer["HR"] = mHR

        let mRR = LpUtility.byteArrToInt(pFirstByte: mCharctData[3], pSecondByte: mCharctData[4])
        mUploadToServer["RR"] = mRR

        let mOS = LpUtility.byteArrToInt(pFirstByte: mCharctData[5], pSecondByte: mCharctData[6])
        mUploadToServer["SPO2"] = mOS

        let mBG = LpUtility.byteArrToInt(pFirstByte: mCharctData[7], pSecondByte: mCharctData[8])
        mUploadToServer["Glucose"] = mBG

        let mBPS = LpUtility.byteArrToInt(pFirstByte: mCharctData[9], pSecondByte: mCharctData[10])
        mUploadToServer["SBP"] = mBPS

        let mBPD = LpUtility.byteArrToInt(pFirstByte: mCharctData[11], pSecondByte: mCharctData[12])
        mUploadToServer["DBP"] = mBPD

        let mYER = LpUtility.byteArrToInt(pFirstByte: mCharctData[13], pSecondByte: mCharctData[14])
        let mMon = LpUtility.byteToInt(pByte: mCharctData[15])
        let mDay = LpUtility.byteToInt(pByte: mCharctData[16])
        let mHour = LpUtility.byteToInt(pByte: mCharctData[17])
        let mMinute = LpUtility.byteToInt(pByte: mCharctData[18])
        let mSecond = LpUtility.byteToInt(pByte: mCharctData[19])
        let measureTime = "\(mYER)-\(mMon)-\(mDay) \(mHour):\(mMinute):\(mSecond)"
        
        var measureTimeMillis = Int64.zero
        if (mYER > 0) {
            let date = LpUtility.parseToDate(timestamp: measureTime)!
            measureTimeMillis = Int64(date.timeIntervalSince1970 * 1000)
        }
        mUploadToServer["Time"] = measureTimeMillis
        MeasureProcess.addTimeToGoldParams(pTime: measureTimeMillis)

        let now = Int64(Date().timeIntervalSince1970 * 1000)
        if measureTimeMillis > now { // future timestamp, log an error
          ErrorLogger.shared.customError(message: "Future measurement timestamp: \(measureTime) (\(measureTimeMillis)), now \(now)")
        }

        if let mAService = ServiceDefs.getService(pUUID: GattServiceEnum.CUSTOM_SERVICE.code) {
          if let mCharacteristics = mAService.getCharacteristic(pUUID: GattCharEnum.VITAL_DATA.code) {
            var mMap: [String: Int] = [:]
            for i in 0..<mCharacteristics.getMembers().count {
              if (mCharacteristics.getMembers()[i].name == "UTC_Month") {
                mMap[mCharacteristics.getMembers()[i].name] = mMon
              } else if (mCharacteristics.getMembers()[i].name == "UTC_Year") {
                mMap[mCharacteristics.getMembers()[i].name] = mYER
              } else if (mCharacteristics.getMembers()[i].name == "UTC_Day") {
                mMap[mCharacteristics.getMembers()[i].name] = mDay
              } else if (mCharacteristics.getMembers()[i].name == "UTC_Hour") {
                mMap[mCharacteristics.getMembers()[i].name] = mHour
              } else if (mCharacteristics.getMembers()[i].name == "UTC_Minutes") {
                mMap[mCharacteristics.getMembers()[i].name] = mMinute
              } else if (mCharacteristics.getMembers()[i].name == "UTC_Seconds") {
                mMap[mCharacteristics.getMembers()[i].name] = mSecond
              } else if (mCharacteristics.getMembers()[i].name == "OpStatus") {
                mMap[mCharacteristics.getMembers()[i].name] = 1
              } else if (mCharacteristics.getMembers()[i].name == "HeartRate") {
                mMap[mCharacteristics.getMembers()[i].name] = mHR
              } else if (mCharacteristics.getMembers()[i].name == "RespirationRate") {
                mMap[mCharacteristics.getMembers()[i].name] = mRR
              } else if (mCharacteristics.getMembers()[i].name == "OxygenSaturation") {
                mMap[mCharacteristics.getMembers()[i].name] = mOS
              } else if (mCharacteristics.getMembers()[i].name == "BloodGlucose") {
                mMap[mCharacteristics.getMembers()[i].name] = mBG
              } else if (mCharacteristics.getMembers()[i].name == "BloodPressureSYS") {
                mMap[mCharacteristics.getMembers()[i].name] = mBPS
              } else if (mCharacteristics.getMembers()[i].name == "BloodPressureDIA") {
                mMap[mCharacteristics.getMembers()[i].name] = mBPD
              } else {
                let randomNumber = 68     // (int) (50 + (Math.random() * ((100 - 50))))
                mMap[mCharacteristics.getMembers()[i].name] = randomNumber
              }
            }

            shouldStop = measureTimeMillis == 0 || DbAccess.isMeasureExist(measureTime: measureTimeMillis)

            if !shouldStop {
              try DbAccess.addIntoMeasurable(pValues: mMap, pTime: measureTimeMillis)
              LpLogger.logInfo( LoggerStruct("VitalReadEvent", pFileName: "BleServices", pEventDescription: "data added to the database"))

              do{
                try LpUtility.uploadToCloud(pMap: mUploadToServer)
                LpLogger.logInfo( LoggerStruct("VitalReadEvent", pFileName: "BleServices", pEventDescription: "data uploaded to Cloud"))
              } catch let error {
                LpLogger.logInfo( LoggerStruct("VitalReadEvent", pFileName: "BleServices", pErrorCode:ResultCodeEnum.DB_OP_ERR, pEventDescription: "Error adding uploading data to cloud \(error.localizedDescription)", pLineNumber: ""))
              }
            }
          }
        }
      }
    } catch let error {
      MeasureProcess.resetProcessState()
      LpLogger.logInfo( LoggerStruct("VitalReadEvent", pFileName: "BleServices", pErrorCode:ResultCodeEnum.DB_OP_ERR, pEventDescription: "data NOT added to the database \(error.localizedDescription)", pLineNumber: ""))
    }

//    DispatchQueue.main.async {
      switch (self.mCurrProc) {
      case .INSTANT_MEASURE:
        EventEmittersToReact.percentStatus(percentage: 100)
        LpLogger.logInfo( LoggerStruct("processVitalData", pFileName: "ProcessVitalDataFn", pEventDescription: "Instant measure completed (Event 399)"))
        EventEmittersToReact.EmitInstantMeasureResult(pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.INSTANT_MEASURE_COMPLETED))
      case .AUTO_MEASURE:
        LpLogger.logInfo( LoggerStruct("processVitalData", pFileName: "ProcessVitalDataFn", pEventDescription: "Auto measure completed (Event 599)"))
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.AUTO_MEASURE_COMPLETED))
      case .CALIBRATE:
        EventEmittersToReact.EmitCalibrationResult(pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_MEASURE_COMPLETE))
      case .AUTO_MEASURE_SYNC:

        if shouldStop {
//          LpLogger.logInfo( LoggerStruct("processVitalData", pFileName: "ProcessVitalDataFn", pEventDescription: "Auto measure sync completed (Event 599)"))
//
//          //TODO : Need to emit event? If yes then which one, currently auto measure emitted.
//          EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.AUTO_MEASURE_COMPLETED))
            
            MeasureProcess.currentProc = .MEAL_DATA
        } else {
            ServiceFactory.getDeviceService().continueAutoMeasureSync()
        }

      default:
        break
      }
//    }
  }
}
