//
//  DbKeyService.swift
//  nativeLib
//
//  Created by Eugene Krivenja on 21.09.2022.
//

import Foundation

protocol KeyService {
    func getKey() -> Data
}

class DbKeyService: KeyService {
    private let service = Bundle.main.bundleIdentifier ?? "DbService"
    
    func getKey() -> Data {
        let query = [
            kSecClass as String       : kSecClassGenericPassword,
            kSecAttrService as String : service,
            kSecReturnData as String  : kCFBooleanTrue!,
            kSecMatchLimit as String  : kSecMatchLimitOne
        ] as [String : Any]
        
        var result: AnyObject? = nil
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecSuccess, let keyData = result as? Data {
            return storeKey(data: keyData)
        } else {
            let keyData = newKey()
            return storeKey(data: keyData)
        }
    }
    
    private func newKey() -> Data {
        let uuid = UUID().uuid
        return Data([uuid.0, uuid.1, uuid.2, uuid.3, uuid.4, uuid.5, uuid.6, uuid.7, uuid.8, uuid.9, uuid.10, uuid.11, uuid.12, uuid.13, uuid.14, uuid.15])
    }
    
    private func storeKey(data: Data) -> Data {
        let status = updateKey(data: data)
        if status == errSecSuccess {
            return data
        } else {
            fatalError("Failed to store into keychain with status = \(status)")
        }
    }
    
    private func updateKey(data: Data) -> OSStatus {
        let query = [
            kSecClass as String          : kSecClassGenericPassword,
            kSecAttrService as String    : service
        ] as [String : Any]

        SecItemDelete(query as CFDictionary)
        
        let attributes = [
            kSecClass as String          : kSecClassGenericPassword,
            kSecAttrService as String    : service,
            kSecAttrAccessible as String : kSecAttrAccessibleAfterFirstUnlock,
            kSecValueData as String      : data
        ] as [String : Any]

        return SecItemAdd(attributes as CFDictionary, nil)
    }
}
