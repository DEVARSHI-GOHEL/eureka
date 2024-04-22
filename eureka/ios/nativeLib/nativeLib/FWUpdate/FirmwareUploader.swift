//
//  FirmwareUploader.swift
//  
//
//  Created by Peter Ertl on 20/08/2021.
//

import Foundation
import os.log

public class FirmwareUploader {
    static let advertisedNameInDFUMode = "BLE DFU Device"
    static let scanTimeoutForDFU = TimeInterval(180)
    static let serviceUuid = CBUUID(string: "00060000-F8CE-11E4-ABF4-0002A5D5C51B")
    static let characteristicUuid = CBUUID(string: "00060001-F8CE-11E4-ABF4-0002A5D5C51B")
    static let osLog = OSLog(subsystem: "\(FirmwareUploader.self)", category: "Firmware")
    static let minParallelSize = 128 * 1024
    static var delegates = [UUID: Any]()
    
    /// Performs firmware update by uploading specified `cyacd2` file to the `target` peripheral via Bluetooth LE.
    /// Target peripheral needs to support Device Firmware Update protocol.
    ///
    /// This method should be called on the main thread and so will be the `completion` block.
    ///
    /// Implementation will temporarily replace `target.delegate`,
    /// but original delegate will be restored before `completion` is executed.
    ///
    /// - Parameters:
    ///   - url: URL should point to a `cyacd2` file on local file system.
    ///   - target: Bluetooth peripheral that should be updated.
    ///   - completion: Completion block to be called on the main thread with result of the operation.
    ///   - result: Either success (Void) or one of `FirmwareUploadError` cases.
    public static func upload(_ url: URL,
                              to target: CBPeripheral,
                              completion: @escaping (_ result: Result<Void, FirmwareUploadError>) -> Void) {
        
        dispatchPrecondition(condition: .onQueue(FirmwareUploadDelegate.queue))
        guard delegates[target.identifier] == nil else {
            FirmwareUploadDelegate.queue.async {
                completion(.failure(.communicationError(cause: PeripheralError.updateInProgress)))
            }
            return
        }
        delegates[target.identifier] = true
        
        os_log("Firmware update initiated.", log: osLog, type: .default)
        weak var origDelegate = target.delegate
        let callback = FirmwareUploadDelegate.queue.wrapAsync { (result: Result<Void, FirmwareUploadError>) in
            delegates[target.identifier] = nil
            target.delegate = origDelegate
            switch result {
            case .success: os_log("Firmware update successful.", log: osLog, type: .default)
            case .failure(let error): os_log("Firmware update failed: %{public}@",
                                             log: osLog, type: .error, error.localizedDescription)
            }
            completion(result)
        }
        
        let characteristic: CBCharacteristic
        do {
            characteristic = try getCharacteristic(target)
        } catch {
            let fwError = error as? FirmwareUploadError
                ?? .communicationError(cause: PeripheralError.missingCharacteristic)
            callback(.failure(fwError))
            return
        }
        
        DispatchQueue.global().async {
            do {
                let file = try load(url)
                FirmwareUploadDelegate.queue.async {
                    let delegate = FirmwareUploadDelegate(file: file,
                                                          characteristic: characteristic,
                                                          completion: callback)
                    delegates[target.identifier] = delegate
                    delegate.start()
                }
            } catch {
                let fwError: FirmwareUploadError =
                    (error as? Cyacd2Error).map { .invalidFileError(cause: $0) } ?? .fileReadError(cause: error)
                callback(.failure(fwError))
            }
        }
    }
    
    static func getCharacteristic(_ peripheral: CBPeripheral) throws -> CBCharacteristic {
        guard peripheral.state == .connected else {
            throw FirmwareUploadError.connectionError
        }
        guard let service = peripheral.getService(serviceUuid) else {
            throw FirmwareUploadError.communicationError(cause: PeripheralError.missingService)
        }
        guard let characteristic = service.getCharacteristic(characteristicUuid) else {
            throw FirmwareUploadError.communicationError(cause: PeripheralError.missingCharacteristic)
        }
        let charProps = characteristic.properties
        guard charProps.contains(.write),
              charProps.contains(.notify) || charProps.contains(.indicate) else {
            throw FirmwareUploadError.communicationError(cause: PeripheralError.invalidProperties(charProps))
        }
        return characteristic
    }
    
    static func load(_ url: URL) throws -> Cyacd2File {
        try autoreleasepool {
            os_log("Loading file \"%{public}@\".", log: Self.osLog, type: .default, url.path)
            let data = try Data(contentsOf: url)
            let file = try Cyacd2Parser().parse(data, options: data.count >= minParallelSize ? .parallel : [])
            os_log("%{public}@", log: Self.osLog, type: .debug, file.description)
            return file
        }
    }
}
