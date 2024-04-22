package com.lifeplus.Ble;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.util.Log;

import com.lifeplus.EventEmittersToReact;
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
import com.lifeplus.Pojo.ACharDef;
import com.lifeplus.Pojo.AServiceDef;
import com.lifeplus.Pojo.Enum.BleOperation;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.BleProcStateEnum;
import com.lifeplus.Pojo.Enum.NoParamEventEnum;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.Responses.CommonResponse;
import com.lifeplus.Pojo.Responses.ConnectResponse;
import com.lifeplus.Pojo.ServiceDefs;
import com.lifeplus.Util.ErrorLogger;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;

import org.greenrobot.eventbus.EventBus;

import java.util.Arrays;
import java.util.List;

@SuppressLint("MissingPermission")
public class GattCallback extends BluetoothGattCallback {
    public static int _devicePrevStatus = -1;
    private BleDevice _callerDevice;
    public static BluetoothGatt _bleGatt;

    public void setBleDevice(BleDevice device) {
        if (_callerDevice != null && _callerDevice.getGatt() != null) {
            _callerDevice.getGatt().close();
        }
        _callerDevice = device;
    }

    @Override
    public void onPhyUpdate(BluetoothGatt gatt, int txPhy, int rxPhy, int status) {
        super.onPhyUpdate(gatt, txPhy, rxPhy, status);
        ErrorLogger.log("PHY update: TX " + txPhy + ", RX " + rxPhy + ", status " + status);
    }

