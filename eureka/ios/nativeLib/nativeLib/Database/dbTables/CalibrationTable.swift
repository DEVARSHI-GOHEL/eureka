//
//  Calibration.swift
//  eureka
//
//  Created by work on 26/10/20.
//

import Foundation

public class CalibrationTable {
    public static let TABLE_NAME: String = "calibration"

    public class Cols {
      public static let TRIAL_DATA_ID: String = "trial_data_id"
      public static let PATIENT_ID: String = "patient_id"
      public static let PATIENT_INFO: String = "patient_info"
      public static let HEALTH_INFO: String = "health_info"
      public static let VITAL: String = "vital"
      public static let DATETIME: String = "datetime"
      public static let DEVICE_MSN: String = "device_msn"
      public static let SENSOR_DATA: String = "sensor_data"
      public static let CALIBRATION_DATA: String = "calibration_data"
      public static let COMPLETE_DATA: String = "complete_data"
      public static let IS_COMPLETE: String = "is_complete"
      public static let UPLOADED: String = "uploaded"
      public static let UPDATE_DATE: String = "update_date"
    }
}
