package com.lifeplus.Pojo.Enum;

public enum BleProcStateEnum {
    // Common states
    UNKNOWN("State unknown", 5),
    NONE("SubState Idle", 0),
    FIRE_COMMAND("Fire command", 5),
    READ_VITAL("Read vital", 5),

    // Connect states
    CHECK_PAIRED("Check pairing", 60),
    SCAN("Scanning", 30),
    CONNECT_GATT("Connect to watch", 10),
    DISCOVER_GATT("Gatt service discovery", 30),
    SET_MAX_MTU("Setting MAX MTU size", 5),
    SUBSCRIBE_INDICATION("Subscribe indication", 2),
    SUBSCRIBE_MEAL_INDICATION("Subscribe meal indication", 2),
    SUBSCRIBE_STEPCOUNT_INDICATION("Subscribe step indication", 2),
    SET_DATETIME("Set date", 5),
    SET_TIMEZONE("Set timezone", 10),
    SET_STEP_GOAL("Set step goal", 10),
    READ_WATCH_STATUS("read watch status", 10),
    OFFLINE_SYNC_START("Offline sync start", 50),
    OFFLINE_SYNC_PREV("Offline sync continue", 2100),
    OFFLINE_SYNC_MEAL_START("Offline meal sych start", 50),
    OFFLINE_SYNC_MEAL_PREV("Offline meal sync continue", 2100),
    OFFLINE_SYNC_STEPS_START("offline step count sync start", 50),
    // Measure states
    MEASURE_START("Start Measurement", 5),
    CHECK_MEASURE_ON("Check measure ON", 5),
    CHECK_MEASURE_PRECONDITION("Check measure pre-conditions", 5),
    MEASURE_COMMAND_FIRED("Measure command fired", 140),
    MEASURE_READ_COMMAND_FIRED("Vital read command fired", 5),
    MEASURE_TIME("Last measure time command fired", 5),
    // Step count states
    STEP_COUNT_READ_COMMAND_FIRED("Steps read command fired", 5),
    SET_MEASURE_CALC_BEFORE("Disable vital data calculation before measure", 5),
    SET_MEASURE_CALC_AFTER("Enable vital data calculation after measure ", 5),

    // FW revision state
    FIRMWARE_REVISION_READ("Firmware revision read", 5),

    // AppSync states
    APP_SYNC_READ("App sync read", 5),
    APP_SYNC_WRITE("App sync write", 5),
    // Calibration states
    CALIBRATION_REFERENCE_WRITE("Calibration reference write", 5),
    CALIBRATION_START("Calibration start", 5),

    //Read raw data states
    READ_RAW_FIRST("Raw read start", 5),
    READ_RAW_NEXT("Raw read next", 5),
    READ_RAW_PREV("Raw read prev", 5),
    READ_RAW_LAST("Raw read last", 5),

    // Meal data states
    MEAL_DATA_READ_COMMAND_FIRED("Meal data read", 5),

    FIRMWARE_UPDATE_INITIATE_DFU("Firmware update start", 0),
    FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE("Scanning for BLE DFU Device", 0),
    FIRMWARE_UPDATE_CONNECT_DFU_DEVICE("Connect to BLE DFU Device", 0),
    FIRMWARE_UPDATE_BOND_DFU_DEVICE("Bond with BLE DFU Device", 0),
    FIRMWARE_UPDATE_START("Firmware update start", 0);

    private final String _desc;
    private final int _timeoutPeriod;       // in seconds

    BleProcStateEnum(String pDesc, int pTimeoutPeriod) {
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
