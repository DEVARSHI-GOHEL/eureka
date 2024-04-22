//
//  MealsTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class MealsTable {
  public static let TABLE_NAME: String = "meals"

    public class Cols {
      public static let SESSION_ID: String = "session_id"
      public static let TIME: String = "time"
      public static let TYPE: String = "type"
      public static let UPDATE_DATE:String = "update_date"
      public static let UPLOAD_DATE:String = "upload_date"

      public static let MEALTYPE:String = "mealtype"
      public static let UTCYEAR:String = "utcyear"
      public static let UTCMONTH:String = "utcmonth"
      public static let UTCDAY:String = "utcday"
      public static let UTCHOUR:String = "utchour"
      public static let UTCMINUTE:String = "utcminute"
      public static let UTCSECOND:String = "utcsecond"
    }
}
