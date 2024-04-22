//
//  Ble.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 25.10.2021.
//

import XCTest
import CoreBluetoothMock
@testable import nativeLib

func setupBleSteps() {
    
    Given("watch is already connected") { _, step in
        let central = CBMCentralManagerMock()
        let deviceService = DeviceService(central)
        ServiceFactory.setDeviceService(deviceService: deviceService)
        
        let msn = randomMsn(length: 8)
        deviceName = "LPW2-\(msn)"
        simulator = WatchSimulator(
            name: deviceName,
            tiny: step.scenario?.containsTags(["TinyWatch"]) ?? false,
            noReferenceChar: step.scenario?.containsTags(["NoReferenceChar"]) ?? false
        )
        CBMCentralManagerMock.simulatePeripherals([simulator.peripheralSpec])
        CBMCentralManagerMock.simulatePowerOn()
        
        if !wait(for: { central.state == .poweredOn }, with: 5.0) {
            XCTFail("Central powerOn timeout")
        }
        
        peripheral = central.retrievePeripherals(withIdentifiers: [simulator.peripheralSpec.identifier]).first
        deviceService.currentDevice = Device(id: msn, name: deviceName, services: [], peripheral: peripheral)
        central.connect(peripheral!, options: [:])
        if !wait(for: { peripheral?.state == .connected }, with: 2.0) {
            XCTFail("Peripheral connect timeout")
        }
    }

    Given("services and characteristics already discovered") { _, _ in
        peripheral?.discoverServices(nil)
        if !wait(for: { peripheral?.services?.count ?? 0 > 0 }, with: 2.0) {
            XCTFail("Services discovery timeout")
        }
        
        peripheral?.services?.forEach({ service in
            peripheral?.discoverCharacteristics(nil, for: service)
        })
        if !wait(for: { simulator.discoveredServices.count == peripheral?.services?.count ?? 0 }, with: 2.0) {
            XCTFail("Services and characteristics discovery timeout, found \(simulator.discoveredServices.count)")
        }
        peripheral?.services?.forEach({ service in
            wait(0.15 * Double(service.characteristics?.count ?? 0))
        })
        peripheral?.delegate = ServiceFactory.getDeviceService() as? DeviceService
    }
    
    Given("app is busy with '(.+)'") { matches, _ in
        let process = BleProcEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        DeviceService.setCurrentProc(pCurrentProc: process!)
    }
    
    Given("notify set for '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        let char = peripheral?.services?.map({ s in
            s.characteristics?.first(where: { c in
                c.uuid.uuidString == charItem!.code
            })
        }).first(where: { $0 != nil })
        peripheral?.setNotifyValue(true, for: char!!)
        wait(0.5)
    }
    
    Given("has failure to read '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        simulator.readErrorChars.append(charItem!.code)
    }
    
    Given("has failure to write '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        simulator.writeErrorChars.append(charItem!.code)
    }
    
    Given("has failure to enable indications for '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        simulator.notifyErrorChars.append(charItem!.code)
    }
    
    Given("scan timeout is (\\d+) ms") { matches, _ in
        bleModule.scanTimeout = Double(matches[1])! / 1000
    }
    
    Given("watch has connection failure") { _, _ in
        simulateConnectError = true
    }
    
    When("app reads '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        let char = peripheral?.services?.map({ s in
            s.characteristics?.first(where: { c in
                c.uuid.uuidString == charItem!.code
            })
        }).first(where: { $0 != nil })
        peripheral?.readValue(for: char!!)
        wait(0.5)
    }
    
    When("app writes (\\d+) to '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[2] == String(describing: item)
        }
        let char = peripheral?.services?.map({ s in
            s.characteristics?.first(where: { c in
                c.uuid.uuidString == charItem!.code
            })
        }).first(where: { $0 != nil })
        peripheral?.writeValue(Data([UInt8(matches[1])!]), for: char!!, type: CBMCharacteristicWriteType.withResponse)
        wait(0.5)
    }
    
    When("app tries to enable indications on '(.+)' characteristic") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        let char = peripheral?.services?.map({ s in
            s.characteristics?.first(where: { c in
                c.uuid.uuidString == charItem!.code
            })
        }).first(where: { $0 != nil })
        peripheral?.setNotifyValue(true, for: char!!)
        wait(0.5)
    }
  
    When("app requests connect to watch with MSN '(\\w+)'") { matches, _ in
        deviceName = "LPW2-\(matches[1])"
        
        if Global.getUserId() != 3008 {
            let central = CBMCentralManagerMock()
            ServiceFactory.setDeviceService(deviceService: DeviceService(central))
        
            Global.setUserId(pUserId: 3008)
            try! DbAccess.addTestUser(userId: 3008, stepGoal: 8000)
        }
        
        let request = "{\"userId\":\"3008\",\"AuthenticationId\":\"\(matches[1])\"}"
        lastResponse = bleModule.deviceConnect(request)
    }
    
    When("watch was found") { _, _ in
        simulator = WatchSimulator(name: deviceName)
        simulator.simulateConnectError = simulateConnectError
        CBMCentralManagerMock.simulatePeripherals([simulator.peripheralSpec])
        
        CBMCentralManagerMock.simulatePowerOn()
    }
    
    When("watch was not found") { _, _ in
        simulator = WatchSimulator(name: randomMsn(length: 8))
        CBMCentralManagerMock.simulatePeripherals([simulator.peripheralSpec])
        
        CBMCentralManagerMock.simulatePowerOn()
    }
    
    When("watch has (\\d+) records of vital data") { matches, _ in
        vitalData.append(Data([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
        for i in 1...Int(matches[1])! {
            vitalData.append(Data([0, 70, 0, 15, 0, 85, 0, 120, 0, 90, 0, 60, 0, 229, 7, 12, 10, 5, 15, UInt8(i)]))
        }
    }
    
    When("watch has (\\d+) records of meal data") { matches, _ in
        mealData.append(Data([0, 0, 0, 0, 0, 0, 0, 0, 0]))
        for i in 1...Int(matches[1])! {
            mealData.append(Data([0, 0, 229, 7, 12, 10, 5, 15, UInt8(i)]))
        }
    }
    
    When("app requests disconnect from the watch") { _, _ in
        lastResponse = bleModule.disconnect()
        wait(0.5)
    }
    
    When("app requests start instant measure") { _, _ in
        lastResponse = bleModule.startInstantMeasure()
    }
    
    When("watch updates '(.+)' characteristic value to (\\d+)") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        if charItem == .STATUS {
            let char = customService.characteristics?.first(where: { c in
                c.uuid.uuidString == charItem!.code
            }) as? CBMCharacteristicMock
            simulator.peripheralSpec.simulateValueUpdate(Data(repeating: UInt8(matches[2])!, count: 1), for: char!)
            wait(0.5)
        }
    }

    When("app requests app sync write with '(.+)' params") { matches, step in
        Global.setUserId(pUserId: 123)
        try? DbAccess.addTestUser(userId: Global.getUserId())
        
        if matches[1] == "valid" {
            let settings = try! DbAccess.getAppSyncFor(userId: Global.getUserId())
            let row = step.dataTable!.rows[1]
            settings.setHeight_ft(pHeight_ft: Int(row[0])!)
            settings.setHeight_in(pHeight_in: Int(row[1])!)
            settings.setWeight(pWeight: Float(row[2])!)
            settings.setWeightUnit(pWeightUnit: "MKS")
            settings.setEthnicity(pEthnicity: Int(row[3])!)
            settings.setGender(pGender: row[4])
            settings.setSkinTone(pSkinTone: Int(row[5]))
            try! DbAccess.updateAppSync(pUserId: Global.getUserId(), pAppSync: settings)
        }
        let request = matches[1] == "json" ? "-" : createAppSyncRequest(matches[1])
        lastResponse = bleModule.appSync(request)
    }
    
    When("app requests calibration with '(.+)' params") { matches, _ in
        let request = matches[1] == "json" ? "-" : createCalibrationRequest(matches[1])
        lastResponse = bleModule.calibrate(request)
    }
    
    When("app requests start calibration with params") { _, step in
        let row = step.dataTable!.rows[1]
        let hr = row[0]
        let rr = row[1]
        let spo2 = row[2]
        let glucose = row[3]
        let sbp = row[4]
        let dbp = row[5]
        let request = createCalibrationRequest(spo2: spo2, rr: rr, hr: hr, sbp: sbp, dbp: dbp, glucose: glucose)
        lastResponse = bleModule.calibrate(request)
    }
    
    When("app requests to update daily step goal") { _, _ in
        lastResponse = bleModule.updateDailyStepGoal()
    }
    
    When("app requests to initiate DFU mode") { _, _ in
        peripheral?.delegate = ServiceFactory.getDeviceService() as? DeviceService
        lastResponse = bleModule.startDfuMode()
    }
    
    When("raw data count is (\\d+)") { matches, _ in
        let count = Int(matches[1])!
        while (MeasureProcess.rawDataCount() < count) {
            MeasureProcess.appendRawData(pRawRow: [0])
        }
    }
    
    Then("BLE scan shall be started") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(lastResponse!.contains("\"result\":\"198\""))
        XCTAssertTrue(lastResponse!.contains("\"message\":\"Request is being processed (Device connection)\""))
    }
    
    Then("BLE scan shall not be started") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertFalse(lastResponse!.contains("\"result\":\"198\""))
        XCTAssertTrue(lastResponse!.contains("\"result\":\"013\""))
        XCTAssertTrue(lastResponse!.contains("\"message\":\"Other process is running (\(DeviceService.currentProc.desc))\""))
    }
    
    Then("event with message '(\\d+)' - '(.+)' should be emitted to the app") { matches, _ in
        if !wait(for: { emittedEvents.count > 0 }, with: 5.0) {
            if emittedEvents.isEmpty {
                XCTFail("Emitted event \(matches[1]) timeout")
            }
            return
        }
        
        let event = emittedEvents.removeFirst()
        XCTAssertTrue(event.contains("\"result\":\"\(matches[1])\""), "Expected \(matches[1]), but found \(event)")
        XCTAssertTrue(event.contains("\"message\":\"\(matches[2])\""), "Expected \(matches[2]), but found \(event)")
    }
    
    Then("watch shall be connected") { _, _ in
        if !wait(for: { simulator.connected }, with: 5.0) {
            XCTFail("Connect timeout")
        }
        
        XCTAssertTrue(simulator.connected)
        
        XCTAssertTrue(Global.getWatchMSNForScan().isEmpty)
        XCTAssertTrue(!Global.getWatchMSN().isEmpty)
    }
    
    Then("services and characteristics shall be discovered") { _, _ in
        let expected = simulator.peripheralSpec.services!.count
        if !wait(for: { simulator.discoveredServices.count == expected }, with: 20.0) {
            if simulator.discoveredServices.count != 2 {
                XCTFail("Services discovery timeout, found \(simulator.discoveredServices.count)")
            }
        }
        
        XCTAssertTrue(simulator.discoveredServices.count == expected)
    }
    
    Then("notify should be set for '(.+)' characteristic") { matches, _ in
        if !wait(for: { !simulator.notifiedChars.isEmpty }, with: 5.0) {
            XCTFail("Characteristic set notify timeout")
        }
        
        let char = simulator.notifiedChars.removeFirst()
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        
        XCTAssertTrue(char.uuid.uuidString == charItem!.code)
    }
    
    Then("watch shall receive current time") { _, _ in
        XCTAssertTrue(simulator.timeSet)
    }
    
    Then("watch shall receive time zone") { _, _ in
        XCTAssertTrue(simulator.timeZoneSet)
    }
    
    Then("watch shall receive step goal") { _, _ in
        XCTAssertTrue(simulator.stepGoalSet)
    }
    
    Then("watch shall receive command '(.+)' on command characteristic") { matches, _ in
        if !wait(for: { !simulator.processedCommands.isEmpty }, with: 5.0) {
            XCTFail("Command recieve timeout")
        }
        
        let cmd = simulator.processedCommands.removeFirst()
        if matches[1] == "GET_STEP_COUNTER_*" {
            let stepCommands: [BleCommandEnum] = [.GET_STEP_COUNTER_SUN, .GET_STEP_COUNTER_MON, .GET_STEP_COUNTER_TUE, .GET_STEP_COUNTER_WED, .GET_STEP_COUNTER_THU, .GET_STEP_COUNTER_FRI, .GET_STEP_COUNTER_SAT]
            XCTAssertTrue(stepCommands.contains(where: { $0.command == cmd }), "Expected GET_STEP_COUNTER_*, but found \(cmd)")
        } else {
            let cmdItem = BleCommandEnum.allCases.first { item in
                matches[1] == String(describing: item)
            }
            
            XCTAssertTrue(cmd == cmdItem!.command, "Expected \(cmdItem!.command), but found \(cmd)")
        }
    }
    
    Then("characteristic '(.+)' value should be read") { matches, _ in
        if !wait(for: { !simulator.readChars.isEmpty }, with: 5.0) {
            XCTFail("Characteristic read timeout")
            return
        }
        
        let char = simulator.readChars.removeFirst()
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        
        XCTAssertTrue(char.uuid.uuidString == charItem!.code, "Expected \(charItem!.code), but found \(char.uuid.uuidString)")
    }
    
    Then("characteristic '(.+)' value should be written") { matches, _ in
        if !wait(for: { !simulator.writtenChars.isEmpty }, with: 5.0) {
            XCTFail("Characteristic write timeout")
            return
        }
        
        let char = simulator.writtenChars.removeFirst().0
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        
        XCTAssertTrue(char.uuid.uuidString == charItem!.code, "Expected \(charItem!.code), but found \(char.uuid.uuidString)")
    }
    
    Then("characteristic '(.+)' should be written with value '(.+)'") { matches, _ in
        if !wait(for: { !simulator.writtenChars.isEmpty }, with: 5.0) {
            XCTFail("Characteristic write timeout")
            return
        }
        
        let (char, data) = simulator.writtenChars.removeFirst()
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        XCTAssertTrue(char.uuid.uuidString == charItem!.code.uppercased(), "Expected \(charItem!.code.uppercased()), but found \(char.uuid.uuidString)")
        
        matches[2].split(separator: ",").enumerated().forEach { (index, value) in
            if value != "." {
                XCTAssertTrue(Int(value)! == data[index], "Expected \(value) at \(index), but found \(data[index])")
            }
        }
    }
    
    Then("characteristic '(.+)' should not be written") { matches, _ in
        let charItem = GattCharEnum.allCases.first { item in
            matches[1] == String(describing: item)
        }
        
        XCTAssertFalse(
            simulator.writtenChars.contains { char, _ in
            char.uuid.uuidString == charItem!.code
            }
        )
    }
    
    Then("watch shall not receive any command on command characteristic") { _, _ in
        wait(2.0)
        
        XCTAssertTrue(simulator.processedCommands.isEmpty)
    }
    
    Then("watch shall disconnect") { _, _ in
        XCTAssertNil(lastResponse)
        XCTAssertFalse(simulator.connected)
    }
    
    Then("watch shall not disconnect") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(simulator.connected)
    }
    
    Then("instant measure shall start") { _, _ in
        XCTAssertTrue(MeasureProcess.currentProcState != .NONE)
    }
    
    Then("instant measure shall not start") { _, _ in
        wait(1.0)
        XCTAssertTrue(MeasureProcess.currentProcState == .NONE)
    }
    
    Then("app sync response shall start") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertFalse(
            lastResponse!.contains("\"status\":\"failed\"") ||
            lastResponse!.contains("\"result\":\"004\"") ||
            lastResponse!.contains("\"result\":\"011\"") ||
            lastResponse!.contains("\"result\":\"013\"") ||
            lastResponse!.contains("\"result\":\"202\"") ||
            lastResponse!.contains("\"result\":\"203\"") ||
            lastResponse!.contains("\"result\":\"204\"") ||
            lastResponse!.contains("\"result\":\"205\"") ||
            lastResponse!.contains("\"result\":\"206\"") ||
            lastResponse!.contains("\"result\":\"207\"") ||
            lastResponse!.contains("\"result\":\"209\"") ||
            lastResponse!.contains("\"result\":\"210\"") ||
            lastResponse!.contains("\"result\":\"211\"") ||
            lastResponse!.contains("\"result\":\"212\"")
        )
    }
    
    Then("app sync response shall not start") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(
            lastResponse!.contains("\"status\":\"failed\"") ||
            lastResponse!.contains("\"result\":\"004\"") ||
            lastResponse!.contains("\"result\":\"011\"") ||
            lastResponse!.contains("\"result\":\"013\"") ||
            lastResponse!.contains("\"result\":\"202\"") ||
            lastResponse!.contains("\"result\":\"203\"") ||
            lastResponse!.contains("\"result\":\"204\"") ||
            lastResponse!.contains("\"result\":\"205\"") ||
            lastResponse!.contains("\"result\":\"206\"") ||
            lastResponse!.contains("\"result\":\"207\"") ||
            lastResponse!.contains("\"result\":\"209\"") ||
            lastResponse!.contains("\"result\":\"210\"") ||
            lastResponse!.contains("\"result\":\"211\"") ||
            lastResponse!.contains("\"result\":\"212\"")
        )
    }
    
    Then("calibration shall start") { _, _ in
        XCTAssertNil(lastResponse)
    }
    
    Then("calibration shall not start") { _, _ in
        XCTAssertNotNil(lastResponse)
    }
    
    Then("response shall contain error '(.+)' - '(.+)'") { matches, _ in
        XCTAssertTrue(lastResponse!.contains("\"result\":\"\(matches[1])\""))
        XCTAssertTrue(lastResponse!.contains("\"message\":\"\(matches[2]) (\(DeviceService.currentProc.desc))\""))
    }
    
    Then("update daily step goal shall not start") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertFalse(lastResponse!.contains("\"result\":\"521\""))
    }
    
    Then("DFU mode shall start") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(lastResponse!.contains("\"result\":\"510\""))
    }
    
    Then("DFU mode shall not start") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertFalse(lastResponse!.contains("\"result\":\"510\""))
    }
    
}
