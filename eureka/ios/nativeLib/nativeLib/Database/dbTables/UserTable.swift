//
//  UserTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class UserTable {
    public static let TABLE_NAME: String = "users"

    public class Cols {
      public static let ID: String = "id"
      public static let NAME: String = "name"
      public static let BIRTH_DATE: String = "birth_date"
      public static let GENDER_ID: String = "gender_id"
      public static let ETHNICITY_ID: String = "ethnicity_id"
      public static let SKIN_TONE_ID: String = "skin_tone_id"
      public static let ADDRESS: String = "address"

      public static let COUNTRY: String = "country"
      public static let ZIP: String = "zip"
      public static let PASSWORD: String = "password"
      public static let HEIGHT_FT: String = "height_ft"
      public static let HEIGHT_IN: String = "height_in"
      public static let WEIGHT: String = "weight"

      public static let WEIGHT_UNIT: String = "weight_unit"
      public static let TNC_DATE: String = "tnc_date"
      public static let STEP_GOAL: String = "step_goal"
      public static let HW_ID: String = "hw_id"
      public static let GLUCOSE_UNIT: String = "glucose_unit"
      public static let AUTO_MEASURE: String = "auto_measure"

      public static let AUTO_FREQUENCY: String = "auto_frequency"
      public static let SLEEP_TRACKING: String = "sleep_tracking"
      public static let POWER_SAVE: String = "power_save"
      public static let CGM_DEBUG: String = "cgm_debug"
      public static let REGISTRATION_STATE: String = "registration_state"
      public static let WEATHER_UNIT: String = "weather_unit"
      public static let UPDATE_DATE: String = "update_date"
      public static let UPLOAD_DATE: String = "upload_date"
        
      // calculated field
      public static let AGE: String = "age"
      public static let AGE_EXP: String = "cast(ifnull(strftime('%Y.%m%d', 'now') - strftime('%Y.%m%d', \(BIRTH_DATE)), 0) as int) AS \(AGE)"
    }
}
