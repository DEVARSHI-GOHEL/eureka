package com.lifeplus.Util;

import android.util.Log;

import com.lifeplus.EventEmittersToReact;
import com.lifeplus.Pojo.LoggerStruct;

import java.util.Timer;
import java.util.TimerTask;

public class LpLogger {
    private static long _logSrlNo = 0;

    public static long getNewSrlNo() {
        return _logSrlNo++;
    }

    public static void logInfo(final LoggerStruct mLog) {
        TimerTask timerTask = new TimerTask() {
            public void run() {
                String request = mLog.getJSONStr();
                EventEmittersToReact.getInstance().debugLog(request);
            }
        };
        Log.i("logInfo", mLog.getJSONStr());
        Timer mLogTimer = new Timer();
        mLogTimer.schedule(timerTask, 100);
    }

    public static void logError(final LoggerStruct mLog) {
        TimerTask timerTask = new TimerTask() {
            public void run() {
                String request = mLog.getJSONStr();
                EventEmittersToReact.getInstance().debugLog(request);
            }
        };
        Log.i("logError", mLog.getJSONStr());
        Timer mLogTimer = new Timer();
        mLogTimer.schedule(timerTask, 100);
    }
}
