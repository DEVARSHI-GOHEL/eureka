package com.lifeplus.Events;

public class MeasureTimeReadEvent implements EventBase{
    public final byte[] data;
    public  String characteristicId;

    public MeasureTimeReadEvent(String characteristicId, byte[] data) {
        this.data = data;
        this.characteristicId = characteristicId;
    }

    @Override
    public String getData() {
        return null;
    }
}
