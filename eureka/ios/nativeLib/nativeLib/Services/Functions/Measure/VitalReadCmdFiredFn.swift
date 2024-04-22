//
//  VitalReadCmdFiredFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class VitalReadCmdFiredFn: FunctionBase {
  internal override init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
    super.init(pParams, pNewProcState: pNewProcState)
  }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "VitalReadCmdFiredFn", pEventDescription: "Unable to fire vital read command (\(mError.localizedDescription)"))
      return nil
    }
      
    if let peripheral = params["peripheral"] as? CBPeripheral {
      DispatchQueue.global().async {
        let mReadVital = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.VITAL_DATA)
        if (!mReadVital.result) {
          DeviceService.resetCurrentProcState()
          EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
          LpLogger.logError( LoggerStruct("doOperation", pFileName: "VitalReadCmdFiredFn", pEventDescription: "Unable to read vital data characteristic"))
        }
      }
    }
    return nil
  }
}
