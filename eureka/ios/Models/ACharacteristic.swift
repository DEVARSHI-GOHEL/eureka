//
//  ACharacteristic.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation
import nativeLib

public class ACharacteristic {
  public final var uuid: UUID?
  public final var name: String
  public final var dataType: DataType
  public final var length: Int
  public final var members: [AMember] = []

  public init(pUuid: String, pName: String, pDataType: DataType, pLength: Int) {
      uuid = UUID(uuidString: pUuid)
      name = pName
      dataType = pDataType
      length = pLength
  }

  public func addMember(pMember: AMember) {
    members.append(pMember)
  }
  
  public func addMember(pName: String, pDataType: DataTypeEnum, pLength: Int) {
    members.append(AMember(pName: pName, pDataType: pDataType, pLength: pLength));
  }
  
  public func getName() -> String {
    return name
  }
  
  public func getUuid() -> UUID? {
    return uuid
  }

  public func getMembers() -> [AMember]{
        return members;
    }
}
