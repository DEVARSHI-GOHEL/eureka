package com.lifeplus.Ble;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.util.Pair;

import com.google.gson.Gson;
import com.lifeplus.Database.DbAccess;
import com.lifeplus.EventEmittersToReact;
import com.lifeplus.Events.CalibrationCompletedEvent;
import com.lifeplus.Events.FirmwareRevisionReadEvent;
import com.lifeplus.Events.MealDataEvent;
import com.lifeplus.Events.MealDataReadEvent;
import com.lifeplus.Events.MeasureTimeReadEvent;
import com.lifeplus.Events.NoParamEvent;
import com.lifeplus.Events.RawDataReadEvent;
import com.lifeplus.Events.StatusChangeEvent;
import com.lifeplus.Events.StepCountEvent;
import com.lifeplus.Events.UserInfoEvent;
import com.lifeplus.Events.VitalReadEvent;
import com.lifeplus.Events.WriteCharCallbackEvent;
import com.lifeplus.Events.WriteDescCallbackEvent;
import com.lifeplus.LifePlusReactModule;
import com.lifeplus.Pojo.ACharDef;
import com.lifeplus.Pojo.AServiceDef;
import com.lifeplus.Pojo.AppSync;
import com.lifeplus.Pojo.Enum.BleCommandEnum;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.BleProcStateEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;
import com.lifeplus.Pojo.Enum.GattServiceEnum;
import com.lifeplus.Pojo.Enum.NoParamEventEnum;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.Responses.AppSyncResponse;
import com.lifeplus.Pojo.Responses.CalibrationResponse;
import com.lifeplus.Pojo.Responses.CommonResponse;
import com.lifeplus.Pojo.Responses.ConnectResponse;
import com.lifeplus.Pojo.Responses.FirmwareUpdateResponse;
import com.lifeplus.Pojo.Responses.InstantMeasureResponse;
import com.lifeplus.Pojo.Responses.MealDataResponse;
import com.lifeplus.Pojo.Responses.StepCountResponse;
import com.lifeplus.Pojo.Responses.StepGoalResponse;
import com.lifeplus.Pojo.ServiceDefs;
import com.lifeplus.Util.ConnectErrorHandler;
import com.lifeplus.Util.ErrorLogger;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;
import com.lifeplus.Util.LpUtility;
import com.lifeplus.lifeleaf.uploader.CommunicationError;
import com.lifeplus.lifeleaf.uploader.ConnectionError;
import com.lifeplus.lifeleaf.uploader.CrcError;
import com.lifeplus.lifeleaf.uploader.FileParseError;
import com.lifeplus.lifeleaf.uploader.FileReadError;
import com.lifeplus.lifeleaf.uploader.FirmwareUploader;
import com.lifeplus.lifeleaf.uploader.InstallationError;
import com.lifeplus.lifeleaf.uploader.UpdateResult;
import com.lifeplus.weather.WeatherManager;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;

import java.io.File;
import java.nio.ByteBuffer;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import kotlin.Unit;
import kotlin.jvm.functions.Function1;

@SuppressLint("MissingPermission")
public class BleServices {
    private static BleProcEnum _currentProc = BleProcEnum.NONE;
    private static BleProcStateEnum _currentProcState = BleProcStateEnum.NONE;

    public static BleDevice _bleDevice;
    private static HashMap<String, Object> _calibrationUserEnteredData = new HashMap<>();

    private static Timer _vitalMeasureTimer = null;
    private static TimerTask _progressTimerTask = null;
    private static Timer _scanStopTimer = null;
    private static String firmwareRevision = "";

    private static boolean _appFirstBoot = true;
    private static int _progressCount = 0;
    private static int rawDataProgress = 0;
    public static boolean intendedDisconnect = false;

    private static final ArrayList<byte[]> _totalRawDataInByteArray = new ArrayList<>();
    private static final ArrayList<HashMap<String, Object>> _collectionOfRawData = new ArrayList<>();
    private static long _measureTime = 0;

    public long SCAN_TIMEOUT_BEFORE_DFU_MS = 30000L;
    public long SCAN_TIMEOUT_MS = 7000L;
    public long CONNECT_TIMEOUT_MS = 15000L;

    public BleDevice connectedDevice; // TODO always same as _bleDevice?
    private final Context _context;
    private File firmwareFile;
    private long lastMeasureTime = 0L;
    private WeatherManager weatherManager;
    private String lastAddress = null;
    private GattCallback _gattCallback;
    private final List<String> statusEvents = Collections.synchronizedList(new ArrayList<>());
    private final List<ResultCodeEnum> chargerStatusEvents = Collections.synchronizedList(new ArrayList<>());
    private final List<Pair<ResultCodeEnum,Boolean>> wristStatusEvents = Collections.synchronizedList(new ArrayList<>());

