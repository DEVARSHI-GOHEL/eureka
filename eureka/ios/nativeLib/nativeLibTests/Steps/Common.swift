//
//  Steps.swift
//
//
//  Created by Peter Ertl on 03/09/2021.
//

import XCTest
import CucumberSwift
import CoreBluetoothMock
@testable import nativeLib
import GRDB

var dbModule: DbModule!
var bleModule: BleModule!
var deviceName = ""
var simulator: WatchSimulator!
var simulateConnectError = false
var lastResponse: String? = nil
var peripheral: CBMPeripheral? = nil

var vitalData: [Data] = []
var mealData: [Data] = []
let stepCounterData = Data([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

var emittedEvents: [String] = []
var queries: [String] = []
var lastError: NSError? = nil

func setup() {
    XCTestCase.observe()
  
    BeforeScenario { _ in
        DbAccess.keyService = TestKeyService()
        DbAccess.createDB()
        DeviceService.setCurrentProc(pCurrentProc: .NONE)
        DeviceService.resetProcessState()
        MeasureProcess.resetProcessState()
        MeasureProcess.clearRawData()
        StatusReadEvent.reset()
        Global.setUserId(pUserId: 0)
        bleModule = nil
        deviceName = ""
        simulator = nil
        simulateConnectError = false
        lastResponse = nil
        peripheral = nil
        lastError = nil
    }
  
    AfterScenario { _ in
        CBMCentralManagerMock.tearDownSimulation()
        do {
            try DbAccess.queue.erase()
        } catch {
            print("error erasing db: \(error)")
        }
    }
    
    BeforeStep { step in
        XCTAssert(step.canExecute, "Cannot execute step \"\(step.keyword.toString()) \(step.match)\"")
    }
  
    Given("app creates native module") { _, _ in
        ErrorLogger.errorProvider = { error in
            lastError = error
        }
        
        dbModule = DbModule()
        
        let _ = EventEmittersToReact { name, body in
            if ["PercentStatus", "DebugLog", "UploadOnCloud"].filter({ $0 == name }).isEmpty {
                emittedEvents.append("\(name) \(body)".replacingOccurrences(of: "\\", with: ""))
            }
        }
        bleModule = BleModule()
    }
    
    Given("user with step goal (\\d+) is logged in") { matches, _ in
        let stepGoal = Int(matches[1])
        let userId = 3008
        try! DbAccess.addTestUser(userId: userId, stepGoal: stepGoal!)
        Global.setUserId(pUserId: userId)
    }
    
    When("app reports API error with type '(.+)', url '(.+)', data '(.+)', options '(.+)' and status (\\d+)") { matches, _ in
        let requestInfo: [String: Any] = ["type": matches[1], "url": matches[2], "data": matches[3], "options": matches[4], "status": Int(matches[5])!]
        ErrorLogger.shared.apiError(userInfo: requestInfo)
    }
    
    Then("app shall report '(.+)' error") { matches, _ in
        XCTAssertNotNil(lastError)
        XCTAssertTrue(lastError!.domain == matches[1])
    }
    
    Then("app shall not report any error") { matches, _ in
        XCTAssertNil(lastError)
    }
    
    Then("error shall contain key '(.+)' with value '(.+)'") { matches, _ in
        let value = lastError!.userInfo[matches[1]] as? String
        XCTAssertNotNil(value)
        XCTAssertTrue(value == matches[2] || value!.contains(matches[2]), "Expected \(matches[2]), but found \(value!)")
    }
    
    Then("error shall contain key '(.+)' with value (\\d+)") { matches, _ in
        let value = lastError!.userInfo[matches[1]] as? Int
        XCTAssertNotNil(value)
        let expectedValue = Int(matches[2])!
        XCTAssertTrue(value == expectedValue, "Expected \(matches[2]), but found \(value!)")
    }
    
    Then("app shall receive response '(.+)' - '(.+)'") { matches, _ in
        XCTAssertTrue(lastResponse!.contains("\"result\":\"\(matches[1])\""))
        XCTAssertTrue(lastResponse!.contains("\"message\":\"\(matches[2])\""))
    }
    
    setupBleSteps()
    
    setupDbSteps()
    
    setupFWUpdateSteps()
}

func randomMsn(length: Int) -> String {
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return String((0..<length).map{ _ in letters.randomElement()! })
}

private class TestKeyService: KeyService {
    func getKey() -> Data {
        return Data(count: 16)
    }
}
