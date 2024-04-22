package com.lifeplus.Pojo.Enum;

public enum BleCommandEnum {
    GET_FIRST_VITAL((byte)0x11,	"Get first record of vital data", ""),
    GET_NEXT_VITAL((byte)0x21, "Get next record of vital data", ""),
    GET_PREV_VITAL((byte)0x31, "Get previous record of vital data", ""),
    GET_LAST_VITAL((byte)0x41, "Get last record of vital data", ""),
    GET_FIRST_RAW((byte)0x12, "Get first record of raw data", ""),
    GET_NEXT_RAW((byte)0x22, "Get next record of raw data", ""),
    GET_PREV_RAW((byte)0x32, "Get previous record of raw data", ""),
    GET_LAST_RAW((byte)0x42, "Get last record of raw data", ""),
    GET_FIRST_MEAL((byte)0x13, "Get first record of meal data", ""),
    GET_NEXT_MEAL((byte)0x23, "Get next record of meal data", ""),
    GET_PREV_MEAL((byte)0x33, "Get previous record of meal data", ""),
    GET_LAST_MEAL((byte)0x43, "Get last record of meal data", ""),
    GET_BOUNDS_HR((byte)0x50, "Get bounds for heart rate", ""),
    GET_BOUNDS_RR((byte)0x51, "Get bounds for respiration rate", ""),
    GET_BOUNDS_O2((byte)0x52, "Get bounds for oxigen saturation", ""),
    GET_BOUNDS_GLUCOSE((byte)0x53, "Get bounds for blood glucose", ""),
    GET_BOUNDS_SBP((byte)0x54, "Get bounds for blood pressure systolic", ""),
    GET_BOUNDS_DDBP((byte)0x55, "Get bounds for blood pressure diastolic", ""),
    GET_STEP_TARGET((byte)0x60, "Get step target", ""),
    GET_STEP_COUNTER_SUN((byte)0x61, "Get step counter for Sun", ""),
    GET_STEP_COUNTER_MON((byte)0x62, "Get step counter for Mon", ""),
    GET_STEP_COUNTER_TUE((byte)0x63, "Get step counter for Tue", ""),
    GET_STEP_COUNTER_WED((byte)0x64, "Get step counter for Wed", ""),
    GET_STEP_COUNTER_THU((byte)0x65, "Get step counter for Thu", ""),
    GET_STEP_COUNTER_FRI((byte)0x66, "Get step counter for Fri", ""),
    GET_STEP_COUNTER_SAT((byte)0x67, "Get step counter for Sat", ""),
    START_ML_UPDATE((byte)0x70, "Start ML update", "ML_Update_In_Progress → 1"),
    ABORT_ML_UPDATE((byte)0x80, "Abort ML update", "ML_Update_In_Progress → 0"),
    START_MEASUREMENT((byte)0x90, "Start measurement", "Measure_In_Progress → 1"),
    START_MEASUREMENT_UNCOND((byte)0x91, "Start measurement unconditionally", "Measure_In_Progress → 1");

    private final byte[] _value;
    private final String _purpose;
    private final String _desc;

    BleCommandEnum(byte pValue, String pPurpose, String pDesc) {
        _value = new byte[]{pValue};
        _purpose = pPurpose;
        _desc = pDesc;
    }

    public byte[] getValue() {
        return _value;
    }

    public String getPurpose() {
        return _purpose;
    }

    public String getDesc() {
        return _desc;
    }
}
