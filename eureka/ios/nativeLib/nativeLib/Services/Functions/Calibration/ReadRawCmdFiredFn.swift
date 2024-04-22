//
//  RawDataReadFn.swift
//  eureka
//
//  Created by work on 09/03/21.
//

import Foundation

internal class ReadRawCmdFiredFn:FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "ReadRawCmdFiredFn", pEventDescription: "Unable to fire start / prev raw read command (\(mError.localizedDescription)"))
      return nil
    }
    
    if let peripheral = params["peripheral"] as? CBPeripheral {
      DispatchQueue.global().async {
        let mReadRaw = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.RAW_DATA)
        if (!mReadRaw.result) {
          DeviceService.resetCurrentProcState()
          EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
          LpLogger.logError( LoggerStruct("doOperation", pFileName: "ReadRawCmdFiredFn", pEventDescription: "Unable to read raw data characteristic"))
        }
      }
    }
    return nil

  }

}
