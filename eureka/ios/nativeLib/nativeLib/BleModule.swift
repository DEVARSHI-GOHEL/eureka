//
//  BleModule.swift
//  nativeLib
//
//  Created by Eugene Krivenja on 29.09.2021.
//

import Foundation

public class BleModule {
    internal var scanTimeout = 7.0
    internal var connectAttempt: Int = 0

    public init() {}
    
    public func simuDeviceConnect(_ pRequest: String) -> String {
      var mResultMap: [String: Any] = [:]
      do {
        var mData: [String: String] = [:]
        if let mRequestData = pRequest.data(using: .utf8) {
          if let jObj = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: String] {
            if let mErrorIdToThrow = jObj["errorIdToThrow"] {
              if let mErrorMsgToThrow  = jObj["errorMsgToThrow"] {
                mResultMap["message"] = "\(mErrorIdToThrow): \(mErrorMsgToThrow)"
              } else {
                mResultMap["message"] = "\(mErrorIdToThrow): Unknown Error"
              }
              mResultMap["status"] = "failed"

              if let jsonData = try? JSONSerialization.data(withJSONObject: mResultMap, options: []),
                let mJson = String(data: jsonData, encoding: .utf8) {
                  return mJson
              }

              return ""
            }
            if let mDeviceMsn: String = jObj["AuthenticationId"] {
              if let pUserId: String = jObj["userId"] {
                var mResult: [String: Any] = [:]
                mResult["status"] = "success"
                mResult["result"] = "200"
                mResult["message"] = "Device connected"
                
                mData["userId"] = pUserId
                mData["AuthenticationId"] = mDeviceMsn
                
                mResult["data"] = mData
                mResultMap["result"] = mResult
              } else {
                mResultMap["status"] = "failed"
                mResultMap["message"] = "User ID not received in request"
              }
            } else {
              mResultMap["status"] = "failed"
              mResultMap["message"] = "Authentication ID not received in request"
            }
          } else {
            mResultMap["status"] = "failed"
            mResultMap["message"] = "Request JSON incorrect format"
          }
        } else {
          mResultMap["status"] = "failed"
          mResultMap["message"] = "Request JSON not received"
        }
      } catch {
        mResultMap["status"] = "failed"
        mResultMap["message"] = error.localizedDescription
      }
        
