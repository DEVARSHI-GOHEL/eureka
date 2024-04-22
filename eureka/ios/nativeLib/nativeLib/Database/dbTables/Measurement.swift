//
//  Measurement.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class Measurement {
  public static let TABLE_NAME: String = "Measurement"
    
  public class Cols {
    public static let ID: String = "id"
    public static let USERID: String = "user_id"

    public static let MEASUREDDATE: String = "date"
    public static let HEARTRATE: String = "heartrate"
    public static let RESPIRATIONRATE: String = "resprate"
    public static let OXYGENSATURATION: String = "oxygensaturatiokn"

    public static let BLOODGLUCODE: String = "bloodGlucode"
    public static let BLOODPRESURESYS: String = "bloodPresure"
    public static let BLOODPRESUREDIA: String = "oxygensaturatiokn"
  }
}
