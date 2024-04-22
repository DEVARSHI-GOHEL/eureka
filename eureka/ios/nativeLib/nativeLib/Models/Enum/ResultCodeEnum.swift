//
//  ResultCodeEnum.swift
//  BLEDemo
//

import Foundation

public enum ResultCodeEnum: String {
  // Common Success and Intermediate
  case FINAL_UPDATE = "999"
  case GATT_STATE_CHANGE = "997"

  // Common Errors
  case UNKNOWN_ERR = "001"
  case DISCONNECT = "002"
  case NOT_CONNECTED = "003"
  case INVALID_USER = "004"
  case INVALID_USER_SESSION = "005"
  case DATA_PARSE_ERR = "006"
  case OP_TIMEOUT = "007"
  case DB_OP_ERR = "008"
  case HTTP_OP_ERR = "009"
  case BLANK_ERR = "010"
  case INVALID_MSN = "011"
  case TIME_OUT = "012"
  case OTHER_PROC_RUNNING = "013"
  case UNABLE_CHARCT_READ = "014"
  case UNABLE_CHARCT_WRITE = "015"
  case INVALID_GATT = "016"
  case UNABLE_DATETIME_SET = "017"
  case UNABLE_TIMEZONE_SET = "018"
  case AUTO_MEASURE_IN_PROGRESS = "019"
  case INSTANT_MEASURE_IN_PROGRESS = "020"
  case CALIBRATE_IN_PROGRESS = "021"
  case WATCH_BATTERY_LOW = "022"
  case WATCH_BATTERY_NORMAL = "023"
  case WATCH_CHARGER_CONNECTED = "024"
  case WATCH_CHARGER_DISCONNECTED = "025"
  case WATCH_NOT_ON_WRIST = "026"
  case WATCH_ON_WRIST = "027"
  case UNDEFINED_CHARACT = "028"    // Not in Android
  case INVALID_INPUT_PARAMS = "029"    // Not in Android
  case WATCH_SHUTDOWN_IN_PROGRESS = "030"
  case MEASURE_FAILED = "031"

  // Connect Success and Intermediate
  case WATCH_CONNECTED = "199"
  case CONNECT_ACKNOWLEDGE = "198"
  case DISCOVERING_SERVICES = "197"
//    DEVICE_FOUND = 'I', "198", "Device Found")

  // Connect errors
  case INVALID_AUTH = "101"
  case WATCH_UNAVAILABLE = "102"
  case UNMATCH_AUTH_ID = "103"
  case WATCH_REJECT_AUTH = "104"
  case BLE_NO_PERMISSION = "105"
  case LOCATION_NO_PERMISSION = "106"
  case WATCH_REJECT_BOND = "107"
  case INDICATE_SBSCRIPTION_FAIL = "108"
  case GATT_DISCOVER_FAIL = "109"
  case GATT_WRITE_FAIL = "110"
  case GATT_READ_FAIL = "111"
  case UNABLE_START_SCANNING = "112"
  case UNABLE_START_SERVICE_DISCOVERY = "113"
  case INVALID_DEVICE = "114"
  case CALIBRATION_FAILED = "115"
  case INSTANT_MEASURE_FAILED = "116"

  // AppSync Success and Intermediate
  case APPSYNC_COMPLETED = "299"
  case APPSYNC_ACKNOWLEDGE = "298"

  // AppSync errors
  case INVALID_DATA_FROM_WATCH = "210"
  case APPSYNC_ERROR = "211"    // Not in Android
  case INVALID_CGM_MODE = "212"    // Not in Android

  // Auto Measure Success and Intermediate
  case AUTO_MEASURE_STARTED = "598"
  case AUTO_MEASURE_COMPLETED = "599"

  // Instant Measure Success and Intermediate
  case INSTANT_MEASURE_COMPLETED = "399"
  case MEASURE_ACKNOWLEDGE = "398"

  // Instant Measure
  case UNABLE_START_INSTANT_MEASURE = "301"
  case VITAL_READ_COMMAND_FAILED = "302"

