//
//  StatusReadForMeasureFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class StatusReadForMeasureFn:FunctionBase {
  internal override init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
    super.init(pParams, pNewProcState: pNewProcState)
  }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "StatusReadForMeasureFn", pEventDescription: "Unable to fire start measure command (\(mError.localizedDescription)"))
      return nil
    }
      
    if let peripheral = params["peripheral"] as? CBPeripheral {
      DispatchQueue.global().async {
        let mCommandResult = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.START_MEASUREMENT.command])
        if (mCommandResult.result) {
          LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StatusReadForMeasureFn", pEventDescription: "start measure command fired"))
        } else {
          DeviceService.resetCurrentProcState()
          EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
          LpLogger.logError( LoggerStruct("doOperation", pFileName: "StatusReadForMeasureFn", pEventDescription: "Unable to fire start measure command"))
        }
      }
    }
    return nil
  }
}
