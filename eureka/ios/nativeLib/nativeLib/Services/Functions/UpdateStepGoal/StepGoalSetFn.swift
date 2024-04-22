//
//  StepGoalSetFn.swift
//  nativeLib
//
//  Created by Lukas Racko on 17/10/2022.
//

import Foundation

internal class StepGoalSetFn: FunctionBase {
  internal override init(_ pParams:[String:Any?]) {
    super.init(pParams)
  }
  
  internal override func doOperation() -> Any? {
    LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StepGoalSetFn", pEventDescription: "StepGoalSetFn called"))
      
      if let mError = params["error"] as? Error {
          LpLogger.logError(LoggerStruct("doOperation", pFileName: "StepGoalSetFn",
                                         pErrorCode: ResultCodeEnum.STEP_GOAL_UPDATE_FAILED,
                                         pEventDescription: "Unable to set step goal (\(mError.localizedDescription))",
                                         pLineNumber: ""))
          EventEmittersToReact.emitStepGoal(pResponse: StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_FAILED))
      } else {
          let mCurrProc = DeviceService.currentProc
          switch (mCurrProc) {
          case .STEP_GOAL_UPDATE:
              EventEmittersToReact.emitStepGoal(pResponse: StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_COMPLETE))
              DeviceService.resetCurrentProcState()
          case .CONNECT:
              EventEmittersToReact.emitStepGoal(pResponse: StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_COMPLETE))
              
              ConsoleLogger.shared.log(value: "notifyWatchConnected")
              DeviceService.resetCurrentProcState()
              LpLogger.logInfo(LoggerStruct("doOperation", pFileName: "StepGoalSetFn", pEventDescription: ResultCodeEnum.WATCH_CONNECTED.desc))
              EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_CONNECTED))
          default: break
          }
      }
    return nil
  }
}