  case RAW_READ_COMMAND_FAILED = "303"

  case OFFLINE_VITAL_COMMAND_FAILED = "304"
  case OFFLINE_VITAL_READ_COMPLETE = "305"
  case OFFLINE_VITAL_READ_START = "306"
  case OFFLINE_VITAL_READ_IN_PROGRESS = "307"

  // Step count
  case STEP_COUNT_AVAILABLE = "601"

  // Meal data available
  case MEAL_DATA_AVAILABLE = "611"

  // Calibration Success and Intermediate
  case CALIBRATION_ACKNOWLEDGE = "498"

  case CALIBRATION_SUCCESS = "499"
  case CALIBRATION_MEASURE_COMPLETE = "491"
  case CALIBRATION_MEASURE_PROGRESS = "492"

  case AUTO_CALIBRATION_SUCCESS = "490"
  case AUTO_CALIBRATION_STARTED = "489"

  // Calibration errors
  case UNABLE_START_CALIBRATION = "401"
  case INVALID_SPO2 = "402"
  case INVALID_RR = "403"
  case INVALID_HR = "404"
  case INVALID_SBP = "405"
  case INVALID_DBP = "406"
  case INVALID_GLUCOSE = "407"
  case CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS = "408"    // Not in Android
  case CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS = "409"    // Not in Android
  case CALIBRATE_ERR_CALIBRATE_IN_PROGRESS = "410"    // Not in Android
  case CALIBRATION_ERROR = "411"    // Not in Android
    
  // Firmware update errors
  case FIRMWARE_UPDATE_START = "501"
  case FIRMWARE_UPDATE_ERROR_FILE_PARSE = "502"
  case FIRMWARE_UPDATE_ERROR_FILE_READ = "503"
  case FIRMWARE_UPDATE_ERROR_CONNECTION = "504"
  case FIRMWARE_UPDATE_ERROR_COMMUNICATION = "505"
  case FIRMWARE_UPDATE_ERROR_CRC = "506"
  case FIRMWARE_UPDATE_ERROR_INSTALLATION = "507"
  case FIRMWARE_UPDATE_INVALID_FILE = "508"
  case FIRMWARE_UPDATE_COMPLETE = "509"
  case FIRMWARE_UPDATE_DFU_MODE_INITIATED = "510"
    
  // Step goal
  case INVALID_STEP_GOAL = "520"
  case STEP_GOAL_UPDATE_ACKNOWLEDGE = "521"
  case STEP_GOAL_UPDATE_FAILED = "522"
  case STEP_GOAL_UPDATE_COMPLETE = "523"

  public var type: String {
    switch self.category {
          case "S":
              return "success"
          case "I":
              return "intermediate"
          default:
              return "failed"
      }
  }

  internal var code: String {
    return self.rawValue
  }

