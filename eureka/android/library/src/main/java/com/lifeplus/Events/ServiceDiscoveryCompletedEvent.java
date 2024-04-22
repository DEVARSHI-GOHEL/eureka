package com.lifeplus.Events;

public class ServiceDiscoveryCompletedEvent implements EventBase {
    public  int progressStatus;

    public ServiceDiscoveryCompletedEvent(int progressStatus) {
        this.progressStatus = progressStatus;
    }

    @Override
    public String getData() {
        return "{progressStatus: " + progressStatus + "}";
    }
}
