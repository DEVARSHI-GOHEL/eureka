//
//  IDeviceService.swift
//  LPClient
//
//  Created by Andrey Filyakov on 18.02.2021.
//

import Foundation

public struct Device {
  let id: String
  let name: String
  let services: [String]
  public let peripheral: CBPeripheral?
}

public protocol IDeviceService {
  var delegate: IDeviceServiceDelegate? { get set }
  func startScan()
  func stopScan()
  func connect(to device: Device)
  var currentDevice: Device? { get }

  func startMeasureProcess(status: ProceesStateResponse?, calibrationParams: [String: Any?]?, proc: BleProcEnum,  procSate: BleProcStateEnum)
  func stopMeasureProcess()
  func continueAutoMeasureSync()
  func disconnect()
}

public protocol IDeviceServiceDelegate: AnyObject {
    func deviceFound(_ device: Device)
    func deviceConnected(_ device: Device)
    func deviceDisconnected()
    func deviceTimeReceived(_ deviceTime: Data)
}
