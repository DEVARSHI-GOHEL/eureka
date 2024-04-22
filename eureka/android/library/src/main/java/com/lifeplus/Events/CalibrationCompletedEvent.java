package com.lifeplus.Events;

import java.util.HashMap;

public class CalibrationCompletedEvent implements EventBase {
    public HashMap<String, Object> userEnteredData;
    public HashMap<String, Object> deviceData;

    public CalibrationCompletedEvent(HashMap<String, Object> userEnteredData, HashMap<String, Object> deviceData) {
        this.userEnteredData = userEnteredData;
        this.deviceData = deviceData;
    }

    @Override
    public String getData() {
        return "{characteristicId: " + userEnteredData.toString() + ", data: " + deviceData.toString() + "}";
    }
}
