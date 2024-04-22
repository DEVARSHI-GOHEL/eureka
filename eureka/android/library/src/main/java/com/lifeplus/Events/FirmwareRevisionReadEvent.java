package com.lifeplus.Events;

public class FirmwareRevisionReadEvent implements EventBase {
    public final byte[] data;
    public String characteristicId;

    public FirmwareRevisionReadEvent(String characteristicId, byte[] data) {
        this.data = data;
        this.characteristicId = characteristicId;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + characteristicId + ", data: " + new String(data) + "}";
    }
}
