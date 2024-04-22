//
//  AServiceDef.swift
//  BLEDemo
//

import Foundation

public class AServiceDef {
    
    private final var _uuid: UUID
    private final var _name: String
    private final var _isAtomic: Bool
    private final var _characteristics = [UUID : ACharDef]()
    
    public init(pUUID: String, pName: String) {
        _uuid = UUID(uuidString: pUUID)!
        _name = pName
        _isAtomic = false
    }
    
    public init(pUUID: String, pName: String, pIsAutomic: Bool) {
        _uuid = UUID(uuidString: pUUID)!
        _name = pName
        _isAtomic = pIsAutomic
    }

    public func getUuid() -> UUID? {
        return _uuid
    }
    
    public func getName() -> String {
        return _name
    }
    
    public func isAutomic() -> Bool {
        return _isAtomic
    }

    public func addCharacteristic(pCharacteristic: ACharDef) {
        _characteristics[pCharacteristic.uuid!] = pCharacteristic
    }
    
    public func addCharacteristic(pUuid: String, pName: String, pDataType: DataTypeEnum, pLength: Int, pProperty: CharPropertyEnum, pCharEnum: GattCharEnum) {
        _characteristics[UUID(uuidString: pUuid)!] = ACharDef(pUuid: pUuid, pCharEnum: pCharEnum, pName: pName, pDataType: pDataType, pProperty: pProperty, pLength: pLength)
    }
    
    public func getCharacteristics() -> [UUID : ACharDef] {
        return _characteristics
    }
    
    public func getCharacteristic(pUUID: String) -> ACharDef? {
        return _characteristics.values.first(where: {
            $0.charEnum.code.lowercased() == pUUID.lowercased() || $0.charEnum.altCode.lowercased() == pUUID.lowercased()
        })
    }
}
