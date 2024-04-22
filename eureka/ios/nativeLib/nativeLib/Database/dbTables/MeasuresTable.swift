//
//  MeasuresTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class MeasuresTable {

  public static let TABLE_NAME: String = "measures"

  public class Cols {
    public static let SESSION_ID: String = "session_id"
    public static let TYPE: String = "type"
    public static let MEASURE_TIME: String = "measure_time"
    public static let O2: String = "o2"
    public static let RESPIRATION: String = "respiration"
    public static let HEART_RATE: String = "heart_rate"
    public static let BPSYS: String = "bpsys"
    public static let BPDIA: String = "bpdia"
    public static let GLUCOSE: String = "glucose"
    public static let UPLOAD_DATE: String = "upload_date"
    public static let UPDATE_DATE:String = "update_date"
  }
}
