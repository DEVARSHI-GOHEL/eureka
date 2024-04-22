package com.lifeplus.Events;

public class StepCountEvent implements EventBase {
    public final String characteristicId;
    public final byte[] data;
    public final boolean isRead;

    public StepCountEvent(String characteristicId, byte[] data, boolean isRead) {
        this.characteristicId = characteristicId;
        this.data = data;
        this.isRead = isRead;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + characteristicId + ", data: " + new String(data) + ", " + (isRead ? "read" : "update") + " event}";
    }
}
