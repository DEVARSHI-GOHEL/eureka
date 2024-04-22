//
//  DidDiscoverServices.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

internal class ServicesDiscoveredFn:FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "ServicesDiscoveredFn", pEventDescription: "ServicesDiscoveredFn called"))

    if let mError = params["error"] as? Error {
      if let peripheral = params["peripheral"] as? CBPeripheral {
        DeviceService.resetCurrentProcState()
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ServicesDiscoveredFn",
                                      pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                      pEventDescription: (peripheral.name ?? "unknown") + " Unable to discover services (Status:" + (mError.localizedDescription ) + ")",
                                      pLineNumber: ""))
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
      return nil
    }
    
    if let peripheral = params["peripheral"] as? CBPeripheral {
      if let mServices = peripheral.services {
        for service in mServices {
          LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "ServicesDiscoveredFn", pEventDescription: "Discovering characteristics for \(service.uuid.uuidString)"))
          DispatchQueue.global().async {
            peripheral.discoverCharacteristics(nil, for: service)
          }
        }
      } else {
        DeviceService.resetCurrentProcState()
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ServicesDiscoveredFn",
                                      pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                      pEventDescription: (peripheral.name ?? "unknown") + " Unable to get services",
                                      pLineNumber: ""))
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
      }
    } else {
      DeviceService.resetCurrentProcState()
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ServicesDiscoveredFn",
                                    pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                    pEventDescription: " Unable to get peripheral from param",
                                    pLineNumber: ""))
      EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL))
    }
    return nil
  }
}
