package com.lifeplus.Pojo;

import com.lifeplus.Pojo.Enum.DataTypeEnum;

public class AMember {
    public final String name;
    public final DataTypeEnum dataType;
    public final int length;

    public AMember(String pName, DataTypeEnum pDataType, int pLength) {
        name = pName;
        dataType = pDataType;
        length = pLength;
    }
}
