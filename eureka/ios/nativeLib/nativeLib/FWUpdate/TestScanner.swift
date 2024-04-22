//
//  TestScanner.swift
//  
//
//  Created by Peter Ertl on 30/08/2021.
//

import Foundation
import CoreBluetooth
import os.log

class TestScanner: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    static let osLog = OSLog(subsystem: "\(TestScanner.self)", category: "Bluetooth")
    
    struct InvalidState: LocalizedError {
        let state: CBManagerState
        var errorDescription: String? {
            "Invalid CBCentralManager state: \(state)."
        }
    }
    
    var scannedServices: [CBUUID]?
    var filter: (CBPeripheral, [String: Any], NSNumber) -> Bool
    var completion: (Result<CBPeripheral, Error>) -> Void
    
    var shouldStopScan = true
    var shouldConnect = true
    var shouldDiscoverServices = true
    var shouldDiscoverCharacteristics = true
    
    private var cleanup: (() -> Void)?
    private var servicesToExplore = [CBService]()
    
    init(scanFor scannedServices: [CBUUID]? = nil,
         accepting filter: @escaping (CBPeripheral, [String: Any], NSNumber) -> Bool = { _, _, _ in true },
         completion: @escaping (Result<CBPeripheral, Error>) -> Void = { _ in }) {
        self.scannedServices = scannedServices
        self.filter = filter
        self.completion = completion
    }
    
    func finish(_ result: Result<CBPeripheral, Error>) {
        cleanup?()
        cleanup = nil
        switch result {
        case .success(let peripheral):
            os_log("Scanner successful with peripheral %{public}@.",
                   log: Self.osLog, type: .debug, "\(peripheral.identifier)")
        case .failure(let error):
            os_log("Scanner failed with error: %{public}@",
                   log: Self.osLog, type: .error, "\(error.localizedDescription)")
        }
        DispatchQueue.main.async {
            self.completion(result)
        }
    }
    
    // MARK: CBCentralManagerDelegate
    
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        os_log("Central manager did update state to %{public}@.", log: Self.osLog, type: .debug, "\(central.state)")
        switch central.state {
        case .poweredOff, .unauthorized, .unsupported:
            finish(.failure(InvalidState(state: central.state)))
        case .poweredOn:
            if !central.isScanning {
                os_log("Scanning for peripherals with services: %{public}@.",
                       log: Self.osLog, type: .debug, "\(scannedServices ?? [])")
                central.scanForPeripherals(withServices: scannedServices, options: nil)
            }
        default:
            break
        }
    }
    
    func centralManager(_ central: CBCentralManager,
                        didDiscover peripheral: CBPeripheral,
                        advertisementData: [String: Any],
                        rssi RSSI: NSNumber) {
        os_log("Discovered peripheral %{public}@ \"%{public}@\" %{public}@.",
               log: Self.osLog, type: .debug, "\(peripheral.identifier)",
               peripheral.name ?? "<?>", "\(advertisementData)")
        guard filter(peripheral, advertisementData, RSSI) else { return }
        if shouldStopScan {
            central.stopScan()
        }
        if shouldConnect {
            central.connect(peripheral, options: nil)
        } else {
            finish(.success(peripheral))
        }
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        os_log("Connected to peripheral %{public}@.",
               log: Self.osLog, type: .debug, "\(peripheral.identifier)")
        if shouldDiscoverServices {
            peripheral.delegate = self
            cleanup = { peripheral.delegate = nil }
            peripheral.discoverServices(nil)
        } else {
            finish(.success(peripheral))
        }
    }
    
    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        if let error = error {
            finish(.failure(error))
        }
    }
    
    // MARK: CBPeripheralDelegate
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error = error {
            finish(.failure(error))
            return
        }
        let serviceInfo = (peripheral.services ?? []).map(\.uuid.description)
        os_log("Discovered services %{public}@.", log: Self.osLog, type: .debug, serviceInfo)
        if shouldDiscoverCharacteristics {
            servicesToExplore = peripheral.services ?? []
        }
        if let service = servicesToExplore.popLast() {
            peripheral.discoverCharacteristics(nil, for: service)
        } else {
            finish(.success(peripheral))
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error = error {
            finish(.failure(error))
            return
        }
        let charInfo = (service.characteristics ?? []).map(\.uuid.description)
        os_log("Discovered characteristics %{public}@ for service %{public}@.",
               log: Self.osLog, type: .debug, charInfo, "\(service.uuid)")
        if let service = servicesToExplore.popLast() {
            peripheral.discoverCharacteristics(nil, for: service)
        } else {
            finish(.success(peripheral))
        }
    }
}
