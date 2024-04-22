//
//  FirmwareUpdateResponse.swift
//  nativeLib
//
//  Created by Peter Ertl on 28/06/2022.
//

import Foundation

public class FirmwareUpdateResponse: ResponseBase {
  private var _userId: String = ""
  private var _authId: String = ""
    
  public override init(pErrorCode: ResultCodeEnum) {
    super.init(pErrorCode: pErrorCode)
  }
    
  internal override init(pErrorCode: ResultCodeEnum, pMessage: String) {
    super.init(pErrorCode: pErrorCode, pMessage: pMessage)
  }
    
  public override func getResponseStr() -> String {
    do {
      var result: [String: Any] = getResponseMap()
      result["data"] = ["userId": _userId, "AuthenticationId": _authId]
      let jsonData = try JSONSerialization.data(withJSONObject: ["result": result], options: [])
      let jsonString = String(data: jsonData, encoding: String.Encoding.ascii)!
      return jsonString
    } catch {
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
