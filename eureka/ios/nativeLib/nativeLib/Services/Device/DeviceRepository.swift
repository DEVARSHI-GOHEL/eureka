//
//  DeviceRepository.swift
//  LPClient
//
//  Created by Andrey Filyakov on 18.02.2021.
//

import Foundation

class DeviceRepository: IDeviceRepository {
    var lastDeviceId: String? {
        get {
            UserDefaults.standard.string(forKey: "lastDeviceId")
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "lastDeviceId")
        }
    }
    
    var lastDeviceName: String? {
        get {
            UserDefaults.standard.string(forKey: "lastDeviceName")
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "lastDeviceName")
        }
    }
}
