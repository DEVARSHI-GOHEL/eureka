//
//  CharatericsDef.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

public class CharatericsDef {

  public static let CHARACTRISTICS_UUID: UUID? = UUID(uuidString: "4C505732-5F43-535F-5644-5F5245430000")

  private var ServiceId: [UUID: Any] = [:]
  private var Vitaldata: [UUID: [String: Any]] = [:]

  public func getServiceId() -> [UUID: Any] {
    return ServiceId
  }

  public func setServiceId(serviceId: [UUID: Any]) {
      ServiceId = serviceId
  }

  public func getVitaldata() -> [UUID: [String: Any]] {
    return Vitaldata
  }

  public func setVitaldata(vitaldata: [UUID: [String: Any]]) {
      Vitaldata = vitaldata
  }
}