  public var desc: String {
    switch self {
    // Common Success and Intermediate
    case .FINAL_UPDATE: return ""
    case .GATT_STATE_CHANGE: return "New GATT status"

    // Common Errors
    case .UNKNOWN_ERR: return "Unknown error"
    case .DISCONNECT: return "Watch disconnected"
    case .NOT_CONNECTED: return "Watch not connected"
    case .INVALID_USER: return "Invalid user id"
    case .INVALID_USER_SESSION: return "Invalid user session"
    case .DATA_PARSE_ERR: return "Watch data parse error"
    case .OP_TIMEOUT: return "Watch operation timeout"
    case .DB_OP_ERR: return "Database operation failed"
    case .HTTP_OP_ERR: return "HTTP operation failed"
    case .BLANK_ERR: return ""
    case .INVALID_MSN: return "Invalid device MSN"
    case .TIME_OUT: return "Watch did not reply in stipulated time"
    case .OTHER_PROC_RUNNING: return "Other process is running"
    case .UNABLE_CHARCT_READ: return "Unable to read characteristic"
    case .UNABLE_CHARCT_WRITE: return "Unable to write characteristic"
    case .INVALID_GATT: return "GATT is null or invalid"
    case .AUTO_MEASURE_IN_PROGRESS: return "Auto measure in progress, please wait"
    case .INSTANT_MEASURE_IN_PROGRESS: return "Instant measure in progress, please wait"
    case .CALIBRATE_IN_PROGRESS: return "Calibrate already in progress, please wait"
    case .WATCH_BATTERY_LOW: return "Watch battery low"
    case .WATCH_BATTERY_NORMAL: return "Watch battery normal"
    case .WATCH_CHARGER_CONNECTED: return "Watch charger connected"
    case .WATCH_CHARGER_DISCONNECTED: return "Watch charger removed"
    case .WATCH_NOT_ON_WRIST: return "Watch not on wrist"
    case .WATCH_ON_WRIST: return "Watch on wrist"
    case .UNDEFINED_CHARACT: return "Characteristic is not defined"
    case .UNABLE_DATETIME_SET: return "Unable to sync date time with watch"
    case .UNABLE_TIMEZONE_SET: return "Unable to sync timezone with watch"
    case .INVALID_INPUT_PARAMS: return "Invalid input parameter(s)"
    case .WATCH_SHUTDOWN_IN_PROGRESS: return "Watch shutdown is in progress"
    case .MEASURE_FAILED: return "Unsuccessful measure has been detected"
      
    // Connect Success and Intermediate
    case .WATCH_CONNECTED: return "Watch connected"
    case .CONNECT_ACKNOWLEDGE: return "Request is being processed"
    case .DISCOVERING_SERVICES: return "Discovering GATT services"
  //    DEVICE_FOUND('I', "198", "Device Found"

    // Connect errors
    case .INVALID_AUTH: return "Invalid Authentication Id"
    case .WATCH_UNAVAILABLE: return "No watch available"
    case .UNMATCH_AUTH_ID: return "Authentication Id does not match"
    case .WATCH_REJECT_AUTH: return "Authentication rejected by watch"
    case .BLE_NO_PERMISSION: return "Bluetooth permission is not enabled"
    case .LOCATION_NO_PERMISSION: return "Location permission is not enabled"
    case .WATCH_REJECT_BOND: return "Bonding rejected by watch"
    case .INDICATE_SBSCRIPTION_FAIL: return "Unable to subscribe indicate"
    case .GATT_DISCOVER_FAIL: return "Unable to discover GATT"
    case .GATT_WRITE_FAIL: return "Unable to write GATT characteristic"
    case .GATT_READ_FAIL: return "Unable to read GATT characteristic"
    case .UNABLE_START_SCANNING: return "Unable to start scanning"
    case .UNABLE_START_SERVICE_DISCOVERY: return "Unable to start services discovery"
    case .INVALID_DEVICE: return "Watch is null or invalid"
    case .CALIBRATION_FAILED: return "Calibration failed"
    case .INSTANT_MEASURE_FAILED: return "Instant measure failed"

    // AppSync Success and Intermediate
    case .APPSYNC_COMPLETED: return "App Sync completed"
    case .APPSYNC_ACKNOWLEDGE: return "Request is being processed"

    // AppSync errors
    case .INVALID_CGM_MODE: return "Invalid CGM code"
    case .INVALID_DATA_FROM_WATCH: return "Invalid number of bytes received from watch"
    case .APPSYNC_ERROR: return "Unable to start AppSync"

    case .AUTO_MEASURE_COMPLETED: return "Auto measure completed"
    case .AUTO_MEASURE_STARTED: return "Auto measure started"

    // Instant Measure Success and Intermediate
    case .INSTANT_MEASURE_COMPLETED: return "Instant measure completed"
    case .MEASURE_ACKNOWLEDGE: return "Request is being processed"

    // Instant Measure
    case .UNABLE_START_INSTANT_MEASURE: return "Unable to start instant measure"
    case .VITAL_READ_COMMAND_FAILED: return "Unable to fire command for vital read"
    case .RAW_READ_COMMAND_FAILED: return "Unable to fire command for raw data read"

    case .OFFLINE_VITAL_COMMAND_FAILED: return "Unable to fire command for offline data read"
    case .OFFLINE_VITAL_READ_COMPLETE: return "offline data read complete"
    case .OFFLINE_VITAL_READ_START: return "offline data read started"
    case .OFFLINE_VITAL_READ_IN_PROGRESS: return "offline data read in progress"

    // Step count
    case .STEP_COUNT_AVAILABLE: return "Step count available"

    // Meal data available
    case .MEAL_DATA_AVAILABLE: return "Meal data available"

    // Calibration Success and Intermediate
    case .CALIBRATION_ACKNOWLEDGE: return "Request is being processed"

    case .CALIBRATION_SUCCESS: return "Calibration completed"
    case .CALIBRATION_MEASURE_COMPLETE: return "Calibration measure complete"
    case .CALIBRATION_MEASURE_PROGRESS: return "Calibration measure in progress"

    // Auto calibration
    case .AUTO_CALIBRATION_SUCCESS: return "Auto Calibration Completed"
    case .AUTO_CALIBRATION_STARTED: return "Auto Calibration started"

    // Calibration errors
    case .UNABLE_START_CALIBRATION: return "Unable to start calibration"
    case .INVALID_SPO2: return "Invalid SPO2"
    case .INVALID_RR: return "Invalid RR"
    case .INVALID_HR: return "Invalid HR"
    case .INVALID_SBP: return "Invalid SBP"
    case .INVALID_DBP: return "Invalid DBP"
    case .INVALID_GLUCOSE: return "Invalid Glucose"
    case .CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS: return "Auto Measure in progress"
    case .CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS: return "Instant Measure in progress"
    case .CALIBRATE_ERR_CALIBRATE_IN_PROGRESS: return "Calibration in progress"
    case .CALIBRATION_ERROR: return "Calibration error"
        
    case .FIRMWARE_UPDATE_START: return "Firmware update started"
    case .FIRMWARE_UPDATE_ERROR_FILE_PARSE: return "Firmware update finished with file parse error"
    case .FIRMWARE_UPDATE_ERROR_FILE_READ: return "Firmware update finished with file read error"
    case .FIRMWARE_UPDATE_ERROR_CONNECTION: return "Firmware update finished with connection error"
    case .FIRMWARE_UPDATE_ERROR_COMMUNICATION: return "Firmware update finished with communication error"
    case .FIRMWARE_UPDATE_ERROR_CRC: return "Firmware update finished with CRC error"
    case .FIRMWARE_UPDATE_ERROR_INSTALLATION: return "Firmware update finished with installation error"
    case .FIRMWARE_UPDATE_INVALID_FILE: return "Failed to read firmware update file"
    case .FIRMWARE_UPDATE_COMPLETE: return "Firmware update completed successfully"
    case .FIRMWARE_UPDATE_DFU_MODE_INITIATED: return "DFU mode has been initiated successfully"
        
    case .INVALID_STEP_GOAL: return "Invalid daily step goal"
    case .STEP_GOAL_UPDATE_ACKNOWLEDGE: return "Request is being processed"
    case .STEP_GOAL_UPDATE_FAILED: return "Unable to update daily step goal in watch"
    case .STEP_GOAL_UPDATE_COMPLETE: return "Step goal updated successfully"
    }
  }

