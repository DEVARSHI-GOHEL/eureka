/*
 * (c) 2014-2020, Cypress Semiconductor Corporation or a subsidiary of
 * Cypress Semiconductor Corporation.  All rights reserved.
 *
 * This software, including source code, documentation and related
 * materials ("Software"),  is owned by Cypress Semiconductor Corporation
 * or one of its subsidiaries ("Cypress") and is protected by and subject to
 * worldwide patent protection (United States and foreign),
 * United States copyright laws and international treaty provisions.
 * Therefore, you may use this Software only as provided in the license
 * agreement accompanying the software package from which you
 * obtained this Software ("EULA").
 * If no EULA applies, Cypress hereby grants you a personal, non-exclusive,
 * non-transferable license to copy, modify, and compile the Software
 * source code solely for use in connection with Cypress's
 * integrated circuit products.  Any reproduction, modification, translation,
 * compilation, or representation of this Software except as specified
 * above is prohibited without the express written permission of Cypress.
 *
 * Disclaimer: THIS SOFTWARE IS PROVIDED AS-IS, WITH NO WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, NONINFRINGEMENT, IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. Cypress
 * reserves the right to make changes to the Software without notice. Cypress
 * does not assume any liability arising out of the application or use of the
 * Software or any product or circuit described in the Software. Cypress does
 * not authorize its products for use in any products where a malfunction or
 * failure of the Cypress product may reasonably be expected to result in
 * significant property damage, injury or death ("High Risk Product"). By
 * including Cypress's product in a High Risk Product, the manufacturer
 * of such system or application assumes all risk of such use and in doing
 * so agrees to indemnify Cypress against all liability.
 */

package com.cypress.cysmart.CommonUtils;

import android.R.integer;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;

/**
 * Class for commonly used methods in the project
 */
public class Utils {

    // Shared preference constant
    private static final String SHARED_PREF_NAME = "CySmart Shared Preference";

    private static final String BASE_UUID_FORMAT = "(((0000)|(\\d{4}))(\\d{4}))-0000-1000-8000-00805F9B34FB";
    private static final java.util.regex.Pattern BASE_UUID_PATTERN = java.util.regex.Pattern.compile(BASE_UUID_FORMAT, java.util.regex.Pattern.CASE_INSENSITIVE);
    public static final java.util.Locale DATA_LOCALE = java.util.Locale.ROOT;
    private static final int BONDING_PROGRESS_DIALOG_TIMEOUT_MILLIS = 20000;
    public static final String DATA_LOGGER_FILENAME_PATTERN = "dd-MMM-yyyy";

    private static android.app.ProgressDialog mBondingProgressDialog;
    private static android.os.Handler mBondingProgressDialogTimer;
    private static Runnable mBondingProgressDialogTimerTask;


    /**
     * Checks if input UUID string is of base UUID format and if that is true returns the unique 16 or 32 bits of it
     *
     * @param uuid128 complete 128 bit UUID string
     * @return
     */
    public static String getUuidShort(String uuid128) {
        String result = uuid128;
        if (uuid128 != null) {
            java.util.regex.Matcher m = BASE_UUID_PATTERN.matcher(uuid128);
            if (m.matches()) {
                boolean isUuid16 = m.group(3) != null;
                if (isUuid16) { // 0000xxxx
                    String uuid16 = m.group(5);
                    result = uuid16;
                } else { // xxxxxxxx
                    String uuid32 = m.group(1);
                    result = uuid32;
                }
            }
        }
        return result;
    }

    /**
     * Returns the manufacture name from the given characteristic
     */
    public static String getManufacturerName(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String manufacturerName = characteristic.getStringValue(0);
        return manufacturerName;
    }

    /**
     * Returns the model number from the given characteristic
     */
    public static String getModelNumber(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String modelNumber = characteristic.getStringValue(0);
        return modelNumber;
    }

    /**
     * Returns the serial number from the given characteristic
     */
    public static String getSerialNumber(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String serialNumber = characteristic.getStringValue(0);
        return serialNumber;
    }

    /**
     * Returns the hardware revision from the given characteristic
     */
    public static String getHardwareRevision(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String hardwareRevision = characteristic.getStringValue(0);
        return hardwareRevision;
    }

