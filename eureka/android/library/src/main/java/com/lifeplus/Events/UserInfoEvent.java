package com.lifeplus.Events;

public class UserInfoEvent implements EventBase {
    public final byte[] data;
    public  String characteristicId;

    public UserInfoEvent(String characteristicId, byte[] data) {
        this.data = data;
        this.characteristicId = characteristicId;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + characteristicId + ", data: " + new String(data) + "}";
    }
}
