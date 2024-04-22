//
//  UserInfoWritten.swift
//  eureka
//
//  Created by work on 07/03/21.
//

import Foundation

internal class UserInfoWrittenFn:FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    DeviceService.resetCurrentProcState()
    let firmwareRevision = params["firmwareRevision"] as? String ?? ""
    if let mError = params["error"] as? Error {
      DeviceService.resetCurrentProcState()
      EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL), firmwareRevision: firmwareRevision)
      LpLogger.logError( LoggerStruct("doOperation", pFileName: "UserInfoWrittenFn", pEventDescription: "Unable to fire user info write command (\(mError.localizedDescription)"))
      return nil
    }
    
    DeviceService.resetCurrentProcState()
    EventEmittersToReact.EmitAppSyncResult( pResponse: AppSyncResponse(pErrorCode: ResultCodeEnum.APPSYNC_COMPLETED), firmwareRevision: firmwareRevision)

    return nil
  }
}
