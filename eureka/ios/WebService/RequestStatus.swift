//
//  RequestStatus.swift
//  eureka
//
//  Created by work on 14/02/21.
//

import Foundation

class RequestStatus {
    private var _result : Bool = false
    private var _message : String = ""
    
    internal func setSuccess() {
        _result = true
    }
    internal func setFailure() {
        _result = false
    }
    
    internal func isSuccess() -> Bool {
        return _result
    }
    
    internal func isFailed() -> Bool {
        return !_result
    }
    
    internal func setMessage(pMessage : String) {
        _message = pMessage
    }
    
    internal func getMessage() -> String {
        return _message
    }
}
