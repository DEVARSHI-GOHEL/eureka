//
//  XCTestCase+current.swift
//  
//
//  Created by Peter Ertl on 03/09/2021.
//

import XCTest

extension XCTestCase {
    private class Observer: NSObject, XCTestObservation {
        var testCase: XCTestCase?
        
        override init() {
            super.init()
            XCTestObservationCenter.shared.addTestObserver(self)
        }
        
        func testCaseWillStart(_ testCase: XCTestCase) {
            self.testCase = testCase
        }
    }
    
    private static var observer: Observer?
    
    static func observe() {
        observer = observer ?? Observer()
    }
    
    static var current: XCTestCase {
        observer!.testCase!
    }
    
    func async(timeout: TimeInterval = 15, task: (XCTestExpectation) -> Void) {
        let exp = expectation(description: "Async task is finished")
        task(exp)
        wait(for: [exp], timeout: timeout)
    }
}
