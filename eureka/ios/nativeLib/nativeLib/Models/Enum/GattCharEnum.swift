//
//  GattCharEnum.swift
//  BLEDemo
//

import Foundation

public enum GattCharEnum: CaseIterable {
  case BATTERY_LEVEL
  case BP_MEASUREMENT
  case BP_FEATURE
  case CGM_FEATURE
  case CGM_SESSION_RUNTIME
  case CGM_SESSION_START_TIME
  case TIME_OFFSET
  case CGM_MEASUREMENT
  case RECORD_ACCESS_CONTROL_POINT_GLUCO
  case CGM_SPECIFIC_OPS_CONTOL_POINT
  case CURRENT_TIME
  case LOCAL_TIME_INFORMATION
  case PLX_SPOT_CHECK_MEASUREMENT
  case PLX_FEATURES
  case RECORD_ACCESS_CONTROL_POINT_OXY
  case ALERT_LEVEL
  case STATUS
  case COMMAND
  case VITAL_DATA
  case RAW_DATA
  case LAST_MEASURE_TIME
  case MEAL_DATA
  case BOUNDS
  case USER_DATA
  case STEP_COUNTER
  case ML_UPDATE
  case RAW_DATA_2
  case WEATHER
  case NOTIFICATION
  case DFU
  case FIRMWARE_REVISION
  case REFERENCE_VITAL_DATA

  internal var code: String {
    switch self {
    case .BATTERY_LEVEL: return "00002a19-0000-1000-8000-00805f9b34fb"
    case .BP_MEASUREMENT: return "00002a35-0000-1000-8000-00805f9b34fb"
    case .BP_FEATURE: return "00002a49-0000-1000-8000-00805f9b34fb"
    case .CGM_FEATURE: return "00002aa8-0000-1000-8000-00805f9b34fb"
    case .CGM_SESSION_RUNTIME: return "00002aab-0000-1000-8000-00805f9b34fb"
    case .CGM_SESSION_START_TIME: return "00002aaa-0000-1000-8000-00805f9b34fb"
    case .TIME_OFFSET: return "00002aa9-0000-1000-8000-00805f9b34fb"
    case .CGM_MEASUREMENT: return "00002aa7-0000-1000-8000-00805f9b34fb"
    case .RECORD_ACCESS_CONTROL_POINT_GLUCO: return "00002a52-0000-1000-8000-00805f9b34fb"
    case .CGM_SPECIFIC_OPS_CONTOL_POINT: return "00002aac-0000-1000-8000-00805f9b34fb"
    case .CURRENT_TIME: return "00002a2b-0000-1000-8000-00805f9b34fb".uppercased()
    case .LOCAL_TIME_INFORMATION: return "00002a0f-0000-1000-8000-00805f9b34fb".uppercased()
    case .PLX_SPOT_CHECK_MEASUREMENT: return "00002a5e-0000-1000-8000-00805f9b34fb"
    case .PLX_FEATURES: return "00002a60-0000-1000-8000-00805f9b34fb"
    case .RECORD_ACCESS_CONTROL_POINT_OXY: return "00002a52-0000-1000-8000-00805f9b34fb"
    case .ALERT_LEVEL: return "00002a06-0000-1000-8000-00805f9b34fb"
    case .STATUS: return "4C505732-5F43-535F-5354-415455530000"
    case .COMMAND: return "4C505732-5F43-535F-434F-4D4D414E4400"
    case .VITAL_DATA: return "4C505732-5F43-535F-5644-5F5245430000"
    case .RAW_DATA: return "4C505732-5F43-535F-5244-5F5245430000"
    case .LAST_MEASURE_TIME: return "4C505732-5F43-535F-5244-5F54494D4500"
    case .MEAL_DATA: return "4C505732-5F43-535F-4D44-5F5245430000"
    case .BOUNDS: return "4C505732-5F43-535F-424F-554E44530000"
    case .USER_DATA: return "4C505732-5F43-535F-5553-45525F494600"
    case .STEP_COUNTER: return "4C505732-5F43-535F-5354-45505F435400"
    case .ML_UPDATE: return "4C505732-5F43-535F-4D4C-5F5550440000"
    case .RAW_DATA_2: return "0F0D4337-141C-439E-93D0-706E5870278C"
    case .WEATHER: return "4C505732-5F43-535F-5745-415448455200"
    case .NOTIFICATION: return "4C505732-5F43-535F-4E4F-544946494353"
    case .DFU: return "00060001-F8CE-11E4-ABF4-0002A5D5C51B"
    case .FIRMWARE_REVISION: return "00002A26-0000-1000-8000-00805F9B34FB"
    case .REFERENCE_VITAL_DATA: return "4C505732-5F43-535F-5245-465F56440000"
    }
  }
  
