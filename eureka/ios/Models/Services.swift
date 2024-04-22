//
//  Services.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation
import nativeLib

public class Services {

  private static var _services: [UUID: AService] = [:]

  private static func addService(pUUID: String, pName: String) {
    if let mUuid = UUID(uuidString: pUUID) {
      _services[mUuid] = AService(pUUID: pUUID, pName: pName, pIsAutomic: false)
    }
  }

  private static func addService(pUUID: String, pName: String, pIsAutomic: Bool) {
    if let mUuid = UUID(uuidString: pUUID) {
      _services[mUuid] = AService(pUUID: pUUID, pName: pName, pIsAutomic: pIsAutomic)
    }
  }

  internal static func getService(pUUID: String) -> AService {
    if let mUuid = UUID(uuidString: pUUID) {
      if let mService = _services[mUuid] {
        return mService
      } else {
        return AService(pUUID: "UNKNOWN", pName: "UNKNOWN")
      }
    } else {
      return AService(pUUID: "UNKNOWN", pName: "UNKNOWN")
    }
  }

  internal static func isAutomic(pUUID: String) -> Bool {
    var result: Bool = false
    if let mUuid = UUID(uuidString: pUUID) {
      if let mService: AService = _services[mUuid] {
        result = mService.isAutomic();
      }
    }
    return result;
  }

  internal static func createServices() {
    let mServiceId: String = "4C505732-5F43-5553-544F-4D5F53525600"
    addService(pUUID: mServiceId, pName: "Common Service")
    let mService: AService = getService(pUUID: mServiceId)

    let mCharacteristicId: String = "4C505732-5F43-535F-5644-5F5245430000"
    mService.addCharacteristic(pUuid: mCharacteristicId, pName: "VitalData",
                               pDataType: DataType.byteArr, pLength: 20)
    let mCharacteristic: ACharacteristic = mService.getCharacteristic(pUUID: mCharacteristicId)
    mCharacteristic.addMember(pMember: AMember(pName: "OpStatus", pDataType: DataTypeEnum.UINT8, pLength: 1))
    mCharacteristic.addMember(pMember: AMember(pName: "HeartRate", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "RespirationRate", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "OxygenSaturation", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "BloodGlucose", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "BloodPressureSYS", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "BloodPressureDIA", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Year", pDataType: DataTypeEnum.UINT16, pLength: 2))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Month", pDataType: DataTypeEnum.UINT8, pLength: 1))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Day", pDataType: DataTypeEnum.UINT8, pLength: 1))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Hour", pDataType: DataTypeEnum.UINT8, pLength: 1))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Minutes", pDataType: DataTypeEnum.UINT8, pLength: 1))
    mCharacteristic.addMember(pMember: AMember(pName: "UTC_Seconds", pDataType: DataTypeEnum.UINT8, pLength: 1))
  }
}
