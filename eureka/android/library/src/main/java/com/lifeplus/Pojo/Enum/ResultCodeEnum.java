package com.lifeplus.Pojo.Enum;

public enum ResultCodeEnum {
    // Common Success and Intermediate
    FINAL_UPDATE('S',"999", "", BleProcStateEnum.NONE),
    GATT_STATE_CHANGE('I',"997", "New GATT status", BleProcStateEnum.NONE),

    // Common Errors
    UNKNOWN_ERR("001", "Unknown error"),
    DISCONNECT("002", "Watch disconnected"),
    NOT_CONNECTED("003", "Watch not connected"),
    INVALID_USER("004", "Invalid user id"),
    INVALID_USER_SESSION("005", "Invalid user session"),
    DATA_PARSE_ERR("006", "Watch data parse error"),
    OP_TIMEOUT("007", "Watch operation timeout"),
    DB_OP_ERR("008", "Database operation failed"),
    HTTP_OP_ERR("009", "HTTP operation failed"),
    BLANK_ERR("010", ""),
    INVALID_MSN("011", "Invalid device MSN"),
    TIME_OUT("012", "Watch did not reply in stipulated time"),
    OTHER_PROC_RUNNING("013", "Other process is running"),
    UNABLE_CHARCT_READ("014", "Unable to read characteristic"),
    UNABLE_CHARCT_WRITE("015", "Unable to write characteristic"),
    INVALID_GATT("016", "GATT is null or invalid"),
    UNDEFINED_CHARACT("016", "Characteristic is not defined"),
    UNABLE_DATETIME_SET("017", "Unable to sync date time with watch"),
    UNABLE_TIMEZONE_SET("018", "Unable to sync timezone with watch"),
    AUTO_MEASURE_IN_PROGRESS("019", "Auto measure in progress, please wait"),
    INSTANT_MEASURE_IN_PROGRESS("020", "Instant measure in progress, please wait"),
    CALIBRATE_IN_PROGRESS("021", "Calibrate already in progress, please wait"),

    WATCH_BATTERY_LOW("022", "Watch battery low"),
    WATCH_BATTERY_NORMAL("023", "Watch battery normal"),
    WATCH_CHARGER_CONNECTED("024", "Watch charger connected"),
    WATCH_CHARGER_DISCONNECTED("025", "Watch charger removed"),
    WATCH_NOT_ON_WRIST("026", "Watch not on wrist"),
    WATCH_ON_WRIST("027", "Watch on wrist"),
    WATCH_SHUTDOWN_IN_PROGRESS("030", "Watch shutdown is in progress"),
    MEASURE_FAILED("031", "Unsuccessful measure has been detected"),

    // Connect Success and Intermediate
    WATCH_CONNECTED('S', "199", "Watch connected", BleProcStateEnum.NONE),
    CONNECT_ACKNOWLEDGE('I', "198", "Request is being processed", BleProcStateEnum.SCAN),
    DISCOVERING_SERVICES('I', "197", "Discovering GATT services", BleProcStateEnum.CONNECT_GATT),
   //DEVICE_FOUND('I', "198", "Device Found"),

    // Connect errors
    INVALID_AUTH("101", "Invalid Authentication Id"),
    WATCH_UNAVAILABLE("102", "No watch available"),
    UNMATCH_AUTH_ID("103", "Authentication Id does not match"),
    WATCH_REJECT_AUTH("104", "Authentication rejected by watch"),
    BLE_NO_PERMISSION("105", "Bluetooth permission is not enabled"),
    LOCATION_NO_PERMISSION("106", "Location permission is not enabled"),
    WATCH_REJECT_BOND("107", "Bonding rejected by watch"),
    INDICATE_SBSCRIPTION_FAIL("108", "Unable to subscribe indicate"),
    GATT_DISCOVER_FAIL("109", "Unable to discover GATT"),
    GATT_WRITE_FAIL("110", "Unable to write GATT characteristic"),
    GATT_READ_FAIL("111", "Unable to read GATT characteristic"),
    UNABLE_START_SCANNING("112", "Unable to start scanning"),
    UNABLE_START_SERVICE_DISCOVERY("113", "Unable to start services discovery"),
    INVALID_DEVICE("114", "Watch is null or invalid"),
    CALIBRATION_FAILED("115", "Calibration failed"),
    INSTANT_MEASURE_FAILED("116", "Instant measure failed"),

    // AppSync Success and Intermediate
    APPSYNC_COMPLETED('S', "299", "App Sync completed", BleProcStateEnum.NONE),
    APPSYNC_ACKNOWLEDGE('I', "298", "Request is being processed", BleProcStateEnum.APP_SYNC_READ),


    // AppSync errors
    INVALID_DATA_FROM_WATCH("210", "Invalid number of bytes received from watch"),

