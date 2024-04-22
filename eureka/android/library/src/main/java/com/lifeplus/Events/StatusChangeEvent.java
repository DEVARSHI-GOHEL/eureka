package com.lifeplus.Events;

public class StatusChangeEvent implements EventBase {
    private final byte _rawStatus;
    private static boolean _prevBatteryLow;
    private static boolean _prevChargerConnected;
    private static boolean _prevWatchNotOnWrist;
    private static boolean _prevMeasureInProgress;
    private static boolean _prevMlUpdateInProgress;
    private static boolean _prevShutdownManual;
    private static boolean _prevShutdownInProgress;
    private static boolean _prevMeasureSuccess;
    private final boolean _batteryLow;
    private final boolean _chargerConnected;
    private final boolean _watchNotOnWrist;
    private final boolean _measureInProgress;
    private final boolean _mlUpdateInProgress;
    private final boolean _shutdownManual;
    private final boolean _shutdownInProgress;
    private final boolean _measureSuccess;

    public StatusChangeEvent(byte pNewStatus) {
        super();
        _rawStatus = pNewStatus;

        _batteryLow = ((pNewStatus & 1) == 1);
        _chargerConnected = (((pNewStatus >> 1) & 1) == 1);
        _watchNotOnWrist = (((pNewStatus >> 2) & 1) == 1);
        _measureInProgress = (((pNewStatus >> 3) & 1) == 1);
        _mlUpdateInProgress = (((pNewStatus >> 4) & 1) == 1);
        _shutdownManual = (((pNewStatus >> 5) & 1) == 1);
        _shutdownInProgress = (((pNewStatus >> 6) & 1) == 1);
        _measureSuccess = (((pNewStatus >> 7) & 1) == 1);
    }

    public boolean isBatteryLow() {
        return _batteryLow;
    }

    public boolean isChargerConnected() {
        return _chargerConnected;
    }

    public boolean isWatchNotOnWrist() {
        return _watchNotOnWrist;
    }

    public boolean isMeasureInProgress() {
        return _measureInProgress;
    }

    public boolean isMlUpdateInProgress() {
        return _mlUpdateInProgress;
    }

    public boolean isShutdownManual() {
        return _shutdownManual;
    }

    public boolean isShutdownInProgress() {
        return _shutdownInProgress;
    }

    public boolean isMeasureSuccess() {
        return _measureSuccess;
    }

    public static boolean isPrevBatteryLow() {
        return _prevBatteryLow;
    }

    public static boolean isPrevChargerConnected() {
        return _prevChargerConnected;
    }

    public static boolean isPrevWatchNotOnWrist() {
        return _prevWatchNotOnWrist;
    }

    public static boolean isPrevMeasureInProgress() {
        return _prevMeasureInProgress;
    }

    public static boolean isPrevMlUpdateInProgress() {
        return _prevMlUpdateInProgress;
    }

    public static boolean isPrevShutdownManual() {
        return _prevShutdownManual;
    }

    public static boolean isPrevShutdownInProgress() {
        return _prevShutdownInProgress;
    }

    public static boolean isPrevMeasureSuccess() {
        return _prevMeasureSuccess;
    }

    public static void reset() {
        _prevBatteryLow = false;
        _prevChargerConnected = false;
        _prevWatchNotOnWrist = false;
        _prevMeasureInProgress = false;
        _prevMlUpdateInProgress = false;
        _prevShutdownManual = false;
        _prevShutdownInProgress = false;
        _prevMeasureSuccess = false;
    }

    public void setNewStatus() {
        _prevBatteryLow = _batteryLow;
        _prevChargerConnected = _chargerConnected;
        _prevWatchNotOnWrist = _watchNotOnWrist;
        _prevMeasureInProgress = _measureInProgress;
        _prevMlUpdateInProgress = _mlUpdateInProgress;
        _prevShutdownManual = _shutdownManual;
        _prevShutdownInProgress = _shutdownInProgress;
        _prevMeasureSuccess = _measureSuccess;
    }

    @Override
    public String getData() {
        return "{newStatus: " + _rawStatus + "}";
    }
}
