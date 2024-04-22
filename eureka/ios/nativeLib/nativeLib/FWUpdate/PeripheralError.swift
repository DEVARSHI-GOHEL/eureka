//
//  PeripheralError.swift
//  
//
//  Created by Peter Ertl on 31/08/2021.
//

import Foundation

enum PeripheralError: LocalizedError, Equatable {
    case updateInProgress,
         missingService,
         missingCharacteristic,
         invalidProperties(_ properties: CBCharacteristicProperties),
         invalidResponse(_ response: Data),
         badStatus(_ status: ResponseStatus),
         timeout(_ interval: TimeInterval)
    
    var errorDescription: String? {
        switch self {
        case .updateInProgress:
            return "Peripheral is already being updated."
        case .missingService:
            return "Peripheral does not provide service \(FirmwareUploader.serviceUuid)."
        case .missingCharacteristic:
            return "Peripheral does not provide characteristic \(FirmwareUploader.characteristicUuid)."
        case .invalidProperties(let props):
            return "Characteristic \(FirmwareUploader.characteristicUuid) has invalid properties: \(props)."
        case .invalidResponse(let response):
            return "Failed to parse response: \(response.hexString)."
        case .badStatus(let status):
            return "Received error response status: \(status)."
        case .timeout(let interval):
            return "Response timeout after \(interval) seconds."
        }
    }
}
