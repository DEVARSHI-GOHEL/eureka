//
//  UpdateStepGoalFn.swift
//  nativeLib
//
//  Created by Lukas Racko on 14/10/2022.
//

import Foundation

internal class UpdateStepGoalFn: FunctionBase {
    
    internal override init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
        super.init(pParams, pNewProcState: pNewProcState)
    }
    
    internal override func doOperation() -> Any? {
        if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
            if let peripheral = currentDevice.peripheral {
                do {
                    let stepGoal = try DbAccess.getCurrentUserGoal(userId: Global.getUserId())
                    if stepGoal == 0 {
                        return StepGoalResponse(pErrorCode: ResultCodeEnum.INVALID_STEP_GOAL)
                    }
                    let newStepGoalByteArray = [UInt8] (LpUtility.getUpdateStepGoalByteArray(stepGoal: stepGoal))
                    let mWriteResult = BleUtil.writeCustomdCharacteristic(pPeripheral: peripheral, pWhichCharct: .STEP_COUNTER, pValue: newStepGoalByteArray)
                    if mWriteResult.result {
                        return StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_ACKNOWLEDGE)
                    } else {
                        return StepGoalResponse(pErrorCode: .STEP_GOAL_UPDATE_FAILED)
                    }
                } catch {
                    return StepGoalResponse(pErrorCode: ResultCodeEnum.STEP_GOAL_UPDATE_FAILED)
                }
            } else {
                return StepGoalResponse(pErrorCode: .INVALID_DEVICE)
            }
        }
        return nil
    }
}
