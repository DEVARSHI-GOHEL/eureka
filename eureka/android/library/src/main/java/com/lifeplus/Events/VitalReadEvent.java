package com.lifeplus.Events;

public class VitalReadEvent implements EventBase {
    public final byte[] data;
    public BaseDataVO baseDataVO;
    public  String characteristicId;

    public VitalReadEvent(String characteristicId, byte[] data, BaseDataVO baseDataVO) {
        this.data = data;
        this.characteristicId = characteristicId;
        this.baseDataVO = baseDataVO;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + characteristicId + ", data: " + new String(data) + "}";
    }
}
