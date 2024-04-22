//
//  PreconditionPassedFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class PreconditionPassedFn: FunctionBase {
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
      
    if let peripheral = params["peripheral"] as? CBPeripheral {
      DispatchQueue.global().async {
        let mFiredLastVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.GET_LAST_VITAL.command])
        if (mFiredLastVital.result) {
          LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Read vital command fired"))
        } else {
          DeviceService.resetCurrentProcState()
          EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
          LpLogger.logError( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Unable to fire read vital command"))
        }
      }
    }
    return nil
  }
}
