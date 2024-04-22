//
//  Utils.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

public class Utils {
  public class func currentMillis() -> Int64 {
    return Int64((Date().timeIntervalSince1970 * 1000.0).rounded())
  }

  public class func currentMillisStr() -> String {
    return "\(Int64((Date().timeIntervalSince1970 * 1000.0).rounded()))"
  }
}
