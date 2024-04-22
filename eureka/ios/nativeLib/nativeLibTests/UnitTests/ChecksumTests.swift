//
//  ChecksumTests.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

import XCTest
@testable import nativeLib

class ChecksumTests: XCTestCase {
    
    let inputs: [[UInt8]] = [
        .init(repeating: 0, count: 32),
        .init(repeating: 100, count: 32),
        .init(repeating: 0xFF, count: 32),
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
        [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
        [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
        [0, 20, 40, 60, 80, 100, 120, 140, 160, 180]
    ]
    
    let checksums: [UInt16] = [
        0,
        62336,
        57376,
        65491,
        65491,
        65491,
        65311,
        65086,
        64636
    ]
    
    let crc16s: [UInt16] = [
        28877,
        27275,
        20960,
        57903,
        17709,
        13392,
        55055,
        9914,
        54745
    ]
    
    let crc32s: [UInt32] = [
        2324772522,
        3688958618,
        1655221059,
        36446513,
        3673336463,
        1505947201,
        3876539520,
        3933768125,
        4036428743
    ]
    
    func testChecksum() {
        XCTAssertEqual(inputs.count, checksums.count)
        for (input, checksum) in zip(inputs, checksums) {
            XCTAssertEqual(input.checksum16, checksum)
        }
    }
    
    func testCRC16() {
        XCTAssertEqual(inputs.count, crc16s.count)
        for (input, crc) in zip(inputs, crc16s) {
            XCTAssertEqual(input.crc16, crc)
        }
    }
    
    func testCRC32() {
        XCTAssertEqual(inputs.count, crc32s.count)
        for (input, crc) in zip(inputs, crc32s) {
            XCTAssertEqual(input.crc32, crc)
        }
    }
    
    func testHexConversion() {
        let data = Array(UInt8.fullRange)
        let hexString = data.map { String(format: "%02X", $0) }.joined()
        XCTAssertEqual([UInt8](hexString: hexString), data)
        XCTAssertEqual([UInt8](hexString: data.hexString), data)
        XCTAssertEqual(data.hexString, hexString)
        XCTAssertEqual([UInt8](hexString: hexString)?.hexString, hexString)
        
        XCTAssertEqual([UInt8](hexString: ""), [])
        XCTAssertEqual([UInt8]().hexString, "")
        
        for invalidHexString in ["0", "z0", "á0", "🙂0"] {
            XCTAssertNil(Data(hexString: invalidHexString))
        }
        
        for (string, value) in [("01020304", 0x04030201), ("AABBCCDD", 0xDDCCBBAA)] {
            let data = string.data(using: .ascii)!
            XCTAssertEqual(UInt32(littleEndianHexString: data), UInt32(value))
        }
    }
}