    // Auto Measure Success and Intermediate
    AUTO_MEASURE_STARTED('S', "598", "Auto measure started", BleProcStateEnum.NONE),
    AUTO_MEASURE_COMPLETED('S', "599", "Auto measure completed", BleProcStateEnum.NONE),

    // Instant Measure Success and Intermediate
    INSTANT_MEASURE_COMPLETED('S', "399", "Instant measure completed", BleProcStateEnum.NONE),
    MEASURE_ACKNOWLEDGE('I', "398", "Request is being processed", BleProcStateEnum.MEASURE_START),

    // Instant Measure
    UNABLE_START_INSTANT_MEASURE("301", "Unable to start instant measure"),
    VITAL_READ_COMMAND_FAILED("302", "Unable to fire command for vital read"),

    RAW_READ_COMMAND_FAILED("303", "Unable to fire command for raw data read"),

    OFFLINE_VITAL_COMMAND_FAILED("304", "Unable to fire command for offline data read"),
    OFFLINE_VITAL_READ_COMPLETE('S',"305", "offline data read complete", BleProcStateEnum.NONE),
    OFFLINE_VITAL_READ_START('S',"306", "offline data read started", BleProcStateEnum.NONE),
    OFFLINE_VITAL_READ_IN_PROGRESS("307", "offline data read in progress"),


    // Step count
    STEP_COUNT_AVAILABLE('S', "601", "Step count available", BleProcStateEnum.NONE),

    // Meal data
    MEAL_DATA_AVAILABLE('S', "611", "Meal data available", BleProcStateEnum.NONE),

    // Calibration Success and Intermediate
    CALIBRATION_ACKNOWLEDGE('I', "498", "Request is being processed", BleProcStateEnum.CALIBRATION_START),
    CALIBRATION_SUCCESS('S', "499", "Calibration completed", BleProcStateEnum.NONE),
    CALIBRATION_MEASURE_COMPLETE('S', "491", "Calibration measure complete", BleProcStateEnum.NONE),
    CALIBRATION_MEASURE_PROGRESS('S', "492", "Calibration measure in progress", BleProcStateEnum.NONE),

    // Calibration errors
    UNABLE_START_CALIBRATION("401", "Unable to start calibration"),
    INVALID_SPO2("402", "Invalid SPO2"),
    INVALID_RR("403", "Invalid RR"),
    INVALID_HR("404", "Invalid HR"),
    INVALID_SBP("405", "Invalid SBP"),
    INVALID_DBP("406", "Invalid DBP"),
    INVALID_GLUCOSE("407", "Invalid Glucose"),
    
    FIRMWARE_UPDATE_START('S', "501", "Firmware update started", BleProcStateEnum.FIRMWARE_UPDATE_START),
    FIRMWARE_UPDATE_ERROR_FILE_PARSE("502", "Firmware update finished with file parse error"),
    FIRMWARE_UPDATE_ERROR_FILE_READ("503", "Firmware update finished with file read error"),
    FIRMWARE_UPDATE_ERROR_CONNECTION("504", "Firmware update finished with connection error"),
    FIRMWARE_UPDATE_ERROR_COMMUNICATION("505", "Firmware update finished with communication error"),
    FIRMWARE_UPDATE_ERROR_CRC("506", "Firmware update finished with CRC error"),
    FIRMWARE_UPDATE_ERROR_INSTALLATION("507", "Firmware update finished with installation error"),
    FIRMWARE_UPDATE_INVALID_FILE("508", "Failed to read firmware update file"),
    FIRMWARE_UPDATE_COMPLETE('S', "509", "Firmware update completed successfully", BleProcStateEnum.NONE),
    FIRMWARE_UPDATE_DFU_MODE_INITIATED('S', "510", "DFU mode has been initiated successfully", BleProcStateEnum.NONE),

    // Step goal
    INVALID_STEP_GOAL("520", "Invalid daily step goal"),
    STEP_GOAL_UPDATE_ACKNOWLEDGE("521", "Request is being processed"),
    STEP_GOAL_UPDATE_FAILED("522", "Unable to update daily step goal in watch"),
    STEP_GOAL_UPDATE_COMPLETE("523", "Step goal updated successfully");

    private final char _type;
    private final String _code;
    private final String _desc;
    private final BleProcStateEnum _nextState;

    ResultCodeEnum(String pCode, String pDesc) {
        _type = 'F';
        _code = pCode;
        _desc = pDesc;
        _nextState = BleProcStateEnum.NONE;
    }

    ResultCodeEnum(char pType, String pCode, String pDesc, BleProcStateEnum pNextState) {
        _type = pType;
        _code = pCode;
        _desc = pDesc;
        _nextState = pNextState;
    }

    public String getType() {
        switch (_type) {
            case 'S':
                return "success";
            case 'I':
                return "intermediate";
            default:
                return "failed";
        }
    }

    public String getCode() {
        return _code;
    }

    public String getDesc() {
        return _desc;
    }

    public BleProcStateEnum getNextState() {
        return _nextState;
    }
}
