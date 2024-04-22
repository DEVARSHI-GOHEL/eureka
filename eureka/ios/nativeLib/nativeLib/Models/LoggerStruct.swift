//
//  LoggerStruct.swift
//  BLEDemo
//

import Foundation

public class LoggerStruct {
  
  private final var _log: [String : String] = [:]
  
  public init(_ pFunctionName:String, pFileName:String, pEventDescription:String) {
    setValues(pFunctionName: pFunctionName, pFileName: pFileName, pErrorCode: nil, pEventDescription: pEventDescription, pLineNumber: "");
  }

  public init(_ pFunctionName: String, pFileName:String, pErrorCode:ResultCodeEnum, pEventDescription: String, pLineNumber: String) {
      setValues(pFunctionName: pFunctionName, pFileName: pFileName, pErrorCode: pErrorCode, pEventDescription: pEventDescription, pLineNumber: pLineNumber)
  }
  
  public func setValues(pFunctionName: String, pFileName: String, pErrorCode: ResultCodeEnum?, pEventDescription: String, pLineNumber:String) {
    
    let userID = Global.getUserId() <= 0 ? Global.getUserIdForScan() : Global.getUserId()
    let watchMSN = Global.getWatchMSN().count <= 0 ? Global.getWatchMSNForScan() : Global.getWatchMSN()
    
    _log["ts"] = "\(NSDate().timeIntervalSince1970 * 1000)"
    _log["userId"] = userID.description
    _log["seq_no"] = "\(LpLogger.getNewSrlNo())"
    _log["userName"] = ""
    _log["codeCategoryId"] = "1"
    _log["functionName"] = pFunctionName
    _log["fileName"] = pFileName
    _log["operationName"] = "add"
    _log["watchMSN"] = watchMSN
    _log["osVersion"] = ""
    _log["errorCode"] = (pErrorCode == nil) ? "" : pErrorCode?.code
    _log["eventDescription"] = pEventDescription
    _log["lineNumber"] = pLineNumber
    _log["applicationNameId"] = "1"
  }
  
  internal func getLog() -> [String:String] {
    return _log
  }
  
  public func getJSONStr() -> String {
    let encoder = JSONEncoder()
    if let jsonData = try? encoder.encode(_log) {
      if let jsonString = String(data: jsonData, encoding: .utf8) {
        return jsonString
      }
    }
    return ""
  }
}

