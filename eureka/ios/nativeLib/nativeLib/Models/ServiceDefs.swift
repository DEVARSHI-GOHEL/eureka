//
//  ServiceDefs.swift
//  BLEDemo
//

import Foundation

public class ServiceDefs {
    
  internal enum WriteType {
    case WriteDescriptor
    case WriteCharacteristic
  }
    
  private static var _services: [UUID : AServiceDef] = getServices()
    
  private static func addServiceDef(pUUID: String, pName: String) {
    _services[UUID(uuidString: pUUID)!] = AServiceDef(pUUID: pUUID, pName: pName, pIsAutomic: false)
  }
    
  private static func addServiceDef(pUUID: String , pName: String , pIsAutomic: Bool) {
    _services[UUID(uuidString: pUUID)!] = AServiceDef(pUUID: pUUID, pName: pName, pIsAutomic: pIsAutomic)
  }
    
  internal static func getService(pUUID: String) -> AServiceDef? {
    return _services[UUID(uuidString: pUUID)!]!
  }
    
  internal static func isAtomic(pUUID: String) -> Bool {
    var result: Bool = false
    if let mService = _services[UUID(uuidString: pUUID)!] {
      result = mService.isAutomic();
    }
    return result;
  }
    
  internal static func getCharDef(pCharUuidStr:String) -> ACharDef? {
    var result:ACharDef? = nil
    for mServiceDefEntry in _services {
      result = mServiceDefEntry.value.getCharacteristic(pUUID: pCharUuidStr)
      if (result != nil) {
        break
      }
    }
    return result
  }
    
  internal static func getServiceDefForChar(pCharUuidStr:String) -> AServiceDef? {
    var result:AServiceDef? = nil
    for mServiceDefEntry in _services {
      if (mServiceDefEntry.value.getCharacteristic(pUUID: pCharUuidStr) != nil) {
        result = mServiceDefEntry.value
        break;
      }
    }
    return result;
  }
    
