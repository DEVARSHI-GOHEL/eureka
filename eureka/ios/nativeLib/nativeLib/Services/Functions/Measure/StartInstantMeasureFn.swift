//
//  StartInstantMeasureFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class StartInstantMeasureFn: FunctionBase {
  private static var measurePercentage: Int = 0

  internal override init(_ pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    super.init(pNewProc, pNewProcState: pNewProcState)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StartInstantMeasureFn", pEventDescription: "StartInstantMeasureFn called"))
    
    var result:InstantMeasureResponse = InstantMeasureResponse(pErrorCode: ResultCodeEnum.UNABLE_START_INSTANT_MEASURE)
    if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
      if let peripheral = currentDevice.peripheral {
        DispatchQueue.global().async {

          let mStartedMeasure = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.STATUS)
          if (mStartedMeasure.result) {
//            StartInstantMeasureFn.startMeasureTimer()
          } else {
            DeviceService.resetCurrentProcState()
            LpLogger.logError( LoggerStruct("doOperation", pFileName: "StartInstantMeasureFn",
                                          pErrorCode: ResultCodeEnum.UNABLE_START_INSTANT_MEASURE,
                                          pEventDescription: " Unable to start instant measure",
                                          pLineNumber: ""))
            EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.UNABLE_START_INSTANT_MEASURE))
          }
        }
        result = InstantMeasureResponse(pErrorCode: ResultCodeEnum.MEASURE_ACKNOWLEDGE)
      } else {
        DeviceService.resetCurrentProcState()
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "StartInstantMeasureFn",
                                      pErrorCode: ResultCodeEnum.INVALID_DEVICE,
                                      pEventDescription: " Unable to get peripheral from singleton",
                                      pLineNumber: ""))
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.INVALID_DEVICE))
      }
    } else {
      DeviceService.resetCurrentProcState()
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "StartInstantMeasureFn",
                                    pErrorCode: ResultCodeEnum.INVALID_DEVICE,
                                    pEventDescription: " Unable to get currentDevice from singleton",
                                    pLineNumber: ""))
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.INVALID_DEVICE))
    }
    return result
  }
}