  internal var nextState: BleProcStateEnum? {
    switch self {
    // Common Success and Intermediate
    case .FINAL_UPDATE: return BleProcStateEnum.NONE
    case .GATT_STATE_CHANGE: return BleProcStateEnum.NONE

    // Connect Success and Intermediate
    case .WATCH_CONNECTED: return BleProcStateEnum.NONE
    case .CONNECT_ACKNOWLEDGE: return BleProcStateEnum.SCAN
    case .DISCOVERING_SERVICES: return BleProcStateEnum.CONNECT_GATT
  //    DEVICE_FOUND('I', "198", "Device Found")

    // AppSync Success and Intermediate
    case .APPSYNC_COMPLETED: return BleProcStateEnum.NONE
    case .APPSYNC_ACKNOWLEDGE: return BleProcStateEnum.APP_SYNC_READ

    case .AUTO_MEASURE_COMPLETED: return BleProcStateEnum.NONE

    case .OFFLINE_VITAL_READ_COMPLETE: return BleProcStateEnum.NONE
    case .OFFLINE_VITAL_READ_START: return BleProcStateEnum.NONE

    // Step count
    case .STEP_COUNT_AVAILABLE: return BleProcStateEnum.NONE

    // Meal data available
    case .MEAL_DATA_AVAILABLE: return BleProcStateEnum.NONE

    // Calibration Success and Intermediate
    case .CALIBRATION_ACKNOWLEDGE: return BleProcStateEnum.CALIBRATION_START

    case .CALIBRATION_SUCCESS: return BleProcStateEnum.NONE
    case .CALIBRATION_MEASURE_COMPLETE: return BleProcStateEnum.NONE
    case .CALIBRATION_MEASURE_PROGRESS: return BleProcStateEnum.NONE

    // Auto Calibration
    case .AUTO_CALIBRATION_SUCCESS: return .NONE
    case .AUTO_CALIBRATION_STARTED: return .NONE

    case .AUTO_MEASURE_STARTED: return BleProcStateEnum.NONE

    // Instant Measure Success and Intermediate
    case .INSTANT_MEASURE_COMPLETED: return BleProcStateEnum.NONE
    case .MEASURE_ACKNOWLEDGE: return BleProcStateEnum.MEASURE_START
    
    // Firmware update
    case .FIRMWARE_UPDATE_START: return BleProcStateEnum.FIRMWARE_UPDATE_START
    case .FIRMWARE_UPDATE_COMPLETE: return BleProcStateEnum.NONE

    default: return nil
    }
  }

