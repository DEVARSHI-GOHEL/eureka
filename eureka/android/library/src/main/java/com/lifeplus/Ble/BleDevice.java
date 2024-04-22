package com.lifeplus.Ble;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.lifeplus.EventEmittersToReact;
import com.lifeplus.Events.NoParamEvent;
import com.lifeplus.Pojo.Enum.BleOperation;
import com.lifeplus.Pojo.Enum.BleProcStateEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;
import com.lifeplus.Pojo.Enum.GattServiceEnum;
import com.lifeplus.Pojo.Enum.NoParamEventEnum;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.Responses.ConnectResponse;
import com.lifeplus.Pojo.Responses.StepGoalResponse;
import com.lifeplus.Util.ConnectErrorHandler;
import com.lifeplus.Util.ErrorLogger;
import com.lifeplus.Util.LpLogger;
import com.lifeplus.Util.LpUtility;

import org.greenrobot.eventbus.EventBus;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;

@SuppressLint("MissingPermission")
public class BleDevice {
    private final Context _context;
    private final BluetoothDevice _device;
    public static BluetoothGatt _blueToothGatt = null;
    private boolean _bonded = false;
    private Timer connectTimer = null;

    public BleDevice(Context pContext, BluetoothDevice pDevice, boolean pBonded) {
        _context = pContext;
        _device = pDevice;
        _bonded = pBonded;
    }

    public Context getContext() {
        return _context;
    }

    public BluetoothDevice getDevice() {
        return _device;
    }

    public boolean isConnected() {
        try {
            Method m = _device.getClass().getMethod("isConnected", (Class[]) null);
            return (boolean) m.invoke(_device, (Object[]) null);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public String getName() {
        return ((_device == null) || ((_device.getName() == null) || (_device.getName().isEmpty()))) ? "Unknown" : _device.getName();
    }

    public String getAddress() {
        return (_device == null) ? "" : _device.getAddress();
    }

    public boolean connectGatt(GattCallback callback, long timeout) {
        boolean result = false;
        try {
            final Handler mHandler = new Handler(Looper.getMainLooper());
            if (connectTimer != null) {
                connectTimer.cancel();
            }
            TimerTask timerTask = new TimerTask() {
                public void run() {
                    mHandler.post(() -> connectTimeout());
                }
            };

            connectTimer = new Timer();
            connectTimer.schedule(timerTask, timeout);

            boolean autoConnect = BleServices.getCurrentProcState() != BleProcStateEnum.FIRMWARE_UPDATE_CONNECT_DFU_DEVICE;
            LpLogger.logInfo(new LoggerStruct("connectGatt", "BleDevice", "Starting connectGATT"));
            callback.setBleDevice(this);
            _blueToothGatt = _device.connectGatt(_context, autoConnect, callback);
            result = true;
        } catch (IllegalArgumentException e) {
            LpLogger.logError(new LoggerStruct("discoverServices", "BleDevice",
                    ResultCodeEnum.GATT_DISCOVER_FAIL,
                    e.getMessage(),
                    ""));
            Log.e("GattFailed", "Fail Fail");
            EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.GATT_DISCOVER_FAIL, e.getMessage()));
        }
        return result;
    }

    public void disconnectGatt() {
        if (_blueToothGatt != null) {
            _blueToothGatt.disconnect();
            _blueToothGatt = null;
        }
    }

