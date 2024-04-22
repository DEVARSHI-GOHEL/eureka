package com.lifeplus.Events;

public class WriteCharCallbackEvent implements EventBase {
    public String characteristicId;
    public int status;

    public WriteCharCallbackEvent(String characteristicId, int status) {
        this.characteristicId = characteristicId;
        this.status = status;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + characteristicId + ", status: " + status + "}";
    }
}
