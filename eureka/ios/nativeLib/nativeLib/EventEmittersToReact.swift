//
//  EventEmittersToReact.swift
//  eureka
//
//  Created by work on 04/02/21.
//

import Foundation

public class EventEmittersToReact {
  private static var parent: ((String, Any) -> Void)? = nil
      
  public init(pParent: @escaping (String, Any) -> Void){
    EventEmittersToReact.parent = pParent
  }
  
  internal class func debugLog(_ loggerStruct: LoggerStruct) {
    EventEmittersToReact.parent?("DebugLog", ["DebugLog": loggerStruct.getJSONStr()])
  }
    
  internal class func uploadOnCloud(_ data: String) {
    EventEmittersToReact.parent?("UploadOnCloud", ["UploadOnCloud": data])
  }
  
  public static func emitConnectResult(pResponse:ConnectResponse) {
    switch (pResponse.getResultCode().type) {
        case "intermediate":
            break;
        case "success":
//                LifePlusReactModule.cancelConnectTimeoutTimer();
//                BleCache.clearCharacteristicList();
          DeviceService.setCurrentProc(pCurrentProc: BleProcEnum.NONE);
            break;
        default:
//          Global.setUserId(pUserId: 0);
//                LifePlusReactModule.cancelConnectTimeoutTimer();
//                BleCache.clearCharacteristicList();
          DeviceService.setCurrentProc(pCurrentProc: BleProcEnum.NONE);
            break;
    }

    if (DeviceService.currentProcState != BleProcStateEnum.NONE) {
      DeviceService.setCurrentProcState(BleProcEnum.CONNECT, pCurrentProcState: pResponse.getResultCode().nextState);
    }
    EventEmittersToReact.parent?("ScanResult", ["ScanResult": pResponse.getResponseStr()])
  }
  
  internal static func EmitInstantMeasureResult(pResponse: InstantMeasureResponse) {
//    if (BleServices.getCurrentProcState() != BleProcStateEnum.NONE) {
//      BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, pCurrentProcState: pResponse.getResultCode().nextState);
//    }
    EventEmittersToReact.parent?("InstantMeasureResult", ["InstantMeasureResult": pResponse.getResponseStr()])
  }
  
  //percent status
  internal static func percentStatus(percentage: Int) {
    EventEmittersToReact.parent?("PercentStatus", String(format: "{\"result\":{\"processcompletes\":\"%d%%\"}}", percentage))
  }
  
  internal static func EmitAppSyncResult(pResponse: AppSyncResponse, firmwareRevision: String){
    if (DeviceService.currentProcState != BleProcStateEnum.NONE) {
      DeviceService.setCurrentProcState(BleProcEnum.APP_SYNC, pCurrentProcState: pResponse.getResultCode().nextState)
    }
    EventEmittersToReact.parent?("AppSyncResult", ["InstantMeasureResult": pResponse.getResponseStr(), "FirmwareRevision": firmwareRevision])
  }

  internal class func EmitCalibrationResult(pResponse: CalibrationResponse) {
    EventEmittersToReact.parent?("CalibrationResult", ["CalibrationResult": pResponse.getResponseStr()])
  }

  internal class func EmitAutoCalibrationResult(pResponse:AutoCalibrationResponse) {
    EventEmittersToReact.parent?("AutoCalibrationResult", ["AutoCalibrationResult": pResponse.getResponseStr()])
  }

  internal class func EmitStepCount(pResponse: StepCountResponse) {
    EventEmittersToReact.parent?("StepCountResult", ["StepCountResult": pResponse.getResponseStr()])
  }

  internal class func EmitMealData(pResponse: MealDataResponse) {
    EventEmittersToReact.parent?("MealDataResult", ["MealDataResult": pResponse.getResponseStr()])
  }

  internal class func EmitCommonResult(pResponse: CommonResponse) {
    EventEmittersToReact.parent?("ScanResult", ["CommonResult": pResponse.getResponseStr()])
  }
    
  internal class func EmitFwUpdate(pResponse: FirmwareUpdateResponse) {
    EventEmittersToReact.parent?("FwUpdate", ["FwUpdate": pResponse.getResponseStr()])
  }
    
  public class func emitTimerTick() {
    EventEmittersToReact.parent?("TimerTick", [:])
  }
    
  public class func emitStepGoal(pResponse: StepGoalResponse) {
    EventEmittersToReact.parent?("StepGoalResult", ["StepGoalResult": pResponse.getResponseStr()])
  }
}
