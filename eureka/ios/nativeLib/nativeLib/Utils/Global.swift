//
//  Global.swift
//  eureka
//
//  Created by work on 04/02/21.
//

import Foundation

public class Global {
  public static let autoCalibrationOn = false
  public static let onSimulator:Bool = false
  private static var _debugMode:Bool = true
  private static var _autoMeasure:Bool = false

  private static var _userId:Int = 0
  private static var _watchMSN:String = ""

  private static var _userIdForScan:Int = 0
  private static var _watchMsnForScan:String = ""

  public static func setUserIdForScan(pUserIdForScan:Int) {
      _userIdForScan = pUserIdForScan
  }

  public static func getUserIdForScan() -> Int {
      return _userIdForScan
  }

  public static func setWatchMSNForScan(pWatchMsnForScan: String) {
      Global._watchMsnForScan = pWatchMsnForScan
  }

  public static func getWatchMSNForScan() -> String {
    return _watchMsnForScan
  }

  public static func setUserId(pUserId: Int) {
      _userId = pUserId
  }

  public static func getUserIdStr() -> String {
      return "\(_userId)"
  }

  public static func getUserId() -> Int {
      return _userId
  }

  public static func getWatchMSN() -> String {
      return _watchMSN
  }

  public static func isDebugMode() -> Bool {
      return _debugMode
  }

  public static func setDebugMode(debugMode: Bool) {
      Global._debugMode = debugMode
  }

  public static func isAutoMeasure() -> Bool {
        return _autoMeasure
  }

  public static func setAutoMeasure(_autoMeasure: Bool) {
      Global._autoMeasure = _autoMeasure
  }

  public static func moveConfirmScanUser() {
    _userId = (_userIdForScan == 0) ? _userId : _userIdForScan
    _watchMSN = (_watchMsnForScan == "") ? _watchMSN : _watchMsnForScan

    _userIdForScan = 0
    _watchMsnForScan = ""
  }
    
    public static func getWatchMSNPure() -> String {
        let value = !getWatchMSN().isEmpty ? getWatchMSN() : getWatchMSNForScan()
        if let splitIndex = value.lastIndex(of: "-") {
            return String(value[value.index(after: splitIndex)...])
        } else {
            return value
        }
    }
}
