//
//  WatchSimulator.swift
//  
//
//  Created by Peter Ertl on 30/08/2021.
//

import Foundation
import CoreBluetoothMock
@testable import nativeLib

class WatchSimulator: CBMPeripheralSpecDelegate {
    let name: String
    var connected = false
    var simulateConnectError = false
    var autoMeasure = true
    var discoveredServices: [CBMServiceMock] = []
    var notifiedChars: [CBMCharacteristicMock] = []
    var notifyErrorChars: [String] = []
    var timeSet = false
    var timeZoneSet = false
    var stepGoalSet = false
    var readChars: [CBMCharacteristicMock] = []
    var readErrorChars: [String] = []
    var writtenChars: [(CBMCharacteristicMock, Data)] = []
    var writeErrorChars: [String] = []
    var processedCommands: [UInt8] = []
    
    private let tiny: Bool
    private let noReferenceChar: Bool
    private var receivedCommand: UInt8 = 0
    private var vitalDataIndex = 0
    private var mealDataIndex = 0
    
    init(name: String, tiny: Bool = false, noReferenceChar: Bool = false) {
        self.name = name
        self.tiny = tiny
        self.noReferenceChar = noReferenceChar
    }
    
    lazy var peripheralSpec: CBMPeripheralSpec = {
        return CBMPeripheralSpec
            .simulatePeripheral(proximity: .near)
            .advertising(
                advertisementData: [
                    CBMAdvertisementDataLocalNameKey: name,
                    CBMAdvertisementDataServiceUUIDsKey: [CBUUID(string: GattServiceEnum.BATTERY_SERVICE.code)],
                    CBMAdvertisementDataIsConnectable: true as NSNumber
                ],
                withInterval: 0.250,
                alsoWhenConnected: true)
            .connected(
                name: name,
                services: [currentTimeService, tiny ? tinyCustomService :
                            noReferenceChar ? customServiceWithoutReferenceChar :  customService,
                           deviceInformationService, alertService],
                delegate: self,
                connectionInterval: 0.150,
                mtu: 23)
            .build()
    }()
    
    // MARK: CBMPeripheralSpecDelegate
    
    func peripheralDidReceiveConnectionRequest(_ peripheral: CBMPeripheralSpec) -> Result<Void, Error> {
        if simulateConnectError {
            connected = false
            return .failure(NSError(domain: "CONNECT error", code: -1001, userInfo: ["message" : "Failed to connect"]))
        } else {
            connected = true
            return .success(())
        }
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec, didDisconnect error: Error?) {
        connected = false
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveCharacteristicsDiscoveryRequest characteristicUUIDs: [CBMUUID]?,
                    for service: CBMServiceMock) -> Result<Void, Error> {
        discoveredServices.append(service)
        return .success(())
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveSetNotifyRequest enabled: Bool,
                    for characteristic: CBMCharacteristicMock) -> Result<Void, Error> {
        if notifyErrorChars.contains(characteristic.uuid.uuidString) {
            return .failure(NSError(domain: "NOTIFY error", code: -1001, userInfo: ["message" : "Failed to set notify on characteristic"]))
        }
        
        if enabled {
            notifiedChars.append(characteristic)
        } else {
            if let index = notifiedChars.firstIndex(of: characteristic) {
                notifiedChars.remove(at: index)
            }
        }
        return .success(())
    }
    
    // write without response
    func peripheral(_ peripheral: CBMPeripheralSpec, didReceiveWriteCommandFor characteristic: CBMCharacteristicMock, data: Data) {
        writtenChars.append((characteristic, data))
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveWriteRequestFor characteristic: CBMCharacteristicMock,
                    data: Data) -> Result<Void, Error> {
        if writeErrorChars.contains(characteristic.uuid.uuidString) {
            return .failure(NSError(domain: "WRITE error", code: -1001, userInfo: ["message" : "Failed to write characteristic"]))
        }
        
        if characteristic.uuid.uuidString == GattCharEnum.CURRENT_TIME.code {
            timeSet = true
        } else if characteristic.uuid.uuidString == GattCharEnum.LOCAL_TIME_INFORMATION.code {
            timeZoneSet = true
        } else if characteristic.uuid.uuidString == GattCharEnum.STEP_COUNTER.code {
            stepGoalSet = true
            writtenChars.append((characteristic, data))
        } else if characteristic.uuid.uuidString == GattCharEnum.COMMAND.code {
            receivedCommand = data[0]
            if receivedCommand == BleCommandEnum.START_MEASUREMENT.command {
                processedCommands.append(receivedCommand)
            }
        } else {
            writtenChars.append((characteristic, data))
        }
        return .success(())
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveReadRequestFor characteristic: CBMCharacteristicMock)
    -> Result<Data, Error> {
        if readErrorChars.contains(characteristic.uuid.uuidString) {
            return .failure(NSError(domain: "READ error", code: -1001, userInfo: ["message" : "Failed to read characteristic"]))
        }
        
        readChars.append(characteristic)
        switch characteristic.uuid.uuidString {
        case GattCharEnum.USER_DATA.code:
            let data = Data([autoMeasure ? 1 : 0]) + Data(repeating: 0, count: 9)
            return .success(data)
        case GattCharEnum.STATUS.code:
            return .success(Data(repeating: 128, count: 1))
        case GattCharEnum.VITAL_DATA.code:
            processedCommands.append(receivedCommand)
            if receivedCommand == BleCommandEnum.GET_LAST_VITAL.command {
                vitalDataIndex = vitalData.count - 1
                return .success(Data(vitalData.last!))
            } else if receivedCommand == BleCommandEnum.GET_PREV_VITAL.command {
                vitalDataIndex -= 1
                if vitalDataIndex < 0 {
                    vitalDataIndex = 0
                }
                return .success(Data(vitalData[vitalDataIndex]))
            }
        case GattCharEnum.MEAL_DATA.code:
            processedCommands.append(receivedCommand)
            if receivedCommand == BleCommandEnum.GET_LAST_MEAL.command {
                mealDataIndex = mealData.count - 1
                return .success(Data(mealData.last!))
            } else if receivedCommand == BleCommandEnum.GET_PREV_MEAL.command {
                mealDataIndex -= 1
                if mealDataIndex < 0 {
                    mealDataIndex = 0
                }
                return .success(Data(mealData[mealDataIndex]))
            }
        case GattCharEnum.STEP_COUNTER.code:
            processedCommands.append(receivedCommand)
            return .success(stepCounterData)
        case GattCharEnum.RAW_DATA.code:
            processedCommands.append(receivedCommand)
            return .success(Data(count: 175))
        case GattCharEnum.FIRMWARE_REVISION.code:
            return .success("abcdefg".data(using: .utf8)!)
        default:
            return .success(Data())
        }
        return .success(Data())
    }

}
