//
//  IDeviceRepository.swift
//  LPClient
//
//  Created by Andrey Filyakov on 18.02.2021.
//

protocol IDeviceRepository {
    var lastDeviceId: String? { get set }
    var lastDeviceName: String? { get set }
}
