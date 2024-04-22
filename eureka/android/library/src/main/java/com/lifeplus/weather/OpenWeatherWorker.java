package com.lifeplus.weather;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.google.gson.internal.LinkedTreeMap;
import com.lifeplus.Ble.BleServices;
import com.lifeplus.Database.DbAccess;
import com.lifeplus.EventEmittersToReact;
import com.lifeplus.Pojo.AppSync;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.OpenWeatherStruct;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;
import com.lifeplus.WebService.HttpConnectionManager;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

public class OpenWeatherWorker extends Worker {
    private final Context context;

    public OpenWeatherWorker(
            @NonNull Context context,
            @NonNull WorkerParameters params) {
        super(context, params);
        this.context = context;
    }

    @NonNull
    @Override
    public Result doWork() {
        EventEmittersToReact.getInstance().emitTimerTick();

        if (Global.getUserId() > 0) {
            openWeatherCallUsingLatLong();
            return Result.success();
        } else {
            return Result.retry();
        }
    }

    private void openWeatherCallUsingLatLong() {
        Log.e( "openWeatherCallUsingLatLong","Started" );
        if (checkLocationPermission()) {
            try {
                Location location = WeatherManager.Companion.getGpsTracker().getCurrentLocation();
                if (location != null) {
                    String longitude = String.valueOf(location.getLongitude());
                    String latitude = String.valueOf(location.getLatitude());
                    Log.e( "LatLong", "Got Current Location" );
                    DbAccess dbAccess = DbAccess.getInstance(context);
                    AppSync syncData = dbAccess.getAppSyncData(Global.getUserId());
                    String weatherUnit = "imperial";
                    int unitCode = 1;
                    if (syncData != null) {
                        unitCode = syncData.getWeatherUnit();
                    }
                    if (unitCode == 0 ) {
                        weatherUnit = "metric";
                    }

                    OpenWeatherStruct weatherStruct = HttpConnectionManager.openWeather(latitude, longitude, weatherUnit);

                    Geocoder geocoder = new Geocoder(this.context, Locale.getDefault());
                    List<Address> addresses = geocoder.getFromLocation(Double.parseDouble(latitude), Double.parseDouble(longitude), 1);
                    String locality = addresses.get(0).getLocality() != null ? addresses.get(0).getLocality() : addresses.get(0).getSubLocality();

                    byte[] weatherArray = createWeatherByteArray(weatherStruct, locality, weatherUnit);
                    if (sendToBleDevice(weatherArray)) {
                        Log.i(this.getClass().getName(), "Weather data was sent successfully");
                    } else {
                        Log.w(this.getClass().getName(), "Weather data wasn't sent");
                    }
                } else {
                    LpLogger.logError(new LoggerStruct("openWeatherCallUsingLatLong", "OpenWeather",
                            "Failed to get location."));
                }
            } catch(Exception e) {
                Log.e("weather", "Exception in reading location" + e.getMessage());
            }
        }
    }

    private boolean checkLocationPermission() {
        String permission = Manifest.permission.ACCESS_FINE_LOCATION;
        int res = context.checkCallingOrSelfPermission( permission );
        return (res == PackageManager.PERMISSION_GRANTED);
    }

    private boolean sendToBleDevice(byte[] pData) {
        if (BleServices._bleDevice == null || !BleServices._bleDevice.isBonded()) {
            return false;
        } else {
            return BleServices._bleDevice.sendWeather(pData);
        }
    }

