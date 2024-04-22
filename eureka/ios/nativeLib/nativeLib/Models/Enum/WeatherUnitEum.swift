//
//  WeatherUnitEum.swift
//  eureka
//
//  Created by Admin on 27/06/21.
//

import Foundation

public enum WeatherUnitEnum: Int {
  case Metric = 0
  case Imperial = 1
  
  public var desc:String {
    switch self {
    case .Imperial: return "imperial"
    case .Metric: return "metric"
    }
  }
  
  public var code: Int {
    switch self {
    case .Imperial: return 1
    case .Metric: return 2
    }
  }
}
