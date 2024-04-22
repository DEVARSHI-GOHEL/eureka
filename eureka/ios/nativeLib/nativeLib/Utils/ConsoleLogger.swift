//
//  Logger.swift
//  eureka
//
//  Created by Harshada Memane on 22/02/21.
//

import Foundation

public class ConsoleLogger {
  
  public static let shared = ConsoleLogger()
  
  private init () {}
  
  public func log<T>(value: T) {
    print("Logger : -> \(value)")
  }
}