    private byte[] createWeatherByteArray(OpenWeatherStruct openWeatherStruct, String locality, String pWeatherUnit) {
        byte[] weatherArray = null;
        try {
            byte[] result = new byte[116];

            TimeZone timeZone = TimeZone.getTimeZone("UTC");
            Calendar calendar = Calendar.getInstance(timeZone);
            @SuppressLint("SimpleDateFormat") SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            simpleDateFormat.setTimeZone(timeZone);

            int mYear = Calendar.getInstance().get(Calendar.YEAR);
            result[0] = (byte)(mYear % 256);
            int mRemainder = mYear / 256;
            result[1] = (byte)mRemainder;

            int mMonth = calendar.get(Calendar.MONTH) + 1;
            result[2] = (byte)mMonth;

            int mDay = calendar.get(Calendar.DAY_OF_MONTH);
            result[3] = (byte)mDay;

            int mHour = calendar.get(Calendar.HOUR_OF_DAY);
            result[4] = (byte)mHour;

            int mMinute = calendar.get(Calendar.MINUTE);
            result[5] = (byte)mMinute;

            int mSeconds = calendar.get(Calendar.SECOND);
            result[6] = (byte)mSeconds;

            byte[] mLocation = locality.getBytes();
            int j = 0;
            for (int i = 7; i < 23; i++) {
                if (mLocation.length == j) {
                    result[i] = 0;
                } else {
                    result[i] = mLocation[j];
                    j++;
                }
            }

            int units = 1;
            if (pWeatherUnit.equalsIgnoreCase("imperial")) {
                units = 1;
            } else if (pWeatherUnit.equalsIgnoreCase("metric")) {
                units = 2;
            }
            result[23] = (byte) units;

            if (openWeatherStruct.getCurrent().get("wind_speed") != null) {
                int windSpeed = (int) Float.parseFloat(openWeatherStruct.getCurrent().get("wind_speed").toString());
                result[24] = (byte) windSpeed;
            }

            if (openWeatherStruct.getCurrent().get("wind_deg") != null) {
                int windDirection = getWindDirectionEnum((double)openWeatherStruct.getCurrent().get("wind_deg"));
                result[25] = (byte) windDirection;;
            }

            if (openWeatherStruct.getCurrent().get("uvi") != null) {
                float orgUVIndex = Float.parseFloat(openWeatherStruct.getCurrent().get("uvi").toString());
                int multiplierUV = (int) (orgUVIndex / 0.1);
                result[26] = (byte) multiplierUV;
                int mUVRate = getUVRate(orgUVIndex);
                result[27] = (byte) mUVRate;
            }

            if (openWeatherStruct.getCurrent().get("sunrise") != null) {
                long mTimeinMilli = ((long) Float.parseFloat(openWeatherStruct.getCurrent().get("sunrise").toString()) * 1000);
                ZonedDateTime mSunriseTimeUTC = Instant.ofEpochMilli(mTimeinMilli).atZone(ZoneOffset.UTC);
                result[28] = (byte) mSunriseTimeUTC.getHour();
                result[29] = (byte) mSunriseTimeUTC.getMinute();
            }

            if (openWeatherStruct.getCurrent().get("sunset") != null) {
                long mTimeinMilli = ((long) Float.parseFloat(openWeatherStruct.getCurrent().get("sunset").toString()) * 1000);
                ZonedDateTime mSunsetTimeUTC = Instant.ofEpochMilli(mTimeinMilli).atZone(ZoneOffset.UTC);
                result[30] = (byte) mSunsetTimeUTC.getHour();
                result[31] = (byte) mSunsetTimeUTC.getMinute();
            }

            // hourly data: Array of 11 items (idx = 0 -> now, idx 1-10 next hours from now sequentially)
            ArrayList<HashMap<String, Object>> hourlyData = openWeatherStruct.getHourly();
            ArrayList<HashMap<String, Object>> nextTenHourData = getNextTenHourData(hourlyData);
            j = 32;
            for (int i = 0; i < nextTenHourData.size(); i++) {
                ArrayList<LinkedTreeMap<String, Object>> mWeatherData;
                if (i == 0) {
                    mWeatherData = (ArrayList<LinkedTreeMap<String, Object>>) openWeatherStruct.getCurrent().get("weather");
                } else {
                    mWeatherData = (ArrayList<LinkedTreeMap<String, Object>>) nextTenHourData.get(i).get("weather");
                }
                LinkedTreeMap<String, Object> mWeatherMap = mWeatherData.get(0);
                int mDescriptionId = (int) Float.parseFloat(mWeatherMap.get("id").toString());
                int mWeatherId = getWeatherIdFromDescription(mDescriptionId);
                result[j] = (byte) mWeatherId; // weather id
                j++;

                float pop = Float.parseFloat(nextTenHourData.get(i).get("pop").toString());
                int mPrecipitation = (int) (pop * 100);

                result[j] = (byte) mPrecipitation; //precipitation
                j++;

                // signed temperature
                int mTemp = 0;
                if (i == 0) {
                    mTemp = (int)Float.parseFloat(openWeatherStruct.getCurrent().get("temp").toString());
                } else {
                    mTemp = (int)Float.parseFloat(nextTenHourData.get(i).get("temp").toString());
                }

                result[j] = (byte) mTemp;
                j++;
                result[j] = (byte) (mTemp >> 8);
                j++;
            }

            // daily data: Array of 8 items (idx = 0 -> today, idx 1-7 next days from today sequentially)
            ArrayList<HashMap<String, Object>> mDailyData = openWeatherStruct.getDaily();
            j = 76;
            for (int i = 0; i < mDailyData.size(); i++) {
                ArrayList<LinkedTreeMap<String, Object>> mWeatherData = (ArrayList<LinkedTreeMap<String, Object>>) mDailyData.get(i).get("weather");
                LinkedTreeMap<String, Object> mWeatherMap = mWeatherData.get(0);
                int mDescriptionId = (int) Float.parseFloat(mWeatherMap.get("id").toString());
                int mWeatherId = getWeatherIdFromDescription(mDescriptionId);
                result[j] = (byte) mWeatherId; // weather id
                j++;

                LinkedTreeMap<String, Object> mTempData = (LinkedTreeMap<String, Object>) mDailyData.get(i).get("temp");
                int mMinTemp = (int)Float.parseFloat(mTempData.get("min").toString());

                result[j] = (byte) mMinTemp;
                j++;
                result[j] = (byte) (mMinTemp >>> 8);
                j++;

                int mMaxTemp = (int)Float.parseFloat(mTempData.get("max").toString());

                result[j] = (byte) mMaxTemp;
                j++;
                result[j] = (byte) (mMaxTemp >>> 8);
                j++;
            }
            weatherArray = result;

        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("createWeatherByteArray", "OpenWeather",
                    "Exception in reading weather data."));

            Log.e("Exception", e.getMessage());
        }

