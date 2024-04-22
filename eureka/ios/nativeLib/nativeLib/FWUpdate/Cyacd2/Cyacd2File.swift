//
//  Cyacd2File.swift
//  
//
//  Created by Peter Ertl on 24/08/2021.
//

import Foundation

struct Cyacd2File: Equatable {
    var version: UInt8
    var siliconId: UInt32
    var siliconRevision: UInt8
    var checksumType: ChecksumType
    var appId: UInt8
    var productId: UInt32
    var entries: [Entry]
    
    enum Entry: Equatable {
        case appInfo(address: UInt32, length: UInt32),
             eiv(_ vector: [UInt8]),
             dataRow(address: UInt32, data: [UInt8])
    }
}

extension Cyacd2File: CustomStringConvertible {
    var description: String {
        "Cyacd2File(version: \(version), siliconId: \(siliconId), siliconRevision: \(siliconRevision), "
            + "checksumType: \(checksumType), appId: \(appId), productId: \(productId), entries: \(entries.count))"
    }
}
