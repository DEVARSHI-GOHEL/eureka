package com.lifeplus.Util;

import android.bluetooth.BluetoothGattCharacteristic;
import android.util.Log;

import com.lifeplus.Ble.BleServices;
import com.lifeplus.Pojo.Enum.BleOperation;
import com.lifeplus.exceptions.ApiException;
import com.lifeplus.exceptions.BluetoothException;
import com.lifeplus.exceptions.DatabaseException;
import com.lifeplus.exceptions.DiagnosticsException;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ErrorLogger {

    public static ErrorLoggerProvider provider = null;

    public static void log(String message) {
        if (provider != null) {
            provider.log(message);
        }
    }

    public static void bluetoothError(String message) {
        Log.e("ErrorLogger", "Reporting bluetooth error: " + message);
        if (provider != null) {
            provider.setKeys(getNewMap());
            provider.recordException(new BluetoothException(message));
        }
    }

    public static void bluetoothError(String message, BluetoothGattCharacteristic mCharacteristic, BleOperation operation) {
        Log.e("ErrorLogger", "Reporting bluetooth error: " + message);
        if (provider != null) {
            setCharacteristicKeys(mCharacteristic, operation);
            provider.recordException(new BluetoothException(message));
        }
    }

    public static void bluetoothError(String message, BluetoothGattCharacteristic mCharacteristic, BleOperation operation, int gattStatus) {
        Log.e("ErrorLogger", "Reporting bluetooth error: " + message);
        if (provider != null) {
            setCharacteristicKeys(mCharacteristic, operation, gattStatus);
            provider.recordException(new BluetoothException(message));
        }
    }

    public static void bluetoothError(String message, int gattStatus) {
        Log.e("ErrorLogger", "Reporting bluetooth error: " + message);
        if (provider != null) {
            setGattStatus(gattStatus);
            provider.recordException(new BluetoothException(message));
        }
    }

    private static void setCharacteristicKeys(BluetoothGattCharacteristic mCharacteristic, BleOperation operation) {
        if (provider != null) {
            Map<String, String> charMap = getNewMap();
            charMap.put(BLUETOOTH_OPERATION_KEY, operation.toString());
            charMap.put(CHARACTERISTIC_UUID_KEY, mCharacteristic.getUuid().toString());
            charMap.put(CHARACTERISTIC_DATA_KEY, LpUtility.encodeHexString(mCharacteristic.getValue()));
            charMap.put(CHARACTERISTIC_PROPERTIES_KEY, Integer.toString(mCharacteristic.getProperties()));

            provider.setKeys(charMap);
        }
    }
    private static void setCharacteristicKeys(BluetoothGattCharacteristic mCharacteristic, BleOperation operation, int gattStatus) {
        if (provider != null) {
            Map<String, String> charMap = getNewMap();
            charMap.put(BLUETOOTH_OPERATION_KEY, operation.toString());
            charMap.put(CHARACTERISTIC_UUID_KEY, mCharacteristic.getUuid().toString());
            charMap.put(CHARACTERISTIC_DATA_KEY, LpUtility.encodeHexString(mCharacteristic.getValue()));
            charMap.put(CHARACTERISTIC_PROPERTIES_KEY, Integer.toString(mCharacteristic.getProperties()));
            charMap.put(GATT_STATUS_KEY, Integer.toString(gattStatus));

            provider.setKeys(charMap);
        }
    }

    private static void setGattStatus(int status) {
        if (provider != null) {
            Map<String, String> map = getNewMap();
            map.put(GATT_STATUS_KEY, Integer.toString(status));
            provider.setKeys(map);
        }
    }

    public static void databaseError(String message, String query, String queryErrorMsg) {
        Log.e("ErrorLogger", "Reporting database error: " + message);
        if (provider != null) {
            Map<String, String> map = getNewMap();
            map.put(QUERY_KEY, query);
            map.put(QUERY_ERROR_MESSAGE_KEY, queryErrorMsg);

            provider.setKeys(map);
            provider.recordException(new DatabaseException(message));
        }
    }

    public static void apiError(String message, String type, String url, String data, String options, String statusCode) {
        Log.e("ErrorLogger", "Reporting api error: " + message);
        if (provider != null) {
            setRequestKeys(type, url, data, options, statusCode);
            provider.recordException(new ApiException(message));
        }
    }

    public static void diagnosticsEvent(String message) {
        Log.e("ErrorLogger", "Diagnostics event: " + message);
        if (provider != null) {
            provider.recordException(new DiagnosticsException(message));
        }
    }

    private static void setRequestKeys(String type, String url, String data, String options, String statusCode) {
        if (provider != null) {
            Map<String, String> map = getNewMap();
            String obfuscatedData = data;
            try {
                JSONObject json = new JSONObject(data);
                if(json.has("password")) json.put("password", "******");
                obfuscatedData = json.toString();
            } catch (Exception e) {
                // not hiding anything
            }

            map.put(REQUEST_TYPE_KEY, type);
            map.put(REQUEST_URL_KEY, url);
            map.put(REQUEST_DATA_KEY, obfuscatedData);
            map.put(REQUEST_OPTIONS_KEY, options);
            map.put(REQUEST_STATUS_CODE_KEY, statusCode);

            provider.setKeys(map);
        }
    }

    private static Map<String, String> getNewMap() {
        Map<String, String> map = new HashMap<>();
        // shared keys
        String msn = "";
        if(Global.getWatchMSNForScan() != null && !Global.getWatchMSNForScan().isEmpty()) {
            msn = Global.getWatchMSNForScan();
        }
        else if(!Global.getWatchMSN().isEmpty()) {
            msn = Global.getWatchMSN();
        }
        map.put(ErrorLogger.MSN_KEY, msn);
        map.put(ErrorLogger.PROC_KEY, BleServices.getCurrentProc().name());
        map.put(ErrorLogger.PROC_STATE_KEY, BleServices.getCurrentProcState().name());

        // reset other keys
        map.put(ErrorLogger.BLUETOOTH_OPERATION_KEY, "");
        map.put(ErrorLogger.CHARACTERISTIC_UUID_KEY, "");
        map.put(ErrorLogger.CHARACTERISTIC_DATA_KEY, "");
        map.put(ErrorLogger.CHARACTERISTIC_PROPERTIES_KEY, "");
        map.put(ErrorLogger.GATT_STATUS_KEY, "");
        map.put(ErrorLogger.QUERY_KEY, "");
        map.put(ErrorLogger.QUERY_ERROR_MESSAGE_KEY, "");
        map.put(ErrorLogger.REQUEST_TYPE_KEY, "");
        map.put(ErrorLogger.REQUEST_URL_KEY, "");
        map.put(ErrorLogger.REQUEST_DATA_KEY, "");
        map.put(ErrorLogger.REQUEST_OPTIONS_KEY, "");
        map.put(ErrorLogger.REQUEST_STATUS_CODE_KEY, "");

        return map;
    }

    public final static String MSN_KEY = "MSN";
    public final static String BLUETOOTH_OPERATION_KEY = "Bluetooth operation";
    public final static String CHARACTERISTIC_UUID_KEY = "Characteristic UUID";
    public final static String CHARACTERISTIC_DATA_KEY = "Characteristic data";
    public final static String CHARACTERISTIC_PROPERTIES_KEY = "Characteristic properties";
    public final static String GATT_STATUS_KEY = "GATT status";
    public final static String QUERY_KEY = "Query";
    public final static String QUERY_ERROR_MESSAGE_KEY = "Query error message";
    public final static String PROC_KEY = "Proc";
    public final static String PROC_STATE_KEY = "Proc state";
    public final static String REQUEST_TYPE_KEY = "Request type";
    public final static String REQUEST_URL_KEY = "Request URL";
    public final static String REQUEST_DATA_KEY = "Request data";
    public final static String REQUEST_OPTIONS_KEY = "Request options";
    public final static String REQUEST_STATUS_CODE_KEY = "Request status code";
}