    /**
     * Returns the Firmware revision from the given characteristic
     */
    public static String getFirmwareRevision(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String firmwareRevision = characteristic.getStringValue(0);
        return firmwareRevision;
    }

    /**
     * Returns the software revision from the given characteristic
     */
    public static String getSoftwareRevision(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        String softwareRevision = characteristic.getStringValue(0);
        return softwareRevision;
    }

    /**
     * Returns the SystemID from the given characteristic
     */
    public static String getSystemId(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        final byte[] data = characteristic.getValue();
        final StringBuilder sb = new StringBuilder(data.length);
        if (data != null && data.length > 0) {
            for (byte b : data)
                sb.append(formatForRootLocale("%02X ", b));
        }
        return String.valueOf(sb);
    }

    /**
     * Returns the PNP ID from the given characteristic
     */
    public static String getPnPId(android.bluetooth.BluetoothGattCharacteristic characteristic) {
        final byte[] data = characteristic.getValue();
        final StringBuilder sb = new StringBuilder(data.length);
        if (data != null && data.length > 0) {
            for (byte b : data)
                sb.append(formatForRootLocale("%02X ", b));
        }
        return String.valueOf(sb);
    }

    public static String byteArrayToHex(byte[] bytes) {
        if (bytes != null) {
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                // Previously was using the following line but it fires "JavaBinder: !!! FAILED BINDER TRANSACTION !!!" with TPUT 2M code example ...
//                sb.append(formatForRootLocale("%02X ", b));
                // ... hence rewrote the line above with the following two lines
                sb.append(Character.toUpperCase(Character.forDigit((b >> 4) & 0xF, 16)));
                sb.append(Character.toUpperCase(Character.forDigit((b & 0xF), 16)) + " ");
            }
            return sb.toString();
        }
        return "";
    }

    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    public static String getMSB(String string) {
        StringBuilder msbString = new StringBuilder();
        for (int i = string.length(); i > 0; i -= 2) {
            String str = string.substring(i - 2, i);
            msbString.append(str);
        }
        return msbString.toString();
    }

    /**
     * Method to convert hex to byteArray
     */
    public static byte[] convertingToByteArray(String result) {
        String[] splitted = result.split("\\s+");
        byte[] valueByte = new byte[splitted.length];
        for (int i = 0; i < splitted.length; i++) {
            if (splitted[i].length() > 2) {
                String trimmedByte = splitted[i].split("x")[1];
                valueByte[i] = (byte) convertStringToByte(trimmedByte);
            }
        }
        return valueByte;
    }


    /**
     * Convert the string to byte
     *
     * @param string
     * @return
     */
    private static int convertStringToByte(String string) {
        return Integer.parseInt(string, 16);
    }

    /**
     * Returns the battery level information from the characteristics
     *
     * @param characteristics
     * @return {@link String}
     */
    public static String getBatteryLevel(android.bluetooth.BluetoothGattCharacteristic characteristics) {
        int batteryLevel = characteristics.getIntValue(android.bluetooth.BluetoothGattCharacteristic.FORMAT_UINT8, 0);
        return String.valueOf(batteryLevel);
    }

    /**
     * Returns the Alert level information from the characteristics
     *
     * @param characteristics
     * @return {@link String}
     */
    public static String getAlertLevel(android.bluetooth.BluetoothGattCharacteristic characteristics) {
        int alert_level = characteristics.getIntValue(android.bluetooth.BluetoothGattCharacteristic.FORMAT_UINT8, 0);
        return String.valueOf(alert_level);
    }

    /**
     * Returns the Transmission power information from the characteristic
     *
     * @param characteristics
     * @return {@link integer}
     */
    public static int getTransmissionPower(android.bluetooth.BluetoothGattCharacteristic characteristics) {
        int txPower = characteristics.getIntValue(android.bluetooth.BluetoothGattCharacteristic.FORMAT_SINT8, 0);
        return txPower;
    }

    /**
     * Get the data from milliseconds
     *
     * @return {@link String}
     */
    public static String GetDateFromMilliseconds() {
        java.text.DateFormat formatter = new java.text.SimpleDateFormat("dd MMM yyyy");
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        return formatter.format(calendar.getTime());
    }

    /**
     * Get the date
     *
     * @return {@link String}
     */
    public static String GetDate() {
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(DATA_LOGGER_FILENAME_PATTERN);
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        return formatter.format(calendar.getTime());
    }

    /**
     * Get the time in seconds
     *
     * @return {@link String}
     */
    public static int getTimeInSeconds() {
        int seconds = (int) System.currentTimeMillis();
        return seconds;
    }

    /**
     * Get the time from milliseconds
     *
     * @return {@link String}
     */
    public static String GetTimeFromMilliseconds() {
        java.text.DateFormat formatter = new java.text.SimpleDateFormat("HH:mm ss SSS");
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        return formatter.format(calendar.getTime());
    }

    /**
     * Get time and date
     *
     * @return {@link String}
     */
    public static String GetTimeandDate() {
        java.text.DateFormat formatter = new java.text.SimpleDateFormat("[dd-MMM-yyyy|HH:mm:ss]");
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        return formatter.format(calendar.getTime());
    }

    /**
     * Get time and date without datalogger format
     *
     * @return {@link String}
     */
    public static String GetTimeandDateUpdate() {
        java.text.DateFormat formatter = new java.text.SimpleDateFormat("dd-MMM-yyyy HH:mm:ss");
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        return formatter.format(calendar.getTime());
    }

    /**
     * Setting the shared preference with values provided as parameters
     *
//     * @param context
     * @param key
     * @param value
     */
    public static final void setStringSharedPreference(Context context, String key, String value) {

        SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(key, value);
        editor.apply();
    }

    /**
     * Returning the stored values in the shared preference with values provided
     * as parameters
     *
     * @param context
     * @param key
     * @return
     */
    public static final String getStringSharedPreference(Context context, String key) {
        if (context != null) {
            SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
            return pref.getString(key, "");
        }
        return "";
    }

    /**
     * Setting the shared preference with values provided as parameters
     *
     * @param context
     * @param key
     * @param value
     */
    public static final void setIntSharedPreference(Context context, String key, int value) {
        SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putInt(key, value);
        editor.apply();
    }

    /**
     * Returning the stored values in the shared preference with values provided
     * as parameters
     *
     * @param context
     * @param key
     * @return
     */
    public static final int getIntSharedPreference(Context context, String key) {
        if (context != null) {
            SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
            return pref.getInt(key, 0);
        }
        return 0;
    }

    public static final void setBooleanSharedPreference(Context context, String key, boolean value) {
        SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putBoolean(key, value);
        editor.commit();
    }

    public static final boolean getBooleanSharedPreference(Context context, String key) {
        SharedPreferences Preference = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        return Preference.getBoolean(key, false);
    }

    public static final boolean containsSharedPreference(Context context, String key) {
        SharedPreferences pref = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        return pref.contains(key);
    }

    /**
     * Take the screen shot of the device
     *
     * @param view
     * @param file
     */
    public static void takeScreenshotAndSaveToFile(android.view.View view, java.io.File file) throws java.io.IOException {
        if (view != null) {
            view.setDrawingCacheEnabled(true);
            view.buildDrawingCache(true);
            android.graphics.Bitmap bitmap = android.graphics.Bitmap.createBitmap(view.getDrawingCache());
            view.setDrawingCacheEnabled(false);

            try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
                bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, baos);
                byte[] bytes = baos.toByteArray();

                try (java.io.FileOutputStream fos = new java.io.FileOutputStream(file)) {
                    fos.write(bytes);
                }
            }
        }
    }

    /**
     * Method to detect whether the device is phone or tablet
     */
    public static boolean isTablet(Context context) {
        return (context.getResources().getConfiguration().screenLayout &
                Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE;
    }

//    public static void showBondingProgressDialog(Context context, android.app.ProgressDialog dialog) {
//        showBondingProgressDialog(context, dialog, BONDING_PROGRESS_DIALOG_TIMEOUT_MILLIS);
//    }
//
//    public static void showBondingProgressDialog(Context context, android.app.ProgressDialog dialog, long timeOutMillis) {
//        if (mBondingProgressDialogTimer == null) {
//            mBondingProgressDialogTimer = new android.os.Handler();
//            mBondingProgressDialogTimerTask = new Runnable() {
//                @Override
//                public void run() {
//                    Logger.d("BondingProgressDialog: pair: time out, dismissing dialog " + System.identityHashCode(mBondingProgressDialog));
//                    mBondingProgressDialog.dismiss();
//                }
//            };
//        }
//
//        // Dismiss previous dialog
//        if (mBondingProgressDialog != null && mBondingProgressDialog != dialog) {
//            hideBondingProgressDialog(mBondingProgressDialog);
//        }
//
//        mBondingProgressDialog = dialog;
//
//        // Show new dialog
//        Logger.d("BondingProgressDialog: pair: showing dialog " + System.identityHashCode(mBondingProgressDialog));
//        mBondingProgressDialog.setTitle(context.getResources().getString(com.lifeplus.lifeleaf.uploader.R.string.alert_message_bonding_title));
//        mBondingProgressDialog.setMessage((context.getResources().getString(com.lifeplus.lifeleaf.uploader.R.string.alert_message_bonding_message)));
//        mBondingProgressDialog.setCancelable(false);
//        mBondingProgressDialog.show();
//        mBondingProgressDialogTimer.postDelayed(mBondingProgressDialogTimerTask, timeOutMillis);
//    }
//
//    public static void hideBondingProgressDialog(android.app.ProgressDialog dialog) {
//        // Dismiss previous dialog
//        if (mBondingProgressDialogTimer != null) {
//            mBondingProgressDialogTimer.removeCallbacks(mBondingProgressDialogTimerTask);
//        }
//
//        if (mBondingProgressDialog != null && mBondingProgressDialog != dialog) {
//            Logger.d("BondingProgressDialog: pair: dismissing dialog " + System.identityHashCode(mBondingProgressDialog));
//            mBondingProgressDialog.dismiss();
//        }
//        mBondingProgressDialog = null;
//
//        // Dismiss current dialog
//        Logger.d("BondingProgressDialog: pair: dismissing dialog " + System.identityHashCode(dialog));
//        dialog.dismiss();
//    }

//    /**
//     * Check whether Internet connection is enabled on the device
//     *
//     * @param context
//     * @return
//     */
//    public static final boolean checkNetwork(Context context) {
//        if (context != null) {
//            boolean result = true;
//            android.net.ConnectivityManager connectivityManager = (android.net.ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
//            android.net.NetworkInfo networkInfo = connectivityManager.getActiveNetworkInfo();
//            if (networkInfo == null || !networkInfo.isConnectedOrConnecting()) {
//                result = false;
//            }
//            return result;
//        } else {
//            return false;
//        }
//    }

    // See CDT 251485
    // This method returns number format in default en_US locale.
    // This method fixes NumberFormatException thrown when the following condition holds true
    // 1. System's locale is different from en_US whose decimal point representation
    // is different from en_US's '.' (e.g. ',' in ua_UK for Ukraine).
    // 2. There are places in code where floating number is first converted to string via NumberFormat.format(float)
    // and then parsed back to floating number via Float.valueOf(string) which in turn is locale independent
    // and only respects '.' as a decimal point (and throws NFE for ',' as a decimal point).
    // So previously it was possible to get a NFE in the following case
    // 1. Set default locale to ua_UK.
    // 2. Get locale-specific NumberFormat instance via NumberFormat.getInstance().
    // 3. Get locale-specific floating number string by formatting it via NumberFormat.format(float).
    // 4. Parse string back to number via Float.valueOf(string)... here NFE is thrown
    public static java.text.NumberFormat getNumberFormatForRootLocale() {
        return java.text.NumberFormat.getNumberInstance(DATA_LOCALE);
    }

    public static java.text.NumberFormat getNumberFormatForDefaultLocale() {
        return java.text.NumberFormat.getNumberInstance();
    }

    public static String formatForRootLocale(String format, Object... args) {
        return String.format(DATA_LOCALE, format, args);
    }

    public static String formatForDefaultLocale(String format, Object... args) {
        return String.format(format, args);
    }

    /**
     * Read version name from the manifest
     *
     * @param context
     * @return
     */
    public static String getVersionName(Context context) {
        String versionName = "";
        try {
            String packageName = context.getPackageName();
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(packageName, 0);
            versionName = packageInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionName;
    }

    public static void debug(String msg, Object... objects) {
        StringBuilder sb = new StringBuilder(msg);
        for (Object o : objects) {
            sb.append(" " + o.getClass().getSimpleName() + "(" + System.identityHashCode(o) + ")");
        }
        Logger.d(sb.toString());
    }
}
