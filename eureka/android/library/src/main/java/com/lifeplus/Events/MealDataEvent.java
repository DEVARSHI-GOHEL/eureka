package com.lifeplus.Events;

public class MealDataEvent implements EventBase {
    public final byte[] data;
    public BaseDataVO baseDataVO;
    public  String characteristicId;

    public MealDataEvent(String characteristicId, byte[] data, BaseDataVO baseDataVO) {
        this.data = data;
        this.characteristicId = characteristicId;
        this.baseDataVO = baseDataVO;
    }


    @Override
    public String getData() {
        return new String(this.data);
    }
}
