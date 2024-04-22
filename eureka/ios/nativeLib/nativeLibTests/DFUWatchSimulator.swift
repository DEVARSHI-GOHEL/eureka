//
//  DFUWatchSimulator.swift
//  
//
//  Created by Peter Ertl on 30/08/2021.
//

import Foundation
import CoreBluetoothMock
@testable import nativeLib

class DFUWatchSimulator: CBMPeripheralSpecDelegate {
    let name: String
    var responder: (Command) -> Response?
    var buffer = [UInt8]()
    var commands = [Command]()
    var setNotifyError: Error?
    var writeError: Error?
    
    init(name: String,
         siliconId: UInt32 = 1,
         siliconRevision: UInt8 = 1,
         sdkVersion: [UInt8] = [1, 0, 0]) {
        self.name = name
        self.responder = { command in
            guard command.hasResponse else { return nil }
            switch command.code {
            case .enterDFU: return .enterDFU(siliconId: siliconId,
                                             siliconRevision: siliconRevision,
                                             sdkVersion: sdkVersion)
            case .verifyApp: return .verifyApp(result: true)
            default: return .status(.success)
            }
        }
    }
    
    lazy var peripheralSpec: CBMPeripheralSpec = {
        let service = CBMServiceMock(
            type: FirmwareUploader.serviceUuid, primary: false,
            characteristics: CBMCharacteristicMock(
                type: FirmwareUploader.characteristicUuid,
                properties: [.write, .writeWithoutResponse, .notify]
            )
        )
        
        var advertisementData: [String: Any] = [
            CBAdvertisementDataLocalNameKey: name,
            CBAdvertisementDataIsConnectable: true as NSNumber
        ]
        
        if name != FirmwareUploader.advertisedNameInDFUMode {
            advertisementData[CBAdvertisementDataServiceUUIDsKey] = [CBUUID(string: "180F")]
        }
        
        return CBMPeripheralSpec
            .simulatePeripheral(proximity: .near)
            .advertising(
                advertisementData: advertisementData,
                withInterval: 0.250,
                alsoWhenConnected: true)
            .connected(
                name: name,
                services: [service],
                delegate: self,
                connectionInterval: 0.150,
                mtu: 23)
            .build()
    }()
    
    func updateResponder(_ update: @escaping (Command, Response?) -> Response?) {
        let prevResponder = self.responder
        self.responder = { update($0, prevResponder($0)) }
    }
    
    // MARK: CBMPeripheralSpecDelegate
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveSetNotifyRequest enabled: Bool,
                    for characteristic: CBMCharacteristicMock) -> Result<Void, Error> {
        let result = setNotifyError.map(Result.failure) ?? .success(())
        setNotifyError = nil
        return result
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveWriteRequestFor characteristic: CBMCharacteristicMock,
                    data: Data) -> Result<Void, Error> {
        self.peripheral(peripheral, didReceiveWriteCommandFor: characteristic, data: data)
        let result = writeError.map(Result.failure) ?? .success(())
        writeError = nil
        return result
    }
    
    func peripheral(_ peripheral: CBMPeripheralSpec,
                    didReceiveWriteCommandFor characteristic: CBCharacteristic,
                    data: Data) {
        buffer.append(contentsOf: data)
        if let command = Command(packet: buffer) {
            commands.append(command)
            buffer.removeAll()
            if let response = responder(command),
               let mockChar = characteristic as? CBMCharacteristicMock {
                peripheral.simulateValueUpdate(Data(response.packet), for: mockChar)
            }
        }
    }
}
