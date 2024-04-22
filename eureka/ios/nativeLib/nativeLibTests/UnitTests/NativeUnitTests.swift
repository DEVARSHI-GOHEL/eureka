//
//  NativeUnitTests.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 25.10.2021.
//

import XCTest
@testable import nativeLib

class NativeUnitTests: XCTestCase {
    
    func testBleModule() throws {
        let bleModule = BleModule()
        XCTAssertEqual(bleModule.scanTimeout, 7.0)
    }
}

