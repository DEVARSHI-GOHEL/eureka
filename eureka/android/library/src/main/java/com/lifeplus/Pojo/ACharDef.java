package com.lifeplus.Pojo;

import com.lifeplus.Pojo.Enum.CharPropertyEnum;
import com.lifeplus.Pojo.Enum.DataTypeEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;

import java.util.ArrayList;
import java.util.UUID;

public class ACharDef {
    public final UUID uuid;
    public final GattCharEnum charEnum;
    public final String name;
    public final DataTypeEnum dataType;
    public final CharPropertyEnum property;
    public final int length;
    public final ArrayList<AMember> members = new ArrayList<>();

    public ACharDef(String pUuid, String pName, DataTypeEnum pDataType, int pLength, CharPropertyEnum pProperty, GattCharEnum pCharEnum) {
        uuid = UUID.fromString(pUuid);
        charEnum = pCharEnum;
        name = pName;
        dataType = pDataType;
        length = pLength;
        property = pProperty;
    }

    public void addMember(AMember pMember) {
        members.add(pMember);
    }

    public void addMember(String pName, DataTypeEnum pDataType, int pLength) {
        members.add(new AMember(pName, pDataType, pLength));
    }

    public UUID getUuid() {
        return uuid;
    }

    public String getUuidStr() {
        return (uuid != null) ? uuid.toString() : "";
    }

    public ArrayList<AMember> getMembers() {
        return members;
    }
}
