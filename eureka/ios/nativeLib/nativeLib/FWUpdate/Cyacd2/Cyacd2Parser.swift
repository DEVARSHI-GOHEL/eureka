//
//  Cyacd2Parser.swift
//  
//
//  Created by Peter Ertl on 24/08/2021.
//

import Foundation

class Cyacd2Parser {
    private static let headerSize = 24
    private static let lineSeparator = Character("\n").asciiValue!
    private static let appInfoPrefix = "@APPINFO:".data(using: .ascii)!
    private static let eivPrefix = "@EIV:".data(using: .ascii)!
    private static let dataRowPrefix = ":".data(using: .ascii)!
    
    struct Options: OptionSet {
        let rawValue: UInt8
        static let parallel = Options(rawValue: 1)
    }
    
    func parse(_ data: Data, options: Options = []) throws -> Cyacd2File {
        var file: Cyacd2File!
        var lines = [Data]()
        try data.spliterate(separator: Self.lineSeparator) {
            let line = $0.trimming(whereSeparator: \.isInvisibleAscii)
            guard !line.isEmpty else { return }
            if file == nil {
                file = try Self.parseHeader(line)
            } else {
                lines.append(line)
            }
        }
        guard file != nil else {
            throw Cyacd2Error.invalidHeader("")
        }
        if options.contains(.parallel) {
            file.entries = .init(repeating: .dataRow(address: 0, data: []), count: lines.count)
            var errors = [Error?](repeating: nil, count: lines.count)
            let batchCount = ProcessInfo.processInfo.activeProcessorCount * 2
            let batches = lines.indices.split(by: lines.count / batchCount + 1)
            let group = DispatchGroup()
            for batch in batches {
                group.enter()
                DispatchQueue.global().async {
                    defer { group.leave() }
                    for index in batch {
                        do {
                            file.entries[index] = try Self.parseEntry(lines[index])
                        } catch {
                            errors[index] = error
                        }
                    }
                }
            }
            group.wait()
            if let firstError = (errors.lazy.compactMap { $0 }.first) {
                throw firstError
            }
        } else {
            file.entries = try lines.map { try Self.parseEntry($0) }
        }
        return file
    }
    
    private static func parseHeader(_ line: Data) throws -> Cyacd2File {
        guard line.count == headerSize,
              let rawHeader = [UInt8](hexString: line) else {
            throw Cyacd2Error.invalidHeader(describe(line))
        }
        guard let checksumType = ChecksumType(rawValue: rawHeader[6]) else {
            throw Cyacd2Error.invalidChecksumType(rawHeader[6])
        }
        return .init(version: rawHeader[0],
                     siliconId: UInt32(littleEndianBytes: rawHeader[1..<5]),
                     siliconRevision: rawHeader[5],
                     checksumType: checksumType,
                     appId: rawHeader[7],
                     productId: UInt32(littleEndianBytes: rawHeader[8..<12]),
                     entries: [])
    }
    
    private static func parseEntry(_ line: Data) throws -> Cyacd2File.Entry {
        if line.starts(with: appInfoPrefix) {
            guard let text = String(data: line.dropFirst(appInfoPrefix.count),
                                    encoding: .ascii) else {
                throw Cyacd2Error.invalidAppInfo(describe(line))
            }
            let words = text.split(separator: ",").map {
                String($0.removingPrefix("0x")).padding(toLength: 1, with: "0")
            }
            guard words.count == 2,
                  let address = UInt32(words[0], radix: 16),
                  let length = UInt32(words[1], radix: 16) else {
                throw Cyacd2Error.invalidAppInfo(describe(line))
            }
            return .appInfo(address: address, length: length)
        } else if line.starts(with: eivPrefix) {
            guard let vector = [UInt8](hexString: line.dropFirst(eivPrefix.count)) else {
                throw Cyacd2Error.invalidEIV(describe(line))
            }
            return .eiv(vector)
        } else if line.starts(with: dataRowPrefix) {
            let hex = line.dropFirst(dataRowPrefix.count)
            guard hex.count >= 8,
                  let address = UInt32(littleEndianHexString: hex.prefix(8)),
                  let data = [UInt8](hexString: hex.dropFirst(8)) else {
                throw Cyacd2Error.invalidDataRow(describe(line))
            }
            return .dataRow(address: address, data: data)
        } else {
            throw Cyacd2Error.invalidLine(describe(line))
        }
    }
    
    private static func describe(_ data: Data) -> String {
        String(data: data, encoding: .ascii) ?? "0x\(data.hexString)"
    }
}
