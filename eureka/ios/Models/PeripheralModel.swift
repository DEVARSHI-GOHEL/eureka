//
//  PeripheralModel.swift
//  BLEDemo
//

import Foundation
import nativeLib

final class PeripheralModel {
    static let sharedInstance = PeripheralModel()
    //Model for Peripheral
    
    var peripheral:CBPeripheral!
}
