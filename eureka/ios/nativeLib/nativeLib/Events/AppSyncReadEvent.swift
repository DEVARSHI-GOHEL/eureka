//
//  AppSyncReadEvent.swift
//  eureka
//
//  Created by work on 21/02/21.
//

import Foundation

internal class AppSyncReadEvent : EventBase {
  public final var data:[UInt8] = []
  public var characteristicId:String?

  internal init(pCharacteristicId:String, pData:[UInt8]) {
    data = pData
    characteristicId = pCharacteristicId
  }

  internal override func getData() -> String {
    return "{characteristicId: \(characteristicId ?? ""), data: \(String(bytes: data, encoding: .utf8) ?? "")}"
  }
}