        return weatherArray;
    }

    private int getWindDirectionEnum(double degree) {
        int[] directions = {1, 2, 3, 4, 5, 6, 7, 8};
        return directions[ (int)Math.round(((degree % 360) / 45)) % 8 ];
    }

    private int getUVRate(float uvIndex) {
        if (uvIndex < 3) {
            return 1;
        } else if (uvIndex < 6) {
            return 2;
        } else if (uvIndex < 8) {
            return 3;
        } else if (uvIndex < 11) {
            return 4;
        } else if (uvIndex >= 11) {
            return  5;
        }
        return 1;
    }

    private ArrayList<HashMap<String, Object>> getNextTenHourData(ArrayList<HashMap<String, Object>> hourlyData) {
        ArrayList<HashMap<String, Object>> result = new ArrayList<>();
        int resultSize = 11;

        for (int i = 0; i < hourlyData.size(); i++) {
            if (result.size() < resultSize) {
                result.add(hourlyData.get(i));
            } else {
                break;
            }
        }

        return result;
    }

    private int getWeatherIdFromDescription(int pDescriptionId) {
        int mResult = 1;
        Map<Integer, Integer> enumList = new HashMap<Integer, Integer>() {{
            put(804, 1); put(803, 2); put(802, 3); put(301, 4); put(302, 4);
            put(311, 4); put(312, 4); put(313, 4);
            put(314, 4); put(321, 4); put(520, 4);
            put(521, 4); put(522, 4); put(531, 4);
            put(300, 5); put(310, 5);
            put(500, 8); put(501, 8); put(502, 9);
            put(503, 9); put(504, 9); put(801, 10);
            put(761, 13); put(751, 13); put(762, 13);
            put(771, 13); put(781, 17); put(701, 18);
            put(741, 19); put(721, 20); put(615, 22);
            put(616, 22); put(620, 22); put(621, 22);
            put(622, 22); put(611, 23); put(612, 23);
            put(613, 23); put(200, 27); put(230, 27);
            put(711, 28); put(601, 30); put(602, 30);
            put(600, 33); put(511, 34); put(800, 35);
            put(731, 36); put(201, 37); put(202, 37);
            put(211, 37); put(212, 37); put(231, 37);
            put(232, 37); put(210, 41); put(221, 41);
        }};
        if (enumList.get(pDescriptionId) != null) {
            mResult = enumList.get(pDescriptionId);
        }

        return mResult;
    }

}
