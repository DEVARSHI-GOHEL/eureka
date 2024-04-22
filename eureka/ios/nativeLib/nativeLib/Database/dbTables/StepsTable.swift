//
//  StepsTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class StepsTable {
  public static let TABLE_NAME: String = "steps"

    public class Cols {
      public static let SESSION_ID: String = "session_id"
      public static let TIME: String = "time"
      public static let STEPS_COUNT: String = "steps_count"
      public static let UPDATE_DATE:String = "update_date"
      public static let UPLOAD_DATE:String = "upload_date"

      public static let OPSTATUS:String = "opstatus"
      public static let STEPS:String = "steps"
      public static let YEAR:String = "year"
      public static let MONTH:String = "month"
      public static let DAY:String = "day"
      public static let DAYOFWEEK:String = "dayofweek"
    }
}
