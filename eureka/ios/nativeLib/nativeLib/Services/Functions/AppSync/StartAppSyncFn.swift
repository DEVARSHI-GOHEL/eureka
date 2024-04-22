//
//  StartAppSyncFn.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

public class StartAppSyncFn: FunctionBase {

  public override init(_ pParams:[String:Any?], pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    super.init(pParams, pNewProc: pNewProc, pNewProcState: pNewProcState)
  }
  
  public override func doOperation() -> Any? {
      LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StartAppSyncFn", pEventDescription: "StartAppSyncFn called"))
      
      var result = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ERROR)
      if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
        if let peripheral = currentDevice.peripheral {
            switch DeviceService.currentProcState {
            case .APP_SYNC_READ:
                if let errResponse = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.USER_DATA).response {
                  result = AppSyncResponse(pResponseBase: errResponse)
                } else {
                  result = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ACKNOWLEDGE)
                }
                break
            case .APP_SYNC_WRITE:
                if let errResponse = ProcessAppSyncFn(["peripheral" : peripheral], pNewProcState: BleProcStateEnum.APP_SYNC_WRITE).doOperation() as? ResponseBase {
                    result = AppSyncResponse(pResponseBase: errResponse)
                } else {
                    result = AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_ACKNOWLEDGE)
                }
                break
            default:
                break
            }
        }
      }

      return result
  }
}
