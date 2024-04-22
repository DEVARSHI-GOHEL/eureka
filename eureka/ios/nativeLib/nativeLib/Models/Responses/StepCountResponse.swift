//
//  StepCountResponse.swift
//  eureka
//
//  Created by work on 19/02/21.
//

import Foundation

internal class StepCountResponse : ResponseBase {
  var _userId:String = ""
  var _authId:String = ""

  internal override init(pErrorCode:ResultCodeEnum) {
    super.init(pErrorCode: pErrorCode)
  }

  internal override init(pErrorCode:ResultCodeEnum, pMessage:String) {
    super.init(pErrorCode: pErrorCode, pMessage: pMessage)
  }

/*
  public CalibrationResponse(String pMessage) {
      super(pMessage);
  }
*/

  internal override init(pSimuId:String, pSimuMessage:String) {
    super.init(pSimuId: pSimuId, pSimuMessage: pSimuMessage)
  }

  internal override func getResponseStr() -> String {
    do {
      var mResultMap:[String:Any] = [:]

      var result:[String:Any] = getResponseMap()
      var mData:[String:String] = [:]
      mData["userId"] = _userId
      mData["AuthenticationId"] = _authId
      result["data"] = mData

      mResultMap["result"] = result
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

  internal func setUserId(pUserId:String) {
      _userId = pUserId
  }

  internal func getAuthId() -> String {
      return _authId;
  }

  internal func setAuthId(pAuthId:String) {
      _authId = pAuthId;
  }
}
