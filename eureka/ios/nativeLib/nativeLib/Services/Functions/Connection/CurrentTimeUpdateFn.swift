//
//  CurrentTimeUpdateFn.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

internal class CurrentTimeUpdateFn: FunctionBase {
  internal override init(_ pParams: [String: Any?], pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    super.init(pParams, pNewProc: pNewProc, pNewProcState: pNewProcState)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo(LoggerStruct("doOperation", pFileName: "CurrentTimeUpdateFn", pEventDescription: "CurrentTimeUpdateFn called"))

    if let mError = params["error"] as? Error {
      if let peripheral = params["peripheral"] as? CBPeripheral {
        DeviceService.resetCurrentProcState()
        LpLogger.logError(LoggerStruct("doOperation", pFileName: "CurrentTimeUpdateFn",
                                       pErrorCode: ResultCodeEnum.GATT_DISCOVER_FAIL,
                                       pEventDescription: peripheral.name ?? "Unknow" + " Unable to subscribe to indication (Status:" + (mError.localizedDescription) + ")",
                                       pLineNumber: ""))
        EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.INDICATE_SBSCRIPTION_FAIL))
      }
      return nil
    }
  
    if let peripheral = params["peripheral"] as? CBPeripheral {
      DispatchQueue.global().async {
        if let _ = BleUtil.getService(peripheral, pServiceId: GattServiceEnum.CUSTOM_SERVICE.code) {
          DeviceService.setCurrentProcState(DeviceService.currentProc, pCurrentProcState: BleProcStateEnum.SET_DATETIME)
          self.setDateTime(peripheral)
        }
      }
    } else {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.INVALID_DEVICE))
    }
    return nil
  }
  
  private func setDateTime(_ peripheral:CBPeripheral?) {
    ConsoleLogger.shared.log(value: "setDateTime")

    var mSuccess: Bool = false
    if let currentPeripheral = peripheral {
      if let mCommandChar = BleUtil.getChara(peripheral, pServiceEnum: GattServiceEnum.CURR_TIME_SERVICE, pCharEnum: GattCharEnum.CURRENT_TIME) {
        let mDate:[UInt8] = LpUtility.getTimeSyncData()
        currentPeripheral.writeValue(Data(mDate), for: mCommandChar, type: .withResponse)
        mSuccess = true
      }
    }
    if (!mSuccess) {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.emitConnectResult(pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.UNABLE_DATETIME_SET))
    }
  }
}
