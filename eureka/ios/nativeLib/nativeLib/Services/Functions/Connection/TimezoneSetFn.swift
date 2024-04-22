//
//  TimezoneSetFn.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

internal class TimezoneSetFn: FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "TimezoneSetFn", pEventDescription: "TimezoneSetFn called"))

    if let mError = params["error"] as? Error {
      if let peripheral = params["peripheral"] as? CBPeripheral {
        DeviceService.resetCurrentProcState()
        LpLogger.logError(LoggerStruct("doOperation", pFileName: "TimezoneSetFn",
                                       pErrorCode: ResultCodeEnum.UNABLE_TIMEZONE_SET,
                                       pEventDescription: peripheral.name ?? "unknown" + " Unable to set date time zone (\(mError.localizedDescription))",
                                       pLineNumber: ""))
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
      return nil
    }
      if DeviceService.currentProc == .CONNECT {
          _ = UpdateStepGoalFn([:], pNewProcState: .SET_STEP_GOAL).doOperation()
      } else {
          DeviceService.setCurrentProc(pCurrentProc: .NONE)
      }
    return nil
  }
}
