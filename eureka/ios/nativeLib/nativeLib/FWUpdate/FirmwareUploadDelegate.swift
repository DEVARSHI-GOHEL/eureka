//
//  FirmwareUploadDelegate.swift
//  
//
//  Created by Peter Ertl on 31/08/2021.
//

import Foundation
import os.log

class FirmwareUploadDelegate: CBPeripheralDelegate {
    static let queue = DispatchQueue.main
    static var maxCommandDataSize = 300
    static var maxAttempts = 10
    static var responseTimeout = TimeInterval(10)
    static let osLog = OSLog(subsystem: "\(FirmwareUploadDelegate.self)", category: "Bluetooth")
    
    let file: Cyacd2File
    let characteristic: CBCharacteristic
    let peripheral: CBPeripheral
    let completion: ((Result<Void, FirmwareUploadError>) -> Void)

    var commandQueue = [Command]()
    var currentCommand: Command!
    var step = -1
    var attempts = 0
    var timer: Timer?
    var result: Result<Void, FirmwareUploadError>?

    init(file: Cyacd2File,
         characteristic: CBCharacteristic,
         completion: @escaping (Result<Void, FirmwareUploadError>) -> Void) {
        self.file = file
        self.characteristic = characteristic
        self.peripheral = characteristic.service!.peripheral!
        self.completion = completion
    }
    
    func start() {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        peripheral.delegate = self
        commandQueue.append(.enterDFU(productId: file.productId))
        if !characteristic.isNotifying {
            os_log("Subscribing to notifications on characteristic %{public}@.",
                   log: Self.osLog, type: .debug, "\(characteristic.uuid)")
            peripheral.setNotifyValue(true, for: characteristic)
        } else {
            next()
        }
    }
    
    func next() {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        guard peripheral.state == .connected else {
            finish(withResult: .failure(.connectionError))
            return
        }
        if commandQueue.isEmpty {
            step += 1
            attempts = 1
            if step < file.entries.count {
                commandQueue = commands(for: file.entries[step])
            } else if step == file.entries.count {
                commandQueue = [.verifyApp(id: file.appId)]
            } else {
                finish(withResult: .success(()))
                return
            }
        }
        currentCommand = commandQueue.removeFirst()
        send(currentCommand)
        if currentCommand.hasResponse {
            timer?.invalidate()
            let timeout = Self.responseTimeout
            timer = Timer.scheduledTimer(withTimeInterval: timeout, repeats: false) { [weak self] _ in
                self?.timeout(timeout)
            }
        } else {
            next()
        }
    }
    
    func commands(for entry: Cyacd2File.Entry) -> [Command] {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        ChecksumType.shared = file.checksumType
        switch entry {
        case let .appInfo(address, length):
            return [.setAppMetadata(appId: file.appId, address: address, length: length)]
        case let .eiv(vector):
            return [.setEIV(vector)]
        case let .dataRow(address, data):
            if data.count <= Self.maxCommandDataSize {
                return [.programData(data, address: address, crc32: data.crc32)]
            } else {
                var commands = [Command]()
                let chunks = data.chunked(by: Self.maxCommandDataSize).map(Array.init)
                for chunk in chunks.prefix(chunks.count - 1) {
                    commands.append(.sendData(chunk))
                }
                commands.append(.programData(chunks.last!, address: address, crc32: data.crc32))
                return commands
            }
        }
    }
    
    func send(_ command: Command, writeType: CBCharacteristicWriteType? = nil) {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        let writeType: CBCharacteristicWriteType = writeType ??
            (characteristic.properties.contains(.writeWithoutResponse) ? .withoutResponse : .withResponse)
        let maxWriteDataSize = max(peripheral.maximumWriteValueLength(for: writeType), 20)
        os_log("Selected write type: %{public}@, max size: %{public}@ B", log: Self.osLog, type: .debug, writeType == .withResponse ? "with_response" : "without_response", "\(maxWriteDataSize)")
        let packet = command.packet
        os_log("Sending \"%{public}@\" request: %{public}@.",
               log: Self.osLog, type: .debug, "\(command.code)", packet.hexString)
        for chunk in packet.chunked(by: maxWriteDataSize) {
            peripheral.writeValue(Data(chunk), for: characteristic, type: writeType)
        }
    }
    
