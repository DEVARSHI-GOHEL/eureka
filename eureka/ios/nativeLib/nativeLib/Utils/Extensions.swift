//
//  Extensions.swift
//  
//
//  Created by Peter Ertl on 23/08/2021.
//

import Foundation

extension CBPeripheral {
    func getService(_ ids: CBUUID...) -> CBService? {
        self.services?.first { ids.contains($0.uuid) }
    }
}

extension CBService {
    func getCharacteristic(_ ids: CBUUID...) -> CBCharacteristic? {
        self.characteristics?.first { ids.contains($0.uuid) }
    }
}

extension MutableDataProtocol where Element == UInt8 {
    init?<T: StringProtocol>(hexString: T) {
        guard let data = hexString.data(using: .ascii) else { return nil }
        self.init(hexString: data)
    }
    
    init?<T: DataProtocol>(hexString: T) {
        guard hexString.count.isMultiple(of: 2) else { return nil }
        self.init()
        var first = true
        var byte: UInt8 = 0
        for char in hexString {
            guard let value = char.hexDigitValue else { return nil }
            if first {
                byte |= value << 4
            } else {
                byte |= value
                self.append(byte)
                byte = 0
            }
            first.toggle()
        }
    }
}

extension Sequence {
    func repeated(count: Int) -> [Element] {
        guard count >= 1 else { return [] }
        var result = [Element]()
        for _ in 0 ..< count {
            result.append(contentsOf: self)
        }
        return result
    }
}

extension Sequence where Element == UInt8 {
    var hexString: String {
        let alphabet = "0123456789ABCDEF".map { $0 }
        var result = ""
        for byte in self {
            result.append(alphabet[Int(byte >> 4)])
            result.append(alphabet[Int(byte & 0xF)])
        }
        return result
    }
    
    func checksum(type: ChecksumType = .shared) -> UInt16 {
        switch type {
        case .checksum: return self.checksum16
        case .crc: return self.crc16
        }
    }
    
    var checksum16: UInt16 {
        var sum = UInt16.zero
        for byte in self {
            sum &+= UInt16(byte)
        }
        return ~sum &+ 1
    }
    
    var crc16: UInt16 {
        var crc = UInt16.max
        for var byte in self {
            for _ in 0 ..< 8 {
                let diffBit = (crc & 1) != (UInt16(byte) & 1)
                crc >>= 1
                if diffBit { crc ^= 0x8408 }
                byte >>= 1
            }
        }
        crc = ~crc
        crc = (crc << 8) | (crc >> 8)
        return crc
    }
    
    /// CRC-32C
    var crc32: UInt32 {
        var crc: UInt32 = 0xFFFFFFFF
        for byte in self {
            crc ^= UInt32(byte)
            crc = (crc >> 4) ^ crc32table[Int(crc & 0xF)]
            crc = (crc >> 4) ^ crc32table[Int(crc & 0xF)]
        }
        return ~crc
    }
}

private let crc32table: [UInt32] = {
    let g0: UInt32 = 0x82F63B78
    let g1: UInt32 = (g0 >> 1) & 0x7fffffff
    let g2: UInt32 = (g0 >> 2) & 0x3fffffff
    let g3: UInt32 = (g0 >> 3) & 0x1fffffff
    let table: [UInt32] = [
        0, g3, g2, g2^g3,
        g1, g1^g3, g1^g2, g1^g2^g3,
        g0, g0^g3, g0^g2, g0^g2^g3,
        g0^g1, g0^g1^g3, g0^g1^g2, g0^g1^g2^g3
    ]
    return table
}()

extension Collection where Index == Int {
    func chunked(by size: Int) -> [SubSequence] {
        let chunkSize = Swift.max(size, 1)
        return stride(from: 0, to: count, by: chunkSize).map {
            self[$0 ..< Swift.min($0 + chunkSize, count)]
        }
    }
    
    func trimming(whereSeparator separator: (Element) -> Bool) -> SubSequence {
        var start = self.startIndex
        var end = self.endIndex
        while start < end && separator(self[start]) { start += 1 }
        while start < end && separator(self[end-1]) { end -= 1 }
        return self[start ..< end]
    }
}

extension Collection where Element: Equatable, Index == Int {
    func spliterate(separator: Element, block: (SubSequence) throws -> Void) rethrows {
        var seqStartIndex: Index?
        var index = startIndex
        for element in self {
            if element == separator {
                if let start = seqStartIndex {
                    try block(self[start ..< index])
                    seqStartIndex = nil
                }
            } else if seqStartIndex == nil {
                seqStartIndex = index
            }
            index += 1
        }
        if let seqStartIndex = seqStartIndex {
            try block(self[seqStartIndex ..< endIndex])
        }
    }
}

extension Collection {
    func removingPrefix<T: Collection>(_ prefix: T) -> Self.SubSequence
    where T.Element == Element, Element: Equatable {
        self.starts(with: prefix)
            ? self.dropFirst(prefix.count)
            : self[self.startIndex ..< self.endIndex]
    }
}

extension RangeReplaceableCollection {
    func padding(toLength length: Int, with element: Element) -> Self {
        if self.count >= length { return self }
        var result = self
        for _ in 0 ..< (length - self.count) {
            result.append(element)
        }
        return result
    }
}

extension UnsignedInteger {
    init?<T: DataProtocol>(littleEndianHexString hexString: T) {
        guard hexString.count == MemoryLayout<Self>.size * 2 else { return nil }
        self = 0
        var first = true
        var byte: UInt8 = 0
        var exp = 0
        for char in hexString {
            guard let value = char.hexDigitValue else { return nil }
            if first {
                byte |= value << 4
            } else {
                byte |= value
                self |= (Self(byte) << exp)
                byte = 0
                exp += 8
            }
            first.toggle()
        }
    }
    
    init<T: DataProtocol>(littleEndianBytes: T) {
        self = 0
        var exp = 0
        for byte in littleEndianBytes.prefix(MemoryLayout<Self>.size) {
            self |= (Self(byte) << exp)
            exp += 8
        }
    }
}

extension FixedWidthInteger {
    static var fullRange: ClosedRange<Self> {
        Self.min ... Self.max
    }
    
    var bytes: [UInt8] {
        var value = self
        return withUnsafeBytes(of: &value, Array.init)
    }
}

extension UInt8 {
    var isInvisibleAscii: Bool {
        self <= 32 || self == 127
    }
    
    var hexDigitValue: UInt8? {
        if (48...57).contains(self) { return self - 48 }
        if (65...70).contains(self) { return self - 55 }
        if (97...102).contains(self) { return self - 87 }
        return nil
    }
}

extension Range where Bound: FixedWidthInteger {
    func split(by size: Bound.Stride) -> [Self] {
        stride(from: lowerBound, to: upperBound, by: Swift.max(size, 1)).map {
            $0 ..< Swift.min($0 + Bound(size), upperBound)
        }
    }
}

extension DispatchQueue {
    func wrapAsync(_ task: @escaping () -> Void) -> (() -> Void) {
        return {
            self.async { task() }
        }
    }
    
    func wrapAsync<T>(_ task: @escaping (T) -> Void) -> ((T) -> Void) {
        return { param in
            self.async { task(param) }
        }
    }
}

extension Result {
    func fail(_ failure: Failure) -> Self {
        switch self {
        case .failure: return self
        case .success: return .failure(failure)
        }
    }
}
