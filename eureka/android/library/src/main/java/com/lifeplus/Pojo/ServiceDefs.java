package com.lifeplus.Pojo;

import com.lifeplus.Pojo.Enum.CharPropertyEnum;
import com.lifeplus.Pojo.Enum.DataTypeEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;
import com.lifeplus.Pojo.Enum.GattServiceEnum;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ServiceDefs {

    public enum WriteType {
        WriteDescriptor, WriteCharacteristic;
    }

    private static final HashMap<UUID, AServiceDef> _services = new HashMap<>();

    private static void addServiceDef(String pUUID, String pName) {
        _services.put( UUID.fromString(pUUID), new AServiceDef(pUUID, pName, false));
    }

    private static void addServiceDef(String pUUID, String pName, boolean pIsAutomic) {
        _services.put( UUID.fromString(pUUID), new AServiceDef(pUUID, pName, pIsAutomic));
    }

    public static AServiceDef getService(String pUUID) {
        return _services.get( UUID.fromString(pUUID));
    }

    public static boolean isAtomic(String pUUID) {
        boolean result = false;
        AServiceDef mService = _services.get( UUID.fromString(pUUID));
        if (mService != null) {
            result = mService.isAutomic();
        }
        return result;
    }

    public static ACharDef getCharDef(String pCharUuidStr) {
        ACharDef result = null;
        for (Map.Entry<UUID, AServiceDef> mServiceDefEntry : _services.entrySet()) {
            AServiceDef mService = mServiceDefEntry.getValue();
            result = mService.getCharacteristic(pCharUuidStr);
            if (result != null) {
                break;
            }
        }
        return result;
    }

    public static AServiceDef getSerivcedefForChar(String pCharUuidStr) {
        AServiceDef result = null;
        for (Map.Entry<UUID, AServiceDef> mServiceDefEntry : _services.entrySet()) {
            AServiceDef mService = mServiceDefEntry.getValue();
            if (mService.getCharacteristic(pCharUuidStr) != null) {
                result = mService;
                break;
            }
        }
        return result;
    }

    static {
//        00001800-0000-1000-8000-00805f9b34fb
//        00001801-0000-1000-8000-00805f9b34fb

        addServiceDef(GattServiceEnum.BATTERY_SERVICE.getId(), GattServiceEnum.BATTERY_SERVICE.getDesc());
        AServiceDef mService = getService(GattServiceEnum.BATTERY_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.BATTERY_LEVEL.getId(), GattCharEnum.BATTERY_LEVEL.getDesc(), DataTypeEnum.UINT8, 1, CharPropertyEnum.read, GattCharEnum.BATTERY_LEVEL);
        ACharDef mCharacteristic = mService.getCharacteristic(GattCharEnum.BATTERY_LEVEL.getId());
        mCharacteristic.addMember(new AMember("Battery_Level", DataTypeEnum.bit, 8));

        addServiceDef(GattServiceEnum.BP_SERVICE.getId(), GattServiceEnum.BP_SERVICE.getDesc());
        mService = getService(GattServiceEnum.BP_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.BP_MEASUREMENT.getId(), GattCharEnum.BP_MEASUREMENT.getDesc(), DataTypeEnum.byteArr, 14, CharPropertyEnum.indicate, GattCharEnum.BP_MEASUREMENT);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.BP_MEASUREMENT.getId());
        mCharacteristic.addMember(new AMember("Blood_Pressure_Units", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Time_Stamp_Flag", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Pulse_Rate_Flag", DataTypeEnum.bit, 2));
        mCharacteristic.addMember(new AMember("User_ID_Flag", DataTypeEnum.bit, 3));
        mCharacteristic.addMember(new AMember("Measurement", DataTypeEnum.bit, 4));
        mCharacteristic.addMember(new AMember("Measurement_Status_Flag", DataTypeEnum.bit, 4));
        mCharacteristic.addMember(new AMember("Systolic_pressure", DataTypeEnum.bit, 16));
        mCharacteristic.addMember(new AMember("Diastolic_pressure", DataTypeEnum.bit, 16));
        mCharacteristic.addMember(new AMember("Mean_arterial_pressure", DataTypeEnum.bit, 16));
        mCharacteristic.addMember(new AMember("Mean_arterial_pressure", DataTypeEnum.bit, 16));
        mCharacteristic.addMember(new AMember("UTC_Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Seconds", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.BP_FEATURE.getId(), GattCharEnum.BP_FEATURE.getDesc(), DataTypeEnum.UINT16, 2, CharPropertyEnum.read, GattCharEnum.BP_FEATURE);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.BP_FEATURE.getId());
        mCharacteristic.addMember(new AMember("Body_Movement_Detection_Support", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Cuff_Fit_Detection_Support", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Irregular_Pulse_Detection_Support", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Pulse_Rate_Range_Detection_Support", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Measurement_Position_Detection_Support", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Multiple_Bond_Detection_Support", DataTypeEnum.bit, 1));

        addServiceDef(GattServiceEnum.GLUCOSE_SERVICE.getId(), GattServiceEnum.GLUCOSE_SERVICE.getDesc());
        mService = getService(GattServiceEnum.GLUCOSE_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.CGM_FEATURE.getId(), GattCharEnum.CGM_FEATURE.getDesc(), DataTypeEnum.byteArr, 6, CharPropertyEnum.read, GattCharEnum.CGM_FEATURE);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CGM_FEATURE.getId());
        mCharacteristic.addMember(new AMember("Calibration_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Patient_High_Low_Alerts_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Hypo_Alerts_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Hyper_Alerts_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Rate_of_Increase_Decrease_Alerts_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Device_Specific_Alerts_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Sensor_Malfunction_Detection_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Sensor_Temperature_High_Low_Detection_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Sensor_Result_High_Low_Detection_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Low_Battery_Detection_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Sensor_Type_Error_Detection_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("General_Device_Fault_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("E2E_CRC_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Multiple_Bond_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Multiple_Sessions_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("CGM_Trend_Information_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("CGM_Quality_Supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("CGM_Type", DataTypeEnum.bit, 4));
        mCharacteristic.addMember(new AMember("CGM_Sample_Location", DataTypeEnum.bit, 4));
        mCharacteristic.addMember(new AMember("E2E_CRC", DataTypeEnum.bit, 16));

        mService.addCharacteristic(GattCharEnum.CGM_SESSION_RUNTIME.getId(), GattCharEnum.CGM_SESSION_RUNTIME.getDesc(), DataTypeEnum.UINT16, 2, CharPropertyEnum.read, GattCharEnum.CGM_SESSION_RUNTIME);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CGM_SESSION_RUNTIME.getId());
        mCharacteristic.addMember(new AMember("prediction_of_the_run_time_in_hours", DataTypeEnum.bit, 16));

        mService.addCharacteristic(GattCharEnum.CGM_SESSION_START_TIME.getId(), GattCharEnum.CGM_SESSION_START_TIME.getDesc(), DataTypeEnum.UINT16, 9, CharPropertyEnum.read, GattCharEnum.CGM_SESSION_START_TIME);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CGM_SESSION_START_TIME.getId());
        mCharacteristic.addMember(new AMember("Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("TimeZone", DataTypeEnum.INT8, 8));
        mCharacteristic.addMember(new AMember("DST_offset", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.TIME_OFFSET.getId(), GattCharEnum.TIME_OFFSET.getDesc(), DataTypeEnum.UINT16, 2, CharPropertyEnum.read, GattCharEnum.TIME_OFFSET);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.TIME_OFFSET.getId());
        mCharacteristic.addMember(new AMember("Time_Offset", DataTypeEnum.UINT16, 16));

        mService.addCharacteristic(GattCharEnum.CGM_MEASUREMENT.getId(), GattCharEnum.CGM_MEASUREMENT.getDesc(), DataTypeEnum.byteArr, 6, CharPropertyEnum.notify, GattCharEnum.CGM_MEASUREMENT);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CGM_MEASUREMENT.getId());
        mCharacteristic.addMember(new AMember("record_size", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("CGM_Trend_Information_Present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("CGM_Quality_Present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Warning_Octet_Present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Cal_Temp_Octet_Present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Status_Octet_Present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("CGM_glucose_concentration", DataTypeEnum.SFLOAT, 16));
        mCharacteristic.addMember(new AMember("relative_time_difference_in_minutes", DataTypeEnum.SFLOAT, 16));

        mService.addCharacteristic(GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.getId(), GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.getDesc(), DataTypeEnum.byteArr, 5, CharPropertyEnum.write, GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.RECORD_ACCESS_CONTROL_POINT_GLUCO.getId());
        mCharacteristic.addMember(new AMember("Operation_code", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operator", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operand_type", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operand", DataTypeEnum.UINT16, 16));

        mService.addCharacteristic(GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.getId(), GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.getDesc(), DataTypeEnum.byteArr, 2, CharPropertyEnum.write, GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CGM_SPECIFIC_OPS_CONTOL_POINT.getId());
        mCharacteristic.addMember(new AMember("Operation_code", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operator", DataTypeEnum.UINT8, 8));

        addServiceDef(GattServiceEnum.CURR_TIME_SERVICE.getId(), GattServiceEnum.CURR_TIME_SERVICE.getDesc());
        mService = getService(GattServiceEnum.CURR_TIME_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.CURRENT_TIME.getId(), GattCharEnum.CURRENT_TIME.getDesc(), DataTypeEnum.byteArr, 9, CharPropertyEnum.write, GattCharEnum.CURRENT_TIME);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.CURRENT_TIME.getId());
        mCharacteristic.addMember(new AMember("Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Seconds", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Fraction256", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Manual_time_update", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("External_reference_time_update", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Change_of_time_zone", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Change_of_daylight savings time", DataTypeEnum.bit, 1));

        mService.addCharacteristic(GattCharEnum.LOCAL_TIME_INFORMATION.getId(), GattCharEnum.LOCAL_TIME_INFORMATION.getDesc(), DataTypeEnum.byteArr, 2, CharPropertyEnum.read, GattCharEnum.LOCAL_TIME_INFORMATION);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.LOCAL_TIME_INFORMATION.getId());
        mCharacteristic.addMember(new AMember("Time_Zone", DataTypeEnum.INT8, 8));
        mCharacteristic.addMember(new AMember("Daylight_Saving_Time_offset", DataTypeEnum.UINT8, 8));
        addServiceDef(GattServiceEnum.DEVICE_INFORMATION_SERVICE.getId(), GattServiceEnum.DEVICE_INFORMATION_SERVICE.getDesc());
        mService = getService(GattServiceEnum.DEVICE_INFORMATION_SERVICE.getId());
        mService.addCharacteristic(GattCharEnum.FIRMWARE_REVISION.getId(), GattCharEnum.FIRMWARE_REVISION.getDesc(), DataTypeEnum.byteArr, 20, CharPropertyEnum.read, GattCharEnum.FIRMWARE_REVISION);

        addServiceDef(GattServiceEnum.PULSE_OXY_SERVICE.getId(), GattServiceEnum.PULSE_OXY_SERVICE.getDesc());
        mService = getService(GattServiceEnum.PULSE_OXY_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.getId(), GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.getDesc(), DataTypeEnum.byteArr, 12, CharPropertyEnum.indicate, GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.PLX_SPOT_CHECK_MEASUREMENT.getId());
        mCharacteristic.addMember(new AMember("Timestamp_field_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Measurement_Status_Field_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Device_and_Sensor_Status_Field_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Pulse_Amplitude_Index_Field_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Device_Clock_Not_Set", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("percentage_with_resolution_1", DataTypeEnum.SFLOAT, 16));
        mCharacteristic.addMember(new AMember("beats_per_minute_with_resolution_1", DataTypeEnum.SFLOAT, 16));
        mCharacteristic.addMember(new AMember("Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Seconds", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.PLX_FEATURES.getId(), GattCharEnum.PLX_FEATURES.getDesc(), DataTypeEnum.byteArr, 2, CharPropertyEnum.read, GattCharEnum.PLX_FEATURES);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.PLX_FEATURES.getId());
        mCharacteristic.addMember(new AMember("Measurement_Status_support_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Device_Sensor_Status_support_present", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Measurement_Storage_Spot_check_measurements_supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Timestamp_Spot_check_measurements_supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("SpO2PR_Fast_metric_supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("SpO2PR_Slow_metric_supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Pulse_Amplitude_Index_field_supported", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Multiple_Bonds_supported", DataTypeEnum.bit, 1));

        mService.addCharacteristic(GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.getId(), GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.getDesc(), DataTypeEnum.byteArr, 5, CharPropertyEnum.write, GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.RECORD_ACCESS_CONTROL_POINT_OXY.getId());
        mCharacteristic.addMember(new AMember("Op_Code", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operator", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operand_Type", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Operand_Value", DataTypeEnum.UINT16, 16));

//        00002a5f-0000-1000-8000-00805f9b34fb      Characteristic not used

        addServiceDef(GattServiceEnum.CUSTOM_SERVICE.getId(), GattServiceEnum.CUSTOM_SERVICE.getDesc());
        mService = getService(GattServiceEnum.CUSTOM_SERVICE.getId());

        mService.addCharacteristic(GattCharEnum.STATUS.getId(), GattCharEnum.STATUS.getDesc(), DataTypeEnum.UINT8, 1, CharPropertyEnum.indicate, GattCharEnum.STATUS);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.STATUS.getId());
        mCharacteristic.addMember(new AMember("Battery_Low", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Charger_Connected", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Watch_Not_On_Wrist", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Measure_In_Progress", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("ML_Update_In_Progress", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("FLASH_Operation", DataTypeEnum.bit, 1));

        mService.addCharacteristic(GattCharEnum.COMMAND.getId(), GattCharEnum.COMMAND.getDesc(), DataTypeEnum.UINT8, 1, CharPropertyEnum.write, GattCharEnum.COMMAND);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.COMMAND.getId());
        mCharacteristic.addMember(new AMember("Command", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.NOTIFICATIONS.getId(), GattCharEnum.NOTIFICATIONS.getDesc(), DataTypeEnum.UINT8, 107, CharPropertyEnum.write, GattCharEnum.NOTIFICATIONS);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.NOTIFICATIONS.getId());
        mCharacteristic.addMember(new AMember("UTC_Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Seconds", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("ApplicationName", DataTypeEnum.UINT8, 8*13));
        mCharacteristic.addMember(new AMember("Title", DataTypeEnum.UINT8, 8*36));
        mCharacteristic.addMember(new AMember("Content", DataTypeEnum.UINT8, 8*51));


        mService.addCharacteristic(GattCharEnum.VITAL_DATA.getId(), GattCharEnum.VITAL_DATA.getDesc(), DataTypeEnum.byteArr, 20, CharPropertyEnum.read, GattCharEnum.VITAL_DATA);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.VITAL_DATA.getId());
        mCharacteristic.addMember(new AMember("OpStatus", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("HeartRate", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("RespirationRate", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("OxygenSaturation", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BloodGlucose", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BloodPressureSYS", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BloodPressureDIA", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Hour", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Seconds", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.RAW_DATA.getId(), GattCharEnum.RAW_DATA.getDesc(), DataTypeEnum.byteArr, 31, CharPropertyEnum.read, GattCharEnum.RAW_DATA);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.RAW_DATA.getId());
        mCharacteristic.addMember(new AMember("OpStatus", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("CurrentIndex", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("AFEData1", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("AFEData2", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("AFEData3", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("AFEData4", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("Gyro1a", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Gyro2a", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Gyro3a", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Accelerometer_X", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Accelerometer_Y", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Accelerometer_Z", DataTypeEnum.UINT16, 16));

        mService.addCharacteristic(GattCharEnum.LAST_MEASURE_TIME.getId(), GattCharEnum.LAST_MEASURE_TIME.getDesc(), DataTypeEnum.byteArr, 7, CharPropertyEnum.read, GattCharEnum.LAST_MEASURE_TIME);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.LAST_MEASURE_TIME.getId());
        mCharacteristic.addMember(new AMember("UTC_Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Hours", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Seconds", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.MEAL_DATA.getId(), GattCharEnum.MEAL_DATA.getDesc(), DataTypeEnum.byteArr, 7, CharPropertyEnum.read, GattCharEnum.MEAL_DATA);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.MEAL_DATA.getId());
        mCharacteristic.addMember(new AMember("OpStatus", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Meal_Type", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("UTC_Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Hours", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Minutes", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("UTC_Seconds", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.BOUNDS.getId(), GattCharEnum.BOUNDS.getDesc(), DataTypeEnum.byteArr, 18, CharPropertyEnum.read, GattCharEnum.BOUNDS);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.BOUNDS.getId());
        mCharacteristic.addMember(new AMember("OpStatus", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("VitalDataType", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("BorderRedLow", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderOrangeLow", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderYellowLow", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderGreenLow", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderGreenHigh", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderYellowHigh", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderOrangeHigh", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("BorderRedHigh", DataTypeEnum.UINT16, 16));

        mService.addCharacteristic(GattCharEnum.USER_INFO.getId(), GattCharEnum.USER_INFO.getDesc(), DataTypeEnum.byteArr, 9, CharPropertyEnum.read, GattCharEnum.USER_INFO);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.USER_INFO.getId());
        mCharacteristic.addMember(new AMember("Auto_Measure_Enabled", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Meal_Confirmation_Enabled", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Vibration_Enabled", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Glucose_unit_mg_dL", DataTypeEnum.bit, 1));
        mCharacteristic.addMember(new AMember("Auto_Measure_Period", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("User_Age", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("User_Weight", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("User_Height", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("User_Etnicity", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("User_Gender", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.STEP_COUNTER.getId(), GattCharEnum.STEP_COUNTER.getDesc(), DataTypeEnum.byteArr, 10, CharPropertyEnum.read, GattCharEnum.STEP_COUNTER);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.STEP_COUNTER.getId());
        mCharacteristic.addMember(new AMember("OpStatus", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Steps", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("Year", DataTypeEnum.UINT16, 16));
        mCharacteristic.addMember(new AMember("Month", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Day", DataTypeEnum.UINT8, 8));
        mCharacteristic.addMember(new AMember("Day_of_Week", DataTypeEnum.UINT8, 8));

        mService.addCharacteristic(GattCharEnum.ML_UPDATE.getId(), GattCharEnum.ML_UPDATE.getDesc(), DataTypeEnum.byteArr, 20, CharPropertyEnum.read, GattCharEnum.ML_UPDATE);
        mCharacteristic = mService.getCharacteristic(GattCharEnum.ML_UPDATE.getId());
        mCharacteristic.addMember(new AMember("Offset", DataTypeEnum.UINT32, 32));
        mCharacteristic.addMember(new AMember("Data", DataTypeEnum.UINT8, 128));
    }
}
