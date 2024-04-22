package com.lifeplus;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.Looper;
import android.provider.CalendarContract;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;
import com.lifeplus.Ble.BleDevice;
import com.lifeplus.Ble.BleServices;
import com.lifeplus.Ble.GattCallback;
import com.lifeplus.Database.DbAccess;
import com.lifeplus.Database.DbQuery;
import com.lifeplus.Database.DbQueryType;
import com.lifeplus.Events.NoParamEvent;
import com.lifeplus.Notification.CalendarEventListener;
import com.lifeplus.Notification.NotificationListener;
import com.lifeplus.Pojo.DbQueries;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.BleProcStateEnum;
import com.lifeplus.Pojo.Enum.NoParamEventEnum;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.Responses.AppSyncResponse;
import com.lifeplus.Pojo.Responses.CalibrationResponse;
import com.lifeplus.Pojo.Responses.ConnectResponse;
import com.lifeplus.Pojo.Responses.FirmwareUpdateResponse;
import com.lifeplus.Pojo.Responses.InstantMeasureResponse;
import com.lifeplus.Pojo.Responses.StepGoalResponse;
import com.lifeplus.Pojo.UserSessionStruct;
import com.lifeplus.Recievers.InternetConnectivity;
import com.lifeplus.Util.ConnectErrorHandler;
import com.lifeplus.Util.ErrorLogger;
import com.lifeplus.Util.ErrorLoggerProvider;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;
import com.lifeplus.Util.LpUtility;
import com.lifeplus.WebService.WebServiceMethods;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;
import java.util.Set;

public class LifePlusReactModule extends ReactContextBaseJavaModule {
    public static BleServices _bleService;
    private String _connectRequest;
    private Promise _connectPromise;