  internal var altCode: String {
    switch self {
    case .BATTERY_LEVEL: return "2A19"
    case .BP_MEASUREMENT: return "2A35"
    case .BP_FEATURE: return "2A49"
    case .CGM_FEATURE: return "2AA8"
    case .CGM_SESSION_RUNTIME: return "2AAB"
    case .CGM_SESSION_START_TIME: return "2AAA"
    case .TIME_OFFSET: return "2AA9"
    case .CGM_MEASUREMENT: return "2AA7"
    case .RECORD_ACCESS_CONTROL_POINT_GLUCO: return "2A52"
    case .CGM_SPECIFIC_OPS_CONTOL_POINT: return "2AAC"
    case .CURRENT_TIME: return "2A2B"
    case .LOCAL_TIME_INFORMATION: return "2A0F"
    case .PLX_SPOT_CHECK_MEASUREMENT: return "2A5E"
    case .PLX_FEATURES: return "2A60"
    case .RECORD_ACCESS_CONTROL_POINT_OXY: return "2A52"
    case .ALERT_LEVEL: return "2A06"
    case .STATUS: return "4C505732"
    case .COMMAND: return "4C505732"
    case .VITAL_DATA: return "4C505732"
    case .RAW_DATA: return "4C505732"
    case .LAST_MEASURE_TIME: return "4C505732"
    case .MEAL_DATA: return "4C505732"
    case .BOUNDS: return "4C505732"
    case .USER_DATA: return "4C505732"
    case .STEP_COUNTER: return "4C505732"
    case .ML_UPDATE: return "4C505732"
    case .RAW_DATA_2: return "0F0D4337"
    case .WEATHER: return "4C505732"
    case .NOTIFICATION: return "4C505732"
    case .DFU: return "00060001"
    case .FIRMWARE_REVISION: return "2A26"
    case .REFERENCE_VITAL_DATA: return "4C505732"
    }
  }
  
  internal var desc: String {
    switch self {
    case .BATTERY_LEVEL: return "Battery Level"
    case .BP_MEASUREMENT: return "Blood_Pressure_Measurement"
    case .BP_FEATURE: return "Blood_Pressure_Feature"
    case .CGM_FEATURE: return "CGM_Feature"
    case .CGM_SESSION_RUNTIME: return "CGM_Session_Run_Time"
    case .CGM_SESSION_START_TIME: return "CGM_Session_Start_Time"
    case .TIME_OFFSET: return "Time_Offset"
    case .CGM_MEASUREMENT: return "CGM_Measurement"
    case .RECORD_ACCESS_CONTROL_POINT_GLUCO: return "Record_Access_Control_Point_Gluco"
    case .CGM_SPECIFIC_OPS_CONTOL_POINT: return "CGM_Specific_Ops_Control_Point"
    case .CURRENT_TIME: return "Current_Time"
    case .LOCAL_TIME_INFORMATION: return "Local_Time_Information"
    case .PLX_SPOT_CHECK_MEASUREMENT: return "PLX_Spot_check_Measurement"
    case .PLX_FEATURES: return "PLX_Features"
    case .RECORD_ACCESS_CONTROL_POINT_OXY: return "Record_Access_Control_Point_Oxy"
    case .ALERT_LEVEL: return "Alert_Level"
    case .STATUS: return "Status"
    case .COMMAND: return "Command"
    case .VITAL_DATA: return "VitalData"
    case .RAW_DATA: return "RawData"
    case .LAST_MEASURE_TIME: return "Last_Measure_Time"
    case .MEAL_DATA: return "Meal_Data"
    case .BOUNDS: return "Bounds"
    case .USER_DATA: return "User_Data"
    case .STEP_COUNTER: return "Step_Counter"
    case .ML_UPDATE: return "MLUpdate"
    case .RAW_DATA_2: return "AUTO_CALIBRATE_RAW_DATA"
    case .WEATHER: return "WEATHER"
    case .NOTIFICATION: return "NOTIFICATION"
    case .DFU: return "Device_Firmware_Update"
    case .FIRMWARE_REVISION: return "Firmware_Revision"
    case .REFERENCE_VITAL_DATA: return "Referece_vital_data"
    }
  }
}
