//
//  BleCommandEnum.swift
//  BLEDemo
//

import Foundation

public enum BleCommandEnum: CaseIterable {
  case GET_FIRST_VITAL
  case GET_NEXT_VITAL
  case GET_PREV_VITAL
  case GET_LAST_VITAL
  case GET_FIRST_RAW
  case GET_NEXT_RAW
  case GET_PREV_RAW
  case GET_LAST_RAW
  case GET_FIRST_MEAL
  case GET_NEXT_MEAL
  case GET_PREV_MEAL
  case GET_LAST_MEAL
  case GET_BOUNDS_HR
  case GET_BOUNDS_RR
  case GET_BOUNDS_O2
  case GET_BOUNDS_GLUCOSE
  case GET_BOUNDS_SBP
  case GET_BOUNDS_DDBP
  case GET_STEP_TARGET
  case GET_STEP_COUNTER_SUN
  case GET_STEP_COUNTER_MON
  case GET_STEP_COUNTER_TUE
  case GET_STEP_COUNTER_WED
  case GET_STEP_COUNTER_THU
  case GET_STEP_COUNTER_FRI
  case GET_STEP_COUNTER_SAT
  case START_ML_UPDATE
  case ABORT_ML_UPDATE
  case START_MEASUREMENT
  case START_MEASUREMENT_UNCOND
  
  internal var command: UInt8 {
    switch self {
    case .GET_FIRST_VITAL: return 0x11
    case .GET_NEXT_VITAL: return 0x21
    case .GET_PREV_VITAL: return 0x31
    case .GET_LAST_VITAL: return 0x41
    case .GET_FIRST_RAW: return 0x12
    case .GET_NEXT_RAW: return 0x22
    case .GET_PREV_RAW: return 0x32
    case .GET_LAST_RAW: return 0x42
    case .GET_FIRST_MEAL: return 0x13
    case .GET_NEXT_MEAL: return 0x23
    case .GET_PREV_MEAL: return 0x33
    case .GET_LAST_MEAL: return 0x43
    case .GET_BOUNDS_HR: return 0x50
    case .GET_BOUNDS_RR: return 0x51
    case .GET_BOUNDS_O2: return 0x52
    case .GET_BOUNDS_GLUCOSE: return 0x53
    case .GET_BOUNDS_SBP: return 0x54
    case .GET_BOUNDS_DDBP: return 0x55
    case .GET_STEP_TARGET: return 0x60
    case .GET_STEP_COUNTER_SUN: return 0x61
    case .GET_STEP_COUNTER_MON: return 0x62
    case .GET_STEP_COUNTER_TUE: return 0x63
    case .GET_STEP_COUNTER_WED: return 0x64
    case .GET_STEP_COUNTER_THU: return 0x65
    case .GET_STEP_COUNTER_FRI: return 0x66
    case .GET_STEP_COUNTER_SAT: return 0x67
    case .START_ML_UPDATE: return 0x70
    case .ABORT_ML_UPDATE: return 0x80
    case .START_MEASUREMENT: return 0x90
    case .START_MEASUREMENT_UNCOND: return 0x91
    }
  }

  internal var purpose: String {
    var result:String = ""
    switch self {
    case .GET_FIRST_VITAL: result = "Get first record of vital data"
    case .GET_NEXT_VITAL: result = "Get next record of vital data"
    case .GET_PREV_VITAL: result = "Get previous record of vital data"
    case .GET_LAST_VITAL: result = "Get last record of vital data"
    case .GET_FIRST_RAW: result = "Get first record of raw data"
    case .GET_NEXT_RAW: result = "Get next record of raw data"
    case .GET_PREV_RAW: result = "Get previous record of raw data"
    case .GET_LAST_RAW: result = "Get last record of raw data"
    case .GET_FIRST_MEAL: result = "Get first record of meal data"
    case .GET_NEXT_MEAL: result = "Get next record of meal data"
    case .GET_PREV_MEAL: result = "Get previous record of meal data"
    case .GET_LAST_MEAL: result = "Get last record of meal data"
    case .GET_BOUNDS_HR: result = "Get bounds for heart rate"
    case .GET_BOUNDS_RR: result = "Get bounds for respiration rate"
    case .GET_BOUNDS_O2: result = "Get bounds for oxigen saturation"
    case .GET_BOUNDS_GLUCOSE: result = "Get bounds for blood glucose"
    case .GET_BOUNDS_SBP: result = "Get bounds for blood pressure systolic"
    case .GET_BOUNDS_DDBP: result = "Get bounds for blood pressure diastolic"
    case .GET_STEP_TARGET: result = "Get step target"
    case .GET_STEP_COUNTER_SUN: result = "Get step counter for Sun"
    case .GET_STEP_COUNTER_MON: result = "Get step counter for Mon"
    case .GET_STEP_COUNTER_TUE: result = "Get step counter for Tue"
    case .GET_STEP_COUNTER_WED: result = "Get step counter for Wed"
    case .GET_STEP_COUNTER_THU: result = "Get step counter for Thu"
    case .GET_STEP_COUNTER_FRI: result = "Get step counter for Fri"
    case .GET_STEP_COUNTER_SAT: result = "Get step counter for Sat"
    case .START_ML_UPDATE: result = "Start ML update"
    case .ABORT_ML_UPDATE: result = "Abort ML update"
    case .START_MEASUREMENT: result = "Start measurement"
    case .START_MEASUREMENT_UNCOND: result = "Start measurement unconditionally"
    }
    return result
  }
  
  internal var desc: String {
    switch self {
    case .GET_FIRST_VITAL: return ""
    case .GET_NEXT_VITAL: return ""
    case .GET_PREV_VITAL: return ""
    case .GET_LAST_VITAL: return ""
    case .GET_FIRST_RAW: return ""
    case .GET_NEXT_RAW: return ""
    case .GET_PREV_RAW: return ""
    case .GET_LAST_RAW: return ""
    case .GET_FIRST_MEAL: return ""
    case .GET_NEXT_MEAL: return ""
    case .GET_PREV_MEAL: return ""
    case .GET_LAST_MEAL: return ""
    case .GET_BOUNDS_HR: return ""
    case .GET_BOUNDS_RR: return ""
    case .GET_BOUNDS_O2: return ""
    case .GET_BOUNDS_GLUCOSE: return ""
    case .GET_BOUNDS_SBP: return ""
    case .GET_BOUNDS_DDBP: return ""
    case .GET_STEP_TARGET: return ""
    case .GET_STEP_COUNTER_SUN: return ""
    case .GET_STEP_COUNTER_MON: return ""
    case .GET_STEP_COUNTER_TUE: return ""
    case .GET_STEP_COUNTER_WED: return ""
    case .GET_STEP_COUNTER_THU: return ""
    case .GET_STEP_COUNTER_FRI: return ""
    case .GET_STEP_COUNTER_SAT: return ""
    case .START_ML_UPDATE: return "ML_Update_In_Progress → 1"
    case .ABORT_ML_UPDATE: return "ML_Update_In_Progress → 0"
    case .START_MEASUREMENT: return "Measure_In_Progress → 1"
    case .START_MEASUREMENT_UNCOND: return "Measure_In_Progress → 1"
    }
  }
}
