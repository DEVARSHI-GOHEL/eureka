//
//  ErrorLogger.swift
//  nativeLib
//
//  Created by Eugene Krivenja on 17.01.2022.
//

import Foundation

public class ErrorLogger {
    public static let shared = ErrorLogger()
    
    public static var logProvider: ((String) -> Void)? = nil
    
    public static var errorProvider: ((NSError) -> Void)? = nil
    
    private init () {}
    
    public func log(value: String) {
        ErrorLogger.logProvider?(value)
    }
    
    private func error(domain: String, code: Int, userInfo: [String : Any]?) {
        let userId = Global.getUserId() <= 0 ? Global.getUserIdForScan() : Global.getUserId()
        let watchMSN = Global.getWatchMSN().count <= 0 ? Global.getWatchMSNForScan() : Global.getWatchMSN()
        var uInfo: [String : Any] = ["userId" : userId, "MSN" : watchMSN]
        if let userInfo = userInfo {
            uInfo.merge(userInfo) { (_, new) in new }
        }
        ErrorLogger.errorProvider?(NSError(domain: domain, code: code, userInfo: uInfo))
    }
    
    public func dbError(userInfo: [String : Any]? = nil) {
        error(domain: "Database Error", code: -4000, userInfo: userInfo)
    }
    
    public func bleCommunicationError(bleError: Error, userInfo: [String : Any]? = nil) {
        var uInfo: [String : Any] = ["message" : bleError.localizedDescription]
        uInfo.merge((bleError as NSError).userInfo) { (_, new) in new }
        if let userInfo = userInfo {
            uInfo.merge(userInfo) { (_, new) in new }
        }
        error(domain: "BLE Communication Error", code: -4001, userInfo: uInfo)
    }
    
    public func bleConnectionError(bleError: Error, userInfo: [String : Any]? = nil) {
        var uInfo: [String : Any] = ["message" : bleError.localizedDescription]
        uInfo.merge((bleError as NSError).userInfo) { (_, new) in new }
        if let userInfo = userInfo {
            uInfo.merge(userInfo) { (_, new) in new }
        }
        error(domain: "BLE Connection Error", code: -4002, userInfo: uInfo)
    }
    
    public func bleConnectionError(message: String) {
        error(domain: "BLE Connection Error", code: -4002, userInfo: ["message" : message])
    }
    
    public func bleScanError(message: String) {
        error(domain: "BLE Scan Error", code: -4003, userInfo: ["message" : message])
    }
    
    public func apiError(userInfo: [String : Any]) {
        let statusCode = userInfo["status"] ?? ""
        var uInfo: [String : Any] = ["message" : "Request failed with status code \(statusCode)"]
        uInfo.merge(userInfo) { (_, new) in new }
        error(domain: "API Error", code: -4004, userInfo: uInfo)
    }
    
    public func customError(message: String) {
        error(domain: "Custom Error", code: -4005, userInfo: ["message" : message])
    }
}
