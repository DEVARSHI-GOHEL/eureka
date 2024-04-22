//
//  FirmwareUploaderTests.swift
//  
//
//  Created by Peter Ertl on 20/08/2021.
//

import XCTest
import CoreBluetoothMock
@testable import nativeLib

class FirmwareUploaderTests: XCTestCase {
    let fileManager = FileManager.default
    lazy var fileURL = fileManager.temporaryDirectory.appendingPathComponent("update.cyacd2").absoluteURL
    var simulator: DFUWatchSimulator!
    var central: CBCentralManager!
    var peripheralSpec: CBMPeripheralSpec!
    var peripheral: CBPeripheral!
    lazy var scanner = TestScanner(completion: self.startUpload)
    var completion: (Result<Void, FirmwareUploadError>) -> Void = { _ in }
    
    override func setUp() {
        simulator = DFUWatchSimulator(name: FirmwareUploader.advertisedNameInDFUMode,
                                      siliconId: 0xE2442100,
                                      siliconRevision: 0x21)
        peripheralSpec = simulator.peripheralSpec
        CBMCentralManagerMock.simulatePowerOn()
        CBMCentralManagerMock.simulatePeripherals([peripheralSpec])
        FirmwareUploadDelegate.maxCommandDataSize = 4
        scanner.shouldConnect = true
        scanner.shouldDiscoverServices = true
        scanner.shouldDiscoverCharacteristics = true
    }
    
    override func tearDownWithError() throws {
        CBMCentralManagerMock.tearDownSimulation()
        FirmwareUploadDelegate.responseTimeout = 5
        if fileManager.fileExists(atPath: fileURL.path) {
            try fileManager.removeItem(atPath: fileURL.path)
        }
    }
    
    func saveFile(_ text: String) throws {
        try text.data(using: .ascii)!.write(to: fileURL)
    }
    
    func startUpload(_ result: Result<CBPeripheral, Error>) {
        switch result {
        case .success(let peripheral):
            self.peripheral = peripheral
            FirmwareUploader.upload(fileURL, to: peripheral, completion: completion)
            XCTAssertFalse(FirmwareUploader.delegates.isEmpty)
        case .failure(let error):
            XCTFail("Scan should be successful: \(error.localizedDescription)")
            completion(.failure(.communicationError(cause: error)))
        }
    }
    
    func expectSuccess(_ exp: XCTestExpectation, handler: @escaping () -> Void)
    -> (Result<Void, FirmwareUploadError>) -> Void {
        return { result in
            exp.fulfill()
            switch result {
            case .failure: XCTFail("Operation should succeed")
            case .success: handler()
            }
        }
    }
    
    func expectError(_ exp: XCTestExpectation, handler: @escaping (FirmwareUploadError) -> Void)
    -> (Result<Void, FirmwareUploadError>) -> Void {
        return { result in
            exp.fulfill()
            switch result {
            case .success: XCTFail("Operation should fail")
            case .failure(let error): handler(error)
            }
        }
    }
}

// MARK: Successful update

extension FirmwareUploaderTests {
    func testSuccessfulUpdate() throws {
        try saveFile("""
        01002144E221000104030201
        @APPINFO:0x19000000,0x1fffc
        @EIV:0102030405060708
        :0000001901020304
        :0000001A05060708090A
        """)
        async { [self] exp in
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectSuccess(exp) {
                XCTAssertEqual(self.simulator.commands, [
                    .enterDFU(productId: 0x01020304),
                    .setAppMetadata(appId: 1, address: 0x19000000, length: 0x0001fffc),
                    .setEIV([1, 2, 3, 4, 5, 6, 7, 8]),
                    .programData([1, 2, 3, 4], address: 0x19000000),
                    .sendData([5, 6, 7, 8]),
                    .programData([9, 10], address: 0x1A000000, crc32: Data([5, 6, 7, 8, 9, 10]).crc32),
                    .verifyApp(id: 1),
                    .exitDFU
                ])
            }
        }
    }
    
    func testSuccessfulRetry() throws {
        try saveFile("""
        01002144E221000104030201
        @APPINFO:0x19000000,0x1fffc
        @EIV:0102030405060708
        :00000019010203040506
        """)
        async { [self] exp in
            var failures = Set<CommandCode>()
            simulator.updateResponder { command, response in
                guard command.hasResponse else { return nil }
                guard !failures.insert(command.code).inserted else { return .status(.dataError) }
                return response
            }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectSuccess(exp) {
                XCTAssertEqual(self.simulator.commands, [
                    .enterDFU(productId: 0x01020304),
                    .enterDFU(productId: 0x01020304),
                    .setAppMetadata(appId: 1, address: 0x19000000, length: 0x0001fffc),
                    .setAppMetadata(appId: 1, address: 0x19000000, length: 0x0001fffc),
                    .setEIV([1, 2, 3, 4, 5, 6, 7, 8]),
                    .setEIV([1, 2, 3, 4, 5, 6, 7, 8]),
                    .sendData([1, 2, 3, 4]),
                    .syncDFU,
                    .sendData([1, 2, 3, 4]),
                    .programData([5, 6], address: 0x19000000, crc32: Data([1, 2, 3, 4, 5, 6]).crc32),
                    .syncDFU,
                    .sendData([1, 2, 3, 4]),
                    .programData([5, 6], address: 0x19000000, crc32: Data([1, 2, 3, 4, 5, 6]).crc32),
                    .verifyApp(id: 1),
                    .verifyApp(id: 1),
                    .exitDFU
                ])
            }
        }
    }
}

