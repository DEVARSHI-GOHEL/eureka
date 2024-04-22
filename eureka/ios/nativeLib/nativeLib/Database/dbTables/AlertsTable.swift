//
//  AlertsTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class AlertsTable {
  public static let TABLE_NAME: String = "alerts"

    public class Cols {
      public static let SESSION_ID: String = "session_id"
      public static let OCCUR_TIME:String = "occur_time"
      public static let ALERT_TYPE:String = "alert_type"
      public static let ALERT_COLOR:String = "alert_color"
      public static let VALUE:String = "value"
      public static let UPDATE_DATE:String = "update_date";
    }
}
