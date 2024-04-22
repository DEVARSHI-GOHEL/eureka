//
//  ConnectResponse.swift
//  BLEDemo
//

import Foundation

public class ConnectResponse: ResponseBase {
  private var _userId: String = ""
  private var _authId: String = ""
    
  public override init(pErrorCode: ResultCodeEnum) {
    super.init(pErrorCode: pErrorCode)
  }
    
  internal override init(pErrorCode: ResultCodeEnum, pMessage: String) {
    super.init(pErrorCode: pErrorCode, pMessage: pMessage)
  }
    
  internal override func getResponseStr() -> String {
    do {
      var mResultMap: [String:Any] = [:]
      var result: [String:Any] = getResponseMap()
      var mData: [String:String] = [:]
        
      mData["userId"] = _userId
      mData["AuthenticationId"] = _authId
        
      result["data"] = mData as NSObject
        
      mResultMap["result"] = result as NSObject
        
      let jsonData = try JSONSerialization.data(withJSONObject: mResultMap, options: [])
      let jsonString = String(data: jsonData, encoding: String.Encoding.ascii)!
      return jsonString
    } catch _ {
      return ""
    }
  }
    
  internal func getUserId() -> String {
    return _userId
  }
    
  internal func setUserId(pUserId: String) {
    _userId = pUserId
  }
    
  internal func getAuthId() -> String {
    return _authId
  }
    
  internal func setAuthId(pAuthId: String) {
    _authId = pAuthId
  }
}
