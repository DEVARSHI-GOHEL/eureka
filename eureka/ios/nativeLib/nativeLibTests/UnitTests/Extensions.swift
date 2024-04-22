//
//  Extensions.swift
//  
//
//  Created by Peter Ertl on 27/08/2021.
//

import XCTest

extension XCTestCase {
    func measure<T>(_ title: String, block: () throws -> T) rethrows -> T {
        let startTime = Date()
        let result = try block()
        let totalTime = Date().timeIntervalSince(startTime)
        let formatter = NumberFormatter()
        formatter.maximumFractionDigits = 3
        print("\(title): \(formatter.string(for: totalTime) ?? "?") s")
        return result
    }
    
    func wait(_ timeout: TimeInterval) {
        async("Wait \(timeout)s", timeout: timeout + 0.5) { exp in
            Timer.scheduledTimer(withTimeInterval: timeout, repeats: false) { _ in
                exp.fulfill()
            }
        }
    }
    
    func async(_ description: String = "Async task", timeout: TimeInterval = 15, task: (XCTestExpectation) -> Void ) {
        let exp = expectation(description: description)
        task(exp)
        wait(for: [exp], timeout: timeout)
    }
}