    public LifePlusReactModule(ReactApplicationContext reactContext, ErrorLoggerProvider errorLoggerProvider) {
        super(reactContext);
        ErrorLogger.provider = errorLoggerProvider;
        EventEmittersToReact.getInstance().setReactContext(reactContext);
        // check internet connectivity
        InternetConnectivity mConnectivity = new InternetConnectivity();
        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        filter.addAction(Intent.ACTION_AIRPLANE_MODE_CHANGED);
        reactContext.registerReceiver(mConnectivity, filter);

        NotificationListener mNotificationListener = new NotificationListener();
        reactContext.registerReceiver(mNotificationListener, filter);

        _bleService = new BleServices(getReactApplicationContext());

        CalendarEventListener mCalendarEventListener = new CalendarEventListener();
        IntentFilter mCalendarFilter = new IntentFilter(CalendarContract.ACTION_EVENT_REMINDER);
        mCalendarFilter.addDataScheme("content");
        reactContext.registerReceiver(mCalendarEventListener, mCalendarFilter);

        BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if ((intent != null) && (intent.getAction() != null)) {
                    if ("android.bluetooth.device.action.BOND_STATE_CHANGED".equalsIgnoreCase(intent.getAction())) {
                        try {
                            BluetoothDevice mDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                            if (mDevice == null) {
                                return;
                            }
                            String mStatusDesc = "Unknown";
                            int mBondState = mDevice.getBondState();
                            switch (mBondState) {
                                case BluetoothDevice.BOND_BONDING:
                                    mStatusDesc = "BOND_BONDING";
                                    break;
                                case BluetoothDevice.BOND_NONE:
                                    mStatusDesc = "BOND_NONE";
                                    break;
                                case BluetoothDevice.BOND_BONDED:
                                    mStatusDesc = "BOND_BONDED";
                                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_BONDED));
                                    break;
                                default:
                                    Log.d("bt", "DEFAULT");
                                    break;
                            }
                            LpLogger.logInfo(new LoggerStruct("BroadcastReceiver.BOND_STATE_CHANGED", "LifePlusReactModule", "New state of " + mDevice.getAddress() + " is " + mStatusDesc));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        };
        IntentFilter bondIntent = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        getReactApplicationContext().registerReceiver(mBroadcastReceiver, bondIntent);

        IntentFilter timezoneUpdateIntent = new IntentFilter(Intent.ACTION_TIMEZONE_CHANGED);
        BroadcastReceiver timezoneUpdateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (Objects.equals(intent.getAction(), Intent.ACTION_TIMEZONE_CHANGED)) {
                    updateTimezone();
                }
            }
        };
        getReactApplicationContext().registerReceiver(timezoneUpdateReceiver, timezoneUpdateIntent);
    }

    private void updateTimezone() {
        if (BleDevice._blueToothGatt != null && BleServices.getCurrentProc() == BleProcEnum.NONE) {
            BleServices.setCurrentProc(BleProcEnum.TIMEZONE_UPDATE);
            BleServices.setCurrentProcState(
                    BleProcEnum.TIMEZONE_UPDATE,
                    BleProcStateEnum.SET_DATETIME
            );
            EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DATE_TIME_SYNC));
        } else if (BleDevice._blueToothGatt != null) {
            Handler mainHandler = new Handler(Looper.getMainLooper());
            mainHandler.postDelayed(this::updateTimezone, 60*1000);
        }
    }

    private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (Objects.equals(intent.getAction(), BluetoothAdapter.ACTION_STATE_CHANGED)) {
                int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.STATE_OFF);
                switch (state) {
                    case BluetoothAdapter.STATE_OFF: {
                        GattCallback._devicePrevStatus = -1;
                        _bleService.disconnectDevice(true);
                        break;
                    }
                    case BluetoothAdapter.STATE_ON: {
                        deviceConnect(_connectRequest, _connectPromise);
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    };

    @NonNull
    @Override
    public String getName() {
        return "LifePlusReactModule";
    }

    @ReactMethod
    private void dbTunnel(String pInputJson, Promise promise) {
        final ArrayList<DbQuery> mQueries = new ArrayList<>();
        try {
            Gson gson = new Gson();
            DbQueries mDbQueries = gson.fromJson(pInputJson, DbQueries.class);
            switch (mDbQueries.getQueryType()) {
                case "insert":
                    mQueries.add(new DbQuery(DbQueryType.Insert, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                    break;
                case "select":
                    mQueries.add(new DbQuery(DbQueryType.Select, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                    break;
                case "update":
                    mQueries.add(new DbQuery(DbQueryType.Update, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                    break;
                case "delete":
                    mQueries.add(new DbQuery(DbQueryType.Delete, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                    break;
                default:
                    mQueries.add(new DbQuery(DbQueryType.Unknown, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                    break;

            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        DbAccess mDataBaseAccess = DbAccess.getInstance(getReactApplicationContext());
        HashMap<String, Object> mDatabaseResult = mDataBaseAccess.executeQueries(mQueries);
        HashMap<String, HashMap<String, Object>> mDataBaseFinalMap = new HashMap<>();
        mDataBaseFinalMap.put("databaseTunnel", mDatabaseResult);
        String mRetunJsonToReact = new Gson().toJson(mDataBaseFinalMap);
        promise.resolve(mRetunJsonToReact);
    }

    @ReactMethod
    private void dbTunnelForMultipleQueries(String pRequest, Promise promise) {
        DbAccess mDataBaseAccess = DbAccess.getInstance(getReactApplicationContext());
        String mReturn;
        ArrayList<String> mQueryResults = new ArrayList<>();
        final ArrayList<DbQuery> mQueries = new ArrayList<>();
        try {
            Gson gson = new Gson();
            JSONObject mJsonObject = new JSONObject(pRequest);
            JSONArray jsonArray = mJsonObject.getJSONArray("Queries");
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject mMap = jsonArray.getJSONObject(i);
                DbQueries mDbQueries = gson.fromJson(mMap.toString(), DbQueries.class);
                switch (mDbQueries.getQueryType()) {
                    case "insert":
                        mQueries.add(new DbQuery(DbQueryType.Insert, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                        break;
                    case "select":
                        mQueries.add(new DbQuery(DbQueryType.Select, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                        break;
                    case "update":
                        mQueries.add(new DbQuery(DbQueryType.Update, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                        break;
                    case "delete":
                        mQueries.add(new DbQuery(DbQueryType.Delete, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                        break;
                    default:
                        mQueries.add(new DbQuery(DbQueryType.Unknown, mDbQueries.getQueryType(), mDbQueries.getQuery()));
                        break;
                }
            }
            HashMap<String, Object> mData = mDataBaseAccess.executeQueries(mQueries);
            JSONObject mJsonObj = new JSONObject(mData);
//            mJsonObj.put("queryName", mDbQueries.getQueryName());
            mQueryResults.add(mJsonObj.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
        mReturn = "{\"results\"" + ":" + mQueryResults.toString() + "}";
        promise.resolve(mReturn);
    }

    public static boolean isNetworkAvailable(Context pCon) {
        ConnectivityManager connectivityManager = (ConnectivityManager) pCon.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    public static void uploadOnCloud(HashMap<String, Object> pMap, String pMeasureTime) {
        String mReturnJson = new Gson().toJson(pMap);
        String mRandomMeasures = mReturnJson.replaceAll("\"", "'");
        String request = WebServiceMethods.createUploadDataRequest(mRandomMeasures, pMeasureTime);
        EventEmittersToReact.getInstance().uploadOnCloud(request);
    }

    public static void uploadMealsOnCloud(HashMap<String, Object> pMap) {
        int mSize = (int) pMap.get("Meal_Type");
        long mTimeStamp = (long) pMap.get("MealsTimeStamp");
        String request = WebServiceMethods.createMealsUploadDataRequest(mSize, mTimeStamp);
        EventEmittersToReact.getInstance().uploadOnCloud(request);
    }

    public static void uploadStepsOnCloud(HashMap<String, Object> pMap) {
        int stepsCount = (int) pMap.get("Steps");
        long stepsTime = (long) pMap.get("Time");
        String request = WebServiceMethods.createStepsUploadDataRequest(stepsCount, stepsTime);
        EventEmittersToReact.getInstance().uploadOnCloud(request);
    }

    public static void uploadRawDataOnCloud(String dataJson, long measureTime) {
        String rawData = dataJson.replaceAll("\"", "'");
        String mRequest = WebServiceMethods.createUploadRawDataRequest(rawData, measureTime);
        EventEmittersToReact.getInstance().uploadOnCloud(mRequest);
    }

    @ReactMethod
    void startInstantMeasure(Promise pPromise) {
        DbAccess mDbAccess = DbAccess.getInstance(getReactApplicationContext());
        UserSessionStruct mCurrSession = mDbAccess.getCurrSession();
        if (BleServices.getCurrentProc() != BleProcEnum.NONE) {
            switch (BleServices.getCurrentProc()) {
                case AUTO_MEASURE:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case CALIBRATE:
                case READ_RAW_DATA:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.CALIBRATE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case INSTANT_MEASURE:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case CONNECT:
                    if ((BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV) ||
                            (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START))
                        pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;

                default:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.OTHER_PROC_RUNNING, BleServices.getCurrentProc().getDesc()).getResponseStr());
            }
            return;
        }

        BleServices.setCurrentProc(BleProcEnum.INSTANT_MEASURE);

        if (_bleService.startInstantMeasure()) {
            InstantMeasureResponse mResponse = new InstantMeasureResponse(ResultCodeEnum.MEASURE_ACKNOWLEDGE, "Instant measure ");
            mResponse.setUserId((mCurrSession == null) ? "" : mCurrSession.getUserId());
            mResponse.setAuthId((mCurrSession == null) ? "" : mCurrSession.getDeviceId());
            pPromise.resolve(mResponse.getResponseStr());
        } else {
            BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.NONE);
            EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_FAILED));
            pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.UNKNOWN_ERR, "Unable to perform instant measure").getResponseStr());
        }
    }

    void simuDeviceConnect(String pRequest, Promise promise) {
        try {
            JSONObject jObj = new JSONObject(pRequest);
            String mDeviceMsn = jObj.getString("AuthenticationId");
            String mUserId = jObj.getString("userId");

            ConnectResponse mResponse = new ConnectResponse(ResultCodeEnum.WATCH_CONNECTED);
            mResponse.setUserId(mUserId);
            mResponse.setAuthId(mDeviceMsn);
            promise.resolve(mResponse.getResponseStr());
        } catch (Exception e) {
            promise.resolve(new ConnectResponse(ResultCodeEnum.UNKNOWN_ERR, "Unable to start scanning (" + e.getMessage() + ")").getResponseStr());
        }
    }

    @ReactMethod
    void deviceConnect(String pRequest, Promise pPromise) {
        ErrorLogger.log("React method deviceConnect called.");
        if (_bleService.connectedDevice != null && _bleService.connectedDevice.isBonded()) {
            ConnectResponse mPairedResponse = new ConnectResponse(ResultCodeEnum.CONNECT_ACKNOWLEDGE, "Device connection ");
            mPairedResponse.setUserId(String.valueOf(Global.getUserIdForScan()));
            mPairedResponse.setAuthId(Global.getWatchMSNForScan());
            pPromise.resolve(mPairedResponse.getResponseStr());

            EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_CONNECTED));
            return;
        }
        Log.e("Connection", "1");
        _connectRequest = pRequest;
        _connectPromise = pPromise;
        IntentFilter bluetoothFilter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        getReactApplicationContext().registerReceiver(bluetoothReceiver, bluetoothFilter);

        if (Global._onSimulator) {
            simuDeviceConnect(pRequest, pPromise);
            return;
        }
        if (BleServices.getCurrentProc() != BleProcEnum.NONE) {
            LpLogger.logInfo(new LoggerStruct("deviceConnect", "LifePlusReactModule", ResultCodeEnum.OTHER_PROC_RUNNING.getDesc() + " (" + BleServices.getCurrentProc().getDesc() + ")"));
            pPromise.resolve(new ConnectResponse(ResultCodeEnum.OTHER_PROC_RUNNING, BleServices.getCurrentProc().getDesc()).getResponseStr());
            ErrorLogger.log("deviceConnect - other process is running.");
            ConnectErrorHandler.recordConnectError(getReactApplicationContext());
            return;
        }

        _bleService.disconnectDevice(false);
        BleServices.intendedDisconnect = true;
        BleServices.setCurrentProc(BleProcEnum.CONNECT);

        String validateInputs = setUserNMsn(pRequest);
        if (validateInputs.length() > 0) {
            ErrorLogger.log("deviceConnect - watch MSN is invalid.");
            LpLogger.logInfo(new LoggerStruct("deviceConnect", "LifePlusReactModule", validateInputs));
            BleServices.setCurrentProc(BleProcEnum.NONE);
            pPromise.resolve(new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, validateInputs).getResponseStr());
            return;
        }
        Log.e("Connection", "2");

        boolean mFoundInBonded = findInBonded();
        if (mFoundInBonded) {
            ErrorLogger.log("deviceConnect - watch found in bonded.");
            ConnectResponse mPairedResponse = new ConnectResponse(ResultCodeEnum.CONNECT_ACKNOWLEDGE, "Device connection ");
            mPairedResponse.setUserId(String.valueOf(Global.getUserIdForScan()));
            mPairedResponse.setAuthId(Global.getWatchMSNForScan());
            pPromise.resolve(mPairedResponse.getResponseStr());
            // BleServices.setCurrentProc(BleProcEnum.NONE);
            return;
        }

        ConnectResponse startScanResponse = _bleService.startScanning();
        if (startScanResponse != null) {
            if ((startScanResponse.getResultCode() == null) || ("failed".equalsIgnoreCase(startScanResponse.getResultCode().getType()))) {
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
                BleServices.setCurrentProc(BleProcEnum.NONE);
                ErrorLogger.log("deviceConnect - failed to start scanning");
                return;
            }

            pPromise.resolve(startScanResponse.getResponseStr());
        } else {
            ErrorLogger.log("deviceConnect - failed to start scanning.");
            BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
            BleServices.setCurrentProc(BleProcEnum.NONE);
            pPromise.resolve(new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, "Got null from startScanning").getResponseStr());
        }
    }

    @ReactMethod
    void appSync(String pRequest, Promise pPromise) {
        LpLogger.logInfo(new LoggerStruct("appSync", "LifePlusReactModule", "Received input string (" + pRequest + ")"));
//        if (BleServices.getCurrentProc() != BleProcEnum.NONE) {
//            switch(BleServices.getCurrentProc()){
//                case AUTO_MEASURE:
//                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.AUTO_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
//                    break;
//
//                case CALIBRATE:
//                case READ_RAW_DATA:
//                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.CALIBRATE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
//                    break;
//
//                case INSTANT_MEASURE:
//                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.INSTANT_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
//                    break;
//
//                case CONNECT:
//                    if((BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV) ||
//                            (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START))
//                        pPromise.resolve(new AppSyncResponse(ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
//                    break;
//
//                default:
//                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.OTHER_PROC_RUNNING, BleServices.getCurrentProc().getDesc()).getResponseStr());
//            }
//            return;
//        }

        try {
            if (pRequest != null && isJSONValid(pRequest)) {
                JSONObject json = new JSONObject(pRequest);
                if (json.has("errorIdToThrow")) {
                    String mErrorIdToThrow = json.getString("errorIdToThrow");
                    if (!(mErrorIdToThrow.equalsIgnoreCase(""))) {
                        String mErrorMsgToThrow = json.getString("errorMsgToThrow");
                        if ("".equalsIgnoreCase(mErrorMsgToThrow)) {
                            mErrorMsgToThrow = "Unknown Error";
                        }
                        pPromise.resolve(new AppSyncResponse(mErrorIdToThrow, mErrorMsgToThrow).getResponseStr());
                        return;
                    }
                }

                int mUserId = -1;
                String mDeviceMsn = "";

                String mInputStr = json.has("userId") ? json.getString("userId") : "x";
                if ("".equalsIgnoreCase(mInputStr)) {
                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.INVALID_USER, "Received (" + mInputStr + ")").getResponseStr());
                    return;
                }
                try {
                    mUserId = Integer.parseInt(mInputStr);
                } catch (NumberFormatException e) {
                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.INVALID_USER, "Received (" + mInputStr + ")").getResponseStr());
                    return;
                }
                mInputStr = json.has("deviceMsn") ? json.getString("deviceMsn") : "";
                if (!"".equalsIgnoreCase(mInputStr)) {
                    mDeviceMsn = mInputStr;
                } else {
                    pPromise.resolve(new AppSyncResponse(ResultCodeEnum.INVALID_MSN, "Received (" + mInputStr + ")").getResponseStr());
                    return;
                }

                BleServices.setCurrentProcState(BleProcEnum.APP_SYNC, BleProcStateEnum.NONE);
                AppSyncResponse mAppSyncResponse = _bleService.startAppSync(false);
                if (mAppSyncResponse != null) {
                    pPromise.resolve(mAppSyncResponse.getResponseStr());
                } else {
                    InstantMeasureResponse mResponse = new InstantMeasureResponse(ResultCodeEnum.APPSYNC_ACKNOWLEDGE, "AppSync ");
                    mResponse.setUserId("" + mUserId);
                    mResponse.setAuthId(mDeviceMsn);
                    pPromise.resolve(mResponse.getResponseStr());
                }
            }
        } catch (Exception e) {
            pPromise.resolve(new AppSyncResponse(ResultCodeEnum.UNKNOWN_ERR, "Unable to perform AppSync (" + e.getMessage() + ")").getResponseStr());
            LpLogger.logError(new LoggerStruct("appSync", "LifePlusReactModule",
                    ResultCodeEnum.UNKNOWN_ERR,
                    "Unable to perform AppSync (" + e.getMessage() + ")",
                    "508"));
        }
    }

    @ReactMethod
    void calibrate(String pRequest, Promise pResolver) {
        HashMap<String, Object> mData = new HashMap<>();
        DbAccess mDbAccess = DbAccess.getInstance(getReactApplicationContext());
        HashMap<String, Object> mResultMap = new HashMap<>();

        LpLogger.logInfo(new LoggerStruct("calibrate", "LifePlusReactModule",
                ResultCodeEnum.UNKNOWN_ERR,
                "Received calibrate with - " + pRequest + ")",
                ""));

        try {
            if (pRequest != null && isJSONValid(pRequest)) {
                JSONObject json = new JSONObject(pRequest);
                if (json.has("errorIdToThrow")) {
                    String mErrorIdToThrow = json.getString("errorIdToThrow");
                    if (!("".equalsIgnoreCase(mErrorIdToThrow))) {
                        String mErrorMsgToThrow = json.getString("errorMsgToThrow");
                        if (!mErrorMsgToThrow.equalsIgnoreCase("")) {
                            mResultMap.put("message", mErrorMsgToThrow);
                        } else {
                            mResultMap.put("message", "Unknown Error");
                        }
                        pResolver.resolve(new CalibrationResponse(mErrorIdToThrow, mErrorMsgToThrow).getResponseStr());
                        return;
                    }
                }

                String mErrorMsg = "Received";
                int mUserId = -1;
                String mDeviceMsn = "";
                String mInputStr = json.has("userId") ? json.getString("userId") : "X";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_USER, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                    return;
                }
                try {
                    mUserId = Integer.parseInt(mInputStr);
                    mData.put("id", mUserId);
                } catch (NumberFormatException e) {
                    pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_USER, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                    return;
                }
                mInputStr = json.has("deviceMsn") ? json.getString("deviceMsn") : "";
                if ((mInputStr != null) && !("".equalsIgnoreCase(mInputStr))) {
                    mDeviceMsn = mInputStr;
                    mData.put("deviceMsn", mDeviceMsn);
                } else {
                    pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_MSN, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                    return;
                }

                mInputStr = json.has("SPO2") ? json.getString("SPO2") : "0";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    mData.put("SPO2", 0);
                } else {
                    try {
                        mData.put("SPO2", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_SPO2, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                        return;
                    }
                }
                mInputStr = json.has("RR") ? json.getString("RR") : "0";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    mData.put("RR", 0);
                } else {
                    try {
                        mData.put("RR", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_RR, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                        return;
                    }
                }
                mInputStr = json.has("HR") ? json.getString("HR") : "0";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    mData.put("HR", 0);
                } else {
                    try {
                        mData.put("HR", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_HR, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                        return;
                    }
                }
                mInputStr = json.has("SBP") ? json.getString("SBP") : "0";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    mData.put("SBP", 0);
                } else {
                    try {
                        mData.put("SBP", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_SBP, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                        return;
                    }
                }
                mInputStr = json.has("DBP") ? json.getString("DBP") : "0";
                if ((mInputStr == null) || "".equalsIgnoreCase(mInputStr)) {
                    mData.put("DBP", 0);
                } else {
                    try {
                        mData.put("DBP", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_DBP, mErrorMsg + " (" + mInputStr + ")").getResponseStr());
                        return;
                    }
                }
                mInputStr = json.has("Glucose") ? json.getString("Glucose") : "0";
                if (mInputStr.isEmpty()) {
                    mData.put("Glucose", 0);
                } else {
                    try {
                        mData.put("Glucose", Double.parseDouble(mInputStr));
                        mData.put("Glucose", Integer.parseInt(mInputStr));
                    } catch (NumberFormatException e) {
                        if (!mData.containsKey("Glucose")) {
                            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INVALID_GLUCOSE, mInputStr + " is not Int or Double value").getResponseStr());
                            return;
                        }
                    }
                }

//        if (mCurrSession == null) {
//            pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.INVALID_USER_SESSION).getResponseStr());
//            return;
//        }
                if (BleServices.getCurrentProc() != BleProcEnum.NONE) {

                    switch (BleServices.getCurrentProc()) {
                        case AUTO_MEASURE:
                            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.AUTO_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                            break;

                        case CALIBRATE:
                        case READ_RAW_DATA:
                            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.CALIBRATE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                            break;

                        case INSTANT_MEASURE:
                            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.INSTANT_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                            break;

                        case CONNECT:
                            if ((BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV) ||
                                    (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START))
                                pResolver.resolve(new CalibrationResponse(ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                            break;

                        default:
                            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.OTHER_PROC_RUNNING, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    }
                    return;
                }

                mDbAccess.updateCalibration(mUserId, mData);
                BleServices.setCurrentProc(BleProcEnum.CALIBRATE);
                BleServices.setCalibrationUserEnteredData(mData);
                if (_bleService.startCalibration()) {
                    CalibrationResponse response = new CalibrationResponse(ResultCodeEnum.CALIBRATION_ACKNOWLEDGE, "Calibration ");
                    response.setUserId("" + mUserId);
                    response.setAuthId(mDeviceMsn);
                    pResolver.resolve(response.getResponseStr());
                } else {
                    BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.NONE);
                    EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_FAILED));
                    pResolver.resolve(new CalibrationResponse(ResultCodeEnum.UNKNOWN_ERR, "Unable to perform calibrate").getResponseStr());
                }
            }
        } catch (Exception e) {
            pResolver.resolve(new CalibrationResponse(ResultCodeEnum.UNKNOWN_ERR, "Unable to perform calibrate (" + e.getMessage() + ")").getResponseStr());
        }
    }

    @ReactMethod
    void apiError(String pRequest, Promise pResolver) {
        if (pRequest.length() != 0) {
            try {
                if (isJSONValid(pRequest)) {
                    JSONObject json = new JSONObject(pRequest);

                    String requestType = json.has("type") ? json.getString("type") : "";
                    String url = json.has("url") ? json.getString("url") : "";
                    String data = json.has("data") ? json.getString("data") : "";
                    String options = json.has("options") ? json.getString("options") : "";
                    String status = json.has("status") ? json.getString("status") : "-";

                    ErrorLogger.apiError(
                            "Request " + requestType + " " + url + " failed with status code "
                                    + status, requestType, url, data, options, status);
                    pResolver.resolve("Error logged");
                }
            } catch (Exception e) {
                pResolver.resolve("Error setting request keys: " + e.getMessage());
            }
        } else {
            pResolver.resolve("Failed to log error - empty message.");
        }
    }

    @ReactMethod
    void startDfuMode(Promise pResolver) {
        BleServices.setCurrentProc(BleProcEnum.FIRMWARE_UPDATE);
        BleServices.setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.FIRMWARE_UPDATE_INITIATE_DFU);
        FirmwareUpdateResponse mResponse = _bleService.initiateDfuMode();
        if (mResponse != null) {
            if (mResponse.getResultCode().getType().equalsIgnoreCase("failed")) {
                BleServices.setCurrentProc(BleProcEnum.NONE);
            }
            pResolver.resolve(mResponse.getResponseStr());
        } else {
            pResolver.resolve(new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_DFU_MODE_INITIATED).getResponseStr());
        }
    }

    @ReactMethod
    void startFirmwareUpdate(String pRequest, Promise pResolver) {
        String fwUpdateFilePath = "";
        try {
            JSONObject jObj = new JSONObject(pRequest);
            fwUpdateFilePath = jObj.getString("FirmwareUpdateFilePath");
        } catch (Exception e) {
            e.printStackTrace();
            LpLogger.logError(new LoggerStruct("startFirmwareUpdate", "LifePlusReactModule",
                    ResultCodeEnum.FIRMWARE_UPDATE_INVALID_FILE,
                    "Invalid update file path",
                    ""));
            pResolver.resolve(new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_INVALID_FILE).getResponseStr());
            return;
        }
        File updateFile = new File(fwUpdateFilePath);

        // *********** Testing ***********
//        File updateFile = null;
//        try {
//            updateFile = File.createTempFile("update", ".cyacd2");
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        // *********** Testing ***********

        if (updateFile.exists()) {
            BleServices.setCurrentProc(BleProcEnum.FIRMWARE_UPDATE);
            BleServices.setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE);
            _bleService.setFirmwareUpdateFile(updateFile);
            _bleService.startScanning(_bleService.SCAN_TIMEOUT_BEFORE_DFU_MS);
        } else {
            LpLogger.logError(new LoggerStruct("startFirmwareUpdate", "LifePlusReactModule",
                    ResultCodeEnum.FIRMWARE_UPDATE_INVALID_FILE,
                    "File does not exist",
                    ""));
            pResolver.resolve(new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_INVALID_FILE).getResponseStr());
        }
    }

    @ReactMethod
    void updateDailyStepGoal(Promise pPromise) {
        if (BleServices.getCurrentProc() != BleProcEnum.NONE) {
            switch (BleServices.getCurrentProc()) {
                case AUTO_MEASURE:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case CALIBRATE:
                case READ_RAW_DATA:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.CALIBRATE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case INSTANT_MEASURE:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;
                case CONNECT:
                    if ((BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV) ||
                            (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START))
                        pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS, BleServices.getCurrentProc().getDesc()).getResponseStr());
                    break;

                default:
                    pPromise.resolve(new InstantMeasureResponse(ResultCodeEnum.OTHER_PROC_RUNNING, BleServices.getCurrentProc().getDesc()).getResponseStr());
            }
            return;
        }

        DbAccess mDbAccess = DbAccess.getInstance(getReactApplicationContext());
        int stepGoal = mDbAccess.getCurrentUserGoal(Global.getUserId());
        if (stepGoal == 0) {
            pPromise.resolve(new StepGoalResponse(ResultCodeEnum.INVALID_STEP_GOAL).getResponseStr());
        } else {
            BleServices.setCurrentProcState(BleProcEnum.STEP_GOAL_UPDATE, BleProcStateEnum.SET_STEP_GOAL);
            StepGoalResponse result = _bleService.updateDailyStepGoal(LpUtility.getUpdateStepGoalByteArray(stepGoal));
            pPromise.resolve(result.getResponseStr());
        }
    }

    private boolean findInBonded() {
        boolean result = false;
        BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.CHECK_PAIRED);

        BluetoothAdapter bAdapter = BluetoothAdapter.getDefaultAdapter();
        Set<BluetoothDevice> mPairedDevices = bAdapter.getBondedDevices();
        if (mPairedDevices.size() > 0) {
            String mWatchName = "LPW2-" + Global.getWatchMSNForScan();
            for (BluetoothDevice device : mPairedDevices) {
                String mDeviceName = device.getName();
                if (mWatchName.equalsIgnoreCase(mDeviceName)) {
                    LpLogger.logInfo(new LoggerStruct("findInBonded", "BleServices", "Found in paired list"));
                    result = true;
                    BleDevice mBleDevice = new BleDevice(getReactApplicationContext(), device, true);
                    _bleService.connectWithBle(mBleDevice);
                    break;
                }
            }
        }
        if (!result) {
            LpLogger.logInfo(new LoggerStruct("findInBonded", "BleServices", "Not available in paired list"));
        }
        return result;
    }

    private boolean isJSONValid(String test) {
        try {
            new JSONObject(test);
        } catch (JSONException ex) {
            try {
                new JSONArray(test);
            } catch (JSONException ex1) {
                return false;
            }
        }
        return true;
    }

    private String setUserNMsn(String pRequest) {
        String mResult = "";
        try {
            JSONObject jObj = new JSONObject(pRequest);
            String mWatchMsnForScan = (jObj.has("AuthenticationId")) ? jObj.getString("AuthenticationId") : "";
            Global.setWatchMSNForScan(mWatchMsnForScan);
            if (Global.getWatchMSNForScan().isEmpty()) {
                mResult = "Invalid MSN";
            }
            String mUserIdStr = (jObj.has("userId")) ? jObj.getString("userId") : "";
            try {
                Global.setUserIdForScan(Integer.parseInt(mUserIdStr));
                Global.setUserId(Integer.parseInt(mUserIdStr));

            } catch (NumberFormatException e) {
                mResult = "Invalid user id";
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("startScanning", "LifePlusReactModule",
                    ResultCodeEnum.UNABLE_START_SCANNING,
                    e.getMessage(),
                    ""));
            mResult = e.getMessage();
        }
        return mResult;
    }
}