      if let jsonData = try? JSONSerialization.data(withJSONObject: mResultMap, options: []),
        let mJson = String(data: jsonData, encoding: .utf8) {
          return mJson
      }
      return ""
    }
    
    public func deviceConnect(_ pRequest: String)-> String? {
      LpLogger.logInfo( LoggerStruct("deviceConnect", pFileName: "LifePlusReactModule", pEventDescription: "deviceConnect called"))

      if (Global.onSimulator) {
        return simuDeviceConnect(pRequest)
      }

      connectAttempt += 1

      if (DeviceService.currentProc != BleProcEnum.NONE) {
        let mLoogerInfo:LoggerStruct = LoggerStruct("deviceConnect", pFileName: "LifePlusReactModule", pEventDescription: ResultCodeEnum.OTHER_PROC_RUNNING.desc + " (" + DeviceService.currentProc.desc + ")")
        LpLogger.logInfo(mLoogerInfo)
        if connectAttempt >= 3 {
            ErrorLogger.shared.bleConnectionError(message: "Failed third attempt to connect, busy with \(DeviceService.currentProc)")
        }
        return ConnectResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
      }

      connectAttempt = 0
      DeviceService.setCurrentProc(pCurrentProc: BleProcEnum.CONNECT)

      let validateInputs = setUserNMsn(pRequest: pRequest)

      if (!validateInputs.isEmpty) {
        LpLogger.logInfo(LoggerStruct("deviceConnect", pFileName: "LifePlusReactModule", pEventDescription: validateInputs))
        DeviceService.setCurrentProc(pCurrentProc: BleProcEnum.NONE)
        return ConnectResponse(pErrorCode: ResultCodeEnum.UNABLE_START_SCANNING, pMessage: validateInputs).getResponseStr()
      }

      let startScanResponse = startScanning()

      if ("failed" == startScanResponse.getResultCode().type) {
        DeviceService.setCurrentProcState(BleProcEnum.CONNECT, pCurrentProcState: BleProcStateEnum.NONE)
        DeviceService.setCurrentProc(pCurrentProc: BleProcEnum.NONE)
        return nil
      }

      return startScanResponse.getResponseStr()
    }

    public func disconnect() -> String? {
        LpLogger.logInfo( LoggerStruct("disconnect", pFileName: "LifePlusReactModule", pEventDescription: "disconnect called"))
        if ((MeasureProcess.currentProc != .NONE) || (DeviceService.currentProc != .NONE)) {
            return ConnectResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
        }
        
        let service = ServiceFactory.getDeviceService()
        service.disconnect()
        return nil
    }
    
    public func startInstantMeasure() -> String? {
        //TODO : Do we need to check calibration ?
        if ((MeasureProcess.currentProc != .NONE) || (DeviceService.currentProc != .NONE)) {
          return InstantMeasureResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
        }
        
        let service = ServiceFactory.getDeviceService()
        service.startMeasureProcess(status: nil, calibrationParams: nil, proc: BleProcEnum.INSTANT_MEASURE,  procSate: BleProcStateEnum.NONE)
        return nil
    }
    
    public func appSync(_ pRequest: String) -> String {
        LpLogger.logInfo( LoggerStruct("appSync", pFileName: "LifePlusReactModule", pEventDescription: "Received input string (" + pRequest + ")"))

        if (DeviceService.currentProc != BleProcEnum.NONE) {
            return AppSyncResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
        }

        do {
          if let mRequestData = pRequest.data(using: .utf8) {
            if let jObj = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: String] {
              if let mErrorIdToThrow = jObj["errorIdToThrow"] {
                var mResultMap: [String: Any] = [:]
                if let mErrorMsgToThrow  = jObj["errorMsgToThrow"] {
                  mResultMap["message"] = "\(mErrorIdToThrow): \(mErrorMsgToThrow)"
                } else {
                  mResultMap["message"] = "\(mErrorIdToThrow): Unknown Error"
                }
                mResultMap["status"] = "failed"

                if let jsonData = try? JSONSerialization.data(withJSONObject: mResultMap, options: []),
                  let mJson = String(data: jsonData, encoding: .utf8) {
                    return mJson
                }
                return ""
              }

              var mUserId = -1
              var mDeviceMsn = ""

              var mInputStr: String = (jObj["userId"] != nil) ? jObj["userId"]! : "x"
              if (mInputStr.isEmpty) {
                return AppSyncResponse(pErrorCode: ResultCodeEnum.INVALID_USER, pMessage: "Received (\(mInputStr))").getResponseStr()
              }
              if let mUserIdTemp = Int(mInputStr) {
                mUserId = mUserIdTemp
              } else if let mUserIdTemp = Float(mInputStr) {
                mUserId = Int(mUserIdTemp)
              } else {
                return AppSyncResponse(pErrorCode: ResultCodeEnum.INVALID_USER, pMessage: " (\(mInputStr))").getResponseStr()
              }
              mInputStr = (jObj["deviceMsn"] != nil) ? jObj["deviceMsn"]! : ""
              if (!mInputStr.isEmpty) {
                mDeviceMsn = mInputStr
              } else {
                return AppSyncResponse(pErrorCode: ResultCodeEnum.INVALID_MSN, pMessage: "Received (\(mInputStr))").getResponseStr()
              }

              let appSyncState = jObj["autoMeasure"] != nil ? BleProcStateEnum.APP_SYNC_WRITE : BleProcStateEnum.APP_SYNC_READ

              if let mAppSyncResponse = StartAppSyncFn([:], pNewProc: BleProcEnum.APP_SYNC, pNewProcState: appSyncState).doOperation() as? AppSyncResponse {
                  if (mAppSyncResponse.getResultCode().type.lowercased() == "failed") {
                      DeviceService.resetCurrentProcState()
                  }
                  return mAppSyncResponse.getResponseStr()
              } else {
                  let mResponse = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ACKNOWLEDGE, pMessage: "AppSync ")
                  mResponse.setUserId(pUserId: "\(mUserId)")
                  mResponse.setAuthId(pAuthId: mDeviceMsn)
                  return mResponse.getResponseStr()
              }
            } else {
              let mResponse:AppSyncResponse = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR, pMessage: "Invalid JSON")
                mResponse.setUserId(pUserId: "")
                mResponse.setAuthId(pAuthId: "")
                return mResponse.getResponseStr()
            }
          } else {
            let mResponse:AppSyncResponse = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR, pMessage: "Invalid JSON")
              mResponse.setUserId(pUserId: "")
              mResponse.setAuthId(pAuthId: "")
              return mResponse.getResponseStr()
          }
        } catch let error {
          let mResponse:AppSyncResponse = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR, pMessage: error.localizedDescription)
            mResponse.setUserId(pUserId: "")
            mResponse.setAuthId(pAuthId: "")
            return mResponse.getResponseStr()
        }
    }
    
    public func calibrate(_ pRequest: String) -> String? {
        LpLogger.logInfo( LoggerStruct("calibrate", pFileName: "LifePlusReactModule", pEventDescription: "Received calibrate with - " + pRequest + ")"))
        
        switch (DeviceService.currentProc) {
        case .NONE: break
        case .AUTO_MEASURE:
          return CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        case .INSTANT_MEASURE:
          return CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        case .CALIBRATE, .READ_RAW_DATA:
          return CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_CALIBRATE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        default:
          return CalibrationResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
        }

        var mResultMap: [String: Any] = [:]
        var mData: [String: Any] = [:]
        do {
          if let mRequestData = pRequest.data(using: .utf8) {
            if let jObj = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: String] {
              if let mErrorIdToThrow = jObj["errorIdToThrow"] {
                if let mErrorMsgToThrow  = jObj["errorMsgToThrow"] {
                  mResultMap["message"] = "\(mErrorIdToThrow): \(mErrorMsgToThrow)"
                } else {
                  mResultMap["message"] = "\(mErrorIdToThrow): Unknown Error"
                }
                mResultMap["status"] = "failed"

                if let jsonData = try? JSONSerialization.data(withJSONObject: mResultMap, options: []),
                  let mJson = String(data: jsonData, encoding: .utf8) {
                    return mJson
                }
                return ""
              }
                
              let mErrorMsg: String = "Received"
              var mUserId: Int = -1
              var mDeviceMsn: String = ""
              var mInputStr:String = (jObj["userId"] != nil) ? jObj["userId"]! : "x"
              if (mInputStr.isEmpty) {
                  return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_USER, pMessage: "\(mErrorMsg) (\(mInputStr))").getResponseStr()
              }
              if let mUserIdTemp = Int(mInputStr) {
                mUserId = mUserIdTemp
                mData["userId"] = mUserId
              } else if let mUserIdTemp = Float(mInputStr) {
                  mUserId = Int(mUserIdTemp)
                  mData["userId"] = mUserId
              } else {
                return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_USER, pMessage: " (\(mInputStr))").getResponseStr()
              }
              mInputStr = (jObj["deviceMsn"] != nil) ? jObj["deviceMsn"]! : ""
              if (!mInputStr.isEmpty) {
                  mDeviceMsn = mInputStr
                  mData["deviceMsn"] = mDeviceMsn
              } else {
                  return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_MSN, pMessage: "\(mErrorMsg) (\(mInputStr))").getResponseStr()
              }

              if let mSpo2Raw: String = jObj["SPO2"] {
                if (mSpo2Raw.isEmpty) {
                  mData["SPO2"] = 0
                } else {
                  if let myNumber = Int(mSpo2Raw) {
                    mData["SPO2"] = myNumber
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_SPO2, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr()
                  }
                }
              } else {
                mData["SPO2"] = 0
              }
              if let mRrRaw: String = jObj["RR"] {
                if (mRrRaw.isEmpty) {
                  mData["RR"] = 0
                } else {
                  if let myNumber = Int(mRrRaw) {
                    mData["RR"] = myNumber
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_RR, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr()
                  }
                }
              } else {
                mData["RR"] = 0
              }
              if let mHrRaw: String = jObj["HR"] {
                if (mHrRaw.isEmpty) {
                  mData["HR"] = 0
                } else {
                  if let myNumber = Int(mHrRaw) {
                    mData["HR"] = myNumber
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_HR, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr()
                  }
                }
              } else {
                mData["HR"] = 0
              }
              if let mSbpRaw: String = jObj["SBP"] {
                if (mSbpRaw.isEmpty) {
                  mData["SBP"] = 0
                } else {
                  if let myNumber = Int(mSbpRaw) {
                    mData["SBP"] = myNumber
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_SBP, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr()
                  }
                }
              } else {
                mData["SBP"] = 0
              }
              if let mDbpRaw: String = jObj["DBP"] {
                if (mDbpRaw.isEmpty) {
                  mData["DBP"] = 0
                } else {
                  if let myNumber = Int(mDbpRaw) {
                    mData["DBP"] = myNumber
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_DBP, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr()
                  }
                }
              } else {
                mData["DBP"] = 0
              }
              if let glucoseRaw: String = jObj["Glucose"] {
                if (glucoseRaw.isEmpty) {
                  mData["Glucose"] = 0
                } else {
                  if let glucoseInt = Int(glucoseRaw) {
                    mData["Glucose"] = glucoseInt
                  } else if let glucoseDecimal = Double(glucoseRaw) {
                    mData["Glucose"] = glucoseDecimal
                  } else {
                    return CalibrationResponse(pErrorCode: ResultCodeEnum.INVALID_GLUCOSE, pMessage: "\(glucoseRaw) is not an Int or Double value").getResponseStr()
                  }
                }
              } else {
                mData["Glucose"] = 0
              }
    //          if let mCgmMode: String = jObj["cgmMode"] {
    //            if let myNumber = Int(mCgmMode) {
    //              mData["cgmMode"] = myNumber
    //            } else {
    //              resolve( AppSyncResponse(pErrorCode: ResultCodeEnum.INVALID_CGM_MODE, pMessage: "\(mErrorMsg) (\(mInputStr)").getResponseStr())
    //              return
    //            }
    //          } else {
    //            mData["cgmMode"] = 0
    //          }

              let hr = LpUtility.intToByteArr(pInteger: mData["HR"] as? Int ?? 0)
              let rr = LpUtility.intToByteArr(pInteger: mData["RR"] as? Int ?? 0)
              let spo2 = LpUtility.intToByteArr(pInteger: mData["SPO2"] as? Int ?? 0)
              let glucose = LpUtility.intToByteArr(pInteger: mData["Glucose"] as? Int ?? 0)
              let sbp = LpUtility.intToByteArr(pInteger: mData["SBP"] as? Int ?? 0)
              let dbp = LpUtility.intToByteArr(pInteger: mData["DBP"] as? Int ?? 0)
              let refVitalData = Data(hr + rr + spo2 + glucose + sbp + dbp)

              do {
                try DbAccess.updateCalibration(pUserId: mUserId, pDeviceMSN: mDeviceMsn, pDataBaseValues: mData)
              } catch let error {
                print(error.localizedDescription)
              }
             
              let service = ServiceFactory.getDeviceService()
              service.startMeasureProcess(status:nil, calibrationParams: ["data": mData, "referenceVitalData": refVitalData], proc: BleProcEnum.CALIBRATE,  procSate: BleProcStateEnum.NONE)
              
    //        if let mCalibrationResponse = StartCalibrationFn(["data": mData], pNewProc: BleProcEnum.CALIBRATE, pNewProcState: BleProcStateEnum.MEASURE_START).doOperation() as? CalibrationResponse {
    //
    //            if (mCalibrationResponse.getResultCode().type.lowercased() == "failed") {
    //              DeviceService.resetCurrentProcState()
    //            }
    //            resolve(mCalibrationResponse.getResponseStr())
    //          } else {
    //            let mResponse:CalibrationResponse = CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ACKNOWLEDGE, pMessage: "Calibration ")
    //            mResponse.setUserId(pUserId: "\(mUserId)")
    //            mResponse.setAuthId(pAuthId: mDeviceMsn)
    //            resolve(mResponse.getResponseStr())
    //          }
    //        } else {
    //          let mResponse:CalibrationResponse = CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ERROR, pMessage: "Invalid JSON")
    //          mResponse.setUserId(pUserId: "")
    //          mResponse.setAuthId(pAuthId: "")
    //          resolve(mResponse.getResponseStr())
    //        }
    //      } else {
    //        let mResponse:CalibrationResponse = CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ERROR, pMessage: "Invalid JSON")
    //        mResponse.setUserId(pUserId: "")
    //        mResponse.setAuthId(pAuthId: "")
    //        resolve(mResponse.getResponseStr())
    //      }
              
            }
          }
        } catch {
          let mResponse = CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ERROR, pMessage: error.localizedDescription)
          mResponse.setUserId(pUserId: "")
          mResponse.setAuthId(pAuthId: "")
          return mResponse.getResponseStr()
        }
        return nil
    }
    
    public func startDfuMode() -> String {
        guard DeviceService.currentProc == .NONE else {
            return FirmwareUpdateResponse(pErrorCode: .OTHER_PROC_RUNNING).getResponseStr()
        }

        let deviceService = ServiceFactory.getDeviceService()
        guard let peripheral = deviceService.currentDevice?.peripheral else {
            return FirmwareUpdateResponse(pErrorCode: .NOT_CONNECTED).getResponseStr()
        }

        guard let alertChar = BleUtil.getChara(peripheral, pServiceEnum: .IMMEDIATE_ALERT_SERVICE, pCharEnum: .ALERT_LEVEL) else {
            return FirmwareUpdateResponse(pErrorCode: .FIRMWARE_UPDATE_ERROR_COMMUNICATION).getResponseStr()
        }
        
        DeviceService.setCurrentProc(pCurrentProc: .FIRMWARE_UPDATE)
        DeviceService.setCurrentProcState(.FIRMWARE_UPDATE, pCurrentProcState: .FIRMWARE_UPDATE_INITIATE_DFU)
        
        peripheral.writeValue(Data([0x01]), for: alertChar, type: .withoutResponse)

        // Give watch time to process enable DFU request
        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(1)) {
            deviceService.disconnect()
        }
        
        return FirmwareUpdateResponse(pErrorCode: .FIRMWARE_UPDATE_DFU_MODE_INITIATED).getResponseStr()
    }
    
    public func startFirmwareUpdate(file: String) -> String {
        guard DeviceService.currentProc == .NONE else {
            return FirmwareUpdateResponse(pErrorCode: .OTHER_PROC_RUNNING).getResponseStr()
        }

        DeviceService.firmwareFile = URL(fileURLWithPath: file)
        DeviceService.setCurrentProc(pCurrentProc: .FIRMWARE_UPDATE)
        DeviceService.setCurrentProcState(.FIRMWARE_UPDATE, pCurrentProcState: .FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE)
        ServiceFactory.getDeviceService().startScan()
        DeviceService.scheduleTimeoutTimerForProcess(process: .FIRMWARE_UPDATE, timeInterval: FirmwareUploader.scanTimeoutForDFU)
    
        return FirmwareUpdateResponse(pErrorCode: .FIRMWARE_UPDATE_START).getResponseStr()
    }
    
    public func updateDailyStepGoal() -> String {
        LpLogger.logInfo( LoggerStruct("updateDailyStepGoal", pFileName: "LifePlusReactModule", pEventDescription: "Received updateDailyStepGoal request."))
        
        switch (DeviceService.currentProc) {
        case .NONE: break
        case .AUTO_MEASURE:
          return StepGoalResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        case .INSTANT_MEASURE:
          return StepGoalResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        case .CALIBRATE, .READ_RAW_DATA:
          return StepGoalResponse(pErrorCode: ResultCodeEnum.CALIBRATE_ERR_CALIBRATE_IN_PROGRESS, pMessage: DeviceService.currentProc.desc).getResponseStr()
        default:
          return StepGoalResponse(pErrorCode: ResultCodeEnum.OTHER_PROC_RUNNING, pMessage: DeviceService.currentProc.desc).getResponseStr()
        }
        
        DeviceService.setCurrentProc(pCurrentProc: .STEP_GOAL_UPDATE)
        if let stepGoalResponse = UpdateStepGoalFn([:], pNewProcState: .SET_STEP_GOAL).doOperation() as? StepGoalResponse {
            if (stepGoalResponse.getResultCode().type.lowercased() == "failed") {
                DeviceService.resetCurrentProcState()
            }
            return stepGoalResponse.getResponseStr()
        }
        return StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_FAILED).getResponseStr()
    }
    
    public func updateTimeZone() {
        if DeviceService.currentProc == .NONE {
            _ = TimezoneChangeFn([:]).doOperation()
        } else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 60) {
                self.updateTimeZone()
            }
        }
    }
    
    private func setUserNMsn(pRequest: String) -> String {
      var result:String = ""
      do {
        if let mRequestData = pRequest.data(using: .utf8) {
          if let jObj = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: String] {
            let mWatchMsnForScan = (jObj["AuthenticationId"] != nil) ? jObj["AuthenticationId"]! : ""
            Global.setWatchMSNForScan(pWatchMsnForScan: mWatchMsnForScan.uppercased())
            if (Global.getWatchMSNForScan().isEmpty) {
                result = "Invalid MSN"
            } else {
              Global.setWatchMSNForScan(pWatchMsnForScan: "LPW2-\(Global.getWatchMSNForScan())")
            }
            let mUserIdStr:String = (jObj["userId"] != nil) ? jObj["userId"]! : ""
            Global.setUserIdForScan(pUserIdForScan: Int(mUserIdStr) ?? 0)
            if (Global.getUserIdForScan() == 0) {
                result = "Invalid user id"
            }
          }
        }
      } catch let error {
        LpLogger.logError(LoggerStruct("startScanning", pFileName: "LifePlusReactModule",
                                              pErrorCode: ResultCodeEnum.UNABLE_START_SCANNING,
                                              pEventDescription: error.localizedDescription,
                                              pLineNumber: ""))
        result = error.localizedDescription
        }
        return result
    }
    
    private func startScanning() -> ConnectResponse {
      LpLogger.logError( LoggerStruct("startScanning", pFileName: "BleModule", pEventDescription: "startScanning called"))

      DeviceService.setCurrentProcState(BleProcEnum.CONNECT, pCurrentProcState: BleProcStateEnum.SCAN)
      ServiceFactory.getDeviceService().startScan()

      _ = Timer.scheduledTimer(withTimeInterval: scanTimeout, repeats: false) { timer in
        self.scanStopTick(pForceStop: true)
      }

      let result = ConnectResponse(pErrorCode: ResultCodeEnum.CONNECT_ACKNOWLEDGE, pMessage: "Device connection")
      result.setUserId(pUserId: "\(Global.getUserIdForScan())")
      result.setAuthId(pAuthId: Global.getWatchMSNForScan())

      return result
    }
    
    private func scanStopTick(pForceStop:Bool) {
      var mLoggerMessage = ""

      if (pForceStop) {
        if (DeviceService.currentProcState == BleProcStateEnum.SCAN) {
          DeviceService.resetCurrentProcState()
          EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_UNAVAILABLE))
          ServiceFactory.getDeviceService().stopScan()
          mLoggerMessage = ResultCodeEnum.WATCH_UNAVAILABLE.desc
        }
      }
      if (!mLoggerMessage.isEmpty) {
        LpLogger.logInfo(LoggerStruct("stopScanning", pFileName: "LifePlusReactModule", pEventDescription: mLoggerMessage))
      }
    }
}
