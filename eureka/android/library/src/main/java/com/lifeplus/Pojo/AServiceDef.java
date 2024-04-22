package com.lifeplus.Pojo;

import com.lifeplus.Pojo.Enum.CharPropertyEnum;
import com.lifeplus.Pojo.Enum.DataTypeEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;

import java.util.HashMap;
import java.util.UUID;

public class AServiceDef {
    private final UUID _uuid;
    private final String _name;
    private final boolean _isAtomic;
    private final HashMap<UUID, ACharDef> _characteristics = new HashMap<>();

    public AServiceDef(String pUUID, String pName) {
        _uuid = UUID.fromString(pUUID);
        _name = pName;
        _isAtomic = false;
    }

    public AServiceDef(String pUUID, String pName, boolean pIsAutomic) {
        _uuid = UUID.fromString(pUUID);
        _name = pName;
        _isAtomic = pIsAutomic;
    }

    public UUID getUuid() {
        return _uuid;
    }

    public String getName() {
        return _name;
    }

    public boolean isAutomic() {
        return _isAtomic;
    }

    public void addCharacteristic(ACharDef pCharacteristic) {
        _characteristics.put(pCharacteristic.uuid, pCharacteristic);
    }

    public void addCharacteristic(String pUuid, String pName, DataTypeEnum pDataType, int pLength, CharPropertyEnum pProperty, GattCharEnum pCharEnum) {
        _characteristics.put( UUID.fromString(pUuid), new ACharDef(pUuid, pName, pDataType, pLength, pProperty, pCharEnum));
    }

    public HashMap<UUID, ACharDef> getCharacteristics() {
        return _characteristics;
    }

    public ACharDef getCharacteristic(String pUUID) {
        try {
            return _characteristics.get( UUID.fromString(pUUID));
        } catch (Throwable e) {         // Actual expected exception is IllegalArgumentException
            return null;
        }
    }

    public ACharDef getCharacteristic(UUID pUUID) {
        return _characteristics.get(pUUID);
    }
}
