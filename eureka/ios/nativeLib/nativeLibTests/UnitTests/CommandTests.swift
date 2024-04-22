//
//  CommandTests.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

import XCTest
@testable import nativeLib

class CommandTests: XCTestCase {
    
    override func setUp() {
        ChecksumType.shared = .checksum
    }
    
    override func tearDown() {
        ChecksumType.shared = .checksum
    }
    
    func testEncodingCommands() {
        XCTAssertEqual(Command(code: .enterDFU, data: [1, 2, 3, 4]).packet,
                       [1, 0x38, 4, 0, 1, 2, 3, 4, 0xB9, 0xFF, 0x17])
        XCTAssertEqual(Command(code: .exitDFU).packet,
                       [1, 0x3B, 0, 0, 0xC4, 0xFF, 0x17])
        ChecksumType.shared = .crc
        XCTAssertEqual(Command(code: .enterDFU, data: [1, 2, 3, 4]).packet,
                       [1, 0x38, 4, 0, 1, 2, 3, 4, 0xDF, 0x89, 0x17])
        XCTAssertEqual(Command(code: .exitDFU).packet,
                       [1, 0x3B, 0, 0, 0x4F, 0x6D, 0x17])
    }
    
    func testCommonCommands() {
        XCTAssertEqual(Command.enterDFU().packet,
                       [1, 0x38, 0, 0, 0xC7, 0xFF, 0x17])
        XCTAssertEqual(Command.enterDFU(productId: 32).packet,
                       [1, 0x38, 4, 0, 0x20, 0, 0, 0, 0xA3, 0xFF, 0x17])
        XCTAssertEqual(Command.sendData([1, 2, 3, 4]).packet,
                       [1, 0x37, 4, 0, 1, 2, 3, 4, 0xBA, 0xFF, 0x17])
        XCTAssertEqual(Command.sendDataWithoutResponse([1, 2, 3, 4]).packet,
                       [1, 0x47, 4, 0, 1, 2, 3, 4, 0xAA, 0xFF, 0x17])
        XCTAssertEqual(Command.programData([1, 2, 3, 4], address: 1111).packet,
                       [1, 0x49, 0x0C, 0, 0x57, 4, 0, 0, 0xF4, 0x8C, 0x30, 0x29, 1, 2, 3, 4, 0x6C, 0xFD, 0x17])
        XCTAssertEqual(Command.verifyData([1, 2, 3, 4], address: 1111).packet,
                       [1, 0x4A, 0x0C, 0, 0x57, 4, 0, 0, 0xF4, 0x8C, 0x30, 0x29, 1, 2, 3, 4, 0x6B, 0xFD, 0x17])
        XCTAssertEqual(Command.eraseData(address: 1024).packet,
                       [1, 0x44, 4, 0, 0, 4, 0, 0, 0xB3, 0xFF, 0x17])
        XCTAssertEqual(Command.setAppMetadata(appId: 1, address: 1024, length: 2048).packet,
                       [1, 0x4C, 9, 0, 1, 0, 4, 0, 0, 0, 8, 0, 0, 0x9D, 0xFF, 0x17])
        XCTAssertEqual(Command.getMetadata(from: 0, to: 256).packet,
                       [1, 0x3C, 4, 0, 0, 0, 0, 1, 0xBE, 0xFF, 0x17])
        XCTAssertEqual(Command.setEIV([1, 2, 3, 4, 5, 6, 7, 8]).packet,
                       [1, 0x4D, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0x86, 0xFF, 0x17])
        XCTAssertEqual(Command.verifyApp(id: 1).packet,
                       [1, 0x31, 1, 0, 1, 0xCC, 0xFF, 0x17])
        XCTAssertEqual(Command.syncDFU.packet,
                       [1, 0x35, 0, 0, 0xCA, 0xFF, 0x17])
        XCTAssertEqual(Command.exitDFU.packet,
                       [1, 0x3B, 0, 0, 0xC4, 0xFF, 0x17])
    }
    
