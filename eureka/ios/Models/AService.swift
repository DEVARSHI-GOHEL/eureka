//
//  AService.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class AService {
  private final var _uuid: UUID
  private final var _name: String
  private final var _isAutomic: Bool
  private final var _characterictics: [UUID: ACharacteristic] = [:]

  init(pUUID: String, pName: String) {
    if let mUUID = UUID(uuidString: pUUID) {
      _uuid = mUUID
    } else {
      _uuid = UUID()
    }
    _name = pName
    _isAutomic = false
  }

  init(pUUID: String, pName: String, pIsAutomic: Bool) {
    if let mUUID = UUID(uuidString: pUUID) {
      _uuid = mUUID
    } else {
      _uuid = UUID()
    }
    _name = pName
    _isAutomic = pIsAutomic
  }

  public func getUuid() -> UUID? {
    return _uuid
  }

  public func getName() -> String {
    return _name
  }

  public func isAutomic() -> Bool{
    return _isAutomic
  }

  public func addCharacteristic(pCharacteristic: ACharacteristic) {
    if let mUuid = pCharacteristic.uuid {
      _characterictics[mUuid] = pCharacteristic
    }
  }

  public func addCharacteristic(pUuid: String, pName: String, pDataType: DataType, pLength: Int) {
    if let mUuid = UUID(uuidString: pUuid) {
      _characterictics[mUuid] = ACharacteristic(pUuid: pUuid, pName: pName, pDataType: pDataType, pLength: pLength)
    }
  }

  public func getCharacterictics() -> [UUID: ACharacteristic] {
    return _characterictics
  }

  public func getCharacteristic(pUUID: String) -> ACharacteristic {
    if let mUUID = UUID(uuidString: pUUID) {
      if let mCharc = _characterictics[mUUID] {
        return mCharc
      } else {
        return ACharacteristic(pUuid: "UNKNOWN", pName: "UNKNOWN", pDataType: DataType.UINT8, pLength: 0)
      }
    } else {
      return ACharacteristic(pUuid: "UNKNOWN", pName: "UNKNOWN", pDataType: DataType.UINT8, pLength: 0)
    }
  }

  public func getCharacteristic(pUUID: UUID) -> ACharacteristic {
    if let mCharc = _characterictics[pUUID] {
      return mCharc
    } else {
      return ACharacteristic(pUuid: "UNKNOWN", pName: "UNKNOWN", pDataType: DataType.UINT8, pLength: 0)
    }
  }
}
