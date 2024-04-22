//
//  Response.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

import Foundation

struct Response: Equatable {
    var status: ResponseStatus
    var data: [UInt8]
    
    init(status: ResponseStatus = .success, data: [UInt8] = []) {
        self.status = status
        self.data = data
    }
    
    init?(packet: [UInt8]) {
        guard packet.count >= 7,
              packet.first == Command.startByte,
              packet.last == Command.endByte,
              let status = ResponseStatus(rawValue: packet[1]) else {
            return nil
        }
        let dataLength = Int(packet[2]) + (Int(packet[3]) << 8)
        guard packet.count == dataLength + 7 else { return nil }
        let checksum = UInt16(packet[packet.count - 3]) + (UInt16(packet[packet.count - 2]) << 8)
        guard packet.prefix(packet.count - 3).checksum() == checksum else { return nil }
        self.status = status
        self.data = Array(packet[4 ..< 4 + dataLength])
    }
    
    var packet: [UInt8] {
        var packet = [Command.startByte, status.rawValue]
        let dataLength = UInt16(data.count)
        packet.append(UInt8(dataLength & 0xFF))
        packet.append(UInt8(dataLength >> 8))
        packet.append(contentsOf: data)
        let checksum = packet.checksum()
        packet.append(UInt8(checksum & 0xFF))
        packet.append(UInt8(checksum >> 8))
        packet.append(Command.endByte)
        return packet
    }
}

extension Response {
    static func status(_ status: ResponseStatus, data: [UInt8] = []) -> Response {
        .init(status: status, data: data)
    }
    
    static func enterDFU(status: ResponseStatus = .success,
                         siliconId: UInt32,
                         siliconRevision: UInt8,
                         sdkVersion: [UInt8]) -> Response {
        .init(status: status,
              data: siliconId.littleEndian.bytes + [siliconRevision] + sdkVersion)
    }
    
    static func verifyApp(status: ResponseStatus = .success, result: Bool) -> Response {
        .init(status: status, data: [result ? 1 : 0])
    }
}
