//
//  MealDataFnUnitTests.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 08.12.2021.
//

import XCTest
@testable import nativeLib

class MealDataFnUnitTests: XCTestCase {
    var emittedEvents: [String] = []
    
    override func setUp() {
        emittedEvents.removeAll()
        let _ = EventEmittersToReact { name, body in
            self.emittedEvents.append("\(name) \(body)".replacingOccurrences(of: "\\", with: ""))
        }
    }
    
    func testParamsWithError() {
        let params = ["error" : NSError(
            domain: "MealTestError",
            code: -1001,
            userInfo: [ NSLocalizedDescriptionKey : "Test error" ]
        )]
        let mealDataFn = ProcessMealDataFn(params, currentProc: BleProcEnum.MEAL_DATA)
        
        let response = mealDataFn.doOperation()
        XCTAssertNil(response)
        XCTAssertEqual(emittedEvents.count, 2)
        XCTAssertTrue(emittedEvents.first!.contains("Unable to read GATT characteristic"))
    }
    
    func testEmptyParams() {
        let params : [String:Any?] = [:]
        let mealDataFn = ProcessMealDataFn(params, currentProc: BleProcEnum.MEAL_DATA)
        
        let response = mealDataFn.doOperation()
        XCTAssertNil(response)
        XCTAssertEqual(emittedEvents.count, 0)
    }
    
    func testEmptyDataParam() {
        let params = ["data" : [] ]
        let mealDataFn = ProcessMealDataFn(params, currentProc: BleProcEnum.MEAL_DATA)
        
        let response = mealDataFn.doOperation()
        XCTAssertNil(response)
        XCTAssertEqual(emittedEvents.count, 0)
    }
    
    func testZeroDataParam() {
        let data = [UInt8](repeating: 0, count: 9)
        let params = ["data" : data ]
        let mealDataFn = ProcessMealDataFn(params, currentProc: BleProcEnum.MEAL_DATA)
        
        let response = mealDataFn.doOperation()
        XCTAssertNotNil(response)
        XCTAssertEqual(emittedEvents.count, 1)
        XCTAssertTrue(emittedEvents.first!.contains("invalid date"))
    }
    
    func testValidDataParam() {
        let year = LpUtility.intToByteArr(pInteger: 2021)
        let data : [UInt8] = [0, 0, year[0], year[1], 12, 31, 15, 45, 59]
        let params = ["data" : data ]
        let mealDataFn = ProcessMealDataFn(params, currentProc: BleProcEnum.MEAL_DATA)
        
        let response = mealDataFn.doOperation()
        XCTAssertNil(response)
        XCTAssertEqual(emittedEvents.count, 3)
        emittedEvents.removeFirst() // Db error
        XCTAssertTrue(emittedEvents.first!.contains("UploadOnCloud"))
    }
}
