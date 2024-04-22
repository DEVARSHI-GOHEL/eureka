//
//  BleProcEnum.swift
//  BLEDemo
//

import Foundation

public enum BleProcEnum: String, CaseIterable {
    
  case CONNECT = "Connect"
  case INSTANT_MEASURE = "Measure"
  case AUTO_MEASURE = "Auto Measure"
  case STEP_COUNT = "Stepcount"
  case CALIBRATE = "Calibration"
  case APP_SYNC = "App Sync"
  case NONE = "None"
  case MEAL_DATA = "MealData"
  case READ_RAW_DATA = "RawData"
  case AUTO_MEASURE_SYNC = "Auto Measure Sync"
  case FIRMWARE_UPDATE = "Firmware Update"
  case STEP_GOAL_UPDATE = "Step goal update"
  case TIMEZONE_UPDATE = "Timezone update"
   
  public var desc:String {
    switch self {
    case .CONNECT: return "Connect"
    case .INSTANT_MEASURE: return "Measure"
    case .AUTO_MEASURE: return "Measure"
    case .STEP_COUNT: return "Stepcount"
    case .CALIBRATE: return "Calibration"
    case .APP_SYNC: return "App Sync"
    case .NONE: return "None"
    case .MEAL_DATA: return "MealData"
    case .READ_RAW_DATA: return "RawData"
    case .AUTO_MEASURE_SYNC: return "AUTO MEASURE SYNC"
    case .FIRMWARE_UPDATE: return "Firmware Update"
    case .STEP_GOAL_UPDATE: return "Step goal update"
    case .TIMEZONE_UPDATE: return "Timezone update"
    }
  }
  
}