// MARK: Connection errors

extension FirmwareUploaderTests {
    func testNotConnectedPeripheral() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            scanner.shouldConnect = false
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .connectionError: break
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testDisconnectedPeripheral() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            FirmwareUploadDelegate.responseTimeout = 0.2
            simulator.updateResponder { [weak self] _, response in
                self?.peripheralSpec.simulateDisconnection(withError: CBError(.notConnected))
                return response
            }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .connectionError: break
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
}

// MARK: Communication errors

extension FirmwareUploaderTests {
    func testErrorResponse() throws {
        try saveFile("""
        01002144E221000104030201
        @APPINFO:0x19000000,0x1fffc
        :0000001900
        """)
        async { [self] exp in
            simulator.updateResponder { command, response in
                command.code == .programData ? .status(.dataError) : response
            }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .communicationError(let cause):
                    XCTAssertEqual(cause as? PeripheralError, .badStatus(.dataError))
                default: XCTFail("Incorrect error")
                }
                XCTAssertEqual(self.simulator.commands,
                               [.enterDFU(productId: 0x01020304),
                                .setAppMetadata(appId: 1, address: 0x19000000, length: 0x0001fffc),
                                .programData([0], address: 0x19000000)]
                                + [.syncDFU, .programData([0], address: 0x19000000)].repeated(count: 9)
                                + [.exitDFU])
            }
        }
    }
    
    func testResponseTimeout() throws {
        try saveFile("""
        01002144E221000104030201
        @EIV:0000000000000000
        """)
        async { [self] exp in
            FirmwareUploadDelegate.responseTimeout = 0.2
            simulator.updateResponder { _, _ in nil }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .communicationError(let cause):
                    XCTAssertEqual(cause as? PeripheralError, .timeout(0.2))
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testMissingService() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            scanner.shouldDiscoverServices = false
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .communicationError(let cause): XCTAssertEqual(cause as? PeripheralError, .missingService)
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testMissingCharacteristic() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            scanner.shouldDiscoverCharacteristics = false
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .communicationError(let cause):
                    XCTAssertEqual(cause as? PeripheralError, .missingCharacteristic)
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testSubscriptionFailure() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            simulator.setNotifyError = CBATTError(.invalidHandle)
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .communicationError(let cause):
                    XCTAssertEqual(cause as? CBATTError, CBATTError(.invalidHandle))
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
}

// MARK: File errors

extension FirmwareUploaderTests {
    func testNonExistingFile() throws {
        async { [self] exp in
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .fileReadError: break
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testMalformedFile() throws {
        try saveFile("")
        async { [self] exp in
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .invalidFileError(let cause):
                    XCTAssertEqual(cause as? Cyacd2Error, .invalidHeader(""))
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testIncorrectSiliconId() throws {
        try saveFile("01012144E221000104030201")
        async { [self] exp in
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .invalidFileError(let cause):
                    XCTAssertEqual(cause as? Cyacd2Error, .incorrectSilicon)
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
    
    func testIncorrectSiliconRevision() throws {
        try saveFile("01002144E222000104030201")
        async { [self] exp in
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .invalidFileError(let cause):
                    XCTAssertEqual(cause as? Cyacd2Error, .incorrectSilicon)
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
}

// MARK: CRC error

extension FirmwareUploaderTests {
    func testCRCError() throws {
        try saveFile("""
        01002144E221000104030201
        @APPINFO:0x19000000,0x1fffc
        :000000190000000000000000
        """)
        async { [self] exp in
            simulator.updateResponder { command, response in
                command.code == .verifyApp ? .verifyApp(result: false) : response
            }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .crcError: break
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
}

// MARK: Installation error

extension FirmwareUploaderTests {
    func testExitDFUFailure() throws {
        try saveFile("01002144E221000104030201")
        async { [self] exp in
            simulator.updateResponder { [weak self] command, response in
                if command.code == .exitDFU {
                    self?.simulator.writeError = CBATTError(.invalidHandle)
                }
                return response
            }
            central = CBMCentralManagerMock(delegate: scanner, queue: .main)
            completion = expectError(exp) { error in
                switch error {
                case .installationError: break
                default: XCTFail("Incorrect error")
                }
            }
        }
    }
}