    @Override
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
        super.onMtuChanged(gatt, mtu, status);
        if (status != BluetoothGatt.GATT_SUCCESS) {
            ErrorLogger.bluetoothError("Failed to change MTU size to " + mtu + "B", status);
        }
        LpLogger.logInfo(new LoggerStruct("onMtuChanged", "GattCallback",
                "New MTU: " + mtu + " , Status: " + status + " , Succeed: " + (status == BluetoothGatt.GATT_SUCCESS)));
        EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.SUBSCRIBE_CUSTOM_STATUS_INDICATION));
    }

    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
        String message = "status " + status + " newState " + newState + " oldState " + _devicePrevStatus;
        ErrorLogger.log("Connection state change: " + message);
        Log.i("onConnectionStateChange", message);

        if (_devicePrevStatus != newState) {
            _bleGatt = gatt;
            String mStatusDesc = "GATT status: Unknown";
            switch (newState) {
                case BluetoothProfile.STATE_CONNECTING:
                    mStatusDesc = "GATT status: Connecting";
                    break;
                case BluetoothProfile.STATE_CONNECTED:
                    mStatusDesc = "GATT status: Connected";
                    ErrorLogger.log("Watch connected");
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_CONNECTED));
                    BleServices.intendedDisconnect = false;
                    break;
                case BluetoothProfile.STATE_DISCONNECTING:
                    mStatusDesc = "GATT status: Disconnecting";
                    break;
                case BluetoothProfile.STATE_DISCONNECTED:
                    _callerDevice.setBonded(false);
                    Log.e("Connection", "failed");
                    ErrorLogger.log("Watch disconnected");

                    mStatusDesc = "GATT status: Disconnected";
                    if (!BleServices.intendedDisconnect) {
                        EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));
                    }
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.DEVICE_DISCONNECTED));
                    gatt = null;
                    break;
            }
            String deviceName = "Unknown";
            if (gatt != null) {
                deviceName = gatt.getDevice().getName();
            }
            CommonResponse mResponse = new CommonResponse(ResultCodeEnum.GATT_STATE_CHANGE, mStatusDesc);
            mResponse.setAuthId(deviceName);
            EventEmittersToReact.getInstance().EmitCommonResult(mResponse);

            Log.i("onConnectionStateChange", "New state of " + deviceName + " is " + mStatusDesc);
            LpLogger.logInfo(new LoggerStruct("onConnectionStateChange", "GattCallback", "New state of " + deviceName + " is " + mStatusDesc));
            _devicePrevStatus = newState;
        }
    }

    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
            List<BluetoothGattService> mServices = _callerDevice.getGatt().getServices();
            if (mServices.size() > 0) {
                for (int i = 0; i < mServices.size(); i++) {
                    BluetoothGattService service = mServices.get(i);
                    List<BluetoothGattCharacteristic> mChars = service.getCharacteristics();
                    Log.d("Discovery: ", "----------------------------------------------------");
                    Log.d("Discovery: ", "SUUID = " + service.getUuid().toString());
                    for (int j = 0; j < mChars.size(); j++) {
                        BluetoothGattCharacteristic charac = mChars.get(j);
                        Log.d("Discovery: ", "CUUID = " + charac.getUuid().toString());
                    }
                }
                Log.e("Connection", "services discovered");

                if (BleServices.getCurrentProc() != BleProcEnum.FIRMWARE_UPDATE) {
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.REQUEST_MAX_MTU));
                } else {
                    BleServices.setCurrentProcState(BleProcEnum.FIRMWARE_UPDATE, BleProcStateEnum.FIRMWARE_UPDATE_START);
                    EventBus.getDefault().post(new NoParamEvent(NoParamEventEnum.START_FIRMWARE_UPDATE));
                }
            } else {
                Log.e("Connection", "services not discoverd ");

                BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
                LpLogger.logError(new LoggerStruct("onServicesDiscovered", "GattCallback",
                        ResultCodeEnum.GATT_DISCOVER_FAIL,
                        "Got zero services in discovery",
                        ""));
                EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.GATT_DISCOVER_FAIL));
            }
        } else {
            BleServices.setCurrentProc(BleProcEnum.CONNECT);
            BleServices.setCurrentProcState(BleProcEnum.CONNECT, BleProcStateEnum.NONE);
            String mDeviceName = "";
            if (gatt != null) {
                if (gatt.getDevice() != null) {
                    if (gatt.getDevice().getName() != null) {
                        mDeviceName = gatt.getDevice().getName();
                    }
                }
            }
            Log.e("Failed", "Faileddd");
            LpLogger.logError(new LoggerStruct("onServicesDiscovered", "GattCallback",
                    ResultCodeEnum.GATT_DISCOVER_FAIL,
                    mDeviceName + " Unable to discover services (Status:" + status + ")",
                    ""));
            EventEmittersToReact.getInstance().EmitConnectResult(new ConnectResponse(ResultCodeEnum.WATCH_UNAVAILABLE));
        }
    }

    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        if (status != BluetoothGatt.GATT_SUCCESS) {
            CommonResponse mResponse = new CommonResponse(ResultCodeEnum.UNABLE_CHARCT_READ, "GATT Read Err code " + status);
            EventEmittersToReact.getInstance().EmitCommonResult(mResponse);
            LpLogger.logInfo(new LoggerStruct("onCharacteristicRead", "BleServices", "GATT read Err code " + status));
            ErrorLogger.bluetoothError(
                    "Failed reading characteristic " + characteristic.getUuid().toString(),
                    characteristic,
                    BleOperation.READ,
                    status);
            return;
        }
        LpLogger.logInfo(new LoggerStruct("onCharacteristicRead", "GattCallback", "READ characteristic "+characteristic.getUuid() + ", value: "+Arrays.toString(characteristic.getValue())));
        AServiceDef mServiceDef = ServiceDefs.getSerivcedefForChar(characteristic.getUuid().toString());
        if (mServiceDef != null) {
            ACharDef mCharDef = mServiceDef.getCharacteristic(characteristic.getUuid().toString());
            if (mCharDef != null) {
                byte[] mCharData = characteristic.getValue();
                switch (mCharDef.charEnum) {
                    case STATUS:
                        Global.setCurrentStatus("READ");
                        EventBus.getDefault().post(new StatusChangeEvent(mCharData[0]));
                        break;
                    case VITAL_DATA:
                        EventBus.getDefault().post(new VitalReadEvent(characteristic.getUuid().toString(), mCharData, null));
                        break;
                    case RAW_DATA:
                        Log.d("Raw data: ", mCharData.length + " data: " + Arrays.toString(mCharData));
                        EventBus.getDefault().post(new RawDataReadEvent(characteristic.getUuid().toString(), mCharData, null));
                        break;
                    case STEP_COUNTER:
                        EventBus.getDefault().post(new StepCountEvent(characteristic.getUuid().toString(), mCharData, true));
                        break;
                    case MEAL_DATA:
                        EventBus.getDefault().post(new MealDataReadEvent(characteristic.getUuid().toString(), mCharData, null));
                        break;
                    case USER_INFO:
                        EventBus.getDefault().post(new UserInfoEvent(characteristic.getUuid().toString(), mCharData));
                        break;
                    case LAST_MEASURE_TIME:
                        EventBus.getDefault().post(new MeasureTimeReadEvent(characteristic.getUuid().toString(), mCharData));
                        break;
                    case FIRMWARE_REVISION:
                        EventBus.getDefault().post(new FirmwareRevisionReadEvent(characteristic.getUuid().toString(), mCharData));
                    default:
                        break;
                }
            }
        }
    }

    @Override
    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        super.onCharacteristicChanged(gatt, characteristic);
        Log.d("CharChanged callback: ", characteristic.getUuid().toString());
        if (characteristic.getUuid() == null) {
            return;
        }
        LpLogger.logInfo(new LoggerStruct("onCharacteristicChanged", "GattCallback", "CHANGED characteristic "+characteristic.getUuid() + ", value: "+Arrays.toString(characteristic.getValue())));
        AServiceDef mServiceDef = ServiceDefs.getSerivcedefForChar(characteristic.getUuid().toString());
        if (mServiceDef != null) {
            String mUuid = characteristic.getUuid().toString();
            ACharDef mCharDef = mServiceDef.getCharacteristic(mUuid);
            if (mCharDef != null) {
                switch (mCharDef.charEnum) {
                    case STATUS:
                        byte[] statusData = characteristic.getValue();
                        if (statusData.length > 0) {
                            Global.setCurrentStatus("CHANGE");
                            EventBus.getDefault().post(new StatusChangeEvent(statusData[0]));
                        }
                        break;
                    case MEAL_DATA:
                        byte[] mealData = characteristic.getValue();
                        if (mealData.length > 0) {
                            EventBus.getDefault().post(new MealDataEvent(characteristic.getUuid().toString(), mealData, null));
                        }
                        break;
                    case STEP_COUNTER:
                        byte[] stepCounterData = characteristic.getValue();
                        if (stepCounterData.length > 0) {
                            EventBus.getDefault().post(new StepCountEvent(characteristic.getUuid().toString(), stepCounterData, false));
                        }
                    default:
                        break;
                }
            }
        }
    }

    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        if(status == BluetoothGatt.GATT_SUCCESS) {
            LpLogger.logInfo(new LoggerStruct("onCharacteristicWrite", "GattCallback", "WRITE to characteristic "+characteristic.getUuid() + ", value: "+Arrays.toString(characteristic.getValue())));
        }
        else {
            ErrorLogger.bluetoothError(
                    "Failed writing to characteristic " + characteristic.getUuid().toString(),
                    characteristic,
                    BleOperation.WRITE,
                    status
            );
        }
        EventBus.getDefault().post(new WriteCharCallbackEvent(characteristic.getUuid().toString(), status));
    }

    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
        if(status != BluetoothGatt.GATT_SUCCESS) {
            BleOperation op;
            if(Arrays.equals(descriptor.getValue(), BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)) op = BleOperation.NOTIFY;
            else if(Arrays.equals(descriptor.getValue(), BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)) op = BleOperation.INDICATE;
            else op = null;

            ErrorLogger.bluetoothError(
                    "Failed writing to descriptor " + descriptor.getUuid().toString(),
                    descriptor.getCharacteristic(),
                    op,
                    status
            );
        }

        EventBus.getDefault().post(new WriteDescCallbackEvent(descriptor.getUuid().toString(), status));
    }

    @Override
    public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
        super.onDescriptorRead(gatt, descriptor, status);
    }
}

