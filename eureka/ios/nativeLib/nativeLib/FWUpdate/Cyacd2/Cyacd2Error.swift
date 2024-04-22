//
//  Cyacd2Error.swift
//  
//
//  Created by Peter Ertl on 24/08/2021.
//

import Foundation

enum Cyacd2Error: LocalizedError, Equatable {
    case invalidHeader(_ header: String),
         invalidChecksumType(_ type: UInt8),
         invalidAppInfo(_ line: String),
         invalidEIV(_ line: String),
         invalidDataRow(_ line: String),
         invalidLine(_ line: String),
         incorrectSilicon
    
    var errorDescription: String? {
        switch self {
        case .invalidHeader(let header):
            return "Invalid file header: \"\(header)\". "
                + "Header should match pattern \"[0-9a-fA-F]{24}\"."
        case .invalidChecksumType(let type):
            return "Invalid checksum type: \(type). "
                + "Supported types: \(ChecksumType.allCases.map(\.rawValue))."
        case .invalidAppInfo(let line):
            return "Invalid app info: \"\(line)\". "
                + "App info should match pattern \"@APPINFO:(0x)?[0-9a-fA-F]{,8},(0x)?[0-9a-fA-F]{,8}\"."
        case .invalidEIV(let line):
            return "Invalid EIV: \"\(line)\". EIV should match pattern \"@EIV:([0-9a-fA-F]{2})*\"."
        case .invalidDataRow(let line):
            return "Invalid data row: \"\(line)\". Data row should match patten: \":([0-9a-fA-F]{2}){4,}\"."
        case .invalidLine(let line):
            return "Invalid line: \"\(line)\"."
        case .incorrectSilicon:
            return "Silicon ID or revision does not match connected peripheral."
        }
    }
}
