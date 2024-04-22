//
//  NotifyCharsFn.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

internal class NotifyCharsFn: FunctionBase {
  internal override init(_ pParams: [String: Any?]) {
    super.init(pParams, pNewProc: BleProcEnum.CONNECT, pNewProcState: BleProcStateEnum.DISCOVER_GATT)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo(LoggerStruct("doOperation", pFileName: "NotifyCharsFn", pEventDescription: "NotifyCharsFn called"))

    if let mError = params["error"] as? Error {
        DeviceService.resetCurrentProcState()
        LpLogger.logError(LoggerStruct("doOperation", pFileName: "NotifyCharsFn",
                                       pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                       pEventDescription: "Unable to discover characteristics (Status:" + (mError.localizedDescription ) + ")",
                                       pLineNumber: ""))
        EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
        return nil
    }
    
    if let peripheral = params["peripheral"] as? CBPeripheral {
      if var chars = params["chars"] as? [CBCharacteristic] {
          let char = chars.removeFirst()
          DispatchQueue.global().async {
            peripheral.setNotifyValue(true, for: char)
          }
          params["chars"] = chars
          return chars.isEmpty ? nil : self
      } else {
        DeviceService.resetCurrentProcState()
        LpLogger.logError(LoggerStruct("doOperation", pFileName: "NotifyCharsFn",
                                       pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                       pEventDescription: " Unable to get characteristics from param",
                                       pLineNumber: ""))
        EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
    } else {
      DeviceService.resetCurrentProcState()
      LpLogger.logError(LoggerStruct("doOperation", pFileName: "NotifyCharsFn",
                                     pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                     pEventDescription: " Unable to get peripheral from param",
                                     pLineNumber: ""))
      EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
    }
    return nil
  }
}
