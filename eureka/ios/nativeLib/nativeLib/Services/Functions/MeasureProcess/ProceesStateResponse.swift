//
//  ProceesStateResponse.swift
//  eureka
//
//  Created by Harshada Memane on 16/03/21.
//

import Foundation

public struct ProceesStateResponse {
  let error: Error?
  let characteristic: CBCharacteristic?
  let peripheral: CBPeripheral?
  let status: StatusReadEvent?
}
