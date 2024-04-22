//
//  ACharDef.swift
//  BLEDemo
//

import Foundation

public class ACharDef {
    public final var uuid: UUID?
    public final var charEnum: GattCharEnum
    public final var name: String
    public final var dataType: DataTypeEnum
    public final var property: CharPropertyEnum
    public final var length: Int
    public final var members: [AMember] = []
    
    public init(pUuid: String, pCharEnum: GattCharEnum, pName: String, pDataType: DataTypeEnum, pProperty:CharPropertyEnum, pLength: Int) {
        uuid = UUID(uuidString: pUuid)
        charEnum = pCharEnum
        name = pName
        dataType = pDataType
        property = pProperty
        length = pLength
    }
    
    public func addMember(pMember: AMember) {
        members.append(pMember)
    }
    
    public func addMember(pName: String, pDataType: DataTypeEnum, pLength: Int) {
        members.append(AMember(pName: pName, pDataType: pDataType, pLength: pLength));
    }
    
    public func getUuid() -> UUID? {
        return uuid
    }
    
    public func getUuidStr() -> String {
        return uuid?.description ?? ""
    }
    
    public func getMembers() -> [AMember] {
        return members
    }
}