    func testDecodingResponses() {
        XCTAssertEqual(Response(packet: [1, 4, 0, 0, 0xFB, 0xFF, 0x17]),
                       Response(status: .dataError))
        XCTAssertEqual(Response(packet: [1, 0, 4, 0, 1, 2, 3, 4, 0xF1, 0xFF, 0x17]),
                       Response(status: .success, data: [1, 2, 3, 4]))
        ChecksumType.shared = .crc
        XCTAssertEqual(Response(packet: [1, 4, 0, 0, 0x83, 0x04, 0x17]),
                       Response(status: .dataError))
        XCTAssertEqual(Response(packet: [1, 0, 4, 0, 1, 2, 3, 4, 0xD7, 0x2F, 0x17]),
                       Response(status: .success, data: [1, 2, 3, 4]))
    }
    
    func testInvalidResponses() {
        let template: [UInt8] = [1, 0, 4, 0, 1, 2, 3, 4, 0xF1, 0xFF, 0x17]
        XCTAssertNotNil(Response(packet: template))
        
        // packet too small
        var packet = template
        packet.remove(at: 3)
        XCTAssertNil(Response(packet: packet))
        
        // invalid start byte
        packet = template
        packet[0] = 0
        XCTAssertNil(Response(packet: packet))
        
        // invalid end byte
        packet = template
        packet[10] = 0
        XCTAssertNil(Response(packet: packet))
        
        // invalid status
        packet = template
        packet[1] = 0xFE
        XCTAssertNil(Response(packet: packet))
        
        // invalid data length
        packet = template
        packet[2] = 5
        XCTAssertNil(Response(packet: packet))
        
        // invalid checksum
        packet = template
        packet[8] = 0
        XCTAssertNil(Response(packet: packet))
    }
    
    func testCommonResponses() {
        XCTAssertEqual(Response.status(.success).packet,
                       [1, 0, 0, 0, 0xFF, 0xFF, 0x17])
        XCTAssertEqual(Response.status(.dataError, data: [1, 2, 3, 4]).packet,
                       [1, 4, 4, 0, 1, 2, 3, 4, 0xED, 0xFF, 0x17])
        XCTAssertEqual(Response.enterDFU(siliconId: 1, siliconRevision: 2, sdkVersion: [3, 0, 0]).packet,
                       [1, 0, 8, 0, 1, 0, 0, 0, 2, 3, 0, 0, 0xF1, 0xFF, 0x17])
        XCTAssertEqual(Response.verifyApp(result: true).packet,
                       [1, 0, 1, 0, 1, 0xFD, 0xFF, 0x17])
        XCTAssertEqual(Response.verifyApp(status: .checksumError, result: false).packet,
                       [1, 8, 1, 0, 0, 0xF6, 0xFF, 0x17])
        
        XCTAssertEqual(EnterDFUResponse(.enterDFU(siliconId: 1, siliconRevision: 2, sdkVersion: [1, 2, 3])),
                       EnterDFUResponse(siliconId: 1, siliconRevision: 2, sdkVersion: [1, 2, 3]))
        XCTAssertEqual(EnterDFUResponse(.init(data: .init(repeating: 0xFF, count: 8))),
                       EnterDFUResponse(siliconId: UInt32.max, siliconRevision: 255, sdkVersion: [0xFF, 0xFF, 0xFF]))
        for length in 0...16 where length != 8 {
            XCTAssertNil(EnterDFUResponse(Response.init(data: .init(repeating: 1, count: length))))
        }
        
        XCTAssertEqual(VerifyAppResponse(.verifyApp(status: .checksumError, result: false)),
                       VerifyAppResponse(status: .checksumError, result: false))
        XCTAssertEqual(VerifyAppResponse(.status(.success, data: [1])),
                       VerifyAppResponse(status: .success, result: true))
        for length in 0...16 where length != 1 {
            XCTAssertNil(VerifyAppResponse(.init(data: .init(repeating: 1, count: length))))
        }
        for result in 2...UInt8.max {
            XCTAssertNil(VerifyAppResponse(.init(data: [result])))
        }
    }
}
