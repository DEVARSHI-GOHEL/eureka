//
//  ResponseStatus.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

enum ResponseStatus: UInt8 {
    /// The command was successfully received and executed
    case success = 0x00
    
    /// Verification of non-volatile memory (NVM) after write failed
    case verifyError = 0x02
    
    /// The amount of data sent is greater than expected
    case lengthError = 0x03
    
    /// Packet data is not of the proper form
    case dataError = 0x04
    
    /// The command is not recognized
    case commandError = 0x05
    
    /// Packet checksum or CRC does not match the expected value
    case checksumError = 0x08
    
    /// The flash row number is not valid
    case rowError = 0x0A
    
    /// The flash row number cannot be accessed, for example due to MPU protection
    case rowAccessError = 0x0B
    
    /// An unknown error occurred
    case unknownError = 0xFF
}