    private final ScanCallback leScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            try {
                BluetoothDevice mFoundDevice = result.getDevice();
                if (mFoundDevice != null) {
                    String mFoundName = result.getScanRecord().getDeviceName();
                    if (mFoundName == null) {
                        mFoundName = "Unknown device";
                    }
                    if (getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE) {
                        if (mFoundName.equalsIgnoreCase(FirmwareUploader.INSTANCE.getNameInDfuMode())
                                || mFoundDevice.getAddress().equals(lastAddress)) {
                            setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.FIRMWARE_UPDATE_CONNECT_DFU_DEVICE);
                            connectWithBle(new BleDevice(_context, mFoundDevice, false));
                            lastAddress = null;
                        }
                    } else {
                        String mBleWatch = "LPW2-" + Global.getWatchMSNForScan();
                        if (mFoundName.equalsIgnoreCase(mBleWatch)) {
                            connectWithBle(new BleDevice(_context, mFoundDevice, false));
                        }
                    }
                }
            } catch (Exception e) {
                LpLogger.logError(new LoggerStruct("ScanCallback", "LifePlusReactModule",
                        ResultCodeEnum.UNKNOWN_ERR,
                        "Error in Scan Callback (" + e.getMessage() + ")",
                        "706"));

                Log.e("Connection Call", e.getMessage());
            }
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            Log.d("Scan failed", "Batch Scan: " + results.size());
        }

        @Override
        public void onScanFailed(int errorCode) {
            Log.d("Scan failed", "Code: " + errorCode);
        }
    };

    private static void notifyMeasureProgress() {
        HashMap<String, Object> mResultMap;
        String mReturnProgress = "";
        mResultMap = new HashMap<>();
        HashMap<String, Object> mMap = new HashMap<>();
        mMap.put("processcompletes", (_progressCount * 5) + "%");
        mResultMap.put("result", mMap);
        mReturnProgress = new Gson().toJson(mResultMap);
        EventEmittersToReact.getInstance().percentStatus(mReturnProgress);
    }

    private static void notifyRawDataProgress(int percentage) {
        HashMap<String, Object> mResultMap = new HashMap<>();
        String mReturnProgress = "";
        HashMap<String, Object> mMap = new HashMap<>();
        mMap.put("transfercompletes", percentage + "%");
        mResultMap.put("result", mMap);
        mReturnProgress = new Gson().toJson(mResultMap);
        Log.i("RawDataRead", "NotifyRawDataProgress: " + percentage);
        EventEmittersToReact.getInstance().percentStatus(mReturnProgress);
    }

    public static void startMeasureTimer() {
        _progressCount = 0;
        if (_vitalMeasureTimer != null) {
            _vitalMeasureTimer.cancel();
        }

        _progressTimerTask = new TimerTask() {
            public void run() {
                Log.i("MeasureProgress", "run: Progress " + _progressCount * 5);
                if ((BleProcEnum.INSTANT_MEASURE == getCurrentProc()) || (BleProcEnum.CALIBRATE == getCurrentProc())) {
                    notifyMeasureProgress();
                }

                if (_progressCount < 19) {
                    _progressCount++;
                }
            }
        };
        _vitalMeasureTimer = new Timer();
        _vitalMeasureTimer.schedule(_progressTimerTask, 0, 3000);
        _progressCount = 0;
    }

    public static void stopMeasureTimer() {
        if (_vitalMeasureTimer != null) {
            _vitalMeasureTimer.cancel();
            _vitalMeasureTimer.purge();
            _progressTimerTask.cancel();

            if (getCurrentProcState() != BleProcStateEnum.MEASURE_COMMAND_FIRED) {
                return;
            }

            if ((getCurrentProc() != BleProcEnum.AUTO_MEASURE)
                    && (getCurrentProc() != BleProcEnum.CONNECT)
                    && (getCurrentProcState() != BleProcStateEnum.MEASURE_START)
                    && (getCurrentProcState() != BleProcStateEnum.CALIBRATION_START)) {
                _progressCount = 20;
                notifyMeasureProgress();
            }
            _progressCount = 0;
        }
    }

    public static HashMap<String, Object> getCalibrationUserEnteredData() {
        return _calibrationUserEnteredData;
    }

    public static void setCalibrationUserEnteredData(HashMap<String, Object> mCalibrationUserEnteredData) {
        _calibrationUserEnteredData = mCalibrationUserEnteredData;
    }

    public static BleProcEnum getCurrentProc() {
        return _currentProc;
    }

    public static void setCurrentProc(BleProcEnum pCurrentProc) {
        BleServices._currentProc = pCurrentProc;
        if (pCurrentProc == BleProcEnum.NONE) {
            Log.d("CurrentProc", "CurrentProc NONE");
            _currentProcState = BleProcStateEnum.NONE;
        }
    }

    public static BleProcStateEnum getCurrentProcState() {
        return _currentProcState;
    }

    public static void setCurrentProcState(BleProcEnum pCurrentProc, BleProcStateEnum pCurrentProcState) {
        if (_currentProc != BleProcEnum.NONE) {
            if (pCurrentProc == _currentProc) {
                BleServices._currentProcState = pCurrentProcState;
            } else if ((_currentProc == BleProcEnum.AUTO_MEASURE) || (_currentProc == BleProcEnum.INSTANT_MEASURE) || (_currentProc == BleProcEnum.CALIBRATE)) {
                if ((pCurrentProc == BleProcEnum.AUTO_MEASURE) || (pCurrentProc == BleProcEnum.INSTANT_MEASURE) || (_currentProc == BleProcEnum.CALIBRATE)) {
                    BleServices._currentProcState = pCurrentProcState;
                }
            }
            if (pCurrentProcState == BleProcStateEnum.NONE) {
                _currentProc = BleProcEnum.NONE;
            }
        } else {
            _currentProcState = BleProcStateEnum.NONE;
        }
    }

    public BleServices(Context pContext) {
        _context = pContext;
        EventBus.getDefault().register(this);
        _gattCallback = new GattCallback();
    }

    public void setFirmwareUpdateFile(File updateFile) {
        firmwareFile = updateFile;
    }

    public void setBleDevice(BleDevice pBleDevice) {
        _bleDevice = pBleDevice;
    }

    @Subscribe
    public void onMessageEvent(NoParamEvent event) {
        Log.i("DeviceBondedEvent", "onMessageEvent: reason " + event.getPurpose());
        switch (event.getPurpose()) {
            case DEVICE_CONNECTED:
                if (_bleDevice.getGatt() != null) {
                    Log.e("Connection", "Gatt Successful");
                    if (getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_CONNECT_DFU_DEVICE) {
                        // rebond with DFU device
                        setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.FIRMWARE_UPDATE_BOND_DFU_DEVICE);
                        _bleDevice.getDevice().createBond();
                        _bleDevice.cancelConnectTimer();
                        return;
                    }
                    if (_bleDevice.getDevice().getBondState() != BluetoothDevice.BOND_BONDED) {
                        ErrorLogger.log("Watch not bonded");
                        _bleDevice.getDevice().createBond();
                        return;
                    }
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_BONDED));
                } else {
                    Log.e("Connection", "failed");
                }
                break;
            case DEVICE_DISCONNECTED:
                _bleDevice.setBonded(false);
                if (BleServices.getCurrentProc() == BleProcEnum.READ_RAW_DATA || BleServices.getCurrentProc() == BleProcEnum.CALIBRATE) {
                    EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_FAILED));
                } else if (BleServices.getCurrentProc() == BleProcEnum.INSTANT_MEASURE) {
                    EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_FAILED));
                }

                if (getCurrentProc() != BleProcEnum.FIRMWARE_UPDATE) { // keep firmware update proc when enabling DFU mode
                    BleServices.setCurrentProc(BleProcEnum.NONE);
                }
                stopMeasureTimer();
                stopWeatherService();
                break;
            case DEVICE_BONDED:
                ErrorLogger.log("Watch bonded, discovering services");
                // mConnectTimer.schedule(conn);
                _appFirstBoot = true;
                BleProcEnum proc = getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE ? BleProcEnum.FIRMWARE_UPDATE : BleProcEnum.CONNECT;
                BleServices.setCurrentProc(proc);
                BleServices.setCurrentProcState(proc, BleProcStateEnum.DISCOVER_GATT);
                final boolean mDiscoveryStarted = _bleDevice.getGatt().discoverServices();
                if (mDiscoveryStarted) {
                    LpLogger.logInfo(new LoggerStruct("DeviceBondedEvent", "BleServices", "Service discovery started"));
                } else {
                    BleServices.setCurrentProcState(proc, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("NoParamEvent.DEVICE_BONDED", "BleServices",
                            ResultCodeEnum.UNABLE_START_SERVICE_DISCOVERY,
                            "Unable to start Gatt Services discovery",
                            ""));
                    Log.e("DeviceBondedEvent", "onMessageEvent: Gatt Discovery fail");
                    EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.GATT_DISCOVER_FAIL));
                }
                break;

            case REQUEST_MAX_MTU:
                _bleDevice.setConnectionPreferences();

                Log.e("Connection", "MTU");
                ErrorLogger.log("Requesting max MTU");

                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.SET_MAX_MTU);
                requestMaxMTUSize();
                break;
            case SUBSCRIBE_CUSTOM_STATUS_INDICATION:
                Log.e("Connection", "Indication");
                ErrorLogger.log("Subscribing for STATUS indications");

                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.SUBSCRIBE_INDICATION);
                boolean mStatusIndicationSubscribed = subscribe(event.getPurpose());
                if (!mStatusIndicationSubscribed) {
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("NoParamEvent.SUBSCRIBE_CUSTOM_STATUS_INDICATION", "BleServices",
                            ResultCodeEnum.GATT_DISCOVER_FAIL,
                            "Unable subscribe to status indication",
                            ""));
                }
                break;
            case SUBSCRIBE_CUSTOM_MEAL_INDICATION:
                Log.e("Connection", "Meal Indication");
                ErrorLogger.log("Subscribing for MEAL indications");

                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.SUBSCRIBE_MEAL_INDICATION);
                boolean mMealIndicationSubscribed = subscribe(event.getPurpose());
                if (!mMealIndicationSubscribed) {
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("NoParamEvent.SUBSCRIBE_CUSTOM_MEAL_STATUS_INDICATION", "BleServices,",
                            ResultCodeEnum.GATT_DISCOVER_FAIL, "Unable to subscribe to meal indication",
                            ""));
                }
                break;
            case SUBSCRIBE_CUSTOM_STEPCOUNT_INDICATION:
                Log.e("Connection", "Step count indication");
                ErrorLogger.log("Subscribing for STEPCOUNT indications");

                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.SUBSCRIBE_STEPCOUNT_INDICATION);
                boolean mStepIndicationSubscribed = subscribe(event.getPurpose());
                if (!mStepIndicationSubscribed) {
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("NoParamEvent.SUBSCRIBE_CUSTOM_STEPCOUNT_INDICATION", "BleServices",
                            ResultCodeEnum.GATT_DISCOVER_FAIL, "Unable to subscribe to step indication",
                            ""));
                }
                break;
            case DATE_TIME_SYNC:
                Log.e("Connection", "datetime");
                ErrorLogger.log("Synchronizing DATE TIME with watch");

                BleServices.setCurrentProcState(getCurrentProc(), BleProcStateEnum.SET_DATETIME);
                boolean mDateTimeSet = _bleDevice.setDateTime();
                if (!mDateTimeSet) {
                    BleServices.setCurrentProcState(getCurrentProc(), BleProcStateEnum.NONE);
                }
                break;
            case TIMEZONE_SYNC:
                ErrorLogger.log("Synchronizing timezone with watch");
                boolean mTimeZoneSet = _bleDevice.setTimeZone();
                if (mTimeZoneSet) {
                    Log.e("TImezone", "Set");
                } else {
                    Log.e("TImezone", "failed");
                    EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.UNABLE_TIMEZONE_SET));
                }

                BleServices.setCurrentProcState(getCurrentProc(), BleProcStateEnum.SET_TIMEZONE);
                break;

            case STEP_GOAL_SYNC:
                ErrorLogger.log("Synchronizing daily step goal with watch");
                DbAccess mDbAccess = DbAccess.getInstance(_context);
                int stepGoal = mDbAccess.getCurrentUserGoal(Global.getUserId());
                byte[] stepGoalBytes = LpUtility.getUpdateStepGoalByteArray(stepGoal);
                StepGoalResponse response = _bleDevice.updateDailyStepGoal(stepGoalBytes);
                if (response.getResultCode() == ResultCodeEnum.STEP_GOAL_UPDATE_ACKNOWLEDGE) {
                    Log.e("Step goal update", "success");
                    EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_CONNECTED));
                    _bleDevice.setBonded(true);
                    _bleDevice.cancelConnectTimer();
                } else {
                    Log.e("Step goal update", "failed");
                    EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.STEP_GOAL_UPDATE_FAILED));
                }
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.SET_STEP_GOAL);
                break;
            case GET_WATCH_STATUS:
                ErrorLogger.log("Getting watch status");
                Log.e("Connection", "watch status");

                _bleDevice.readCustomServiceCharacteristic(GattCharEnum.STATUS);
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.READ_WATCH_STATUS);
                break;

            case START_OFFLINE_SYNC:
                ErrorLogger.log("Starting offline vitals sync");
                Log.e("Connection", "offline");

                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_START);
                CommonResponse mResponse = new CommonResponse(ResultCodeEnum.OFFLINE_VITAL_READ_START);
                EventEmittersToReact.getInstance().EmitCommonResult(mResponse);

                this.lastMeasureTime = DbAccess.getInstance(_context).getLatestMeasureTimestamp();

                boolean mRawReadStarted = fireCommandForOfflineDataRead();
                if (!mRawReadStarted) {
                    Log.e("Connection", "sync failed");

                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                            ResultCodeEnum.RAW_READ_COMMAND_FAILED,
                            "RAW_READ_Failed",
                            ""));
                } else {
                    Log.e("Connection", "vital read ");

                    LpLogger.logInfo(new LoggerStruct("VitalDataRead", "BleServices", "Vital read first command  fired"));
                }
                break;
            case START_OFFLINE_MEAL_SYNC:
                ErrorLogger.log("Starting offline meals sync");
                Log.e("Connection", "offline meal");
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_MEAL_START);
                boolean mRawMealReadStarted = fireCommandForOfflineMealRead();
                if (!mRawMealReadStarted) {
                    Log.e("Connection", "meal failed");

                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                            ResultCodeEnum.OFFLINE_VITAL_COMMAND_FAILED,
                            "OFFLINE_VITAL_COMMAND_FAILED",
                            ""));
                } else {
                    Log.e("Connection", "meal read ");

                    LpLogger.logInfo(new LoggerStruct("mealDataRead", "BleServices", "meal read first command  fired"));
                }
                break;
            case START_OFFLINE_STEPCOUNT_SYNC:
                ErrorLogger.log("Starting offline step count sync");
                Log.e("Connection", "offline meal");
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_STEPS_START);
                boolean mRawStepCountReadStarted = fireCommandForStepCountPrepare();
                if (!mRawStepCountReadStarted) {
                    Log.e("Connection", "step sync failed");
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.STEP_COUNT_READ_COMMAND_FIRED);
                    LpLogger.logError(new LoggerStruct("StepReadEvent", "BleServices",
                            ResultCodeEnum.RAW_READ_COMMAND_FAILED,
                            "",
                            ""));
                } else {
                    Log.e("Connection", "step read ");
                    LpLogger.logInfo(new LoggerStruct("StepReadEvent", "BleServices", "Vital read command  fired"));
                }
                break;
            case READ_FW_REVISION:
                ErrorLogger.log("Reading firmware revision");
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.FIRMWARE_REVISION_READ);
                readFirmwareRevision();
                break;
            case START_APP_SYNC_READ:
                ErrorLogger.log("Starting app sync read");
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.APP_SYNC_READ);
                startAppSync(true, false);
                break;
            case START_APP_SYNC_WRITE:
                ErrorLogger.log("Starting app sync write");
                BleServices.setCurrentProc(BleProcEnum.CONNECT);
                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.APP_SYNC_WRITE);
                startAppSync(false, false);
                break;
            case START_FIRMWARE_UPDATE:
                Function1<UpdateResult, Unit> func = result -> {
                    Log.i("FirmwareUpdate", "Update result arrived: " + result.toString());
                    ResultCodeEnum resultCode;
                    if (result instanceof FileParseError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_FILE_PARSE;
                    else if (result instanceof FileReadError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_FILE_READ;
                    else if (result instanceof ConnectionError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_CONNECTION;
                    else if (result instanceof CommunicationError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_COMMUNICATION;
                    else if (result instanceof CrcError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_CRC;
                    else if (result instanceof InstallationError) resultCode = ResultCodeEnum.FIRMWARE_UPDATE_ERROR_INSTALLATION;
                    else resultCode = ResultCodeEnum.FIRMWARE_UPDATE_COMPLETE;

                    EventEmittersToReact.getInstance().emitFwUpdate(new FirmwareUpdateResponse(resultCode));
                    setCurrentProc(BleProcEnum.NONE);
                    setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logInfo(new LoggerStruct("FirmwareUpdateEvent", "BleServices", "Firmware update finished with: " + resultCode.getDesc()));

                    disconnectDevice(false);
                    // Give BT stack time to process state change
                    try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
                    _bleDevice.unpairDevice();
                    return Unit.INSTANCE;
                };
                FirmwareUploader.INSTANCE.upload(_context, firmwareFile, BleServices._bleDevice.getDevice(), func);
                EventEmittersToReact.getInstance().emitFwUpdate(new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_START));
                break;
        }
    }

    @Subscribe
    public void onMessageEvent(WriteCharCallbackEvent event) {
        if (event.status != BluetoothGatt.GATT_SUCCESS) {
            Log.e("GattConnection", "Failed");
            // try to recover
            EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_BONDED));
//            EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));
//            CommonResponse mResponse = new CommonResponse(ResultCodeEnum.UNABLE_CHARCT_WRITE, "CharId " + event.characteristicId + " GATT Write Err code " + event.status);
//            EventEmittersToReact.getInstance().EmitCommonResult(mResponse);

            if (GattCharEnum.STEP_COUNTER.getId().equalsIgnoreCase(event.characteristicId)) {
                EventEmittersToReact.getInstance().emitStepGoal(new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_FAILED));
            }

            // start calibration when writing reference vital data fails
            if (GattCharEnum.REFERENCE_VITAL_DATA.getId().equalsIgnoreCase(event.characteristicId)) {
                readStatusForCalibration();
            }

            // emit calibration error when other operations fail
            if ((GattCharEnum.USER_INFO.getId().equalsIgnoreCase(event.characteristicId) ||
                (GattCharEnum.COMMAND.getId().equalsIgnoreCase(event.characteristicId)) &&
                    getCurrentProc() == BleProcEnum.CALIBRATE)) {
                setCurrentProc(BleProcEnum.NONE);
                EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_FAILED));
            }
            return;
        }

        if (BleServices.getCurrentProcState() != BleProcStateEnum.READ_RAW_NEXT || BleServices.getCurrentProcState() != BleProcStateEnum.OFFLINE_SYNC_PREV)
            LpLogger.logInfo(new LoggerStruct("WriteCharCallbackEvent", "BleServices", event.getData()));

        switch (BleServices.getCurrentProc()) {
            case CONNECT:
                if (getCurrentProcState() == BleProcStateEnum.SET_DATETIME) {
                    Log.e("TimeZone", "Call");
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.TIMEZONE_SYNC));
                } else if (getCurrentProcState() == BleProcStateEnum.SET_TIMEZONE) {
                    Log.e("Offline", "Call");
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.STEP_GOAL_SYNC));
                } else if (getCurrentProcState() == BleProcStateEnum.SET_STEP_GOAL) {
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_OFFLINE_SYNC));
                } else if ((getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START) ||
                        (getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV)) {
                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.VITAL_DATA);
                    Log.i("OfflineData", "onMessageEvent: Reading sync");
                } else if ((getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_MEAL_START) ||
                        (getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_MEAL_PREV)) {
                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.MEAL_DATA);
                    Log.i("OfflineMealData", "onMessageEvent: Reading sync");
                } else if (getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_STEPS_START) {
                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.STEP_COUNTER);
                } else if (getCurrentProcState() == BleProcStateEnum.APP_SYNC_WRITE) {
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.GET_WATCH_STATUS));
                }
                break;
            case APP_SYNC: {
                EventEmittersToReact.getInstance().EmitAppSyncResult(new AppSyncResponse(ResultCodeEnum.APPSYNC_COMPLETED), firmwareRevision);
                BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                startWeatherService();
                break;
            }
            case CALIBRATE: {
                if (GattCharEnum.USER_INFO.getId().equalsIgnoreCase(event.characteristicId)
                        && BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_BEFORE) {
                    if(!writeReferenceVitalData()) {
                        readStatusForCalibration();
                    }
                    break;
                } else if (GattCharEnum.REFERENCE_VITAL_DATA.getId().equalsIgnoreCase(event.characteristicId)) {
                    readStatusForCalibration();
                    break;
                } else if (GattCharEnum.USER_INFO.getId().equalsIgnoreCase(event.characteristicId)
                        && BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_AFTER) {
                    BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.MEASURE_TIME);
                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.LAST_MEASURE_TIME);
                    break;
                }
            }
            case INSTANT_MEASURE: {
                if (GattCharEnum.USER_INFO.getId().equalsIgnoreCase(event.characteristicId)
                        && BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_BEFORE) {
                    readStatusForInstantMeasure();
                    break;
                }
            }
            case TIMEZONE_UPDATE: {
                if (GattCharEnum.CURRENT_TIME.getId().equalsIgnoreCase(event.characteristicId)
                        || GattCharEnum.LOCAL_TIME_INFORMATION.getId().equalsIgnoreCase(event.characteristicId)) {
                    if (getCurrentProcState() == BleProcStateEnum.SET_DATETIME) {
                        EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.TIMEZONE_SYNC));
                        break;
                    } else {
                        BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                        Log.i("Timezone update", "Update completed");
                    }
                }
            }
            default:
                Log.e("default", "Call");

                String mCharactId = event.characteristicId;
                if (GattCharEnum.COMMAND.getId().equalsIgnoreCase(mCharactId)) {
                    switch (BleServices.getCurrentProc()) {
                        case INSTANT_MEASURE:
                            switch (BleServices.getCurrentProcState()) {
                                case CHECK_MEASURE_PRECONDITION:
                                    BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.MEASURE_COMMAND_FIRED);
                                    LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Instant measure preconditions passed"));
                                    break;
                                case MEASURE_READ_COMMAND_FIRED:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.VITAL_DATA);
                                    LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Reading vital data"));
                                    break;
                            }
                            break;
                        case CALIBRATE:
                            switch (BleServices.getCurrentProcState()) {
                                case CHECK_MEASURE_PRECONDITION:
                                    BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.MEASURE_COMMAND_FIRED);
                                    LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Instant measure preconditions passed"));
                                    break;
                                case MEASURE_READ_COMMAND_FIRED:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.VITAL_DATA);
                                    LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Reading vital data"));
                                    break;
                            }
                            break;
                        case AUTO_MEASURE:
                            _bleDevice.readCustomServiceCharacteristic(GattCharEnum.VITAL_DATA);
                            LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Reading vital data"));
                            break;
                        case STEP_COUNT:
                            _bleDevice.readCustomServiceCharacteristic(GattCharEnum.STEP_COUNTER);
                            LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Reading Step count data"));
                            break;
                        case MEAL_DATA:
                            _bleDevice.readCustomServiceCharacteristic(GattCharEnum.MEAL_DATA);
                            LpLogger.logInfo(new LoggerStruct("WriteCharacCallbackEvent", "BleServices", "Reading Meal data"));
                            break;

                        case READ_RAW_DATA: {
                            switch (BleServices.getCurrentProcState()) {
                                case READ_RAW_FIRST:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.RAW_DATA);
                                    Log.i("RawRead", "onMessageEvent: Reading raw first");
                                    break;

                                case READ_RAW_NEXT:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.RAW_DATA);
                                    Log.i("RawRead", "onMessageEvent: Reading raw next");
                                    break;

                                case READ_RAW_PREV:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.RAW_DATA);
                                    Log.i("RawRead", "onMessageEvent: Reading raw prev");
                                    break;
                                case READ_RAW_LAST:
                                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.RAW_DATA);
                                    Log.i("RawRead", "onMessageEvent: Reading raw last");
                                    break;
                            }
                        }
                    }
                } else if (GattCharEnum.ALERT_LEVEL.getId().equalsIgnoreCase(mCharactId)) {
                    if (BleServices.getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE
                            && BleServices.getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_INITIATE_DFU) {
                        lastAddress = connectedDevice.getAddress();
                        // Give watch time to process enable DFU request
                        try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
                        disconnectDevice(false);
                        // Give BT stack time to process state change
                        try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }

                        _bleDevice.unpairDevice();

                        BleServices.setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.NONE);
                        Log.i("FwUpdate", "Device is in DFU mode.");
                    }
                } else if (GattCharEnum.STEP_COUNTER.getId().equalsIgnoreCase(mCharactId)) {
                    setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    EventEmittersToReact.getInstance().emitStepGoal(new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_COMPLETE));
                }
        }
    }

    // This method will be called when a WriteDescCallbackEvent is posted
    @Subscribe
    public void onMessageEvent(WriteDescCallbackEvent event) {
        LpLogger.logInfo(new LoggerStruct("WriteDescCallbackEvent", "BleServices", event.getData()));
        if (event.status != BluetoothGatt.GATT_SUCCESS) {
            handleWriteDescFailure();
            CommonResponse mResponse = new CommonResponse(ResultCodeEnum.UNABLE_CHARCT_WRITE, "GATT Write descriptor Err code " + event.status);
            EventEmittersToReact.getInstance().EmitCommonResult(mResponse);
            LpLogger.logInfo(new LoggerStruct("WriteDescCallbackEvent", "BleServices", "GATT Write descriptor Err code " + event.status));
            return;
        }
        if (BleServices.getCurrentProc() == BleProcEnum.CONNECT) {
            switch (BleServices.getCurrentProcState()) {
                case SUBSCRIBE_INDICATION:
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.SUBSCRIBE_CUSTOM_MEAL_INDICATION));
                    break;
                case SUBSCRIBE_MEAL_INDICATION:
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.SUBSCRIBE_CUSTOM_STEPCOUNT_INDICATION));
                    break;
                case SUBSCRIBE_STEPCOUNT_INDICATION:
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DATE_TIME_SYNC));
                    break;
                default:
                    break;
            }
        }
    }

    @Subscribe
    public void onMessageEvent(UserInfoEvent event) {
        if (event.data.length != 9 && event.data.length != 10) {
            LpLogger.logInfo(
                    new LoggerStruct(
                        "onUserInfoEvent",
                        "invalid size: " + event.data.length,
                        Arrays.toString(event.data)
                    )
            );
            EventEmittersToReact.getInstance().EmitAppSyncResult(new AppSyncResponse(ResultCodeEnum.INVALID_DATA_FROM_WATCH), firmwareRevision);
        }

        AppSync.packetLen = event.data.length;
        int mUserId = Global.getUserId();
        DbAccess mDbAccess = DbAccess.getInstance(_context);

        AppSync settings = mDbAccess.getAppSyncData(mUserId);
        // watch can change auto-measure switch only
        settings.setAutoMeasure((event.data[0] & 0x01) == 1 ? "Y" : "N");
        mDbAccess.updateAppSync(mUserId, settings);

        EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_APP_SYNC_WRITE));
    }

    private void startWeatherService() {
        if (weatherManager == null) {
            weatherManager = new WeatherManager(_context);
        }
        weatherManager.start();
    }

    private void stopWeatherService() {
        if (weatherManager != null) {
            weatherManager.stop();
        }
    }

    private int MealDataStoreAndUpload(byte[] charData) {
        LpLogger.logInfo(new LoggerStruct("MealDataReadEvent", "BleServices", LpUtility.encodeHexString(charData)));

        if (charData.length == 9) {
            HashMap<String, Object> mUploadMeals = new HashMap<>();

            int mMeal_Type = LpUtility.byteToInt(charData[1]) + 1;
            mUploadMeals.put("Meal_Type", mMeal_Type);

            int mUTC_Year = LpUtility.byteArrToInt(charData[2], charData[3]);
            mUploadMeals.put("UTC_Year", mUTC_Year);

            int mUTC_Month = LpUtility.byteToInt(charData[4]);
            mUploadMeals.put("UTC_Month", mUTC_Month);

            int mUTC_Day = LpUtility.byteToInt(charData[5]);
            mUploadMeals.put("UTC_Day", mUTC_Day);

            int mUTC_Hours = LpUtility.byteToInt(charData[6]);
            mUploadMeals.put("UTC_Hours", mUTC_Hours);

            int mUTC_Minutes = LpUtility.byteToInt(charData[7]);
            mUploadMeals.put("UTC_Minutes", mUTC_Minutes);

            int mUTC_Seconds = LpUtility.byteToInt(charData[8]);
            mUploadMeals.put("UTC_Seconds", mUTC_Seconds);

            // TODO: rely on OpStatus instead
            if (mUTC_Year + mUTC_Month + mUTC_Day + mUTC_Hours + mUTC_Minutes + mUTC_Seconds == 0) {
                Log.w("Meal data", "Zero timestamp, stop reading");
                return -1;
            }

            String mYear = String.valueOf(mUTC_Year);
            String mMonth = String.valueOf(mUTC_Month);
            String mDay = String.valueOf(mUTC_Day);
            String mHour = String.valueOf(mUTC_Hours);
            String mMinute = String.valueOf(mUTC_Minutes);
            String mSecond = String.valueOf(mUTC_Seconds);
            String mTimeStamp = mYear + "/" + mMonth + "/" + mDay + " " + mHour + ":" + mMinute + ":" + mSecond;

            DbAccess dbAccess = DbAccess.getInstance(_context);
            ArrayList<String> mAllTimeStampsFromMealsTable = dbAccess.getMealsTimeStamp();
            if (mAllTimeStampsFromMealsTable != null && mAllTimeStampsFromMealsTable.size() > 0) {
                if (mAllTimeStampsFromMealsTable.contains(mTimeStamp)) {
                    Log.e("Duplicate Value", mTimeStamp);
                    return -1;
                }
            }
            @SuppressLint("SimpleDateFormat") SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = null;
            try {
                date = sdf.parse(mTimeStamp);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            assert date != null;
            mUploadMeals.put("MealsTimeStamp", date.getTime());

            if (LifePlusReactModule.isNetworkAvailable(_context)) {
                dbAccess.addMealsData(mUploadMeals, String.valueOf(System.currentTimeMillis()));
                LifePlusReactModule.uploadMealsOnCloud(mUploadMeals);
            } else {
                dbAccess.addMealsData(mUploadMeals, null);
            }

        }
        EventEmittersToReact.getInstance().EmitMealData(new MealDataResponse(ResultCodeEnum.MEAL_DATA_AVAILABLE));
        return 0;
    }

    private int vitalDataStoreAndUpload(VitalReadEvent event) {
        byte[] mCharData = event.data;
        HashMap<String, Object> mUploadToServer = new HashMap<>();
        Log.d("VitalData", "recv" + Arrays.toString(mCharData));

        if (mCharData.length == 20) {
            HashMap<String, Object> mMap = new HashMap<>();

            int mStatus = LpUtility.byteToInt(mCharData[0]);
            mUploadToServer.put("OpStatus", mStatus);

            int mHR = LpUtility.byteArrToInt(mCharData[1], mCharData[2]);
            mUploadToServer.put("HR", mHR);

            int mRR = LpUtility.byteArrToInt(mCharData[3], mCharData[4]);
            mUploadToServer.put("RR", mRR);

            int mOS = LpUtility.byteArrToInt(mCharData[5], mCharData[6]);
            mUploadToServer.put("SPO2", mOS);

            int mBG = LpUtility.byteArrToInt(mCharData[7], mCharData[8]);
            mUploadToServer.put("Glucose", mBG);

            int mBPS = LpUtility.byteArrToInt(mCharData[9], mCharData[10]);
            mUploadToServer.put("SBP", mBPS);

            int mBPD = LpUtility.byteArrToInt(mCharData[11], mCharData[12]);
            mUploadToServer.put("DBP", mBPD);

            int mYear = LpUtility.byteArrToInt(mCharData[13], mCharData[14]);
            int mMon = LpUtility.byteToInt(mCharData[15]);
            int mDay = LpUtility.byteToInt(mCharData[16]);
            int mHour = LpUtility.byteToInt(mCharData[17]);
            int mMinute = LpUtility.byteToInt(mCharData[18]);
            int mSecond = LpUtility.byteToInt(mCharData[19]);

            String mTime = mYear + "/" + mMon + "/" + mDay + " " + mHour + ":" + mMinute + ":" + mSecond;

            //creates a formatter that parses the date in the given format
            @SuppressLint("SimpleDateFormat") SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = null;
            try {
                date = sdf.parse(mTime);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            assert date != null;
            String mTimeInMilliSec = String.valueOf(date.getTime());
            mUploadToServer.put("Time", mTimeInMilliSec);

            long now = System.currentTimeMillis();
            if (date.getTime() > now) {
                ErrorLogger.diagnosticsEvent("Future measurement timestamp: " + mTime + " ("+ mTimeInMilliSec +"), now " + now);
            }

            AServiceDef mAService = ServiceDefs.getService(GattServiceEnum.CUSTOM_SERVICE.getId());
            ACharDef mCharacteristics = mAService.getCharacteristic(GattCharEnum.VITAL_DATA.getId());
            for (int i = 0; i < mCharacteristics.getMembers().size(); i++) {
                if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Month")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mMon);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Year")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mYear);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Day")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mDay);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Hour")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mHour);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Minutes")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mMinute);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("UTC_Seconds")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mSecond);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("OpStatus")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, 1);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("HeartRate")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mHR);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("RespirationRate")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mRR);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("OxygenSaturation")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mOS);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("BloodGlucose")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mBG);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("BloodPressureSYS")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mBPS);
                } else if (mCharacteristics.getMembers().get(i).name.equalsIgnoreCase("BloodPressureDIA")) {
                    mMap.put(mCharacteristics.getMembers().get(i).name, mBPD);
                } else {
                    int randomNumber = (int) (50 + (Math.random() * ((100 - 50))));
                    mMap.put(mCharacteristics.getMembers().get(i).name, randomNumber);
                }
            }
            Log.d("Vital Data Time", mTimeInMilliSec);
            DbAccess dbAccess = DbAccess.getInstance(_context);
            ArrayList<String> mAllTimeStamp = dbAccess.getAllTimeStampFromMeasureTable();
            if (mAllTimeStamp.size() > 0) {
                if (mAllTimeStamp.contains(mTimeInMilliSec) || mYear < 2021) {
                    Log.d("Vital Data Time", mTimeInMilliSec);
                    LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "Data not inserted ts = " + mTimeInMilliSec));
                    return -1;
                }
            }
            if (LifePlusReactModule.isNetworkAvailable(_context)) {
                String mUploadDate = (new Date()).getTime() + "";
                mMap.put("UploadDate", mUploadDate);
                dbAccess.addIntoMeasurable(mMap, mUploadDate);
                LifePlusReactModule.uploadOnCloud(mUploadToServer, mTimeInMilliSec);
                LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "data added to DB and uploaded to Cloud"));
            } else {
                mMap.put("UploadDate", null);
                dbAccess.addIntoMeasurable(mMap, null);
                LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "data added to DB"));
            }
        }
        return 0;
    }

    @Subscribe
    public void onMessageEvent(MealDataReadEvent event) {
        byte[] mCharctData = event.data;
        int mReturn = MealDataStoreAndUpload(mCharctData);
        switch (BleServices.getCurrentProc()) {
            case INSTANT_MEASURE:
            case AUTO_MEASURE:
            case CALIBRATE:
                if (BleServices.getCurrentProc() == BleProcEnum.INSTANT_MEASURE) {
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logInfo(new LoggerStruct("MealReadEvent", "BleServices", "Instant measure completed (Event 399)"));
                    EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_COMPLETED));
                } else if (BleServices.getCurrentProc() == BleProcEnum.AUTO_MEASURE) {
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "Auto measure completed (Event 599)"));
                    EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_COMPLETED));
                } else {
                    BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.MEASURE_TIME);
                    _bleDevice.readCustomServiceCharacteristic(GattCharEnum.LAST_MEASURE_TIME);
                    break;
                }
                break;
            case CONNECT:
                if (mReturn == -1) {
                    BleServices.setCurrentProc(BleProcEnum.NONE);
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                            ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS,
                            "Offline meal read complete",
                            ""));

                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_OFFLINE_STEPCOUNT_SYNC));
                    break;
                }
                if (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_MEAL_START) {
                    BleServices.setCurrentProc(BleProcEnum.CONNECT);
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_MEAL_PREV);
                } else if (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_MEAL_PREV) {
                    BleServices.setCurrentProc(BleProcEnum.CONNECT);
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_MEAL_PREV);

                    // Fire command to get last record
                    boolean mMealReadStarted = fireCommandForOfflineMealRead();
                    if (!mMealReadStarted) {
                        BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                        LpLogger.logError(new LoggerStruct("MealReadEvent", "BleServices",
                                ResultCodeEnum.OFFLINE_VITAL_COMMAND_FAILED,
                                "",
                                ""));
                    } else {
                        LpLogger.logInfo(new LoggerStruct("MealReadRead", "BleServices", "Meal read prev command  fired"));
                    }

                    break;
                }
                boolean mMealReadStarted = fireCommandForOfflineMealRead();
                if (!mMealReadStarted) {
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("MealReadEvent", "BleServices",
                            ResultCodeEnum.OFFLINE_VITAL_COMMAND_FAILED,
                            "",
                            ""));
                } else {
                    LpLogger.logInfo(new LoggerStruct("MealReadRead", "BleServices", "Meal read prev command  fired"));
                }
        }
    }

    @Subscribe
    public void onMessageEvent(VitalReadEvent event) {
        int mReturn = vitalDataStoreAndUpload(event);
        switch (BleServices.getCurrentProc()) {
            case INSTANT_MEASURE:
                BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "Instant measure completed (Event 399)"));
                EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_COMPLETED));
                break;
            case AUTO_MEASURE:
                BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "Auto measure completed (Event 599)"));
                EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_COMPLETED));
                break;
            case CALIBRATE:
                BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.SET_MEASURE_CALC_AFTER);
                startAppSync(false, false);
                break;

            case CONNECT:
                // TODO - Check this state
                if (mReturn == -1) {
                    BleServices.setCurrentProc(BleProcEnum.NONE);
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                            ResultCodeEnum.OFFLINE_VITAL_READ_IN_PROGRESS,
                            "Offline vital data read complete",
                            ""));

                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_OFFLINE_MEAL_SYNC));
                    break;
                }
                if (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_START) {
                    BleServices.setCurrentProc(BleProcEnum.CONNECT);
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_PREV);
                } else if (BleServices.getCurrentProcState() == BleProcStateEnum.OFFLINE_SYNC_PREV) {
                    BleServices.setCurrentProc(BleProcEnum.CONNECT);
                    BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.OFFLINE_SYNC_PREV);

                    // Fire command to get last record
                    boolean mRawReadStarted = fireCommandForOfflineDataRead();
                    if (!mRawReadStarted) {
                        BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                        LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                                ResultCodeEnum.RAW_READ_COMMAND_FAILED,
                                "",
                                ""));
                    } else {
                        LpLogger.logInfo(new LoggerStruct("VitalDataRead", "BleServices", "Vital read prev command  fired"));
                    }

                    break;
                }

                boolean mRawReadStarted = fireCommandForOfflineDataRead();
                if (!mRawReadStarted) {
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("OfflineData", "BleServices",
                            ResultCodeEnum.OFFLINE_VITAL_COMMAND_FAILED,
                            "",
                            ""));
                } else {
                    LpLogger.logInfo(new LoggerStruct("OfflineData", "BleServices", "Offline prev command  fired"));
                }

            default:
                break;
        }
    }

    @Subscribe
    public void onMessageEvent(StepCountEvent event) {
        LpLogger.logInfo(new LoggerStruct("StepCounterEvent", "BleServices", "Step counter " + (event.isRead ? "read" : "update")));

        byte[] mCharData = event.data;
        LpLogger.logInfo(new LoggerStruct("StepCounterEvent", "BleServices", LpUtility.encodeHexString(mCharData)));

        if (mCharData.length == 10) {
            HashMap<String, Object> mUploadSteps = new HashMap<>();

            int opStatus = LpUtility.byteToInt(mCharData[0]);
            mUploadSteps.put("OpStatus", opStatus);

            int steps = LpUtility.byteArrayToInt(mCharData[4], mCharData[3], mCharData[2], mCharData[1]);
            mUploadSteps.put("Steps", steps);

            int year = LpUtility.byteArrToInt(mCharData[5], mCharData[6]);
            mUploadSteps.put("Year", year);

            int month = LpUtility.byteToInt(mCharData[7]);
            mUploadSteps.put("Month", month);

            int day = LpUtility.byteToInt(mCharData[8]);
            mUploadSteps.put("Day", day);

            int dayOfWeek = LpUtility.byteToInt(mCharData[9]);
            mUploadSteps.put("DayOfWeek", dayOfWeek);

            int hour = 23; // history data stores always into the last record
            Calendar cal = Calendar.getInstance();
            if (cal.get(Calendar.YEAR) == year && cal.get(Calendar.MONTH) + 1 == month && cal.get(Calendar.DAY_OF_MONTH) == day) {
                hour = cal.get(Calendar.HOUR_OF_DAY);
            }
            mUploadSteps.put("Hour", hour);

            long stepsTime = LpUtility.getTimeStamp(year, month, day, hour);
            mUploadSteps.put("Time", stepsTime);

            DbAccess dbAccess = DbAccess.getInstance(_context);
            if (LifePlusReactModule.isNetworkAvailable(_context)) {
                dbAccess.addStepDataTable(mUploadSteps, String.valueOf(System.currentTimeMillis()));
                LifePlusReactModule.uploadStepsOnCloud(mUploadSteps);
            } else {
                dbAccess.addStepDataTable(mUploadSteps, null);
            }
            if (!event.isRead) {
                EventEmittersToReact.getInstance().EmitStepCount(new StepCountResponse(ResultCodeEnum.STEP_COUNT_AVAILABLE));
            }
        }
        if (event.isRead) {
            CommonResponse mResponse = new CommonResponse(ResultCodeEnum.OFFLINE_VITAL_READ_COMPLETE);
            EventEmittersToReact.getInstance().EmitCommonResult(mResponse);
            EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.READ_FW_REVISION));
        }
    }

    @Subscribe
    public void onMessageEvent(MealDataEvent event) {
        byte[] mCharData = event.data;
        MealDataStoreAndUpload(mCharData);
    }

    @Subscribe
    public void onMessageEvent(RawDataReadEvent event) {
        byte[] mCharData = event.data;
        int payloadLength = mCharData.length;

        int index = LpUtility.byteArrToInt(mCharData[1], mCharData[2]);
        int status = mCharData[0];

        Log.i("RawReadData", "onMessageEvent: Index " + (int) index + "status " + mCharData[0] + "Data " + LpUtility.encodeHexString(mCharData));

        if ((status & 0x0f) != 0x0) {
            BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
            Log.i("RawRead", "onMessageEvent: All data or some error received");
            return;
        }
        switch (BleServices.getCurrentProc()) {
            case READ_RAW_DATA:
                switch (BleServices.getCurrentProcState()) {
                    case READ_RAW_FIRST:
                        BleServices.setCurrentProcState(BleProcEnum.READ_RAW_DATA, BleProcStateEnum.READ_RAW_NEXT);
                        LpLogger.logInfo(new LoggerStruct("RawDataReadEvent", "BleServices", "Raw data read initiated "));
                        if (_totalRawDataInByteArray != null) {
                            _totalRawDataInByteArray.clear();
                            _totalRawDataInByteArray.add(mCharData);
                            if (_collectionOfRawData != null) {
                                _collectionOfRawData.clear();
                            }
                        }

                        notifyRawDataProgress(0);
                        rawDataProgress = 0;

                        Log.i("RawRead", "onMessageEvent: First received");
                        break;
                    case READ_RAW_NEXT:
                        if ((payloadLength == 211 && index < 1497) ||
                                (payloadLength == 31 && index < 1499) || (payloadLength == 175 && index < 1497)) {
                            int percentComplete = ((int) ((1.0 * index / 1500) * 100));
                            BleServices.setCurrentProcState(BleProcEnum.READ_RAW_DATA, BleProcStateEnum.READ_RAW_NEXT);
                            Log.i("RawRead", "onMessageEvent: index " + index + " received");
                            _totalRawDataInByteArray.add(mCharData);
                            if (rawDataProgress != percentComplete) {
                                notifyRawDataProgress(percentComplete);
                                rawDataProgress = percentComplete;
                            }
                        } else {
                            _totalRawDataInByteArray.add(mCharData);
                            BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                            Log.i("RawRead", "onMessageEvent: All data received");
                            notifyRawDataProgress(100);
                            rawDataProgress = 100;
                            for (int i = 0; i < _totalRawDataInByteArray.size(); i++) {
                                HashMap<String, Object> mUploadToServerAndSaveInDB = new HashMap<>();
                                mCharData = _totalRawDataInByteArray.get(i);

                                if (_totalRawDataInByteArray.get(i).length == 31) {

                                    int mStatus = LpUtility.byteToInt(mCharData[0]);
                                    mUploadToServerAndSaveInDB.put("OpStatus", mStatus);

                                    int mCurrentIndex = LpUtility.byteArrToInt(mCharData[1], mCharData[2]);
                                    mUploadToServerAndSaveInDB.put("CurrentIndex", mCurrentIndex);

                                    long mAFEData1 = LpUtility.byteArrayToLong(mCharData[3], mCharData[4], mCharData[5], mCharData[6]);
                                    mUploadToServerAndSaveInDB.put("AFEData1", mAFEData1);

                                    long mAFEData2 = LpUtility.byteArrayToLong(mCharData[7], mCharData[8], mCharData[9], mCharData[10]);
                                    mUploadToServerAndSaveInDB.put("AFEData2", mAFEData2);

                                    long mAFEData3 = LpUtility.byteArrayToLong(mCharData[11], mCharData[12], mCharData[13], mCharData[14]);
                                    mUploadToServerAndSaveInDB.put("AFEData3", mAFEData3);

                                    long mAFEData4 = LpUtility.byteArrayToLong(mCharData[15], mCharData[16], mCharData[17], mCharData[18]);
                                    mUploadToServerAndSaveInDB.put("AFEData4", mAFEData4);

                                    int mGyro1a = LpUtility.byteArrToInt(mCharData[19], mCharData[20]);
                                    mUploadToServerAndSaveInDB.put("Gyro1a", mGyro1a);

                                    int mGyro2a = LpUtility.byteArrToInt(mCharData[21], mCharData[22]);
                                    mUploadToServerAndSaveInDB.put("Gyro2a", mGyro2a);

                                    int mGyro3a = LpUtility.byteArrToInt(mCharData[23], mCharData[24]);
                                    mUploadToServerAndSaveInDB.put("Gyro3a", mGyro3a);

                                    int mAccelerometer_X = LpUtility.byteArrToInt(mCharData[25], mCharData[26]);
                                    mUploadToServerAndSaveInDB.put("Accelerometer_X", mAccelerometer_X);

                                    int mAccelerometer_Y = LpUtility.byteArrToInt(mCharData[27], mCharData[28]);
                                    mUploadToServerAndSaveInDB.put("Accelerometer_Y", mAccelerometer_Y);

                                    int mAccelerometer_Z = LpUtility.byteArrToInt(mCharData[29], mCharData[30]);
                                    mUploadToServerAndSaveInDB.put("Accelerometer_Z", mAccelerometer_Z);

                                    if (i == _totalRawDataInByteArray.size() - 1) {
                                        mUploadToServerAndSaveInDB.put("vitals", BleServices.getCalibrationUserEnteredData());
                                        _collectionOfRawData.add(mUploadToServerAndSaveInDB);
                                        DbAccess dbAccess = DbAccess.getInstance(_context);
                                        dbAccess.addBulkRawData(_collectionOfRawData, _measureTime);
                                    } else {
                                        _collectionOfRawData.add(mUploadToServerAndSaveInDB);
                                    }
                                } else if (_totalRawDataInByteArray.get(i).length == 211) {
                                    int wrOffset = 0;
                                    int mOpStatus = LpUtility.byteToInt(mCharData[0]);
                                    byte[] mFirstRecord = new byte[70];
                                    for (int mCount = 1; mCount < 71; mCount++) {
                                        mFirstRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    byte[] mSecondRecord = new byte[70];
                                    wrOffset = 0;
                                    for (int mCount = 71; mCount < 141; mCount++) {
                                        mSecondRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    byte[] mThirdRecord = new byte[70];
                                    wrOffset = 0;
                                    for (int mCount = 141; mCount < 211; mCount++) {
                                        mThirdRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    _collectionOfRawData.add(getConvertedValuesFromByteArr(mFirstRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                    _collectionOfRawData.add(getConvertedValuesFromByteArr(mSecondRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));

                                    if (i == _totalRawDataInByteArray.size() - 1) {
                                        _collectionOfRawData.add(getConvertedValuesFromByteArr(mThirdRecord, 1, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                        DbAccess dbAccess = DbAccess.getInstance(_context);
                                        dbAccess.addBulkRawData(_collectionOfRawData, _measureTime);
                                    } else {
                                        _collectionOfRawData.add(getConvertedValuesFromByteArr(mThirdRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                    }
                                } else if (_totalRawDataInByteArray.get(i).length == 175) {
                                    int wrOffset = 0;
                                    int mOpStatus = LpUtility.byteToInt(mCharData[0]);
                                    byte[] mFirstRecord = new byte[58];
                                    for (int mCount = 1; mCount < 59; mCount++) {
                                        mFirstRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    byte[] mSecondRecord = new byte[58];
                                    wrOffset = 0;
                                    for (int mCount = 59; mCount < 117; mCount++) {
                                        mSecondRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    byte[] mThirdRecord = new byte[58];
                                    wrOffset = 0;
                                    for (int mCount = 117; mCount < 175; mCount++) {
                                        mThirdRecord[wrOffset] = _totalRawDataInByteArray.get(i)[mCount];
                                        wrOffset++;
                                    }

                                    _collectionOfRawData.add(getConvertedValuesFromByteArr(mFirstRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                    _collectionOfRawData.add(getConvertedValuesFromByteArr(mSecondRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));

                                    if (i == _totalRawDataInByteArray.size() - 1) {
                                        _collectionOfRawData.add(getConvertedValuesFromByteArr(mThirdRecord, 1, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                        DbAccess dbAccess = DbAccess.getInstance(_context);
                                        dbAccess.addBulkRawData(_collectionOfRawData, _measureTime);
                                    } else {
                                        _collectionOfRawData.add(getConvertedValuesFromByteArr(mThirdRecord, 0, _totalRawDataInByteArray.get(i).length, mOpStatus));
                                    }

                                }
                            }

                            HashMap<String, Object> mData = new HashMap<>();
                            mData.put("data", _collectionOfRawData);
                            String mRawDataToCloud = new Gson().toJson(mData);
                            Log.i("JsonCreateRawData", "RawData" + mRawDataToCloud);
                            LpLogger.logInfo(new LoggerStruct("RawDataReadEvent", "BleServices", "Raw data read complete"));
                            AsyncTask.execute(() -> LifePlusReactModule.uploadRawDataOnCloud(mRawDataToCloud, _measureTime));
                            EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_SUCCESS));
                            return;
                        }
                        break;
                }

                boolean mRawReadNext = fireCommandForRawReadPrepare();
                if (!mRawReadNext) {
                    BleServices.setCurrentProcState(BleProcEnum.READ_RAW_DATA, BleProcStateEnum.NONE);
                    LpLogger.logError(new LoggerStruct("RawDataReadEvent", "BleServices",
                            ResultCodeEnum.RAW_READ_COMMAND_FAILED, "", ""));
                } else {
                    Log.i("RawRead", "onMessageEvent: Raw data read command  fired");
                }
                break;
            default:
                break;
        }
    }


    private HashMap<String, Object> getConvertedValuesFromByteArr(byte[] pData, int last, int payloadLength, int pOpStatus) {
        HashMap<String, Object> mValues = new HashMap<>();

        mValues.put("OpStatus", pOpStatus);

        int mCurrentIndex = LpUtility.byteArrToInt(pData[0], pData[1]);
        mValues.put("CurrentIndex", mCurrentIndex);

        int mAFEData1 = LpUtility.byteArrayToInteger(pData[2], pData[3], pData[4], pData[5]);
        mValues.put("AFEData1", mAFEData1);

        int mAFEData2 = LpUtility.byteArrayToInteger(pData[6], pData[7], pData[8], pData[9]);
        mValues.put("AFEData2", mAFEData2);

        int mAFEData3 = LpUtility.byteArrayToInteger(pData[10], pData[11], pData[12], pData[13]);
        mValues.put("AFEData3", mAFEData3);

        int mAFEData4 = LpUtility.byteArrayToInteger(pData[14], pData[15], pData[16], pData[17]);
        mValues.put("AFEData4", mAFEData4);

        short mGyro1a = LpUtility.byteArrayToShort(pData[18], pData[19]);
        mValues.put("Gyro1a", mGyro1a);

        short mGyro2a = LpUtility.byteArrayToShort(pData[20], pData[21]);
        mValues.put("Gyro2a", mGyro2a);

        short mGyro3a = LpUtility.byteArrayToShort(pData[22], pData[23]);
        mValues.put("Gyro3a", mGyro3a);

        short mAccelerometer_X = LpUtility.byteArrayToShort(pData[24], pData[25]);
        mValues.put("Accelerometer_X", mAccelerometer_X);

        short mAccelerometer_Y = LpUtility.byteArrayToShort(pData[26], pData[27]);
        mValues.put("Accelerometer_Y", mAccelerometer_Y);

        short mAccelerometer_Z = LpUtility.byteArrayToShort(pData[28], pData[29]);
        mValues.put("Accelerometer_Z", mAccelerometer_Z);


        int AFEPHASE1 = LpUtility.byteArrayToInteger(pData[30], pData[31], pData[32], pData[33]);
        mValues.put("AFEPHASE1", AFEPHASE1);

        int AFEPHASE2 = LpUtility.byteArrayToInteger(pData[34], pData[35], pData[36], pData[37]);
        mValues.put("AFEPHASE2", AFEPHASE2);

        int AFEPHASE3 = LpUtility.byteArrayToInteger(pData[38], pData[39], pData[40], pData[41]);
        mValues.put("AFEPHASE3", AFEPHASE3);

        int AFEPHASE4 = LpUtility.byteArrayToInteger(pData[42], pData[43], pData[44], pData[45]);
        mValues.put("AFEPHASE4", AFEPHASE4);

        int AFEPHASE5 = LpUtility.byteArrayToInteger(pData[46], pData[47], pData[48], pData[49]);
        mValues.put("AFEPHASE5", AFEPHASE5);

        int AFEPHASE6 = LpUtility.byteArrayToInteger(pData[50], pData[51], pData[52], pData[53]);
        mValues.put("AFEPHASE6", AFEPHASE6);

        int AFEPHASE7 = LpUtility.byteArrayToInteger(pData[54], pData[55], pData[56], pData[57]);
        mValues.put("AFEPHASE7", AFEPHASE7);

        if (payloadLength != 175) {

            int Gyro1a1 = LpUtility.byteArrToInt(pData[58], pData[59]);
            mValues.put("Gyro1a1", Gyro1a1);

            int Gyro2a1 = LpUtility.byteArrToInt(pData[60], pData[61]);
            mValues.put("Gyro2a1", Gyro2a1);

            int Gyro3a1 = LpUtility.byteArrToInt(pData[62], pData[63]);
            mValues.put("Gyro3a1", Gyro3a1);

            int Accelerometer_X1 = LpUtility.byteArrToInt(pData[64], pData[65]);
            mValues.put("Accelerometer_X1", Accelerometer_X1);

            int Accelerometer_Y1 = LpUtility.byteArrToInt(pData[66], pData[67]);
            mValues.put("Accelerometer_Y1", Accelerometer_Y1);

            int Accelerometer_Z1 = LpUtility.byteArrToInt(pData[68], pData[69]);
            mValues.put("Accelerometer_Z1", Accelerometer_Z1);

        }

        if (last == 1) {
            HashMap<String, Object> mVitalData = BleServices.getCalibrationUserEnteredData();
            mVitalData.put("measure_time", _measureTime);
            mValues.put("vitals", mVitalData);
        }

        return mValues;
    }


    @Subscribe
    public void onMessageEvent(CalibrationCompletedEvent event) {
        LpLogger.logInfo(new LoggerStruct("CalibrationCompletedEvent", "BleServices", event.getData()));
        LifePlusReactModule.uploadOnCloud(event.deviceData, _measureTime + "");
        EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_SUCCESS));
    }

    @Subscribe
    public void onMessageEvent(StatusChangeEvent pStatusChangeEvent) {
        if (statusEvents.isEmpty()) {
            final Handler handler = new Handler(Looper.getMainLooper());
            handler.postDelayed(() -> {
                if (statusEvents.size() > 3) {
                    ErrorLogger.diagnosticsEvent("Status characteristic noise: " + Arrays.toString(statusEvents.toArray()));
                }
                statusEvents.clear();
            }, TimeUnit.SECONDS.toMillis(1));
        }
        statusEvents.add(pStatusChangeEvent.getData());

        if (BleServices.getCurrentProc() == BleProcEnum.CONNECT) {
            if (BleServices.getCurrentProcState() == BleProcStateEnum.READ_WATCH_STATUS) {
                if (pStatusChangeEvent.isMeasureInProgress()) {
                    setCurrentProc(BleProcEnum.AUTO_MEASURE);
                } else {
                    BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
                }
            } else {
                return;
            }
        }

        if (_appFirstBoot || pStatusChangeEvent.isBatteryLow() != StatusChangeEvent.isPrevBatteryLow()) {
            if (pStatusChangeEvent.isBatteryLow()) {
                switch (BleServices.getCurrentProc()) {
                    case INSTANT_MEASURE:
                        EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.WATCH_BATTERY_LOW));
                        break;
                    case CALIBRATE:
                        EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.WATCH_BATTERY_LOW));
                        break;
                    default:
                        EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(ResultCodeEnum.WATCH_BATTERY_LOW));
                }
            } else {
                EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(ResultCodeEnum.WATCH_BATTERY_NORMAL));
            }
        }

        if (_appFirstBoot || pStatusChangeEvent.isChargerConnected() != StatusChangeEvent.isPrevChargerConnected()) {
            if (chargerStatusEvents.isEmpty()) {
                final Handler handler = new Handler(Looper.getMainLooper());
                handler.postDelayed(() -> {
                    ResultCodeEnum event = chargerStatusEvents.get(chargerStatusEvents.size() - 1);
                    EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(event));
                    chargerStatusEvents.clear();
                }, TimeUnit.SECONDS.toMillis(1));
            }
            chargerStatusEvents.add(pStatusChangeEvent.isChargerConnected() ? ResultCodeEnum.WATCH_CHARGER_CONNECTED : ResultCodeEnum.WATCH_CHARGER_DISCONNECTED);
        }

        if (_appFirstBoot || pStatusChangeEvent.isWatchNotOnWrist() != StatusChangeEvent.isPrevWatchNotOnWrist()) {
            if (wristStatusEvents.isEmpty()) {
                final Handler handler = new Handler(Looper.getMainLooper());
                handler.postDelayed(() -> {
                    Pair<ResultCodeEnum, Boolean> event = wristStatusEvents.get(wristStatusEvents.size() - 1);
                    if (event.first == ResultCodeEnum.WATCH_NOT_ON_WRIST && event.second) {
                        // skip event
                    } else {
                        EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(event.first));
                    }
                    wristStatusEvents.clear();
                }, TimeUnit.SECONDS.toMillis(1));
            }
            wristStatusEvents.add(new Pair<>(
                    pStatusChangeEvent.isWatchNotOnWrist() ? ResultCodeEnum.WATCH_NOT_ON_WRIST : ResultCodeEnum.WATCH_ON_WRIST,
                    pStatusChangeEvent.isMeasureInProgress()
            ));
        }

        if (pStatusChangeEvent.isShutdownInProgress() != StatusChangeEvent.isPrevShutdownInProgress()
                || pStatusChangeEvent.isShutdownManual() != StatusChangeEvent.isPrevShutdownManual()) {
            if (pStatusChangeEvent.isShutdownInProgress() && !pStatusChangeEvent.isShutdownManual()) {
                EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(ResultCodeEnum.WATCH_SHUTDOWN_IN_PROGRESS));
            }
        }

        if (!pStatusChangeEvent.isMeasureSuccess() && pStatusChangeEvent.isMeasureSuccess() != StatusChangeEvent.isPrevMeasureSuccess()) {
            DbAccess dbAccess = DbAccess.getInstance(_context);
            dbAccess.addUnsuccessfulMeasure(System.currentTimeMillis());
            EventEmittersToReact.getInstance().EmitCommonResult(new CommonResponse(ResultCodeEnum.MEASURE_FAILED));
        }

        if (_appFirstBoot || StatusChangeEvent.isPrevMeasureInProgress() != pStatusChangeEvent.isMeasureInProgress() || Global.getCurrentStatus().equalsIgnoreCase("READ")) {
            _appFirstBoot = false;
            if (pStatusChangeEvent.isMeasureInProgress()) {
                if (Global.getCurrentStatus().equalsIgnoreCase("READ")) {
                    switch (BleServices.getCurrentProc()) {
                        case INSTANT_MEASURE:
                            BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.MEASURE_READ_COMMAND_FIRED);
                            EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_IN_PROGRESS));
                            break;
                        case AUTO_MEASURE:
                            BleServices.setCurrentProcState(BleProcEnum.AUTO_MEASURE, BleProcStateEnum.MEASURE_READ_COMMAND_FIRED);
                            EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_IN_PROGRESS));
                            break;
                        case CALIBRATE:
                            BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.MEASURE_COMMAND_FIRED);
                            EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATE_IN_PROGRESS));
                            break;
                    }
                    startMeasureTimer();
                } else {
                    if (BleServices.getCurrentProc() == BleProcEnum.NONE) {
                        setCurrentProc(BleProcEnum.AUTO_MEASURE);
                        LpLogger.logInfo(new LoggerStruct("VitalReadEvent", "BleServices", "Auto measure started (Event 598)"));
                        EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.AUTO_MEASURE_STARTED));
                    }
                    startMeasureTimer();
                }
            } else {
                stopMeasureTimer();
                switch (BleServices.getCurrentProc()) {
                    case INSTANT_MEASURE:
                        if (Global.getCurrentStatus().equalsIgnoreCase("READ")) {
                            switch (BleServices.getCurrentProcState()) {
                                case MEASURE_START:
                                    BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.CHECK_MEASURE_PRECONDITION);
                                    boolean mCommandResult = _bleDevice.writeCommand(BleCommandEnum.START_MEASUREMENT.getValue());
                                    if (!mCommandResult) {
                                        BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.NONE);
                                        EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.VITAL_READ_COMMAND_FAILED));
                                        LpLogger.logError(new LoggerStruct("StatusChangeEvent", "BleServices", "Unable to fire start measure command"));
                                    } else {
                                        LpLogger.logInfo(new LoggerStruct("StatusChangeEvent", "BleServices", "start measure command  fired"));
                                    }
                                    break;
                                case MEASURE_READ_COMMAND_FIRED:
                                    break;
                            }
                        } else {
                            if (Global.getCurrentStatus().equalsIgnoreCase("CHANGE")) {
                                setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.MEASURE_READ_COMMAND_FIRED);

                                boolean mMeasureReadStarted = fireCommandForVitalPrepare();
                                if (!mMeasureReadStarted) {
                                    setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.NONE);
                                    LpLogger.logError(new LoggerStruct("StatusChangeEvent", "BleServices",
                                            ResultCodeEnum.VITAL_READ_COMMAND_FAILED,
                                            "",
                                            ""));
                                } else {
                                    LpLogger.logInfo(new LoggerStruct("StatusChangeEvent", "BleServices", "Vital read command  fired"));
                                }
                            }
                        }

                        break;
                    case CALIBRATE:
                        if (Global.getCurrentStatus().equalsIgnoreCase("READ")) {
                            switch (BleServices.getCurrentProcState()) {
                                case CALIBRATION_START:
                                    BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.CHECK_MEASURE_PRECONDITION);
                                    boolean mCommandResult = _bleDevice.writeCommand(BleCommandEnum.START_MEASUREMENT.getValue());
                                    if (!mCommandResult) {
                                        BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.NONE);
                                        EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.VITAL_READ_COMMAND_FAILED));
                                        LpLogger.logError(new LoggerStruct("StatusChangeEvent", "BleServices", "Unable to fire start measure command"));
                                    } else {
                                        LpLogger.logInfo(new LoggerStruct("StatusChangeEvent", "BleServices", "start measure command  fired"));
                                    }
                                    break;
                                case MEASURE_READ_COMMAND_FIRED:
                                    break;
                            }
                        } else {
                            if (Global.getCurrentStatus().equalsIgnoreCase("CHANGE")) {
                                setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.MEASURE_READ_COMMAND_FIRED);

                                boolean mMeasureReadStarted = fireCommandForVitalPrepare();
                                if (!mMeasureReadStarted) {
                                    setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.NONE);
                                    LpLogger.logError(new LoggerStruct("StatusChangeEvent", "BleServices",
                                            ResultCodeEnum.VITAL_READ_COMMAND_FAILED,
                                            "",
                                            ""));
                                } else {
                                    LpLogger.logInfo(new LoggerStruct("StatusChangeEvent", "BleServices", "Vital read command  fired"));
                                }
                            }
                        }

                        break;
                    case NONE:
                    case AUTO_MEASURE:
                        if (Global.getCurrentStatus().equalsIgnoreCase("CHANGE")) {
                            setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.MEASURE_READ_COMMAND_FIRED);

                            boolean mMeasureReadStarted = fireCommandForVitalPrepare();
                            if (!mMeasureReadStarted) {
                                setCurrentProcState(BleServices.getCurrentProc(), BleProcStateEnum.NONE);
                                LpLogger.logError(new LoggerStruct("StatusChangeEvent", "BleServices",
                                        ResultCodeEnum.VITAL_READ_COMMAND_FAILED,
                                        "",
                                        ""));
                            } else {
                                LpLogger.logInfo(new LoggerStruct("StatusChangeEvent", "BleServices", "Vital read command  fired"));
                            }
                        }

                        break;
                }
            }
        }
        pStatusChangeEvent.setNewStatus();
    }

    private boolean fireCommandForVitalPrepare() {
        boolean result = false;
        try {
            result = fireCommand(BleCommandEnum.GET_LAST_VITAL);
        } catch (Exception e) {
            Log.e("fireCommandForVital", e.getLocalizedMessage());
        }
        return result;
    }

    private boolean fireCommandForStepCountPrepare() {
        boolean result = false;
        try {
            int mDay = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
            BluetoothGattService mCustomService = getGattService(GattServiceEnum.CUSTOM_SERVICE);
            if (mCustomService != null) {
                BluetoothGattCharacteristic mCommandChar = getGattChar(mCustomService, GattCharEnum.COMMAND);
                if (mCommandChar != null) {

                    mCommandChar.setValue(LpUtility.GetCommandForStepCountRead(mDay).getValue());
                    result = _bleDevice.getGatt().writeCharacteristic(mCommandChar);
                }
            }
        } catch (Exception e) {
            Log.e("fireCommandForStepCount", e.getLocalizedMessage());
        }
        return result;
    }

    private boolean fireCommandForRawReadPrepare() {
        boolean result = false;
        try {
            BluetoothGattService mCustomService = getGattService(GattServiceEnum.CUSTOM_SERVICE);
            if (mCustomService != null) {
                BluetoothGattCharacteristic mCommandChar = getGattChar(mCustomService, GattCharEnum.COMMAND);
                if (mCommandChar != null) {
                    switch (getCurrentProcState()) {
                        case READ_RAW_FIRST:
                            mCommandChar.setValue(BleCommandEnum.GET_FIRST_RAW.getValue());
                            break;
                        case READ_RAW_NEXT:
                            mCommandChar.setValue(BleCommandEnum.GET_NEXT_RAW.getValue());
                            break;
                        case READ_RAW_PREV:
                            mCommandChar.setValue(BleCommandEnum.GET_PREV_RAW.getValue());
                            break;
                        case READ_RAW_LAST:
                            mCommandChar.setValue(BleCommandEnum.GET_LAST_RAW.getValue());
                            break;
                    }
                    result = _bleDevice.getGatt().writeCharacteristic(mCommandChar);
                }
            }
        } catch (Exception e) {
            Log.e("fireCommandForRawRead", e.getLocalizedMessage());
        }
        return result;
    }

    private boolean fireCommandForOfflineDataRead() {
        boolean result = false;
        try {
            BluetoothGattService mCustomService = getGattService(GattServiceEnum.CUSTOM_SERVICE);
            if (mCustomService != null) {
                BluetoothGattCharacteristic mCommandChar = getGattChar(mCustomService, GattCharEnum.COMMAND);
                if (mCommandChar != null) {
                    switch (getCurrentProcState()) {
                        case OFFLINE_SYNC_START:
                            mCommandChar.setValue(BleCommandEnum.GET_LAST_VITAL.getValue());
                            break;
                        case OFFLINE_SYNC_PREV:
                            mCommandChar.setValue(BleCommandEnum.GET_PREV_VITAL.getValue());
                            break;
                    }
                    result = _bleDevice.getGatt().writeCharacteristic(mCommandChar);
                }
            }
        } catch (Exception e) {
            Log.e("fireCommandForOffline", e.getLocalizedMessage());
        }
        return result;
    }

    private boolean fireCommandForOfflineMealRead() {
        boolean mResult = false;
        try {
            BluetoothGattService mCustomService = getGattService(GattServiceEnum.CUSTOM_SERVICE);
            if (mCustomService != null) {
                BluetoothGattCharacteristic mCommandChar = getGattChar(mCustomService, GattCharEnum.COMMAND);
                if (mCommandChar != null) {
                    switch (getCurrentProcState()) {
                        case OFFLINE_SYNC_MEAL_START:
                            mCommandChar.setValue(BleCommandEnum.GET_LAST_MEAL.getValue());
                            break;
                        case OFFLINE_SYNC_MEAL_PREV:
                            mCommandChar.setValue(BleCommandEnum.GET_PREV_MEAL.getValue());
                            break;
                    }
                    mResult = _bleDevice.getGatt().writeCharacteristic(mCommandChar);
                }
            }
        } catch (Exception e) {
            // no code required
        }
        return mResult;
    }

    private boolean fireCommand(BleCommandEnum pCommandToFire) {
        boolean result = false;
        BluetoothGattService mCustomService = getGattService(GattServiceEnum.CUSTOM_SERVICE);
        if (mCustomService != null) {
            BluetoothGattCharacteristic mCommandChar = getGattChar(mCustomService, GattCharEnum.COMMAND);
            if (mCommandChar != null) {
                mCommandChar.setValue(pCommandToFire.getValue());
                result = _bleDevice.getGatt().writeCharacteristic(mCommandChar);
            }
        }
        return result;
    }

    public BluetoothGattService getGattService(GattServiceEnum pService) {
        BluetoothGattService result = null;
        if (_bleDevice != null) {
            if (_bleDevice.getGatt() != null) {
                result = _bleDevice.getGatt().getService(UUID.fromString(pService.getId()));
            }
        }
        return result;
    }

    public BluetoothGattCharacteristic getGattChar(BluetoothGattService pService, GattCharEnum pChar) {
        BluetoothGattCharacteristic result = null;
        if (pService != null) {
            result = pService.getCharacteristic(UUID.fromString(pChar.getId()));
        }
        return result;
    }

    private boolean connectGatt() {
        if (_bleDevice != null) {
            return _bleDevice.connectGatt(_gattCallback, CONNECT_TIMEOUT_MS);
        } else {
            return false;
        }
    }

    public boolean startInstantMeasure() {
        BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.SET_MEASURE_CALC_BEFORE);
        return startAppSync(false, false) == null;
    }

    private void readStatusForInstantMeasure() {
        BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.MEASURE_START);
        ResultCodeEnum result = null;
        if (_bleDevice != null) {
            result = _bleDevice.readCustomServiceCharacteristic(GattCharEnum.STATUS);
        }
        if (result != ResultCodeEnum.MEASURE_ACKNOWLEDGE) {
            BleServices.setCurrentProcState(BleProcEnum.INSTANT_MEASURE, BleProcStateEnum.NONE);
            EventEmittersToReact.getInstance().EmitInstantMeasureResult(new InstantMeasureResponse(ResultCodeEnum.INSTANT_MEASURE_FAILED));
        }
    }

    public StepGoalResponse updateDailyStepGoal(byte[] stepGoal) {
        if (_bleDevice == null) {
            return new StepGoalResponse(ResultCodeEnum.INVALID_DEVICE);
        } else {
            return _bleDevice.updateDailyStepGoal(stepGoal);
        }
    }

    public AppSyncResponse startAppSync(boolean isSynRead, boolean isCalculationOff) {
        AppSyncResponse result = null;
        if (_bleDevice == null) {
            result = new AppSyncResponse(ResultCodeEnum.INVALID_DEVICE);
        } else {
            if (isSynRead) {
                _bleDevice.readCustomServiceCharacteristic(GattCharEnum.USER_INFO);
            } else {
                boolean isQuietMode = BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_BEFORE
                        || BleServices.getCurrentProcState() == BleProcStateEnum.SET_MEASURE_CALC_AFTER;
                if (!isQuietMode) {
                    stopWeatherService();
                }

                int mUserId = Global.getUserId();
                DbAccess dbAccess = DbAccess.getInstance(_context);
                AppSync settings = dbAccess.getAppSyncData(mUserId);
                settings.setCalculationOff(isCalculationOff);

                boolean mWriteResult = _bleDevice.writeAppSync(settings.toByteArray());
                if (mWriteResult) {
                    if (!isQuietMode) {
                        EventEmittersToReact.getInstance().EmitAppSyncResult(new AppSyncResponse(ResultCodeEnum.APPSYNC_COMPLETED), firmwareRevision);
                    }
                } else {
                    result = new AppSyncResponse(ResultCodeEnum.GATT_WRITE_FAIL);
                }

                if (!isQuietMode) {
                    startWeatherService();
                }
            }
        }
        return result;
    }

    public void readFirmwareRevision() {
        if (_bleDevice != null) {
           _bleDevice.readCharacteristic(GattServiceEnum.DEVICE_INFORMATION_SERVICE, GattCharEnum.FIRMWARE_REVISION);
        }
    }

    private void requestMaxMTUSize() {
        _bleDevice.requestMaxMTUSize();
    }

    private boolean subscribe(NoParamEventEnum pPurpose) {
        return _bleDevice.subscribe(pPurpose);
    }

    private void handleWriteDescFailure() {
        BleServices.setCurrentProc(BleProcEnum.NONE);
    }

    public boolean writeReferenceVitalData() {
        BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.CALIBRATION_REFERENCE_WRITE);
        BluetoothGattService customService = _bleDevice.getGatt().getService(UUID.fromString(GattServiceEnum.CUSTOM_SERVICE.getId()));
        BluetoothGattCharacteristic referenceChar = customService.getCharacteristic(UUID.fromString(GattCharEnum.REFERENCE_VITAL_DATA.getId()));
        boolean result = false;
        if (referenceChar != null) {
            try {
                byte[] hr = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("HR", 0));
                byte[] rr = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("RR", 0));
                byte[] spo2 = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("SPO2", 0));
                byte[] glucose = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("Glucose", 0));
                byte[] sbp = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("SBP", 0));
                byte[] dbp = LpUtility.intToByteArr((int) _calibrationUserEnteredData.getOrDefault("DBP", 0));
                ByteBuffer buffer = ByteBuffer.allocate(12).put(hr).put(rr).put(spo2).put(glucose).put(sbp).put(dbp);
                result = _bleDevice.writeReferenceVitals(buffer.array());
                if (!result) {
                    Log.e("writeReferenceVitalData", "Could not write reference vital data.");
                }
            } catch (Exception exception) {
                Log.e("writeReferenceVitalData", "Could not write reference vital data.");
            }
        } else {
            Log.e("writeReferenceVitalData", "Could not write reference vital data.");
        }
        return result;
    }

    public boolean startCalibration() {
        BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.SET_MEASURE_CALC_BEFORE);
        return startAppSync(false, true) == null;
    }

    private void readStatusForCalibration() {
        BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.CALIBRATION_START);
        ResultCodeEnum result = null;
        if (_bleDevice != null) {
            result = _bleDevice.readCustomServiceCharacteristic(GattCharEnum.STATUS);
        }
        if (result != ResultCodeEnum.MEASURE_ACKNOWLEDGE) {
            BleServices.setCurrentProcState(BleProcEnum.CALIBRATE, BleProcStateEnum.NONE);
            EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_FAILED));
        }
    }

    @Subscribe
    public void onMessageEvent(MeasureTimeReadEvent event) {
        byte[] mCharData = event.data;
        _measureTime = LpUtility.byteArrayToDate(mCharData);

        BleServices.setCurrentProc(BleProcEnum.READ_RAW_DATA);
        BleServices.setCurrentProcState(BleProcEnum.READ_RAW_DATA, BleProcStateEnum.READ_RAW_FIRST);

        EventEmittersToReact.getInstance().EmitCalibrationResult(new CalibrationResponse(ResultCodeEnum.CALIBRATION_MEASURE_COMPLETE));

        // Step count read
        boolean mRawReadStarted = fireCommandForRawReadPrepare();
        if (!mRawReadStarted) {
            BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.READ_RAW_FIRST);
            LpLogger.logError(new LoggerStruct("VitalReadEvent", "BleServices",
                    ResultCodeEnum.RAW_READ_COMMAND_FAILED,
                    "",
                    ""));
        } else {
            LpLogger.logInfo(new LoggerStruct("RawDataRead", "BleServices", "Raw read first command  fired"));
        }
    }

    @Subscribe
    public void onMessageEvent(FirmwareRevisionReadEvent event) {
        byte[] mCharData = event.data;
        firmwareRevision = new String(mCharData).split("\0")[0];
        EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_APP_SYNC_READ));

        if (this.lastMeasureTime > 0) {
            DbAccess.getInstance(_context).reviewOfflineMeasures(this.lastMeasureTime);
        }
    }

    public FirmwareUpdateResponse initiateDfuMode() {
        FirmwareUpdateResponse result = null;
        if (_bleDevice == null || BleDevice._blueToothGatt == null) {
            result = new FirmwareUpdateResponse(ResultCodeEnum.NOT_CONNECTED);
        } else {
            if (!_bleDevice.enableDfuMode()) {
                result = new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_ERROR_COMMUNICATION);
            }
        }
        return result;
    }

    public void connectWithBle(BleDevice pDevice) {
        BleProcEnum proc;
        if (getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE) {
            proc = BleProcEnum.FIRMWARE_UPDATE;
        } else {
            proc = BleProcEnum.CONNECT;
        }
        try {
            scanStopTick(false);
            LpLogger.logInfo(new LoggerStruct("connectWithBle", "BleServices", ResultCodeEnum.DISCOVERING_SERVICES.getDesc() + " (" + pDevice.getAddress() + ")"));

            ConnectResponse mResponse = new ConnectResponse(ResultCodeEnum.DISCOVERING_SERVICES, " (" + pDevice.getAddress() + ")");
            mResponse.setAuthId(pDevice.getAddress());
            EventEmittersToReact.getInstance().EmitConnectResult(mResponse);

            setBleDevice(pDevice);
            if (getCurrentProc() != BleProcEnum.FIRMWARE_UPDATE) {
                Global.moveConfirmScanUser();
            }
            BleServices.setCurrentProc(proc);
            if (getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_CONNECT_DFU_DEVICE) {
                BleServices.setCurrentProcState(proc, BleProcStateEnum.FIRMWARE_UPDATE_CONNECT_DFU_DEVICE);
            } else {
                BleServices.setCurrentProcState(proc, BleProcStateEnum.CONNECT_GATT);
            }
            boolean mConnectGattResult = connectGatt();
            if (!mConnectGattResult) {
                BleServices.setCurrentProcState(proc, BleProcStateEnum.NONE);
                LpLogger.logError(new LoggerStruct("connectWithBle", "BleServices",
                        ResultCodeEnum.GATT_DISCOVER_FAIL,
                        "Unable to connect to GATT",
                        ""));
                EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.GATT_DISCOVER_FAIL));
            } else {
                Log.e("Connection", "3");
                connectedDevice = pDevice;
            }
        } catch (Exception e) {
            BleServices.setCurrentProcState(proc, BleProcStateEnum.NONE);
            LpLogger.logError(new LoggerStruct("connectWithBle", "BleServices",
                    ResultCodeEnum.UNKNOWN_ERR,
                    " Error in LifePlusReactModule.connectWithBle (" + e.getMessage() + ")",
                    ""));
            Log.e("Connection", "4" + e.getMessage());

            EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.UNKNOWN_ERR, " Error in LifePlusReactModule.connectWithBle (" + e.getMessage() + ")"));
        }
    }

    public ConnectResponse startScanning() {
        return startScanning(SCAN_TIMEOUT_MS);
    }

    public ConnectResponse startScanning(long timeout) {
        BleProcEnum proc = getCurrentProc() == BleProcEnum.FIRMWARE_UPDATE ? BleProcEnum.FIRMWARE_UPDATE : BleProcEnum.CONNECT;
        if (getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE) {
            BleServices.setCurrentProcState(proc, BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE);
        } else {
            BleServices.setCurrentProcState(proc, BleProcStateEnum.SCAN);
        }
        ConnectResponse mResult;
        try {
            if (!checkBlueToothPermission()) {
                LpLogger.logError(new LoggerStruct("startScanning", "BleServices", ResultCodeEnum.BLE_NO_PERMISSION.getDesc()));
                mResult = new ConnectResponse(ResultCodeEnum.BLE_NO_PERMISSION);
                return mResult;
            }
            if (!checkLocationPermission()) {
                LpLogger.logError(new LoggerStruct("startScanning", "BleServices", ResultCodeEnum.LOCATION_NO_PERMISSION.getDesc()));
                mResult = new ConnectResponse(ResultCodeEnum.LOCATION_NO_PERMISSION);
                return mResult;
            }

            final Handler mHandler = new Handler(Looper.getMainLooper());
            if (_scanStopTimer != null) {
                _scanStopTimer.cancel();
                scanStopTick(false);
            }
            TimerTask timerTask = new TimerTask() {
                public void run() {
                    mHandler.post(() -> scanStopTick(true));
                }
            };
            _scanStopTimer = new Timer();
            _scanStopTimer.schedule(timerTask, timeout);
            BluetoothManager mBluetoothManager = (BluetoothManager) _context.getSystemService(Context.BLUETOOTH_SERVICE);
            if (mBluetoothManager == null) {
                mResult = new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, "mBluetoothManager is null");
                return mResult;
            }
            BluetoothAdapter mBluetoothAdapter = mBluetoothManager.getAdapter();
            if (mBluetoothAdapter == null) {
                mResult = new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, "mBluetoothAdapter is null");
                return mResult;
            }

            BluetoothLeScanner mBleScanner = mBluetoothAdapter.getBluetoothLeScanner();
            if (mBleScanner != null) {
                ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
                mBleScanner.startScan(null, settings, leScanCallback);
                ErrorLogger.log("deviceConnect - started scanning.");

                mResult = new ConnectResponse(ResultCodeEnum.CONNECT_ACKNOWLEDGE, "Device connection ");
                mResult.setUserId(String.valueOf(Global.getUserIdForScan()));
                mResult.setAuthId(Global.getWatchMSNForScan());

                LpLogger.logInfo(new LoggerStruct("startScanning", "BleServices", "Scanning started (" + mResult.getResponseStr() + ")"));
            } else {
                LpLogger.logError(new LoggerStruct("startScanning", "BleServices",
                        ResultCodeEnum.UNABLE_START_SCANNING,
                        "BLE scanner is null",
                        ""));
                mResult = new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, "BLE scanner is null");
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("startScanning", "BleServices",
                    ResultCodeEnum.UNABLE_START_SCANNING,
                    e.getMessage(),
                    ""));
            mResult = new ConnectResponse(ResultCodeEnum.UNABLE_START_SCANNING, e.getMessage());
        }
        return mResult;
    }

    public void scanStopTick(boolean pForceStop) {
        String mLoggerMessage = "";

        BluetoothManager mBluetoothManager = (BluetoothManager) _context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (mBluetoothManager != null) {
            BluetoothAdapter mBluetoothAdapter = mBluetoothManager.getAdapter();
            if (mBluetoothAdapter != null) {
                BluetoothLeScanner mBleScanner = mBluetoothAdapter.getBluetoothLeScanner();
                if (mBleScanner != null) {
                    mBleScanner.stopScan(leScanCallback);
                    mLoggerMessage = "Stopped Scanning...";
                }
            }
        }
        if (pForceStop) {
            if (Arrays.asList(
                    BleProcStateEnum.SCAN,
                    BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE
            ).contains(BleServices.getCurrentProcState())) {
                ConnectErrorHandler.recordScanError(_context);
                mLoggerMessage = ResultCodeEnum.WATCH_UNAVAILABLE.getDesc();
                EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));

                if (getCurrentProcState() == BleProcStateEnum.FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE) {
                    EventEmittersToReact.getInstance().emitFwUpdate(
                            new FirmwareUpdateResponse(ResultCodeEnum.FIRMWARE_UPDATE_ERROR_CONNECTION)
                    );
                }

                BleServices.setCurrentProc(BleProcEnum.NONE);
                BleServices.setCurrentProcState(BleProcEnum.NONE, BleProcStateEnum.NONE);
            }
        }
        if (!mLoggerMessage.isEmpty()) {
            LpLogger.logInfo(new LoggerStruct("stopScanning", "BleServices", mLoggerMessage));
        }
    }

    private boolean checkBlueToothPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            String mPermission = Manifest.permission.BLUETOOTH_ADMIN;
            int res = _context.checkSelfPermission(mPermission);
            return (res == PackageManager.PERMISSION_GRANTED);
        } else {
            String mPermission = Manifest.permission.BLUETOOTH_SCAN;
            int res = _context.checkSelfPermission(mPermission);
            return (res == PackageManager.PERMISSION_GRANTED);
        }
    }

    private boolean checkLocationPermission() {
        String permission = Manifest.permission.ACCESS_FINE_LOCATION;
        int res = _context.checkSelfPermission(permission);
        return (res == PackageManager.PERMISSION_GRANTED);
    }

    public void disconnectDevice(boolean emitDisconnectEvent) {
        if (connectedDevice != null && connectedDevice.isBonded()) {
            connectedDevice.setBonded(false);
            connectedDevice.disconnectGatt();
            connectedDevice = null;
            EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_DISCONNECTED));

            if (emitDisconnectEvent) {
                EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));
            }
        }
    }

}
