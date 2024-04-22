//
//  OpenWeatherStruct.swift
//  eureka
//
//  Created by work on 02/06/21.
//

import Foundation

public class OpenWeatherStruct {
  private var lat:Double = 0.0
  private var lon:Double = 0.0
  private var dt:Int64 = 0
  private var timezone:String = ""
  private var offset:Int64 = 0
  private var current:[String:Any] = [:]
  private var hourly:[[String:Any]] = []
  private var daily:[[String:Any]] = []
    
  public init() {}
  
  internal func getLat() -> Double {
    return lat
  }

  public func setLat(pLat:Double) {
    lat = pLat
  }

  internal func getLon() -> Double {
    return lon
  }

  public func setLon(pLon:Double) {
    lon = pLon
  }

  internal func getDt() -> Int64 {
    return dt
  }

  public func setDt(pDt:Int64) {
    dt = pDt
  }

  internal func getTimezone() -> String {
    return timezone
  }

  public func setTimezone(pTimezone:String) {
    timezone = pTimezone
  }

  internal func getOffset() -> Int64 {
    return offset
  }

  public func setOffset(pOffset:Int64) {
    offset = pOffset
  }

  public func getCurrent() -> [String:Any] {
    return current
  }

  public func setCurrent(pCurrent:[String:Any]) {
    current = pCurrent
  }

  public func getHourly() -> [[String:Any]] {
    return hourly
  }

  public func setHourly(pHourly:[[String:Any]]) {
    hourly = pHourly
  }

  public func getDaily() -> [[String:Any]] {
    return daily
  }

  public func setDaily(pDaily:[[String:Any]]) {
    daily = pDaily
  }
}
