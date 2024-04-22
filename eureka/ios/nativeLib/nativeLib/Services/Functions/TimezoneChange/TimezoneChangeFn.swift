import Foundation

internal class TimezoneChangeFn: FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
    internal override func doOperation() -> Any? {
        LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "TimezoneChangeFn", pEventDescription: "TimezoneChangeFn called"))
        let deviceService = ServiceFactory.getDeviceService()
        guard let peripheral = deviceService.currentDevice?.peripheral else {
            // device not connected
            return nil
        }
        
        _ = CurrentTimeUpdateFn(["peripheral": peripheral], pNewProc: BleProcEnum.TIMEZONE_UPDATE, pNewProcState: BleProcStateEnum.SET_DATETIME).doOperation()
        return nil
    }
}
