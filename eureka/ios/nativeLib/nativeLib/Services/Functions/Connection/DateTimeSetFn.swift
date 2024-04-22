//
//  DateTimeSetFn.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

internal class DateTimeSetFn:FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "DateTimeSetFn", pEventDescription: "DateTimeSetFn called"))

    if let mError = params["error"] as? Error {
      if let peripheral = params["peripheral"] as? CBPeripheral {
        DeviceService.resetCurrentProcState()
        LpLogger.logError(LoggerStruct("doOperation", pFileName: "DateTimeSetFn",
                                               pErrorCode: ResultCodeEnum.UNABLE_DATETIME_SET,
                                               pEventDescription: peripheral.name ?? "unknown" + " Unable to set date time (\(mError.localizedDescription)",
                                               pLineNumber: ""))
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
      return nil
    }
    
    if let peripheral = params["peripheral"] as? CBPeripheral {
      if let mCommandChar = BleUtil.getChara(peripheral, pServiceEnum: GattServiceEnum.CURR_TIME_SERVICE, pCharEnum: GattCharEnum.LOCAL_TIME_INFORMATION) {
        DispatchQueue.global().async {
          let mDateTimeZone: [Int8] = LpUtility.TimeZoneToByteArr()
          let data = Data(bytes: mDateTimeZone, count: mDateTimeZone.count)
          peripheral.writeValue(data, for: mCommandChar, type: .withResponse)
        }  
      } else {
        DeviceService.resetCurrentProcState()
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "DateTimeSetFn",
                                      pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                      pEventDescription: " Unable to get command charactristic",
                                      pLineNumber: ""))
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
    } else {
      DeviceService.resetCurrentProcState()
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "DateTimeSetFn",
                                    pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                    pEventDescription: " Unable to get peripheral from param",
                                    pLineNumber: ""))
      EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.INVALID_DEVICE))
    }
    return nil
  }
}
