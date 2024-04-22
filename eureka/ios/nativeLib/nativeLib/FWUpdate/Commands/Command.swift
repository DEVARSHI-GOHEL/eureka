//
//  Command.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

import Foundation

struct Command: Equatable {
    static let startByte: UInt8 = 0x01
    static let endByte: UInt8 = 0x17
    
    var code: CommandCode
    var data: [UInt8]
    
    init(code: CommandCode, data: [UInt8] = []) {
        self.code = code
        self.data = data
    }
    
    init?(packet: [UInt8]) {
        guard packet.count >= 7,
              packet.first == Command.startByte,
              packet.last == Command.endByte,
              let code = CommandCode(rawValue: packet[1]) else {
            return nil
        }
        let dataLength = Int(packet[2]) + (Int(packet[3]) << 8)
        guard packet.count == dataLength + 7 else { return nil }
        let checksum = UInt16(packet[packet.count - 3]) + (UInt16(packet[packet.count - 2]) << 8)
        guard packet.prefix(packet.count - 3).checksum() == checksum else { return nil }
        self.code = code
        self.data = Array(packet[4 ..< 4 + dataLength])
    }
    
    var packet: [UInt8] {
        var packet = [Self.startByte, code.rawValue]
        let dataLength = UInt16(data.count)
        packet.append(UInt8(dataLength & 0xFF))
        packet.append(UInt8(dataLength >> 8))
        packet.append(contentsOf: data)
        let checksum = packet.checksum()
        packet.append(UInt8(checksum & 0xFF))
        packet.append(UInt8(checksum >> 8))
        packet.append(Self.endByte)
        return packet
    }
    
    var hasResponse: Bool {
        let noResponse: [CommandCode] = [.sendDataWithoutResponse, .syncDFU, .exitDFU]
        return !noResponse.contains(code)
    }
}

extension Command {
    static func enterDFU(productId: UInt32? = nil) -> Command {
        .init(code: .enterDFU,
              data: productId.map(\.littleEndian.bytes) ?? [])
    }
    
    static func sendData(_ data: [UInt8]) -> Command {
        .init(code: .sendData, data: data)
    }
    
    static func sendDataWithoutResponse(_ data: [UInt8]) -> Command {
        .init(code: .sendDataWithoutResponse, data: data)
    }
    
    static func programData(_ data: [UInt8], address: UInt32, crc32: UInt32? = nil) -> Command {
        let crc = crc32 ?? data.crc32
        return .init(code: .programData,
                     data: address.littleEndian.bytes + crc.littleEndian.bytes + data)
    }
    
    static func verifyData(_ data: [UInt8], address: UInt32, crc32: UInt32? = nil) -> Command {
        let crc = crc32 ?? data.crc32
        return .init(code: .verifyData,
                     data: address.littleEndian.bytes + crc.littleEndian.bytes + data)
    }
    
    static func eraseData(address: UInt32) -> Command {
        return .init(code: .eraseData, data: address.littleEndian.bytes)
    }
    
    static func setAppMetadata(appId: UInt8, address: UInt32, length: UInt32) -> Command {
        .init(code: .setAppMetadata,
              data: [appId] + address.littleEndian.bytes + length.littleEndian.bytes)
    }
    
    static func getMetadata(from: UInt16, to: UInt16) -> Command {
        .init(code: .getMetadata, data: from.littleEndian.bytes + to.littleEndian.bytes)
    }
    
    static func setEIV(_ eiv: [UInt8]) -> Command {
        .init(code: .setEIV, data: eiv)
    }
    
    static func verifyApp(id: UInt8) -> Command {
        .init(code: .verifyApp, data: [id])
    }
    
    static var syncDFU: Command {
        .init(code: .syncDFU)
    }
    
    static var exitDFU: Command {
        .init(code: .exitDFU)
    }
}
