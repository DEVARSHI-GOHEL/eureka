//
//  Methods.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

public class Methods {
  private static var _methods: [String: [String: String]] = [:]
  
  private static func addMethods(pMethodName: String, pParams: [String: String]) {
    _methods[pMethodName] = pParams
  }
  
  public static func get_methods() -> [String: [String: String]] {
    return _methods;
  }
  
/*  static {
        Paramenters paramenters = new Paramenters()
        addMethods("pairDevice" , null)
        addMethods("connectDevice" , paramenters.get_ConnectDeviceParams())
        addMethods("updateAppInfo" , null)
        addMethods("getAppStatus" , null)
        addMethods("measureNow" , null)
        addMethods("calibrateNow" , null)
        addMethods("syncAll" , null)
        addMethods("cloudSync" , null)
    }
 */
}
