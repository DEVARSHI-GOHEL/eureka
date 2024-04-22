//
//  WebServiceMethods.swift
//  eureka
//
//  Created by work on 19/02/21.
//

import Foundation

internal class WebServiceMethods {
  internal class func createUploadDataRequest(pData:String, measurementTime: String) -> String{
    let mQuery:String = "\"query\": \"mutation upload($userId:Int,$deviceMSN:String,$ts:String,$measurementTime: String, $type:Int,$data:String,){uploadDeviceData(userId:$userId,deviceMSN:$deviceMSN,ts:$ts, measurementTime:$measurementTime,type:$type,data:$data){statusCode body}}\"";
    let mVariable = Variables()
    mVariable.userId = Global.getUserId()
    mVariable.deviceMSN = String(Global.getWatchMSNPure())
    mVariable.ts = "\(Int64(Date().timeIntervalSince1970 * 1000))"  //"1566901254292";
    mVariable.type = 2
    mVariable.measurementTime = measurementTime.isEmpty ? mVariable.ts : measurementTime
    mVariable.data = pData
//      let jsonData = try JSONSerialization.data(withJSONObject: mVariable.mVitals, options: [])
//      var mData:String = String(data: jsonData, encoding: String.Encoding.ascii)!
//      mData = mData.replacingOccurrences(of: "\u{0027}", with: "'")
    let mData:String = "{\"userId\":\(mVariable.userId),\"deviceMSN\":\"\(mVariable.deviceMSN)\",\"type\":\(2),\"ts\":\"\(mVariable.ts)\",\"measurementTime\":\"\(mVariable.measurementTime)\",\"data\":\"\(mVariable.data)\"}"
    let mVariables:String = "\"variables\":\(mData)"

    return "{\(mQuery),\(mVariables)}"
  }

  internal class func createUploadRawDataRequest(pData: String, measurementTime: String) -> String {
      do {
        var mOuter:[String:Any] = [:]
        mOuter["query"] = "mutation upload($userId:Int,$deviceMSN:String,$ts:String,$measurementTime: String,$type:Int,$data:String){uploadDeviceData(userId:$userId,deviceMSN:$deviceMSN,ts:$ts,measurementTime:$measurementTime,type:$type,data:$data){statusCode body}}"
        
        var mInner:[String:Any] = [:]
        mInner["userId"] = Global.getUserId()
        mInner["deviceMSN"] = String(Global.getWatchMSNPure())
        mInner["ts"] = "\(Int64(Date().timeIntervalSince1970 * 1000))"  //"1566901254292";
        mInner["measurementTime"] = measurementTime.isEmpty ? mInner["ts"] : measurementTime
        mInner["type"] = 6
        mInner["data"] = pData

        mOuter["variables"] = mInner

        let jsonData = try JSONSerialization.data(withJSONObject: mOuter, options: [])
        return String(data: jsonData, encoding: String.Encoding.ascii)!
      } catch _ {
          // no code required
      }
      return ""
  }

  internal class func createAddStepsRequest(steps: Int, ts: Int64) throws -> String {
    let mInner: [String: Any] = ["userId": Global.getUserId(), "ts": "\(ts)", "count": steps]
        
    let mOuter: [String: Any] = ["query": "mutation MyMutation($userId: Int, $ts: String, $count: Int) {addStepCount(count: $count, ts: $ts, userId: $userId) {body statusCode}}", "variables": mInner]

    let jsonData = try JSONSerialization.data(withJSONObject: mOuter, options: [])
        
    return String(data: jsonData, encoding: String.Encoding.ascii)!
  }

  internal class func createAddMealsRequest(size: Int, ts: Int64) throws -> String {
    let mInner: [String: Any] = ["userId": Global.getUserId(), "timestamp": "\(ts)", "size": size, "notTakenMeal": false, "details": ""]
          
    let mOuter: [String: Any] = ["query": "mutation MyMutation($userId: Int, $timestamp: String, $size: Int, $notTakenMeal: Boolean, $details: String){addMeals(details: $details, notTakenMeal: $notTakenMeal, size: $size, timestamp: $timestamp, userId: $userId) {body statusCode}}", "variables": mInner]

    let jsonData = try JSONSerialization.data(withJSONObject: mOuter, options: [])
          
    return String(data: jsonData, encoding: String.Encoding.ascii)!
  }
}
