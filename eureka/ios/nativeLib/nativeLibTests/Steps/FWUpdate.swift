//
//  FWUpdate.swift
//  
//
//  Created by Peter Ertl on 03/09/2021.
//

import XCTest
import CucumberSwift
import CoreBluetoothMock
@testable import nativeLib

var fileURL: URL!
var dfuSimulator: DFUWatchSimulator!
var scanner: TestScanner!
var central: CBMCentralManagerMock!
var result: Result<Void, FirmwareUploadError>!

func setupFWUpdateSteps() {
    XCTestCase.observe()
    FirmwareUploadDelegate.responseTimeout = 0.3
    
    BeforeScenario { _ in
        reset()
    }
    
    AfterScenario { _ in
        CBMCentralManagerMock.tearDownSimulation()
    }
    
    Given("watch in DFU mode is connected") { matches, _ in
        let name = FirmwareUploader.advertisedNameInDFUMode
        dfuSimulator = DFUWatchSimulator(name: name)
        scanner = TestScanner(accepting: { _, adv, _ in
            adv[CBAdvertisementDataLocalNameKey] as? String == name
        })
    }
    
    Given("there is new firmware update file '([\\w\\.]+)'") { matches, _ in
        let words = matches[1].components(separatedBy: ".")
        fileURL = Bundle(for: Cyacd2ParserTests.self).url(forResource: words[0], withExtension: words[1], subdirectory: "Assets")!
    }
    
    Given("there is a problem during firmware upload: '(.+)'") { matches, _ in
        simulateProblem(matches[1])
    }
    
    When("firmware uploader uploads the file") { _, _ in
        performUpload()
    }
    
    Then("firmware uploader shall return '(\\w+)'") { matches, _ in
        XCTAssertEqual(describe(result), matches[1])
    }
    
    Then("firmware update file shall be fully uploaded") { _, _ in
        XCTAssertEqual(dfuSimulator.commands, parseCommands(from: fileURL))
    }
}

func reset() {
    fileURL = nil
    dfuSimulator = nil
    scanner = nil
    central = nil
    result = nil
}

func simulateProblem(_ problem: String) {
    switch problem {
    case "unreadable file": fileURL = tmpFile(withContent: nil)
    case "malformed file": fileURL = tmpFile(withContent: "")
    case "wrong silicon id": fileURL = tmpFile(withContent: "010200000001000101000000")
    case "wrong silicon revision": fileURL = tmpFile(withContent: "010100000002000101000000")
    case "watch not connected": scanner.shouldConnect = false
    case "watch disconnected":
        let spec = dfuSimulator.peripheralSpec
        dfuSimulator.updateResponder { _, response in
            spec.simulateDisconnection(withError: CBError(.notConnected))
            return response
        }
    case "subscription failed": dfuSimulator.setNotifyError = CBATTError(.invalidHandle)
    case "error response": dfuSimulator.updateResponder { _, _ in .status(.dataError) }
    case "response timeout": dfuSimulator.updateResponder { _, _ in nil }
    case "crc check failed":
        dfuSimulator.updateResponder { cmd, res in
            cmd.code == .verifyApp ? .verifyApp(result: false) : res
        }
    case "exit dfu failed":
        dfuSimulator.updateResponder { cmd, res in
            if cmd.code == .exitDFU { dfuSimulator.writeError = CBATTError(.invalidHandle) }
            return res
        }
    default: XCTFail("Missing implementation for: \(problem)")
    }
}

func performUpload() {
    CBMCentralManagerMock.simulatePowerOn()
    CBMCentralManagerMock.simulatePeripherals([dfuSimulator.peripheralSpec])
    XCTestCase.current.async { exp in
        scanner.completion = {
            switch $0 {
            case .success(let peripheral):
                FirmwareUploader.upload(fileURL, to: peripheral) {
                    result = $0
                    exp.fulfill()
                }
            case .failure(let error):
                result = .failure(.communicationError(cause: error))
                exp.fulfill()
                XCTFail("Scan should be successful: \(error.localizedDescription)")
            }
        }
        central = CBMCentralManagerMock(delegate: scanner, queue: .main)
    }
}

func tmpFile(withContent content: String?) -> URL {
    let fileManager = FileManager.default
    let url = fileManager.temporaryDirectory.appendingPathComponent("tmp.cyacd2")
    if let content = content {
        let data = content.data(using: .utf8) ?? Data()
        try? data.write(to: url)
    } else {
        if fileManager.fileExists(atPath: url.path) {
            try? fileManager.removeItem(at: url)
        }
    }
    return url
}

func describe(_ result: Result<Void, FirmwareUploadError>) -> String {
    switch result {
    case nil: return "nil"
    case .success: return "success"
    case .failure(let error):
        switch error {
        case .fileReadError: return "fileReadError"
        case .invalidFileError: return "invalidFileError"
        case .connectionError: return "connectionError"
        case .communicationError: return "communicationError"
        case .crcError: return "crcError"
        case .installationError: return "installationError"
        }
    }
}

func parseCommands(from url: URL) -> [Command] {
    guard let data = try? Data(contentsOf: fileURL),
          let file = try? Cyacd2Parser().parse(data) else {
        XCTFail("Failed to parse \(fileURL!)")
        return []
    }
    return [.enterDFU(productId: 1)] + file.entries.map {
        switch $0 {
        case let .appInfo(address, length):
            return .setAppMetadata(appId: file.appId, address: address, length: length)
        case let .eiv(vector): return .setEIV(vector)
        case let .dataRow(address, data): return .programData(data, address: address)
        }
    } + [.verifyApp(id: file.appId), .exitDFU]
}