  private static func getServices() -> [UUID : AServiceDef] {
//    //        00001800-0000-1000-8000-00805f9b34fb
//    //        00001801-0000-1000-8000-00805f9b34fb
//
    var result:[UUID : AServiceDef] = [:]
    result[UUID(uuidString: GattServiceEnum.BATTERY_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.BATTERY_SERVICE.code, pName: GattServiceEnum.BATTERY_SERVICE.desc, pIsAutomic: false)
    var mService:AServiceDef = result[UUID(uuidString: GattServiceEnum.BATTERY_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.BATTERY_LEVEL.code, pName: GattCharEnum.BATTERY_LEVEL.desc, pDataType: DataTypeEnum.UINT8, pLength: 1, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.BATTERY_LEVEL)
    var mCharacteristic:ACharDef = mService.getCharacteristic(pUUID: GattCharEnum.BATTERY_LEVEL.code)!
    mCharacteristic.addMember( pMember: AMember(pName: "Battery_Level", pDataType: DataTypeEnum.bit, pLength: 8))

    result[UUID(uuidString: GattServiceEnum.BP_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.BP_SERVICE.code, pName: GattServiceEnum.BP_SERVICE.desc)
    mService = result[UUID(uuidString: GattServiceEnum.BP_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.BP_MEASUREMENT.code, pName: GattCharEnum.BP_MEASUREMENT.desc, pDataType: DataTypeEnum.byteArr, pLength: 14, pProperty: CharPropertyEnum.indicate, pCharEnum: GattCharEnum.BP_MEASUREMENT)
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.BP_MEASUREMENT.code)!
    mCharacteristic.addMember( pMember: AMember(pName: "Blood_Pressure_Units", pDataType: DataTypeEnum.bit, pLength: 1))
    mCharacteristic.addMember( pMember: AMember(pName: "Time_Stamp_Flag", pDataType: DataTypeEnum.bit, pLength: 1))
    mCharacteristic.addMember( pMember: AMember(pName: "Pulse_Rate_Flag", pDataType: DataTypeEnum.bit, pLength: 2))
    mCharacteristic.addMember( pMember: AMember(pName: "User_ID_Flag", pDataType: DataTypeEnum.bit, pLength: 3))
    mCharacteristic.addMember( pMember: AMember(pName: "Measurement", pDataType: DataTypeEnum.bit, pLength: 4));
    mCharacteristic.addMember( pMember: AMember(pName: "Measurement_Status_Flag", pDataType: DataTypeEnum.bit, pLength: 4));
    mCharacteristic.addMember(pMember: AMember(pName: "Systolic_pressure", pDataType: DataTypeEnum.bit, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Diastolic_pressure", pDataType: DataTypeEnum.bit, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Mean_arterial_pressure", pDataType: DataTypeEnum.bit, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Mean_arterial_pressure", pDataType: DataTypeEnum.bit, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hour", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.BP_FEATURE.code, pName: GattCharEnum.BP_FEATURE.desc, pDataType: DataTypeEnum.UINT16, pLength: 2, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.BP_FEATURE);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.BP_FEATURE.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Body_Movement_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Cuff_Fit_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Irregular_Pulse_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Pulse_Rate_Range_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Measurement_Position_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Multiple_Bond_Detection_Support", pDataType: DataTypeEnum.bit, pLength: 1));

    result[UUID(uuidString: GattServiceEnum.GLUCOSE_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.GLUCOSE_SERVICE.code, pName: GattServiceEnum.GLUCOSE_SERVICE.desc);
    mService = result[UUID(uuidString: GattServiceEnum.GLUCOSE_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.CGM_FEATURE.code, pName: GattCharEnum.CGM_FEATURE.desc, pDataType: DataTypeEnum.byteArr, pLength: 6, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.CGM_FEATURE);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CGM_FEATURE.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Calibration_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Patient_High_Low_Alerts_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Hypo_Alerts_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Hyper_Alerts_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Rate_of_Increase_Decrease_Alerts_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Device_Specific_Alerts_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Sensor_Malfunction_Detection_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Sensor_Temperature_High_Low_Detection_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Sensor_Result_High_Low_Detection_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Low_Battery_Detection_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Sensor_Type_Error_Detection_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "General_Device_Fault_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "E2E_CRC_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Multiple_Bond_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Multiple_Sessions_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Trend_Information_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Quality_Supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Type", pDataType: DataTypeEnum.bit, pLength: 4));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Sample_Location", pDataType: DataTypeEnum.bit, pLength: 4));
    mCharacteristic.addMember(pMember: AMember(pName: "E2E_CRC", pDataType: DataTypeEnum.bit, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.CGM_SESSION_RUNTIME.code, pName: GattCharEnum.CGM_SESSION_RUNTIME.desc, pDataType: DataTypeEnum.UINT16, pLength: 2, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.CGM_SESSION_RUNTIME);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CGM_SESSION_RUNTIME.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "prediction_of_the_run_time_in_hours", pDataType: DataTypeEnum.bit, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.CGM_SESSION_START_TIME.code, pName: GattCharEnum.CGM_SESSION_START_TIME.desc, pDataType: DataTypeEnum.UINT16, pLength: 9, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.CGM_SESSION_START_TIME);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CGM_SESSION_START_TIME.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Hour", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "TimeZone", pDataType: DataTypeEnum.INT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "DST_offset", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.TIME_OFFSET.code, pName: GattCharEnum.TIME_OFFSET.desc, pDataType: DataTypeEnum.UINT16, pLength: 2, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.TIME_OFFSET);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.TIME_OFFSET.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Time_Offset", pDataType: DataTypeEnum.UINT16, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.CGM_MEASUREMENT.code, pName: GattCharEnum.CGM_MEASUREMENT.desc, pDataType: DataTypeEnum.byteArr, pLength: 6, pProperty: CharPropertyEnum.notify, pCharEnum: GattCharEnum.CGM_MEASUREMENT);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CGM_MEASUREMENT.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "record_size", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Trend_Information_Present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_Quality_Present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Warning_Octet_Present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Cal_Temp_Octet_Present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Status_Octet_Present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "CGM_glucose_concentration", pDataType: DataTypeEnum.SFLOAT, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "relative_time_difference_in_minutes", pDataType: DataTypeEnum.SFLOAT, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.code, pName: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.desc, pDataType: DataTypeEnum.byteArr, pLength: 5, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Operation_code", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operator", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operand_type", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operand", pDataType: DataTypeEnum.UINT16, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.code, pName: GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.desc, pDataType: DataTypeEnum.byteArr, pLength: 2, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Operation_code", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operator", pDataType: DataTypeEnum.UINT8, pLength: 8));

    result[UUID(uuidString: GattServiceEnum.CURR_TIME_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.CURR_TIME_SERVICE.code, pName: GattServiceEnum.CURR_TIME_SERVICE.desc);
    mService = result[UUID(uuidString: GattServiceEnum.CURR_TIME_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.CURRENT_TIME.code, pName: GattCharEnum.CURRENT_TIME.desc, pDataType: DataTypeEnum.byteArr, pLength: 9, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.CURRENT_TIME);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.CURRENT_TIME.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Hour", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Fraction256", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Manual_time_update", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "External_reference_time_update", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Change_of_time_zone", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Change_of_daylight savings time", pDataType: DataTypeEnum.bit, pLength: 1));

    mService.addCharacteristic(pUuid: GattCharEnum.LOCAL_TIME_INFORMATION.code, pName: GattCharEnum.LOCAL_TIME_INFORMATION.desc, pDataType: DataTypeEnum.byteArr, pLength: 2, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.LOCAL_TIME_INFORMATION);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.LOCAL_TIME_INFORMATION.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Time_Zone", pDataType: DataTypeEnum.INT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Daylight_Saving_Time_offset", pDataType: DataTypeEnum.UINT8, pLength: 8));

    //        00002a14-0000-1000-8000-00805f9b34fb      Characteristics not used

    result[UUID(uuidString: GattServiceEnum.DEVICE_INFORMATION_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.DEVICE_INFORMATION_SERVICE.code, pName: GattServiceEnum.DEVICE_INFORMATION_SERVICE.desc);
    mService = result[UUID(uuidString: GattServiceEnum.DEVICE_INFORMATION_SERVICE.code)!]!
    mService.addCharacteristic(pUuid: GattCharEnum.FIRMWARE_REVISION.code, pName: GattCharEnum.FIRMWARE_REVISION.desc, pDataType: DataTypeEnum.byteArr, pLength: 20, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.FIRMWARE_REVISION);
    //        00002a29-0000-1000-8000-00805f9b34fb
    //        00002a27-0000-1000-8000-00805f9b34fb

    result[UUID(uuidString: GattServiceEnum.PULSE_OXY_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.PULSE_OXY_SERVICE.code, pName: GattServiceEnum.PULSE_OXY_SERVICE.desc);
    mService = result[UUID(uuidString: GattServiceEnum.PULSE_OXY_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.code, pName: GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.desc, pDataType: DataTypeEnum.byteArr, pLength: 12, pProperty: CharPropertyEnum.indicate, pCharEnum: GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Timestamp_field_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Measurement_Status_Field_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Device_and_Sensor_Status_Field_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Pulse_Amplitude_Index_Field_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Device_Clock_Not_Set", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "percentage_with_resolution_1", pDataType: DataTypeEnum.SFLOAT, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "beats_per_minute_with_resolution_1", pDataType: DataTypeEnum.SFLOAT, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Hour", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.PLX_FEATURES.code, pName: GattCharEnum.PLX_FEATURES.desc, pDataType: DataTypeEnum.byteArr, pLength: 2, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.PLX_FEATURES);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.PLX_FEATURES.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Measurement_Status_support_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Device_Sensor_Status_support_present", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Measurement_Storage_Spot_check_measurements_supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Timestamp_Spot_check_measurements_supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "SpO2PR_Fast_metric_supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "SpO2PR_Slow_metric_supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Pulse_Amplitude_Index_field_supported", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Multiple_Bonds_supported", pDataType: DataTypeEnum.bit, pLength: 1));

    mService.addCharacteristic(pUuid: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.code, pName: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.desc, pDataType: DataTypeEnum.byteArr, pLength: 5, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Op_Code", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operator", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operand_Type", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Operand_Value", pDataType: DataTypeEnum.UINT16, pLength: 16));

    //        00002a5f-0000-1000-8000-00805f9b34fb      Characteristic not used

    result[UUID(uuidString: GattServiceEnum.CUSTOM_SERVICE.code)!] = AServiceDef(pUUID: GattServiceEnum.CUSTOM_SERVICE.code, pName: GattServiceEnum.CUSTOM_SERVICE.desc);
    mService = result[UUID(uuidString: GattServiceEnum.CUSTOM_SERVICE.code)!]!

    mService.addCharacteristic(pUuid: GattCharEnum.STATUS.code, pName: GattCharEnum.STATUS.desc, pDataType: DataTypeEnum.UINT8, pLength: 1, pProperty: CharPropertyEnum.indicate, pCharEnum: GattCharEnum.STATUS);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.STATUS.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Battery_Low", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Charger_Connected", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Watch_Not_On_Wrist", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Measure_In_Progress", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "ML_Update_In_Progress", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "FLASH_Operation", pDataType: DataTypeEnum.bit, pLength: 1));

    mService.addCharacteristic(pUuid: GattCharEnum.COMMAND.code, pName: GattCharEnum.COMMAND.desc, pDataType: DataTypeEnum.UINT8, pLength: 1, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.COMMAND);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.COMMAND.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Command", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.VITAL_DATA.code, pName: GattCharEnum.VITAL_DATA.desc, pDataType: DataTypeEnum.byteArr, pLength: 20, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.VITAL_DATA);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.VITAL_DATA.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "HeartRate", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "RespirationRate", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "OxygenSaturation", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BloodGlucose", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BloodPressureSYS", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BloodPressureDIA", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hour", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.RAW_DATA.code, pName: GattCharEnum.RAW_DATA.desc, pDataType: DataTypeEnum.byteArr, pLength: 31, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.RAW_DATA);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.RAW_DATA.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "CurrentIndex", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData1", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData2", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData3", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData4", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro1a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro2a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro3a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_X", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_Y", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_Z", pDataType: DataTypeEnum.UINT16, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.RAW_DATA_2.code, pName: GattCharEnum.RAW_DATA_2.desc, pDataType: DataTypeEnum.byteArr, pLength: 31, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.RAW_DATA_2);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.RAW_DATA_2.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "CurrentIndex", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData1", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData2", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData3", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "AFEData4", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro1a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro2a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Gyro3a", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_X", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_Y", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Accelerometer_Z", pDataType: DataTypeEnum.UINT16, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.LAST_MEASURE_TIME.code, pName: GattCharEnum.LAST_MEASURE_TIME.desc, pDataType: DataTypeEnum.byteArr, pLength: 7, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.LAST_MEASURE_TIME);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.LAST_MEASURE_TIME.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hours", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.MEAL_DATA.code, pName: GattCharEnum.MEAL_DATA.desc, pDataType: DataTypeEnum.byteArr, pLength: 7, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.MEAL_DATA);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.MEAL_DATA.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Meal_Type", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hours", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.BOUNDS.code, pName: GattCharEnum.BOUNDS.desc, pDataType: DataTypeEnum.byteArr, pLength: 18, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.BOUNDS);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.BOUNDS.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "VitalDataType", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderRedLow", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderOrangeLow", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderYellowLow", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderGreenLow", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderGreenHigh", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderYellowHigh", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderOrangeHigh", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "BorderRedHigh", pDataType: DataTypeEnum.UINT16, pLength: 16));

    mService.addCharacteristic(pUuid: GattCharEnum.USER_DATA.code, pName: GattCharEnum.USER_DATA.desc, pDataType: DataTypeEnum.byteArr, pLength: 9, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.USER_DATA);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.USER_DATA.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "Auto_Measure_Enabled", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Meal_Confirmation_Enabled", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Vibration_Enabled", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Glucose_unit_mg_dL", pDataType: DataTypeEnum.bit, pLength: 1));
    mCharacteristic.addMember(pMember: AMember(pName: "Auto_Measure_Period", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "User_Age", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "User_Weight", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "User_Height", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "User_Etnicity", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "User_Gender", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.STEP_COUNTER.code, pName: GattCharEnum.STEP_COUNTER.desc, pDataType: DataTypeEnum.byteArr, pLength: 10, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.STEP_COUNTER);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.STEP_COUNTER.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Steps", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember(pMember: AMember(pName: "Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Day", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Day_of_Week", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.ML_UPDATE.code, pName: GattCharEnum.ML_UPDATE.desc, pDataType: DataTypeEnum.byteArr, pLength: 20, pProperty: CharPropertyEnum.read, pCharEnum: GattCharEnum.ML_UPDATE);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.ML_UPDATE.code)!;
    mCharacteristic.addMember( pMember: AMember(pName: "Offset", pDataType: DataTypeEnum.UINT32, pLength: 32));
    mCharacteristic.addMember( pMember: AMember(pName: "Data", pDataType: DataTypeEnum.UINT8, pLength: 128));
    
    mService.addCharacteristic(pUuid: GattCharEnum.WEATHER.code, pName: GattCharEnum.WEATHER.desc, pDataType: DataTypeEnum.byteArr, pLength: 112, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.WEATHER);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.WEATHER.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day_Of_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hours", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Location", pDataType: DataTypeEnum.UINT8, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "Units", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "WindSpeed", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "WindDirection", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UVIndex", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UVRate", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "WeatherId", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Precipitation", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "Temprature", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "WeatherId", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "MinTemprature", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "MaxTemprature", pDataType: DataTypeEnum.UINT8, pLength: 8));

    mService.addCharacteristic(pUuid: GattCharEnum.NOTIFICATION.code, pName: GattCharEnum.NOTIFICATION.desc, pDataType: DataTypeEnum.byteArr, pLength: 107, pProperty: CharPropertyEnum.write, pCharEnum: GattCharEnum.NOTIFICATION);
    mCharacteristic = mService.getCharacteristic(pUUID: GattCharEnum.NOTIFICATION.code)!;
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 16));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day_Of_Month", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hours", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 8));
    mCharacteristic.addMember(pMember: AMember(pName: "ApplicationName", pDataType: DataTypeEnum.UINT8, pLength: 13));
    mCharacteristic.addMember(pMember: AMember(pName: "Title", pDataType: DataTypeEnum.UINT8, pLength: 36));
    mCharacteristic.addMember(pMember: AMember(pName: "Content", pDataType: DataTypeEnum.UINT8, pLength: 51));
    return result
  }
}
