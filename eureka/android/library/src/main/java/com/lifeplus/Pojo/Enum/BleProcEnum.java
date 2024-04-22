package com.lifeplus.Pojo.Enum;

public enum BleProcEnum {
    CONNECT("Connect", 60),
    INSTANT_MEASURE("Measure", 90),
    AUTO_MEASURE("Measure", 90),
	STEP_COUNT("Stepcount", 60),
    CALIBRATE("Calibration", 180),
    APP_SYNC("App Sync", 60),
    NONE("None", 0),
    MEAL_DATA("MealData", 60),
    READ_RAW_DATA("RawData", 60),
    NOTIFICATION("notification", 60),
    FIRMWARE_UPDATE("FirmwareUpdate", 0),
    STEP_GOAL_UPDATE("Step goal update", 0),
    TIMEZONE_UPDATE("Timezone update", 0);

    private final String _desc;
    private final int _timeoutPeriod;       // in seconds

    BleProcEnum(String pDesc, int pTimeoutPeriod) {
        _desc = pDesc;
        _timeoutPeriod = pTimeoutPeriod;
    }

    public String getDesc() {
        return _desc;
    }

    public int getTimeoutMillis() {
        return _timeoutPeriod * 1000;
    }
}
