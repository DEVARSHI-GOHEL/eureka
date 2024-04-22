package com.lifeplus.Pojo.Enum;

public enum GattServiceEnum {
    BATTERY_SERVICE("0000180f-0000-1000-8000-00805f9b34fb", "battery_service"),
    BP_SERVICE("00001810-0000-1000-8000-00805f9b34fb", "blood_pressure"),
    GLUCOSE_SERVICE("0000181f-0000-1000-8000-00805f9b34fb", "continuous_glucose_monitoring"),
    CURR_TIME_SERVICE("00001805-0000-1000-8000-00805f9b34fb", "current_time"),
    DEVICE_INFORMATION_SERVICE("0000180a-0000-1000-8000-00805f9b34fb", "device_information"),
    PULSE_OXY_SERVICE("00001822-0000-1000-8000-00805f9b34fb", "pulse_oximeter"),
    CUSTOM_SERVICE("4C505732-5F43-5553-544F-4D5F53525600", "Custom Service"),
    IMMEDIATE_ALERT_SERVICE("00001802-0000-1000-8000-00805f9b34fb", "Immediate alert service");

    private final String _id;
    private final String _desc;

    GattServiceEnum(String pId, String pDesc) {
        _id = pId;
        _desc = pDesc;
    }

    public String getId() {
        return _id;
    }

    public String getDesc() {
        return _desc;
    }
}
