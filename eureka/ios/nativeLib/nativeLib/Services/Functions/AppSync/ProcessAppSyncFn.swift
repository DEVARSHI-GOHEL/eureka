//
//  ProcessAppSyncFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class ProcessAppSyncFn: FunctionBase {
    private static var packetLen = 10
    
    internal override init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
        super.init(pParams, pNewProcState: pNewProcState)
        if DeviceService.currentProcState == .APP_SYNC_READ, let data = params["data"] as? [UInt8] {
            ProcessAppSyncFn.packetLen = data.count
        }
    }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Unable to fire start measure command (\(mError.localizedDescription)"))
      return nil
    }
      
      let firmwareRevision = params["firmwareRevision"] as? String ?? ""
      let userId = Global.getUserId()
      let data = DeviceService.currentProcState == .APP_SYNC_READ ? ((params["data"] as? [UInt8]) ?? []) : Array(repeating: 0, count: ProcessAppSyncFn.packetLen)
      let event = AppSyncReadEvent(pCharacteristicId: GattCharEnum.USER_DATA.code, pData: data)
      
      if data.count == 9 || data.count == 10 {
          do {
              let settings = try DbAccess.getAppSyncFor(userId: userId)
              if DeviceService.currentProcState == .APP_SYNC_READ {
                  // SEQ-319
                  ErrorLogger.shared.log(value: "Firmware revision: \(firmwareRevision)")
                  ErrorLogger.shared.log(value: "Automeasure stored in app: \(settings.getAutoMeasure())")
                  ErrorLogger.shared.log(value: "UserInfo data received: \(data.hexString)")
                  ErrorLogger.shared.log(value: "Automeasure read from watch: \((data[0] & 0x01) == 1)")
                  if settings.getAutoMeasure() && (data[0] & 0x01) == 0 {
                      ErrorLogger.shared.customError(message: "Watch updated automeasure to OFF")
                  }
                  // update from the watch
                  settings.setAutoMeasure(pAutoMeasure: (data[0] & 0x01) == 1 ? "Y" : "N" )
                  try DbAccess.updateAppSync(pUserId: userId, pAppSync: settings)
              }
              processAppSync(event: event, appSyncData: settings)
          } catch let error {
              LpLogger.logError(LoggerStruct("doOperation", pFileName: "ProcessAppSyncFn", pEventDescription: "Failed to store app sync data. Error: \(error.localizedDescription)"))
          }
      } else {
          EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.INVALID_DATA_FROM_WATCH), firmwareRevision: firmwareRevision)
      }
    
      var response: ResponseBase? = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR)
      if let peripheral = params["peripheral"] as? CBPeripheral {
          DeviceService.setCurrentProcState(DeviceService.currentProc, pCurrentProcState: .APP_SYNC_WRITE)
          let mWriteResult = BleUtil.writeCustomdCharacteristic(pPeripheral: peripheral, pWhichCharct: .USER_DATA, pValue: event.data)
          if mWriteResult.result {
              //EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_COMPLETED))
          } else {
              EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR), firmwareRevision: firmwareRevision)
          }
          response = mWriteResult.response
      }

    return response
  }
  
  private func processAppSync(event: AppSyncReadEvent, appSyncData: AppSync) {
    if appSyncData.getAutoMeasure() {
      event.data[0] = (UInt8) (event.data[0] | 0x01)
    } else {
      event.data[0] = (UInt8) (event.data[0] & 0xFE)
    }
    if appSyncData.getCgmUnitIndex() == 1 {
      event.data[0] = (UInt8) (event.data[0] | 0x08)
    } else {
      event.data[0] = (UInt8) (event.data[0] & 0xF7)
    }
    if AppSync.calculationOff {
      event.data[0] = (UInt8) (event.data[0] | 0x20)
    } else {
      event.data[0] = (UInt8) (event.data[0] & 0xDF)
    }
    if appSyncData.getAutoMeasureInterval() != nil {
      event.data[1] = (UInt8)(appSyncData.getAutoMeasureInterval()!)
    }
    if let age = appSyncData.getAge() {
      event.data[2] = UInt8(age)
    }
    if let mWeight = appSyncData.getWeightKg() {
      let mWeight:[UInt8] = LpUtility.intToByteArr(pInteger: Int(mWeight * 1000 / 5))
      event.data[3] = mWeight[0]
      event.data[4] = mWeight[1]
    }
    if let heightMm = appSyncData.getHeightMillim() {
      let mHeight = LpUtility.intToByteArr(pInteger: heightMm)
      event.data[5] = mHeight[0]
      event.data[6] = mHeight[1]
    }
    if appSyncData.getEthnicity() != nil {
      event.data[7] = UInt8(appSyncData.getEthnicity()!)
    }
    switch appSyncData.getGender() {
      case "M": event.data[8] = 0
      case "F": event.data[8] = 1
      default: event.data[8] = 2
    }
    if event.data.count > 9 {
      event.data[9] = UInt8(appSyncData.getSkinTone() ?? 3)
    }
  }
}
