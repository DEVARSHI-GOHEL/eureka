//
//  Cyacd2ParserTests.swift
//  
//
//  Created by Peter Ertl on 24/08/2021.
//

import XCTest
@testable import nativeLib

class Cyacd2ParserTests: XCTestCase {
    let parser = Cyacd2Parser()
    
    func testSimpleFile() throws {
        let data = """
        01002144E221000104030201
        @APPINFO:0x19000000,0x1fffc
        @EIV:0102030405060708
        :0000001901020304
        :0000001A05060708
        :0000001B
        """.data(using: .ascii)!
        let parsedFile = try parser.parse(data)
        let expectedFile = Cyacd2File(version: 1,
                                      siliconId: 0xE2442100,
                                      siliconRevision: 0x21,
                                      checksumType: .checksum,
                                      appId: 1,
                                      productId: 0x01020304,
                                      entries: [
                                        .appInfo(address: 0x19000000, length: 0x0001fffc),
                                        .eiv([1, 2, 3, 4, 5, 6, 7, 8]),
                                        .dataRow(address: 0x19000000, data: [1, 2, 3, 4]),
                                        .dataRow(address: 0x1A000000, data: [5, 6, 7, 8]),
                                        .dataRow(address: 0x1B000000, data: [])
                                      ])
        XCTAssertEqual(parsedFile, expectedFile)
    }
    
    func testRealFile() throws {
        let url = Bundle(for: Cyacd2ParserTests.self).url(forResource: "fwupdate", withExtension: "cyacd2", subdirectory: "Assets")!
        let data = try Data(contentsOf: url)
        let file = try measure("fwupdate.cyacd2") {
            try parser.parse(data, options: .parallel)
        }
        let expectedFile = Cyacd2File(version: 1,
                                      siliconId: 0xE2442100,
                                      siliconRevision: 0x21,
                                      checksumType: .checksum,
                                      appId: 1,
                                      productId: 0x01020304,
                                      entries: file.entries)
        XCTAssertEqual(file, expectedFile)
        XCTAssertEqual(file.entries.count, 15822)
        XCTAssertEqual(file.entries.first, .appInfo(address: 0x19000000, length: 0x0001fffc))
        switch file.entries[1] {
        case let .dataRow(address, data):
            XCTAssertEqual(address, 0x19000000)
            XCTAssert(data.starts(with: [0, 0x40, 2, 8, 0x23, 1, 0, 0x19, 0x0D, 0, 0, 0, 0x85, 1, 0, 0x19]))
        default: XCTFail("Expecting a data row")
        }
    }
    
    func testParsingHeader() throws {
        let template = "01002144E221000104030201".data(using: .ascii)!
        XCTAssertEqual(try parser.parse(template),
                       .init(version: 1,
                             siliconId: 0xE2442100,
                             siliconRevision: 0x21,
                             checksumType: .checksum,
                             appId: 1,
                             productId: 0x01020304,
                             entries: []))
        
        let invalidBytes = UInt8.fullRange.filter {
            $0.hexDigitValue == nil && !$0.isInvisibleAscii
        }
        for invalidByte in invalidBytes {
            var header = template
            header[header.count - 1] = invalidByte
            XCTAssertThrowsError(try parser.parse(header)) { error in
                XCTAssertEqual(error as? Cyacd2Error, .invalidHeader(String(data: header, encoding: .ascii)!))
            }
        }
        
        for invalidLength in 0 ..< 48 where invalidLength != 24 {
            let header = (template + template).prefix(invalidLength)
            XCTAssertThrowsError(try parser.parse(header)) { error in
                XCTAssertEqual(error as? Cyacd2Error, .invalidHeader(String(data: header, encoding: .ascii)!))
            }
        }
        
        for invalidChecksumType in UInt8.fullRange where ChecksumType(rawValue: invalidChecksumType) == nil {
            var header = template
            header[12...13] = String(format: "%02X", invalidChecksumType).data(using: .ascii)!
            XCTAssertThrowsError(try parser.parse(header)) { error in
                XCTAssertEqual(error as? Cyacd2Error, .invalidChecksumType(invalidChecksumType))
            }
        }
    }
    
    func testParsingAppInfo() throws {
        let validLines = [
            "@APPINFO:0x19000000,0x1fffc",
            "@APPINFO:0x19000000,0x0001fffc",
            "@APPINFO:19000000,1fffc",
            "@APPINFO:19000000,0001fffc"
        ]
        
        let invalidLines = [
            "@APPINF:0x19000000,0x1fffc",
            "APPINFO:0x19000000,0x1fffc",
            "@APPINFO0x19000000,0x1fffc",
            "@APPINFO:0x190000000x1fffc",
            "@APPINFO:0X19000000,0X1fffc",
            "@APPINFO:x19000000,x1fffc",
            "@APPINFO:0x0119000000,0x010001fffc",
            "@APPINFO:0x1900000z,0x1fffc"
        ]
        
        for line in validLines {
            let data = "01002144E221000104030201\n\(line)\n".data(using: .ascii)!
            let file = try parser.parse(data)
            XCTAssertEqual(file.entries.first, .appInfo(address: 0x19000000, length: 0x0001fffc))
        }
        
        for line in invalidLines {
            let data = "01002144E221000104030201\n\(line)\n".data(using: .utf8)!
            XCTAssertThrowsError(try parser.parse(data)) { error in
                XCTAssertEqual(error as? Cyacd2Error,
                               line.hasPrefix("@APPINFO:") ? .invalidAppInfo(line) : .invalidLine(line))
            }
        }
        
        let data = "01002144E221000104030201\n@APPINFO:0x,0x".data(using: .ascii)!
        let file = try parser.parse(data)
        XCTAssertEqual(file.entries.first, .appInfo(address: 0, length: 0))
    }
    
    func testParsingEIV() throws {
        let data = "01002144E221000104030201\n@EIV:0102030405060708\n".data(using: .ascii)!
        let file = try parser.parse(data)
        XCTAssertEqual(file.entries.first, .eiv([1, 2, 3, 4, 5, 6, 7, 8]))
        
        let invalidLines = [
            "EIV:0102030405060708",
            "@EI:0102030405060708",
            "@EIV0102030405060708",
            "@EIV:01020304050607080",
            "@EIV:010203040506070z"
        ]
        
        for line in invalidLines {
            let data = "01002144E221000104030201\n\(line)\n".data(using: .utf8)!
            XCTAssertThrowsError(try parser.parse(data)) { error in
                XCTAssertEqual(error as? Cyacd2Error,
                               line.hasPrefix("@EIV:") ? .invalidEIV(line) : .invalidLine(line))
            }
        }
    }
    
    func testParsingDataRows() throws {
        let data = "01002144E221000104030201\n:0000001901020304\n".data(using: .ascii)!
        let file = try parser.parse(data)
        XCTAssertEqual(file.entries.first, .dataRow(address: 0x19000000, data: [1, 2, 3, 4]))
        
        let invalidLines = [
            "0000001901020304",
            ":0000001",
            ":0000001z",
            ":000000190",
            ":000000190z"
        ]
        
        for line in invalidLines {
            let data = "01002144E221000104030201\n\(line)\n".data(using: .utf8)!
            XCTAssertThrowsError(try parser.parse(data)) { error in
                XCTAssertEqual(error as? Cyacd2Error,
                               line.hasPrefix(":") ? .invalidDataRow(line) : .invalidLine(line))
            }
        }
    }
}
