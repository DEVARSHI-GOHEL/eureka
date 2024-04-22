package com.lifeplus;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.lifeplus.Pojo.Responses.AppSyncResponse;
import com.lifeplus.Pojo.Responses.CalibrationResponse;
import com.lifeplus.Pojo.Responses.CommonResponse;
import com.lifeplus.Pojo.Responses.ConnectResponse;
import com.lifeplus.Pojo.Responses.FirmwareUpdateResponse;
import com.lifeplus.Pojo.Responses.InstantMeasureResponse;
import com.lifeplus.Pojo.Responses.MealDataResponse;
import com.lifeplus.Pojo.Responses.StepCountResponse;
import com.lifeplus.Pojo.Responses.StepGoalResponse;

public class EventEmittersToReact {
    private ReactContext _reactContext = null;
    private static final EventEmittersToReact instance = new EventEmittersToReact();

    public static EventEmittersToReact getInstance() {
        return instance;
    }

    public void setReactContext(ReactContext reactContext) {
        this._reactContext = reactContext;
    }

    public boolean isReady() {
        return _reactContext != null && _reactContext.hasActiveCatalystInstance();
    }

    public void debugLog(String data) {
        if (_reactContext != null && _reactContext.hasActiveCatalystInstance()) {
            WritableMap params = Arguments.createMap();
            params.putString("DebugLog", data);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("DebugLog", params);
        }
    }

    public void uploadOnCloud(String data) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("UploadOnCloud", data);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("UploadOnCloud", params);
        }
    }

    //measures
    public void measuresEventEmitter(String toJson) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("Measures", toJson);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("Measures", params);
        }
    }

    //percent status
    public void percentStatus(String toJson) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("PercentStatus", toJson);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("PercentStatus", params);
        }
    }

    // Raw data transfer events
    public void RawDataTransferPercent(String toJson) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("RawDataPercentage", toJson);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("Percentage", params);
        }
    }

    //emits after 100%
    public void measuresAfterPerCompletes(String toJson) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("InstantMeasures", toJson);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("InstantMeasures", params);
        }
    }

    public void EmitConnectResult(ConnectResponse pResponse) {
        switch (pResponse.getResultCode().getType()) {
            case "intermediate":
                break;
            case "success":
//                LifePlusReactModule.cancelConnectTimeoutTimer();
//                BleCache.clearCharacteristicList();
//                BleServices.setCurrentProc(BleProcEnum.NONE);
                break;
            default:
                //Global.setUserId(0);
//                LifePlusReactModule.cancelConnectTimeoutTimer();
//                BleCache.clearCharacteristicList();
//                BleServices.setCurrentProc(BleProcEnum.NONE);
                break;
        }

        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("ScanResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ScanResult", params);
        }
    }

    public void EmitInstantMeasureResult(InstantMeasureResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("InstantMeasureResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("InstantMeasureResult", params);
        }
    }

    public void EmitAppSyncResult(AppSyncResponse pResponse, String firmwareRevision) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("InstantMeasureResult", pResponse.getResponseStr());
            params.putString("FirmwareRevision", firmwareRevision);
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AppSyncResult", params);
        }
    }

    public void EmitCommonResult(CommonResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("CommonResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ScanResult", params);
        }
    }

    public void EmitCalibrationResult(CalibrationResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("CalibrationResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("CalibrationResult", params);
        }
    }

    public void EmitStepCount(StepCountResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("StepCountResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("StepCountResult", params);
        }
    }

    public void emitStepGoal(StepGoalResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("StepGoalResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("StepGoalResult", params);
        }
    }

    public void EmitMealData(MealDataResponse pResponse) {
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("MealDataResult", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("MealDataResult", params);
        }
    }

    public void emitFwUpdate(FirmwareUpdateResponse pResponse){
        if (_reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("FwUpdate", pResponse.getResponseStr());
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("FwUpdate", params);
        }
    }

    public void emitTimerTick(){
        if (_reactContext != null) {
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("TimerTick", null);
        }
    }

    public void emitIncompatibleDevice(){
        if (_reactContext != null) {
            _reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("IncompatibleDevice", null);
        }
    }
}
