//
//  FirmwareUploadError.swift
//  
//
//  Created by Peter Ertl on 23/08/2021.
//

import Foundation

public enum FirmwareUploadError: LocalizedError {
    /// Failed to read input file.
    case fileReadError(cause: Error)
    
    /// Failed to parse input file.
    case invalidFileError(cause: Error)
    
    /// Watch is not connected.
    case connectionError
    
    /// Communication with the watch failed.
    case communicationError(cause: Error)
    
    /// CRC check on the watch failed.
    case crcError
    
    /// Watch failed to install firmware.
    case installationError

    public var errorDescription: String? {
        switch self {
        case .fileReadError(let cause): return "Failed to read file: \(cause.localizedDescription)"
        case .invalidFileError(let cause): return "Failed to parse file: \(cause.localizedDescription)"
        case .connectionError: return "Watch is not connected."
        case .communicationError(let cause): return "Communication with the watch failed: \(cause.localizedDescription)"
        case .crcError: return "CRC check on the watch failed."
        case .installationError: return "Watch failed to install firmware."
        }
    }
}
