//
//  Paramenters.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

class Paramenters {
  static var _ConnectDeviceParams: [String: String] = ["userId": "617",
                                                       "deviceMsn": "AE72R38Y"]
  
  static func get_ConnecteviceParams() -> [String: String] {
      return _ConnectDeviceParams;
  }
}
