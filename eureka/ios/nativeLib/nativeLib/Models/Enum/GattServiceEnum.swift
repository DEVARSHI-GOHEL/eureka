//
//  GattServiceEnum.swift
//  BLEDemo
//

import Foundation

public enum GattServiceEnum:String {
    
  case BATTERY_SERVICE = "0000180f-0000-1000-8000-00805f9b34fb"
  case BP_SERVICE = "00001810-0000-1000-8000-00805f9b34fb"
  case GLUCOSE_SERVICE = "0000181f-0000-1000-8000-00805f9b34fb"
  case CURR_TIME_SERVICE = "00001805-0000-1000-8000-00805f9b34fb"
  case DEVICE_INFORMATION_SERVICE = "0000180a-0000-1000-8000-00805f9b34fb"
  case PULSE_OXY_SERVICE = "00001822-0000-1000-8000-00805f9b34fb"
  case IMMEDIATE_ALERT_SERVICE = "00001802-0000-1000-8000-00805f9b34fb"
  case CUSTOM_SERVICE = "4C505732-5F43-5553-544F-4D5F53525600"
  case DFU_SERVICE = "00060000-f8ce-11e4-abf4-0002a5d5c51b"

  internal var code: String {
    return self.rawValue
  }
  
  internal var altCode:String {
    switch self {
    case .BATTERY_SERVICE: return "180f"
    case .BP_SERVICE: return "1810"
    case .GLUCOSE_SERVICE: return "181f"
    case .CURR_TIME_SERVICE: return "1805"
    case .DEVICE_INFORMATION_SERVICE: return "180a"
    case .PULSE_OXY_SERVICE: return "1822"
    case .IMMEDIATE_ALERT_SERVICE: return "1802"
    case .CUSTOM_SERVICE: return "4C505732"
    case .DFU_SERVICE: return "00060000"
    }
  }
  
  internal var desc: String {
    var result:String = ""
    switch self {
      case .BATTERY_SERVICE: result = "battery_service"
      case .BP_SERVICE: result = "blood_pressure"
      case .GLUCOSE_SERVICE: result = "continuous_glucose_monitoring"
      case .CURR_TIME_SERVICE: result = "current_time"
      case .DEVICE_INFORMATION_SERVICE: result = "device_information"
      case .PULSE_OXY_SERVICE: result = "pulse_oximeter"
      case .IMMEDIATE_ALERT_SERVICE: result = "immediate_alert_service"
      case .CUSTOM_SERVICE: result = "Custom Service"
      case .DFU_SERVICE: return "device_firmware_udpate"
    }
    return result
  }
}
