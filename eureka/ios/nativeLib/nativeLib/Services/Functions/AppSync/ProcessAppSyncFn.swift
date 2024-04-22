//
//  ProcessAppSyncFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class ProcessAppSyncFn: FunctionBase {
    private var data = Array(repeating: UInt8(0), count: 10)

    internal override init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
        super.init(pParams, pNewProcState: pNewProcState)
    }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Unable to fire start measure command (\(mError.localizedDescription)"))
      return nil
    }

      do {
          let settings = try DbAccess.getAppSyncFor(userId: Global.getUserId())
          processAppSync(appSyncData: settings)
      } catch let error {
          LpLogger.logError(LoggerStruct("doOperation", pFileName: "ProcessAppSyncFn", pEventDescription: "Failed to store app sync data. Error: \(error.localizedDescription)"))
      }
    
      var response: ResponseBase? = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR)
      if let peripheral = params["peripheral"] as? CBPeripheral {
          DeviceService.setCurrentProcState(DeviceService.currentProc, pCurrentProcState: .APP_SYNC_WRITE)
          let mWriteResult = BleUtil.writeCustomdCharacteristic(pPeripheral: peripheral, pWhichCharct: .USER_DATA, pValue: data)
          if mWriteResult.result {
              //EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_COMPLETED))
          } else {
              let firmwareRevision = params["firmwareRevision"] as? String ?? ""
              EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR), firmwareRevision: firmwareRevision)
          }
          response = mWriteResult.response
      }

    return response
  }
  
  private func processAppSync(appSyncData: AppSync) {
    if appSyncData.getAutoMeasure() {
      data[0] = (UInt8) (data[0] | 0x01)
    } else {
      data[0] = (UInt8) (data[0] & 0xFE)
    }
    if appSyncData.getCgmUnitIndex() == 1 {
      data[0] = (UInt8) (data[0] | 0x08)
    } else {
      data[0] = (UInt8) (data[0] & 0xF7)
    }
    if AppSync.calculationOff {
      data[0] = (UInt8) (data[0] | 0x20)
    } else {
      data[0] = (UInt8) (data[0] & 0xDF)
    }
    if appSyncData.getAutoMeasureInterval() != nil {
      data[1] = (UInt8)(appSyncData.getAutoMeasureInterval()!)
    }
    if let age = appSyncData.getAge() {
      data[2] = UInt8(age)
    }
    if let mWeight = appSyncData.getWeightKg() {
      let mWeight:[UInt8] = LpUtility.intToByteArr(pInteger: Int(mWeight * 1000 / 5))
      data[3] = mWeight[0]
      data[4] = mWeight[1]
    }
    if let heightMm = appSyncData.getHeightMillim() {
      let mHeight = LpUtility.intToByteArr(pInteger: heightMm)
      data[5] = mHeight[0]
      data[6] = mHeight[1]
    }
    if appSyncData.getEthnicity() != nil {
      data[7] = UInt8(appSyncData.getEthnicity()!)
    }
    switch appSyncData.getGender() {
      case "M": data[8] = 0
      case "F": data[8] = 1
      default: data[8] = 2
    }
    data[9] = UInt8(appSyncData.getSkinTone() ?? 3)
  }
}
