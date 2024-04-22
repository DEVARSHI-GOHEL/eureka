//
//  ResponseBase.swift
//  BLEDemo
//

import Foundation

public class ResponseBase {
    
    internal final var _resultCode: ResultCodeEnum!
    internal final var _message: String
    internal final var _simuId: String
  
  internal init(pResponseBase:ResponseBase) {
    _resultCode = pResponseBase._resultCode
    _message = pResponseBase._message
    _simuId = pResponseBase._simuId
  }
  
  internal init(pErrorCode: ResultCodeEnum) {
    _resultCode = pErrorCode
    _message = ""
    _simuId = ""
  }
    
  internal init(pErrorCode: ResultCodeEnum, pMessage: String) {
    _resultCode = pErrorCode
    _message = pMessage
    _simuId = ""
  }

  internal init(pSimuId: String, pSimuMessage: String) {
    _resultCode = nil
    _message = pSimuMessage
    _simuId = pSimuId
  }
    
  internal func getResponseMap() -> [String: Any] {
    var result: [String : Any] = [:]
    result["status"] = (_resultCode != nil) ? _resultCode.type : "failed"
    result["result"] = (_simuId.isEmpty) ? ((_resultCode != nil) ? _resultCode.code : "") : _simuId
    result["message"] = (_simuId.isEmpty) ? ((_resultCode != nil) ? _resultCode.desc + ((_message.isEmpty) ? "" : " (" + _message + ")") : _message ) : _message
    return result
  }
    
  internal func getResponseStr() -> String {
    return ""
  }

  public func getResultCode() -> ResultCodeEnum {
    return _resultCode
  }
}
