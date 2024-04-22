package com.lifeplus.Pojo;

import android.os.Build;

import com.google.gson.Gson;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;

import java.util.Date;
import java.util.HashMap;

public class LoggerStruct {
    private final HashMap<String, String> mLog = new HashMap<>();

    public LoggerStruct(String pFunctionName, String pFileName, String pEventDescription) {
        setValues(pFunctionName, pFileName, null, pEventDescription, "");
    }

    public LoggerStruct(String pFunctionName, String pFileName,
                        ResultCodeEnum pErrorCode, String pEventDescription, String pLineNumber) {
        setValues(pFunctionName, pFileName, pErrorCode, pEventDescription, pLineNumber);
    }

    private void setValues(String pFunctionName, String pFileName,
                           ResultCodeEnum pErrorCode, String pEventDescription, String pLineNumber) {
        mLog.put("ts", String.valueOf(new Date().getTime()));
        mLog.put("userId", String.valueOf((Global.getUserId() <= 0) ? Global.getUserIdForScan() : Global.getUserId()));
        mLog.put("seq_no", String.valueOf(LpLogger.getNewSrlNo()));
        mLog.put("userName", "");
        mLog.put("codeCategoryId", "2");
        mLog.put("functionName", pFunctionName);
        mLog.put("fileName", pFileName);
        mLog.put("operationName", "add");
        mLog.put("watchMSN", (Global.getWatchMSN().length() <= 0) ? Global.getWatchMSNForScan() : Global.getWatchMSN());
        mLog.put("appVersion", Global.getAppVersion());
        mLog.put("osVersion", Build.VERSION.RELEASE);
        mLog.put("errorCode", (pErrorCode == null) ? "" : pErrorCode.getCode());
        mLog.put("eventDescription", pEventDescription);
        mLog.put("lineNumber", pLineNumber);
        mLog.put("applicationNameId", "1");
    }

    public String getJSONStr() {
        return new Gson().toJson( mLog );
    }
}
