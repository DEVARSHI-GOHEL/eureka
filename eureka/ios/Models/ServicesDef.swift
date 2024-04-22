//
//  ServicesDef.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

public class ServicesDef {

  internal static let SERVICE_UUID = UUID(uuidString: "4C505732-5F43-5553-544F-4D5F53525600")

  private var CustomService: [UUID: Any] = [:]

  internal func getCustomService() -> [UUID: Any] {
    return CustomService;
  }

  internal func setCustomService(customService: [UUID: Any]) {
    CustomService = customService;
  }
}
