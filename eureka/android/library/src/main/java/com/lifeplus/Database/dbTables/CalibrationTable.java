package com.lifeplus.Database.dbTables;

public class CalibrationTable {
    public static String TABLE_NAME = "calibration";

    public class Cols {
      public static final String TRIAL_DATA_ID = "trial_data_id";
      public static final String PATIENT_ID = "patient_id";
      public static final String PATIENT_INFO = "patient_info";
      public static final String HEALTH_INFO = "health_info";
      public static final String VITAL = "vital";
      public static final String DATETIME = "datetime";
      public static final String DEVICE_MSN = "device_msn";
      public static final String SENSOR_DATA = "sensor_data";
      public static final String CALIBRATION_DATA = "calibration_data";
      public static final String COMPLETE_DATA = "complete_data";
      public static final String IS_COMPLETE = "is_complete";
      public static final String UPLOADED = "uploaded";
      public static final String UPDATE_DATE = "update_date";
    }
}
