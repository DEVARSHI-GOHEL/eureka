//
//  VitalDataFnUnitTests.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 08.12.2021.
//

import XCTest
@testable import nativeLib

class VitalDataFnUnitTests: XCTestCase {
    var emittedEvents: [String] = []
    
    override func setUp() {
        emittedEvents.removeAll()
        let _ = EventEmittersToReact { name, body in
            self.emittedEvents.append("\(name) \(body)".replacingOccurrences(of: "\\", with: ""))
        }
    }
    
    func testParamsWithError() {
        let params = ["error" : NSError(
            domain: "VitalTestError",
            code: -1001,
            userInfo: [ NSLocalizedDescriptionKey : "Test error" ]
        )]
        let vitalDataFn = ProcessVitalDataFn(params, currentProc: BleProcEnum.NONE)
        
        _ = vitalDataFn.doOperation()
        XCTAssertEqual(emittedEvents.count, 2)
        XCTAssertTrue(emittedEvents.first!.contains("Unable to read GATT characteristic"))
    }
    
    func testEmptyParams() {
        let params : [String:Any?] = [:]
        let vitalDataFn = ProcessVitalDataFn(params, currentProc: BleProcEnum.NONE)
        
        _ = vitalDataFn.doOperation()
        XCTAssertEqual(emittedEvents.count, 0)
    }
    
    func testEmptyDataParam() {
        let params = ["data" : [] ]
        let vitalDataFn = ProcessVitalDataFn(params, currentProc: BleProcEnum.NONE)
        
        _ = vitalDataFn.doOperation()
        XCTAssertEqual(emittedEvents.count, 0)
    }
    
    func testZeroDataParam() {
        let data = [UInt8](repeating: 0, count: 20)
        let params = ["data" : data ]
        let vitalDataFn = ProcessVitalDataFn(params, currentProc: BleProcEnum.NONE)
        
        _ = vitalDataFn.doOperation()
        XCTAssertEqual(emittedEvents.count, 0)
    }
    
    func testValidDataParam() {
        let year = LpUtility.intToByteArr(pInteger: 2021)
        let data : [UInt8] = [UInt8](repeating: 0, count: 13) + [year[0], year[1], 12, 31, 15, 45, 59]
        let params = ["data" : data ]
        let vitalDataFn = ProcessVitalDataFn(params, currentProc: BleProcEnum.NONE)
        
        _ = vitalDataFn.doOperation()
        XCTAssertEqual(emittedEvents.count, 1)
        XCTAssertTrue(emittedEvents.first!.contains("data NOT added to the database"))
        
        // TODO: fix the test to pass DB insert by DbAccess mock
//        XCTAssertEqual(emittedEvents.count, 3)
//        emittedEvents.removeFirst() // Db error
//        XCTAssertTrue(emittedEvents.first!.contains("UploadOnCloud"))
    }
}
