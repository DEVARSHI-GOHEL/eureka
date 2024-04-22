//
//  StartCalibrationFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class StartCalibrationFn:FunctionBase {
  private static var _collectionOfRawData:[[UInt8]] = []
  private static var _goldParams: [String: Any?] = [:]

  internal override init(_ pParams:[String:Any?], pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    super.init(pNewProc, pNewProcState: pNewProcState)
    StartCalibrationFn._goldParams = pParams
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StartCalibrationFn", pEventDescription: "StartCalibrationFn called"))

    StartCalibrationFn._collectionOfRawData.removeAll()
    var result:CalibrationResponse = CalibrationResponse(pErrorCode: ResultCodeEnum.UNABLE_START_CALIBRATION)
    if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
      if let peripheral = currentDevice.peripheral {
        DispatchQueue.global().async {
          let mStartedMeasure = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.STATUS)
          if (mStartedMeasure.result) {
            MeasureProcess.startMeasureTimer()
          }
        }
        
        result = CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ACKNOWLEDGE)
      }
    }
    return result
  }

//  internal class func appendRawData(pRawRow:[UInt8]) {
//    _collectionOfRawData.append(pRawRow)
//  }
//
//  internal class func getDataAt(pIndex:Int) -> [UInt8]? {
//    if (pIndex < _collectionOfRawData.count) {
//      return _collectionOfRawData[pIndex]
//    }
//    return nil
//  }
//
//  internal class func uploadRawData() {
//    // TODO
//  }
//
//  internal static func rawDataCount() -> Int {
//    return _collectionOfRawData.count
//  }
//
//  internal static func getGoldParams() -> [String:Any?] {
//    return _goldParams
//  }
}
