package com.lifeplus.Util;

public class Global {
    public static final boolean _onSimulator = false;
    private static boolean _debugMode = true;
    private static String _appVersion = "1.0.0";         // TODO: read from manifest

    private static int _userId = 0;
    private static String _watchMSN = "";

    private static int _userIdForScan = 0;
    private static String _watchMsnForScan;
    private static String _currentStatus = null;

    public static void setUserIdForScan(int pUserIdForScan) {
        _userIdForScan = pUserIdForScan;
    }

    public static int getUserIdForScan() {
        return _userIdForScan;
    }

    public static void setWatchMSNForScan(String pWatchMsnForScan) {
        _watchMsnForScan = pWatchMsnForScan;
    }

    public static String getWatchMSNForScan() {
        return _watchMsnForScan;
    }

    public static void setUserId(int pUserId) {
        _userId = pUserId;
    }

    public static int getUserId() {
        return _userId;
    }

    public static String getWatchMSN() {
        return _watchMSN;
    }

    public static void setWatchMSN(String pWatchMSN) {
        _watchMSN = pWatchMSN;
    }

    public static boolean isDebugMode() {
        return _debugMode;
    }

    public static void setDebugMode(boolean debugMode) {
        _debugMode = debugMode;
    }

    public static String getAppVersion() {
        return _appVersion;
    }

    public static void setAppVersion(String appVersion) {
        _appVersion = appVersion;
    }

    public static String getCurrentStatus() {
        return _currentStatus;
    }

    public static void setCurrentStatus(String pCurrentStatus) {
        Global._currentStatus = pCurrentStatus;
    }

    public static void moveConfirmScanUser() {
        _userId = _userIdForScan;
        _watchMSN = _watchMsnForScan;
        _userIdForScan = 0;
        _watchMsnForScan = "";
    }
}
