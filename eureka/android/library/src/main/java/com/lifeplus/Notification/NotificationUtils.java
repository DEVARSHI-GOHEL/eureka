package com.lifeplus.Notification;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.util.Log;

import com.lifeplus.Ble.BleServices;
import com.lifeplus.LifePlusReactModule;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.GattCharEnum;
import com.lifeplus.Pojo.Enum.GattServiceEnum;

import java.util.Calendar;
import java.util.TimeZone;

public class NotificationUtils {

    private NotificationUtils() {}

    static byte[] createNotificationByteArray(String appName, String title, String content, Calendar calendar) {
        byte[] mFinalArray = null;
        try {
            byte[] result = new byte[103];
            calendar.setTimeZone(TimeZone.getTimeZone("UTC"));

            int mYear = calendar.get(Calendar.YEAR);
            result[0] = (byte) (mYear % 256);
            int mRemainder = mYear / 256;
            result[1] = (byte) mRemainder;

            int mMonth = calendar.get(Calendar.MONTH) + 1;
            result[2] = (byte) mMonth;

            int mDay = calendar.get(Calendar.DAY_OF_MONTH);
            result[3] = (byte) mDay;

            int mHour = calendar.get(Calendar.HOUR_OF_DAY);
            result[4] = (byte) mHour;

            int mMinute = calendar.get(Calendar.MINUTE);
            result[5] = (byte) mMinute;

            int mSeconds = calendar.get(Calendar.SECOND);
            result[6] = (byte) mSeconds;

            String mApplicationName = appName + "\0";
            StringBuilder paddedName = new StringBuilder(mApplicationName);

            byte[] mAppName = paddedName.toString().getBytes();
            int j = 0;
            for (int i = 7; i < 33; i++) {
                if (mAppName.length == j) {
                    result[i] = 0;
                } else {
                    result[i] = mAppName[j];
                    j++;
                }
            }

            String mTitle = title + "\0";

            // last two bytes of title (idx 50 and 51) has to be 0, otherwise watch does not handle the inputs properly
            paddedName = new StringBuilder(mTitle);
            byte[] mByteTitle = paddedName.toString().getBytes();
            j = 0;
            for (int i = 33; i < 50; i++) {
                if (mByteTitle.length == j) {
                    result[i] = 0;
                } else {
                    result[i] = mByteTitle[j];
                    j++;
                }
            }

            String mContent = content;
            mContent = mContent + "\0";
            byte[] mByteContent = mContent.getBytes();
            j = 0;
            for (int i = 52; i < 103; i++) {
                if (mByteContent.length == j) {
                    result[i] = 0;
                } else {
                    result[i] = mByteContent[j];
                    j++;
                }
            }
            String s = new String(result);
            mFinalArray = result;
        } catch (Exception e) {
            Log.e("Exception", e.getMessage());
        }
        return mFinalArray;
    }

    static boolean writeNotificationsCharacteristic(byte[] pData) {
        boolean mResult = false;
        try {
            if (BleServices._bleDevice != null) {
                if (!BleServices._bleDevice.isBonded()) {
                    return mResult;
                }
            } else {
                return mResult;
            }

            if (BleServices.getCurrentProc() == BleProcEnum.CONNECT) {
                return mResult;
            }

            BluetoothGattService mCustomService = LifePlusReactModule._bleService.getGattService(GattServiceEnum.CUSTOM_SERVICE);
            if (mCustomService != null) {
                Log.e("charactristics", mCustomService.getCharacteristics().toString());
                BluetoothGattCharacteristic mNotifications = LifePlusReactModule._bleService.getGattChar(mCustomService, GattCharEnum.NOTIFICATIONS);
                if (mNotifications != null) {
                    mNotifications.setValue(pData);
                    if (BleServices._bleDevice != null) {
                        mResult = BleServices._bleDevice.getGatt().writeCharacteristic(mNotifications);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mResult;
    }
}
