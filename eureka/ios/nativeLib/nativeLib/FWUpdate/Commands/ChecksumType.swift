//
//  ChecksumType.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

enum ChecksumType: UInt8, CaseIterable {
    case checksum = 0,
         crc = 1
    
    static var shared = ChecksumType.checksum
}