    public boolean writeCommand(byte[] commandValue) {
        boolean result = false;
        BluetoothGattCharacteristic mCharacteristic = getGattChar(GattServiceEnum.CUSTOM_SERVICE, GattCharEnum.COMMAND);
        if (null != mCharacteristic) {
            mCharacteristic.setValue(commandValue);
            result = writeCharacteristic(mCharacteristic);
            if (!result) {
                LpLogger.logError(new LoggerStruct("writeCommand", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to write to: " + GattCharEnum.COMMAND.getId() + " value: " + LpUtility.encodeHexString(commandValue),
                        "204"));
            }
        } else {
            LpLogger.logError(new LoggerStruct("writeCommand", "BleDevice",
                    ResultCodeEnum.GATT_WRITE_FAIL,
                    "Unable to find: " + GattCharEnum.COMMAND.getId() + " for writing: " + LpUtility.encodeHexString(commandValue),
                    "210"));
            ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.COMMAND.getId() + " not found.");
        }
        return result;
    }

    public boolean writeAppSync(byte[] pValue) {
        boolean result = false;
        BluetoothGattCharacteristic mCharacteristic = getGattChar(GattServiceEnum.CUSTOM_SERVICE, GattCharEnum.USER_INFO);
        if (null != mCharacteristic) {
            mCharacteristic.setValue(pValue);
            result = writeCharacteristic(mCharacteristic);
            if (!result) {
                LpLogger.logError(new LoggerStruct("writeCharacteristic", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to write to: " + GattCharEnum.USER_INFO.getId() + " value: " + LpUtility.encodeHexString(pValue),
                        ""));
            }
        } else {
            LpLogger.logError(new LoggerStruct("writeCharacteristic", "BleDevice",
                    ResultCodeEnum.GATT_WRITE_FAIL,
                    "Unable to find: " + GattCharEnum.USER_INFO.getId() + " for writing: " + LpUtility.encodeHexString(pValue),
                    ""));
            ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.USER_INFO.getId() + " not found.");
        }
        return result;
    }

    public boolean writeReferenceVitals(byte[] pValue) {
        boolean result = false;
        BluetoothGattCharacteristic mCharacteristic = getGattChar(GattServiceEnum.CUSTOM_SERVICE, GattCharEnum.REFERENCE_VITAL_DATA);
        if (null != mCharacteristic) {
            mCharacteristic.setValue(pValue);
            result = writeCharacteristic(mCharacteristic);
            if (!result) {
                LpLogger.logError(new LoggerStruct("writeCharacteristic", "BleDevice",
                    ResultCodeEnum.GATT_WRITE_FAIL,
                    "Unable to write to: " + GattCharEnum.REFERENCE_VITAL_DATA.getId() + " value: " + LpUtility.encodeHexString(pValue),
                    ""));
            }
        } else {
            LpLogger.logError(new LoggerStruct("writeCharacteristic", "BleDevice",
                ResultCodeEnum.GATT_WRITE_FAIL,
                "Unable to find: " + GattCharEnum.REFERENCE_VITAL_DATA.getId() + " for writing: " + LpUtility.encodeHexString(pValue),
                ""));
            ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.REFERENCE_VITAL_DATA.getId() + " not found.");
        }
        return result;
    }

    private boolean writeCharacteristic(BluetoothGattCharacteristic mCharacteristic) {
        boolean result = _blueToothGatt.writeCharacteristic(mCharacteristic);
        if (!result) {
            ErrorLogger.bluetoothError(
                    "Failed to initiate write on characteristic " + mCharacteristic.getUuid().toString(),
                    mCharacteristic,
                    BleOperation.WRITE
            );
        }

        return result;
    }

    public boolean enableDfuMode() {
        boolean result = false;
        BluetoothGattCharacteristic mCharacteristic = getGattChar(GattServiceEnum.IMMEDIATE_ALERT_SERVICE, GattCharEnum.ALERT_LEVEL);
        if (null != mCharacteristic) {
            mCharacteristic.setValue(new byte[] { 0x01 });
            mCharacteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
            result = _blueToothGatt.writeCharacteristic(mCharacteristic);
            if (!result) {
                LpLogger.logError(new LoggerStruct("enableDfuMode", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to write to: " + GattCharEnum.ALERT_LEVEL.getId() + " value: 0x01",
                        ""));
            }
        } else {
            LpLogger.logError(new LoggerStruct("enableDfuMode", "BleDevice",
                    ResultCodeEnum.GATT_WRITE_FAIL,
                    "Unable to find: " + GattCharEnum.ALERT_LEVEL.getId() + " for writing: 0x01",
                    ""));
        }
        return result;
    }

    public ResultCodeEnum readCharacteristic(GattServiceEnum service, GattCharEnum characteristic) {
        try {
            if (_blueToothGatt == null) {
                ErrorLogger.bluetoothError("Failed reading characteristic " + characteristic.getId() + ", invalid gatt.");
                return ResultCodeEnum.INVALID_GATT;
            }

            BluetoothGattService mService = _blueToothGatt.getService(UUID.fromString(service.getId()));
            if (mService != null) {
                BluetoothGattCharacteristic mStatusCharacteristic = mService.getCharacteristic(UUID.fromString(characteristic.getId()));
                if (mStatusCharacteristic != null) {
                    boolean status = _blueToothGatt.readCharacteristic(mStatusCharacteristic);
                    if (status) {
                        Log.i("readCharacteristic", characteristic.getDesc() + " characteristic read successfully");
                        return ResultCodeEnum.MEASURE_ACKNOWLEDGE;
                    } else {
                        ErrorLogger.bluetoothError(
                                "Failed to initiate read on characteristic: " + characteristic.getId(),
                                mStatusCharacteristic,
                                BleOperation.READ
                        );
                        return ResultCodeEnum.UNABLE_CHARCT_READ;
                    }
                } else {
                    ErrorLogger.bluetoothError("Failed reading characteristic " + characteristic.getId() + ", char not found.");
                    return ResultCodeEnum.UNABLE_CHARCT_READ;
                }
            } else {
                ErrorLogger.bluetoothError("Failed reading characteristic " + characteristic.getId() + ", service not found.");
                return ResultCodeEnum.UNABLE_CHARCT_READ;
            }
        } catch (Exception e) {
            ErrorLogger.bluetoothError("Failed reading characteristic " + characteristic.getId() + ", exception: " + e.getMessage());
            return ResultCodeEnum.INVALID_GATT;
        }
    }

    public ResultCodeEnum readCustomServiceCharacteristic(GattCharEnum characteristic) {
        return readCharacteristic(GattServiceEnum.CUSTOM_SERVICE, characteristic);
    }

    public BluetoothGatt getGatt() {
        return _blueToothGatt;
    }

    public static BluetoothGattCharacteristic getGattChar(GattServiceEnum pServiceEnum, GattCharEnum pCharEnum) {
        BluetoothGattCharacteristic result = null;

        BluetoothGattService mService = _blueToothGatt.getService(UUID.fromString(pServiceEnum.getId()));
        if (mService != null) {
            result = mService.getCharacteristic(UUID.fromString(pCharEnum.getId()));
        }
        return result;
    }

    public void requestMaxMTUSize() {
        if (!_blueToothGatt.requestMtu(512)) {
            ErrorLogger.bluetoothError("Failed to initiate change of MTU size.");
        }
    }

    public void setConnectionPreferences() {
        _blueToothGatt.setPreferredPhy(BluetoothDevice.PHY_LE_1M_MASK, BluetoothDevice.PHY_LE_1M_MASK, BluetoothDevice.PHY_OPTION_NO_PREFERRED);
    }

    public boolean subscribe(NoParamEventEnum pPurpose) {
        boolean result = false;
        BluetoothGattService mCustomService = _blueToothGatt.getService(UUID.fromString(GattServiceEnum.CUSTOM_SERVICE.getId()));
        if (mCustomService != null) {
            switch (pPurpose) {
                case SUBSCRIBE_CUSTOM_STATUS_INDICATION:
                    BluetoothGattCharacteristic mStatusCharacteristic = mCustomService.getCharacteristic(UUID.fromString(GattCharEnum.STATUS.getId()));
                    if (mStatusCharacteristic != null) {
                        result = subscribe(mStatusCharacteristic, BluetoothGattDescriptor.ENABLE_INDICATION_VALUE);
                    }
                    break;
                case SUBSCRIBE_CUSTOM_MEAL_INDICATION:
                    BluetoothGattCharacteristic mMealCharacteristic = mCustomService.getCharacteristic(UUID.fromString(GattCharEnum.MEAL_DATA.getId()));
                    if (mMealCharacteristic != null) {
                        result = subscribe(mMealCharacteristic, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                    }
                    break;
                case SUBSCRIBE_CUSTOM_STEPCOUNT_INDICATION:
                    BluetoothGattCharacteristic mStepCharacteristic = mCustomService.getCharacteristic(UUID.fromString(GattCharEnum.STEP_COUNTER.getId()));
                    if (mStepCharacteristic != null) {
                        result = subscribe(mStepCharacteristic, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                    }
                    break;
            }
        }
        return result;
    }

    private boolean subscribe(BluetoothGattCharacteristic mCharacteristic, byte[] descriptorValue) {
        boolean result = false;
        BleOperation op = null;
        if (Arrays.equals(descriptorValue, BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)) {
            op = BleOperation.INDICATE;
        } else if (Arrays.equals(descriptorValue, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)) {
            op = BleOperation.NOTIFY;
        }
        for (BluetoothGattDescriptor mDesc : mCharacteristic.getDescriptors()) {
            if (_blueToothGatt.setCharacteristicNotification(mCharacteristic, true)) {
                Log.i("BLE", "Descriptor is " + mDesc.getUuid().toString()); // this is not null
                if (mDesc.setValue(descriptorValue)) {
                    if (_blueToothGatt.writeDescriptor(mDesc)) {
                        result = true;
                    }
                }
            }
        }

        if (!result) {
            ErrorLogger.bluetoothError(
                    "Failed to enable "+op.toString()+" on characteristic " + mCharacteristic.getUuid().toString(),
                    mCharacteristic,
                    op
            );
        }
        return result;
    }

    public boolean setDateTime() {
        boolean result = false;
        try {
            BluetoothGattCharacteristic mCommandChar = getGattChar(GattServiceEnum.CURR_TIME_SERVICE, GattCharEnum.CURRENT_TIME);
            byte[] mDate = LpUtility.getTimeSyncData();
            if (mCommandChar != null) {
                mCommandChar.setValue(mDate);
                result = writeCharacteristic(mCommandChar);
                if (result) {
                    LpLogger.logInfo(new LoggerStruct("DateTimeSyncEvent", "BleServices", "Date time synced with watch"));
                } else {
                    LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                            ResultCodeEnum.UNABLE_DATETIME_SET,
                            "",
                            ""));
                }
            } else {
                LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to find: " + GattCharEnum.CURRENT_TIME.getId() + " for writing: " + LpUtility.encodeHexString(mDate),
                        ""));
                ErrorLogger.bluetoothError("Characteristic " +GattCharEnum.CURRENT_TIME.getId() + " not found.");
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                    ResultCodeEnum.UNABLE_DATETIME_SET,
                    e.getLocalizedMessage(),
                    ""));
        }
        return result;
    }

    public boolean setTimeZone() {
        boolean result = false;
        try {
            BluetoothGattCharacteristic mCommandChar = getGattChar(GattServiceEnum.CURR_TIME_SERVICE, GattCharEnum.LOCAL_TIME_INFORMATION);
            byte[] mDate = LpUtility.TimeZoneToByteArr();
            if (mCommandChar != null) {
                mCommandChar.setValue(mDate);
                result = writeCharacteristic(mCommandChar);
                if (result) {
                    LpLogger.logInfo(new LoggerStruct("DateTimeSyncEvent", "BleServices", "Timezone synced with watch"));
                } else {
                    LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                            ResultCodeEnum.UNABLE_TIMEZONE_SET,
                            "",
                            ""));
                }
            } else {
                LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to find: " + GattCharEnum.LOCAL_TIME_INFORMATION.getId() + " for writing: " + LpUtility.encodeHexString(mDate),
                        ""));
                ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.LOCAL_TIME_INFORMATION.getId() + " not found.");
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("setDateTime", "BleDevice",
                    ResultCodeEnum.UNABLE_TIMEZONE_SET,
                    e.getLocalizedMessage(),
                    ""));
        }
        return result;
    }

    public boolean sendWeather(byte[] weatherData) {
        boolean result = false;
        try {
            BluetoothGattCharacteristic weatherChar = getGattChar(GattServiceEnum.CUSTOM_SERVICE, GattCharEnum.WEATHER);
            if (weatherChar != null) {
                weatherChar.setValue(weatherData);
                result = writeCharacteristic(weatherChar);
            } else {
                ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.WEATHER.getId() + " not found.");
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("sendWeather", "BleDevice",
                    ResultCodeEnum.GATT_WRITE_FAIL,
                    e.getLocalizedMessage(),
                    ""));
        }
        return result;
    }

    public StepGoalResponse updateDailyStepGoal(byte[] stepGoal) {
        StepGoalResponse result;
        try {
            BluetoothGattCharacteristic stepGoalChar = getGattChar(GattServiceEnum.CUSTOM_SERVICE, GattCharEnum.STEP_COUNTER);
            if (stepGoalChar != null) {
                stepGoalChar.setValue(stepGoal);
                if (writeCharacteristic(stepGoalChar)) {
                    LpLogger.logInfo(new LoggerStruct("updateDailyStepGoal", "BleDevice", "Updated daily step goal."));
                    result = new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_ACKNOWLEDGE);
                } else {
                    LpLogger.logError(new LoggerStruct("updateDailyStepGoal", "BleDevice",
                            ResultCodeEnum.STEP_GOAL_UPDATE_FAILED,
                            "",
                            ""));
                    result = new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_FAILED);
                }
            } else {
                LpLogger.logError(new LoggerStruct("updateDailyStepGoal", "BleDevice",
                        ResultCodeEnum.GATT_WRITE_FAIL,
                        "Unable to find: " + GattCharEnum.STEP_COUNTER.getId(),
                        ""));
                ErrorLogger.bluetoothError("Characteristic " + GattCharEnum.STEP_COUNTER.getId() + " not found.");
                result = new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_FAILED);
            }
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("updateDailyStepGoal", "BleDevice",
                    ResultCodeEnum.STEP_GOAL_UPDATE_FAILED,
                    e.getLocalizedMessage(),
                    ""));
            result = new StepGoalResponse(ResultCodeEnum.STEP_GOAL_UPDATE_FAILED);
        }
        return result;
    }

    public boolean unpairDevice() {
        try {
            Class c = _device.getClass();
            Method m = c.getMethod("removeBond");
            m.setAccessible(true);
            return (Boolean) m.invoke(_device);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isBonded() {
        return _bonded;
    }

    public void setBonded(boolean pBonded) {
        this._bonded = pBonded;
    }

    private void connectTimeout() {
        if (BleServices.getCurrentProcState() == BleProcStateEnum.DISCOVER_GATT ||
                BleServices.getCurrentProcState() == BleProcStateEnum.SET_MAX_MTU) {
            EventEmittersToReact.getInstance().emitIncompatibleDevice();
        }
        ConnectErrorHandler.recordConnectError(_context);
        connectTimer = null;
        _blueToothGatt.disconnect();
        EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));
        EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_DISCONNECTED));
    }

    public void cancelConnectTimer() {
        if (connectTimer != null) {
            connectTimer.cancel();
            connectTimer = null;
        }
    }
}