  internal var category: String {
    switch self {
    // Common Success and Intermediate
    case .FINAL_UPDATE: return "S"
    case .GATT_STATE_CHANGE: return "I"

    // Connect Success and Intermediate
    case .WATCH_CONNECTED: return "S"
    case .CONNECT_ACKNOWLEDGE: return "I"
    case .DISCOVERING_SERVICES: return "I"
    //    DEVICE_FOUND('I', "198", "Device Found")

    // AppSync Success and Intermediate
    case .APPSYNC_COMPLETED: return "S"
    case .APPSYNC_ACKNOWLEDGE: return "I"

    case .AUTO_MEASURE_COMPLETED: return "S"

    case .OFFLINE_VITAL_READ_COMPLETE: return "S"
    case .OFFLINE_VITAL_READ_START: return "S"

    // Step count
    case .STEP_COUNT_AVAILABLE: return "S"

    // Meal data available
    case .MEAL_DATA_AVAILABLE: return "S"

    // Calibration Success and Intermediate
    case .CALIBRATION_ACKNOWLEDGE: return "I"

    case .CALIBRATION_SUCCESS: return "S"
    case .CALIBRATION_MEASURE_COMPLETE: return "S"
    case .CALIBRATION_MEASURE_PROGRESS: return "I"
      
    case .AUTO_CALIBRATION_SUCCESS: return "S"
    case .AUTO_CALIBRATION_STARTED: return "I"

    case .AUTO_MEASURE_STARTED: return "S"

    // Instant Measure Success and Intermediate
    case .INSTANT_MEASURE_COMPLETED: return "S"
    case .MEASURE_ACKNOWLEDGE: return "I"
        
    // Firmware update
    case .FIRMWARE_UPDATE_START: return "S"
    case .FIRMWARE_UPDATE_COMPLETE: return "S"
        
    // Step goal update
    case .STEP_GOAL_UPDATE_COMPLETE: return "S"
    case .STEP_GOAL_UPDATE_ACKNOWLEDGE: return "I"

    default: return "F"
    }
  }
}
