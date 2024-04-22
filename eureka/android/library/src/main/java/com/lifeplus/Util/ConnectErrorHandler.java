package com.lifeplus.Util;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class ConnectErrorHandler {
    private static final int SCANNING_ERROR_PERIOD_MIN = 5;
    private static final int SCANNING_ERROR_COUNT = 3;
    private static final int CONNECT_ERROR_PERIOD_MIN = 5;
    private static final int CONNECT_ERROR_COUNT = 3;
    public static final String SHARED_PREFS_SCAN_TIMEOUT = "SCAN_TIMEOUT";
    public static final String SHARED_PREFS_CONNECT_TIMEOUT = "CONNECT_ERROR_TIMEOUT";

    public static void recordScanError(Context context) {
        Log.e("ErrorLogger", "Scanning error recorded.");
        long errorsBound = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(SCANNING_ERROR_PERIOD_MIN);
        String timeoutsString = SharedPrefUtils.getString(context, SHARED_PREFS_SCAN_TIMEOUT);
        ArrayList<String> timeoutsList = parseRelevantTimeouts(timeoutsString, errorsBound);
        timeoutsList.add(Long.toString(System.currentTimeMillis()));

        if(timeoutsList.size() >= SCANNING_ERROR_COUNT) {
            ErrorLogger.bluetoothError("Scanning for watch has failed repeatedly.");
        }

        SharedPrefUtils.saveString(context, SHARED_PREFS_SCAN_TIMEOUT, TextUtils.join(";", timeoutsList));
    }

    public static void recordConnectError(Context context) {
        Log.e("ErrorLogger", "Connection error recorded.");
        long errorsBound = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(CONNECT_ERROR_PERIOD_MIN);
        String timeoutsString = SharedPrefUtils.getString(context, SHARED_PREFS_CONNECT_TIMEOUT);
        ArrayList<String> timeoutsList = parseRelevantTimeouts(timeoutsString, errorsBound);
        timeoutsList.add(Long.toString(System.currentTimeMillis()));

        if(timeoutsList.size() >= CONNECT_ERROR_COUNT) {
            ErrorLogger.bluetoothError("Connecting to watch has failed repeatedly.");
        }

        SharedPrefUtils.saveString(context, SHARED_PREFS_CONNECT_TIMEOUT, TextUtils.join(";", timeoutsList));
    }

    private static ArrayList<String> parseRelevantTimeouts(String timeoutsString, Long errorsBound) {
        return (ArrayList<String>) Arrays
                .stream(timeoutsString.split(";"))
                .filter(t -> !t.isEmpty() && Long.parseLong(t) > errorsBound)
                .collect(Collectors.toList());
    }
}
