package com.lifeplus.Events;

public class DeviceConnectionStatusChangedEvent implements EventBase {
    public String deviceId;
    public int connectionStatus;

    public DeviceConnectionStatusChangedEvent(String deviceId, int connectionStatus) {
        this.connectionStatus = connectionStatus;
        this.deviceId = deviceId;
    }

    @Override
    public String getData() {
        return "{deviceId: " + deviceId + ", connectionStatus: " + connectionStatus + "}";
    }
}