    func process(_ response: Response) {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        timer?.invalidate()
        guard let command = self.currentCommand else { return }
        guard response.status == .success else {
            var retryCommands = [command]
            if command.code == .sendData || command.code == .programData {
                retryCommands = [.syncDFU] + commands(for: file.entries[step])
            }
            retry(using: retryCommands,
                  orThrow: .communicationError(cause: PeripheralError.badStatus(response.status)))
            return
        }
        if command.code == .enterDFU {
            guard let res = EnterDFUResponse(response),
                  res.siliconId == file.siliconId,
                  res.siliconRevision == file.siliconRevision else {
                finish(withResult: .failure(.invalidFileError(cause: Cyacd2Error.incorrectSilicon)))
                return
            }
        }
        if command.code == .verifyApp {
            guard let res = VerifyAppResponse(response), res.result else {
                finish(withResult: .failure(.crcError))
                return
            }
        }
        next()
    }
    
    func timeout(_ interval: TimeInterval) {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        os_log("Response timeout after %{public}@ seconds.",
               log: Self.osLog, type: .error, "\(interval)")
        guard let command = currentCommand else { return }
        var retryCommands = [command]
        if command.code == .sendData || command.code == .programData {
            retryCommands = [.syncDFU] + commands(for: file.entries[step])
        }
        retry(using: retryCommands,
              orThrow: .communicationError(cause: PeripheralError.timeout(interval)))
    }
    
    func retry(using retryCommands: [Command] = [], orThrow error: FirmwareUploadError) {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        guard !retryCommands.isEmpty, attempts < Self.maxAttempts else {
            finish(withResult: .failure(error))
            return
        }
        os_log("Trying again: %{public}@.", log: Self.osLog, type: .debug, "\(attempts)")
        attempts += 1
        commandQueue = retryCommands
        next()
    }
    
    func finish(withResult result: Result<Void, FirmwareUploadError>) {
        dispatchPrecondition(condition: .onQueue(Self.queue))
        timer?.invalidate()
        peripheral.setNotifyValue(false, for: characteristic)
        if peripheral.state == .connected {
            self.result = result
            currentCommand = .exitDFU
            send(currentCommand, writeType: .withResponse)
        } else {
            completion(result.fail(.installationError))
        }
    }
    
    // MARK: CBPeripheralDelegate
    
    func peripheral(_ peripheral: CBPeripheral,
                    didUpdateNotificationStateFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard characteristic.uuid === self.characteristic.uuid else { return }
        Self.queue.async { [self] in
            if let error = error {
                os_log("Error occurred while updating notification state: %{public}@.",
                       log: Self.osLog, type: .error, error.localizedDescription)
                finish(withResult: .failure(.communicationError(cause: error)))
            } else {
                if characteristic.isNotifying {
                    next()
                }
            }
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral,
                    didWriteValueFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard characteristic.uuid === self.characteristic.uuid else { return }
        Self.queue.async { [self] in
            if let error = error {
                os_log("Error occurred while writing value: %{public}@.",
                       log: Self.osLog, type: .error, error.localizedDescription)
                if currentCommand.code == .exitDFU {
                    result = result?.fail(.installationError)
                }
            }
            if let result = self.result {
                completion(result)
                self.result = nil
            }
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral,
                    didUpdateValueFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard characteristic.uuid === self.characteristic.uuid else { return }
        Self.queue.async { [self] in
            if let error = error {
                os_log("Error occurred while reading value: %{public}@.",
                       log: Self.osLog, type: .error, error.localizedDescription)
                finish(withResult: .failure(.communicationError(cause: error)))
            } else {
                let value = characteristic.value ?? Data()
                ChecksumType.shared = file.checksumType
                guard let response = Response(packet: Array(value)) else {
                    finish(withResult: .failure(.communicationError(cause: PeripheralError.invalidResponse(value))))
                    return
                }
                os_log("Received \"%{public}@\" response: %{public}@.",
                       log: Self.osLog, type: .debug, "\(response.status)", value.hexString)
                process(response)
            }
        }
    }
}
