package com.lifeplus.Database;

import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteException;
import android.provider.Settings;
import android.util.Log;

import com.lifeplus.Database.dbTables.AlertsTable;
import com.lifeplus.Database.dbTables.CalibrationTable;
import com.lifeplus.Database.dbTables.CharacteristicsTable;
import com.lifeplus.Database.dbTables.DevicesTable;
import com.lifeplus.Database.dbTables.EthnicitiesTable;
import com.lifeplus.Database.dbTables.FieldsTable;
import com.lifeplus.Database.dbTables.GenderTable;
import com.lifeplus.Database.dbTables.MealsTable;
import com.lifeplus.Database.dbTables.MeasuresTable;
import com.lifeplus.Database.dbTables.RawDataTable;
import com.lifeplus.Database.dbTables.ServicesTable;
import com.lifeplus.Database.dbTables.SessionsTable;
import com.lifeplus.Database.dbTables.StepsTable;
import com.lifeplus.Database.dbTables.UserTable;
import com.lifeplus.Pojo.AppSync;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.UserSessionStruct;
import com.lifeplus.Util.ErrorLogger;
import com.lifeplus.Util.Global;
import com.lifeplus.Util.LpLogger;

import net.sqlcipher.Cursor;
import net.sqlcipher.database.SQLiteDatabase;
import net.sqlcipher.database.SQLiteOpenHelper;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.MessageFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

public class DbAccess extends SQLiteOpenHelper {
    private static final String KEY_CREATE_TABLE = "CREATE TABLE IF NOT EXISTS {0} ({1})";
    private static final String DATABASE_NAME = "LP_Watch.db";
    private static DbAccess mInstance;
    private byte[] password;

    private DbAccess(Context context, byte[] password) {
        super(context, DATABASE_NAME, null, 2);
        this.password = password;
        try { // for compatibility with old unencrypted db instances
            getReadableDatabase(this.password);
        } catch (SQLiteException e) {
            this.password = new byte[0];
            Log.i(this.getClass().getName(), DATABASE_NAME + " is not encrypted");
        }
    }

    public static synchronized DbAccess getInstance(Context context) {
        if (mInstance == null) {
            SQLiteDatabase.loadLibs(context);
            @SuppressLint("HardwareIds")
            String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            byte[] password = (androidId + context.getPackageName()).getBytes();
            try {
                password = MessageDigest.getInstance("SHA-1").digest(password);
            } catch (NoSuchAlgorithmException e) {
                Log.e(DbAccess.class.getName(), e.getLocalizedMessage());
            }
            mInstance = new DbAccess(context, password);
        }
        return mInstance;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        try {
            createServicesTable(db);
            createCharacteristicsTable(db);
            createFieldsTable(db);
            createGendersTable(db);
            createEthnicitiesTable(db);
            createUsersTable(db);
            createDevicesTable(db);
            createSessionsTable(db);
            addSessionValue(db);
            createMeasuresTable(db);
            createMealsTable(db);
            createStepsTable(db);
            createAlertTable(db);
            createCalibrationTable(db);
            createRawDataTable(db);

            generateGender(db);
            generateEthnicities(db);
            addIntoUserTable(db);
            addDeviceValues(db);
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("onCreate", "DbAccess",
                    ResultCodeEnum.DB_OP_ERR,
                    e.getMessage(),
                    "74"));
        }
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (db == null) {
            db = getWritableDatabase(password);
        }
        try {
            Migrations.INSTANCE.start(db, oldVersion);
        } catch (Exception e) {
            LpLogger.logError(new LoggerStruct("onUpgrade", "DbAccess",
                    ResultCodeEnum.DB_OP_ERR,
                    e.getMessage(),
                    "100"));
            throw e;
        }
    }

    private void createTable(SQLiteDatabase db, String name, String fields) {
        try {
            String query = MessageFormat.format(KEY_CREATE_TABLE, name, fields);
            if (db == null) {
                db = getWritableDatabase(password);
            }
            db.execSQL(query);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createServicesTable(SQLiteDatabase db) {
        try {
            String mServiceable = ServicesTable.Cols.UID + " VARCHAR(128) PRIMARY KEY NOT NULL , " +
                    ServicesTable.Cols.NAME + " VARCHAR(50) NOT NULL , " +
                    ServicesTable.Cols.ABBREVIATION + " VARCHAR(10) NOT NULL, " +
                    ServicesTable.Cols.REFERENCE + " VARCHAR(128), " +
                    ServicesTable.Cols.UPDATE_DATE + " INTEGER ";
            createTable(db, ServicesTable.TABLE_NAME, mServiceable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createCharacteristicsTable(SQLiteDatabase db) {
        try {
            String mCharacteristicTable = CharacteristicsTable.Cols.UID + " VARCHAR(128) PRIMARY KEY NOT NULL , " +
                    CharacteristicsTable.Cols.SERVICE_UID + " VARCHAR NOT NULL," +
                    CharacteristicsTable.Cols.NAME + " VARCHAR(50) NOT NULL, " +
                    CharacteristicsTable.Cols.DATA_TYPE + " VARCHAR(10) NOT NULL, " +
                    CharacteristicsTable.Cols.DATA_LENGTH + " INTEGER NOT NULL, " +
                    CharacteristicsTable.Cols.PROPERTIES + " VARCHAR(10) NOT NULL, " +
                    CharacteristicsTable.Cols.PERMISSION + " VARCHAR(10)," +
                    " FOREIGN KEY (" + CharacteristicsTable.Cols.SERVICE_UID + ") REFERENCES "
                    + ServicesTable.TABLE_NAME + "(" + ServicesTable.Cols.UID + ")";
            createTable(db, CharacteristicsTable.TABLE_NAME, mCharacteristicTable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createFieldsTable(SQLiteDatabase db) {
        try {
            String mFields = FieldsTable.Cols.UID + " VARCHAR(128)  NOT NULL , " +
                    FieldsTable.Cols.SRLNO + " INTEGER  NOT NULL , " +
                    FieldsTable.Cols.NAME + " VARCHAR(50) NOT NULL, " +
                    FieldsTable.Cols.DATA_TYPE + " VARCHAR(10) NOT NULL, " +
                    FieldsTable.Cols.DATA_LENGTH + " INTEGER NOT NULL, " +
                    "  PRIMARY KEY ( " + FieldsTable.Cols.UID + "," + FieldsTable.Cols.SRLNO + ")," +
                    " FOREIGN KEY (" + FieldsTable.Cols.UID + ") REFERENCES " +
                    CharacteristicsTable.TABLE_NAME + "(" + CharacteristicsTable.Cols.UID + ")";

            createTable(db, FieldsTable.TABLE_NAME, mFields);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createGendersTable(SQLiteDatabase db) {
        try {
            String mGenders = GenderTable.Cols.ID + " VARCHAR(1) PRIMARY KEY NOT NULL , " +
                    GenderTable.Cols.NAME + " VARCHAR NOT NULL  ";
            createTable(db, GenderTable.TABLE_NAME, mGenders);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createEthnicitiesTable(SQLiteDatabase db) {
        try {
            String mEthnicities = EthnicitiesTable.Cols.ID +
                    " INTEGER PRIMARY KEY NOT NULL , " +
                    EthnicitiesTable.Cols.NAME + " VARCHAR NOT NULL  ";
            createTable(db, EthnicitiesTable.TABLE_NAME, mEthnicities);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createDevicesTable(SQLiteDatabase db) {
        try {
            String mDeviceTable = DevicesTable.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    DevicesTable.Cols.HW_ID + " VARCHAR(128) NOT NULL, " +
                    DevicesTable.Cols.DATE_ADDED + " INTEGER NOT NULL,  " +
                    DevicesTable.Cols.UPDATE_DATE + " INTEGER ";
            createTable(db, DevicesTable.TABLE_NAME, mDeviceTable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public void addBulkRawData(ArrayList<HashMap<String, Object>> pValues, long pMeasureTime) {
        long mRowCount = 0;
        SQLiteDatabase db = getWritableDatabase(password);
        db.beginTransaction();
        try {
            for (HashMap<String, Object> mElement : pValues) {
                ContentValues values = new ContentValues();
                values.put(RawDataTable.Cols.OPSTATUS, (Integer) mElement.get("OpStatus"));
                values.put(RawDataTable.Cols.CURRENTINDEX, (Integer) mElement.get("CurrentIndex"));
                values.put(RawDataTable.Cols.TIME, pMeasureTime);
                values.put(RawDataTable.Cols.AFEDATA1, (Integer) mElement.get("AFEData1"));
                values.put(RawDataTable.Cols.AFEDATA2, (Integer) mElement.get("AFEData2"));
                values.put(RawDataTable.Cols.AFEDATA3, (Integer) mElement.get("AFEData3"));
                values.put(RawDataTable.Cols.AFEDATA4, (Integer) mElement.get("AFEData4"));
                values.put(RawDataTable.Cols.GYRO1A, (Short) mElement.get("Gyro1a"));
                values.put(RawDataTable.Cols.GYRO2A, (Short) mElement.get("Gyro2a"));
                values.put(RawDataTable.Cols.GYRO3A, (Short) mElement.get("Gyro3a"));
                values.put(RawDataTable.Cols.ACCELEROMETER_X, (Short) mElement.get("Accelerometer_X"));
                values.put(RawDataTable.Cols.ACCELEROMETER_Y, (Short) mElement.get("Accelerometer_Y"));
                values.put(RawDataTable.Cols.ACCELEROMETER_Z, (Short) mElement.get("Accelerometer_Z"));
                values.put(RawDataTable.Cols.AFEPHASE1, (Integer) mElement.get("AFEPHASE1"));
                values.put(RawDataTable.Cols.AFEPHASE2, (Integer) mElement.get("AFEPHASE2"));
                values.put(RawDataTable.Cols.AFEPHASE3, (Integer) mElement.get("AFEPHASE3"));
                values.put(RawDataTable.Cols.AFEPHASE4, (Integer) mElement.get("AFEPHASE4"));
                values.put(RawDataTable.Cols.AFEPHASE5, (Integer) mElement.get("AFEPHASE5"));
                values.put(RawDataTable.Cols.AFEPHASE6, (Integer) mElement.get("AFEPHASE6"));
                values.put(RawDataTable.Cols.AFEPHASE7, (Integer) mElement.get("AFEPHASE7"));
                values.put(RawDataTable.Cols.GYRO1A1, mElement.get("Gyro1a1") != null ? (Integer) mElement.get("Gyro1a1") : null);
                values.put(RawDataTable.Cols.GYRO2A1, mElement.get("Gyro2a1") != null ? (Integer) mElement.get("Gyro2a1") : null);
                values.put(RawDataTable.Cols.GYRO3A1, mElement.get("Gyro3a1") != null ? (Integer) mElement.get("Gyro3a1") : null);
                values.put(RawDataTable.Cols.ACCELEROMETER_X1, mElement.get("Accelerometer_X1") != null ? (Integer) mElement.get("Accelerometer_X1") : null);
                values.put(RawDataTable.Cols.ACCELEROMETER_Y1, mElement.get("Accelerometer_Y1") != null ? (Integer) mElement.get("Accelerometer_Y1") : null);
                values.put(RawDataTable.Cols.ACCELEROMETER_Z1, mElement.get("Accelerometer_Z1") != null ? (Integer) mElement.get("Accelerometer_Z1") : null);
                values.put(RawDataTable.Cols.UPLOAD_DATE, System.currentTimeMillis());
                mRowCount = db.insert(RawDataTable.TABLE_NAME, null, values);
            }
            Log.d("rows", "" + mRowCount);
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    private void createSessionsTable(SQLiteDatabase db) {
        try {
            String mSessionTable = SessionsTable.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    SessionsTable.Cols.USER_ID + " INTEGER NOT NULL, " +
                    SessionsTable.Cols.DEVICE_ID + " INTEGER , " +
                    SessionsTable.Cols.LOGIN_DATE + " INTEGER  NOT NULL , " +
                    SessionsTable.Cols.LOGOUT_DATE + " INTEGER , " +
                    SessionsTable.Cols.AUTH_TOKEN + " VARCHAR(512) NOT NULL , " +
                    SessionsTable.Cols.REFRESH_TOKEN + " VARCHAR(512) NOT NULL , " +
                    SessionsTable.Cols.GATEWAY_TOKEN + " VARCHAR(512) NOT NULL , " +
                    " FOREIGN KEY (" + SessionsTable.Cols.USER_ID + ") REFERENCES "
                    + UserTable.TABLE_NAME + "(" + UserTable.Cols.ID + ") ," +
                    " FOREIGN KEY (" + SessionsTable.Cols.DEVICE_ID + ") REFERENCES "
                    + DevicesTable.TABLE_NAME + "(" + DevicesTable.Cols.ID + ")";
            createTable(db, SessionsTable.TABLE_NAME, mSessionTable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createMeasuresTable(SQLiteDatabase db) {
        try {
            String mMeasures = MeasuresTable.Cols.SESSION_ID + " INTEGER  NOT NULL , " +
                    MeasuresTable.Cols.TYPE + " VARCHAR(1) NOT NULL, " +
                    MeasuresTable.Cols.MEASURE_TIME + " INTEGER NOT NULL , " +
                    MeasuresTable.Cols.O2 + " INTEGER , " +
                    MeasuresTable.Cols.RESPIRATION + " INTEGER , " +
                    MeasuresTable.Cols.HEART_RATE + " INTEGER , " +
                    MeasuresTable.Cols.BPSYS + " INTEGER , " +
                    MeasuresTable.Cols.BPDIA + " INTEGER , " +
                    MeasuresTable.Cols.GLUCOSE + " INTEGER , " +
                    MeasuresTable.Cols.UPDATE_DATE + " INTEGER , " +
                    MeasuresTable.Cols.UPLOAD_DATE + " VARCHAR  , "
                    + "  PRIMARY KEY ( " + MeasuresTable.Cols.SESSION_ID + "," + MeasuresTable.Cols.TYPE + " ," + MeasuresTable.Cols.MEASURE_TIME + " ," + MeasuresTable.Cols.UPLOAD_DATE + "),"
                    + " FOREIGN KEY (" + MeasuresTable.Cols.SESSION_ID + ") REFERENCES "
                    + SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")";
            createTable(db, MeasuresTable.TABLE_NAME, mMeasures);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createRawDataTable(SQLiteDatabase db) {
        try {
            String mRawData = RawDataTable.Cols.OPSTATUS + " INTEGER   , " +
                    RawDataTable.Cols.TIME + " INTEGER , " +
                    RawDataTable.Cols.CURRENTINDEX + " INTEGER , " +
                    RawDataTable.Cols.AFEDATA1 + " INTEGER  , " +
                    RawDataTable.Cols.AFEDATA2 + " INTEGER , " +
                    RawDataTable.Cols.AFEDATA3 + " INTEGER , " +
                    RawDataTable.Cols.AFEDATA4 + " INTEGER , " +
                    RawDataTable.Cols.GYRO1A + " INTEGER , " +
                    RawDataTable.Cols.GYRO2A + " INTEGER , " +
                    RawDataTable.Cols.GYRO3A + " INTEGER , " +
                    RawDataTable.Cols.ACCELEROMETER_X + " INTEGER , " +
                    RawDataTable.Cols.ACCELEROMETER_Y + " INTEGER , " +
                    RawDataTable.Cols.UPLOAD_DATE + " INTEGER NOT NULL , " +
                    RawDataTable.Cols.ACCELEROMETER_Z + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE1 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE2 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE3 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE4 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE5 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE6 + " INTEGER ," +
                    RawDataTable.Cols.AFEPHASE7 + " INTEGER ," +
                    RawDataTable.Cols.GYRO1A1 + " INTEGER ," +
                    RawDataTable.Cols.GYRO2A1 + " INTEGER ," +
                    RawDataTable.Cols.GYRO3A1 + " INTEGER ," +
                    RawDataTable.Cols.ACCELEROMETER_X1 + " INTEGER ," +
                    RawDataTable.Cols.ACCELEROMETER_Y1 + " INTEGER ," +
                    RawDataTable.Cols.ACCELEROMETER_Z1 + " INTEGER ";
            createTable(db, RawDataTable.TABLE_NAME, mRawData);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createMealsTable(SQLiteDatabase db) {
        try {
            String mMeals = MealsTable.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    MealsTable.Cols.SESSION_ID + " INTEGER , " +
                    MealsTable.Cols.TIME + " VARCHAR , " +
                    MealsTable.Cols.TYPE + " VARCHAR(1) NOT NULL , " +
                    MealsTable.Cols.UPDATE_DATE + " VARCHAR , " +
                    MealsTable.Cols.UPLOAD_DATE + " VARCHAR , " +
                    MealsTable.Cols.MEALTYPE + " INTEGER , " +
                    MealsTable.Cols.UTCYEAR + " INTEGER , " +
                    MealsTable.Cols.UTCMONTH + " INTEGER , " +
                    MealsTable.Cols.UTCDAY + " INTEGER , " +
                    MealsTable.Cols.UTCHOUR + " INTEGER , " +
                    MealsTable.Cols.UTCMINUTE + " INTEGER , " +
                    MealsTable.Cols.UTCSECOND + " INTEGER , " +
                    MealsTable.Cols.NOTTAKENMEAL + " VARCHAR NOT NULL DEFAULT 'false' , " +
                    MealsTable.Cols.DETAILS + " VARCHAR NOT NULL DEFAULT '', " +
                    " CONSTRAINT meals_unique_key UNIQUE ( " + MealsTable.Cols.SESSION_ID + "," + MealsTable.Cols.UTCYEAR + "," + MealsTable.Cols.UTCMONTH + " ," + MealsTable.Cols.UTCDAY + " ," + MealsTable.Cols.UTCHOUR + " ," + MealsTable.Cols.UTCMINUTE + " ," + MealsTable.Cols.UTCSECOND + "),"
                    + " FOREIGN KEY (" + MealsTable.Cols.SESSION_ID + ") REFERENCES "
                    + SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")";
            createTable(db, MealsTable.TABLE_NAME, mMeals);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createStepsTable(SQLiteDatabase db) {
        try {
            String mSteps =
                StepsTable.Cols.SESSION_ID + " INTEGER PRIMARY KEY NOT NULL, " +
                StepsTable.Cols.TIME + " INTEGER NOT NULL , " +
                StepsTable.Cols.STEPS_COUNT + " INTEGER NOT NULL , " +
                StepsTable.Cols.UPDATE_DATE + " INTEGER , " +
                StepsTable.Cols.UPLOAD_DATE + " VARCHAR , " +

                StepsTable.Cols.OPSTATUS + " INTEGER   , " +
                StepsTable.Cols.STEPS + " INTEGER , " +
                StepsTable.Cols.YEAR + " INTEGER  , " +
                StepsTable.Cols.MONTH + " INTEGER , " +
                StepsTable.Cols.DAY + " INTEGER , " +
                StepsTable.Cols.DAYOFWEEK + " INTEGER , " +
                    " FOREIGN KEY (" + StepsTable.Cols.SESSION_ID + ") REFERENCES " +
                    SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")";
            createTable(db, StepsTable.TABLE_NAME, mSteps);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createAlertTable(SQLiteDatabase db) {
        try {
            String mAlerts = AlertsTable.Cols.SESSION_ID +
                    " INTEGER  NOT NULL, " +
                    AlertsTable.Cols.OCCUR_TIME + " INTEGER  NOT NULL , " +
                    AlertsTable.Cols.ALERT_TYPE + " VARCHAR  NOT NULL , " +
                    AlertsTable.Cols.ALERT_COLOR + " VARCHAR NOT NULL , " +
                    AlertsTable.Cols.VALUE + " INTEGER NOT NULL  ," +
                    AlertsTable.Cols.UPDATE_DATE + " INTEGER, " +
                    "  PRIMARY KEY ( " + AlertsTable.Cols.SESSION_ID + "," + AlertsTable.Cols.OCCUR_TIME + " ," + AlertsTable.Cols.ALERT_TYPE + ")," +
                    " FOREIGN KEY (" + AlertsTable.Cols.SESSION_ID + ") REFERENCES "
                    + SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")";
            createTable(db, AlertsTable.TABLE_NAME, mAlerts);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createCalibrationTable(SQLiteDatabase db) {
        try {
            String mTableDefination = CalibrationTable.Cols.TRIAL_DATA_ID +
                    " INTEGER  PRIMARY KEY AUTOINCREMENT, " +
                    CalibrationTable.Cols.PATIENT_ID + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.PATIENT_INFO + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.HEALTH_INFO + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.VITAL + " TEXT NOT NULL  ," +
                    CalibrationTable.Cols.DATETIME + " INTEGER NOT NULL, " +
                    CalibrationTable.Cols.DEVICE_MSN + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.SENSOR_DATA + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.CALIBRATION_DATA + " TEXT NOT NULL  ," +
                    CalibrationTable.Cols.COMPLETE_DATA + " TEXT NOT NULL, " +
                    CalibrationTable.Cols.IS_COMPLETE + " INTEGER NOT NULL, " +
                    CalibrationTable.Cols.UPLOADED + " INTEGER NOT NULL, " +
                    CalibrationTable.Cols.UPDATE_DATE + " INTEGER ";
            createTable(db, CalibrationTable.TABLE_NAME, mTableDefination);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createUsersTable(SQLiteDatabase db) {
        try {
            String mUsers = UserTable.Cols.ID + " INTEGER PRIMARY KEY NOT NULL , " +
                    UserTable.Cols.NAME + " VARCHAR(50) NOT NULL , " +
                    UserTable.Cols.BIRTH_DATE + " VARCHAR , " +
                    UserTable.Cols.GENDER_ID + " VARCHAR(1) , " +
                    UserTable.Cols.ETHNICITY_ID + " INTEGER , " +
                    UserTable.Cols.SKIN_TONE_ID + " INTEGER , " +
                    UserTable.Cols.ADDRESS + " VARCHAR(100) , " +
                    UserTable.Cols.COUNTRY + " VARCHAR(20) , " +
                    UserTable.Cols.ZIP + " VARCHAR(10) , " +
                    UserTable.Cols.PASSWORD + " VARCHAR(500) , " +
                    UserTable.Cols.HEIGHT_FT + " INTEGER , " +
                    UserTable.Cols.HEIGHT_IN + " INTEGER , " +
                    UserTable.Cols.WEIGHT + " FLOAT , " +
                    UserTable.Cols.WEIGHT_UNIT + " VARCHAR(10) , " +
                    UserTable.Cols.TNC_DATE + " INTEGER , " +
                    UserTable.Cols.STEP_GOAL + " INTEGER , " +
                    UserTable.Cols.HW_ID + " VARCHAR(128) , " +
                    UserTable.Cols.GLUCOSE_UNIT + " VARCHAR(5) , " +
                    UserTable.Cols.AUTO_MEASURE + " VARCHAR NOT NULL DEFAULT 'N', " +
                    UserTable.Cols.AUTO_FREQUENCY + " INTEGER NOT NULL DEFAULT 0 , " +
                    UserTable.Cols.SLEEP_TRACKING + " VARCHAR(1) NOT NULL DEFAULT 'N' , " +
                    UserTable.Cols.POWER_SAVE + " VARCHAR(1) NOT NULL DEFAULT 'N' , " +
                    UserTable.Cols.CGM_DEBUG + " VARCHAR(1) NOT NULL DEFAULT 'N' , " +
                    UserTable.Cols.REGISTRATION_STATE + " INTEGER NOT NULL DEFAULT 0 ," +
                    UserTable.Cols.WEATHER_UNIT + " INTEGER NOT NULL DEFAULT 1 ," +
                    UserTable.Cols.UPDATE_DATE + " INTEGER NOT NULL , " +
                    UserTable.Cols.UPLOAD_DATE + " INTEGER ";
            createTable(db, UserTable.TABLE_NAME, mUsers);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private HashMap<String, Object> performDataBaseOperation(SQLiteDatabase db, String pQuery) {
        HashMap<String, Object> mResultSet = new HashMap<>();
        int count = 0;
        try {
            mResultSet.put("rowcount", "0");
            mResultSet.put("status", "success");
            mResultSet.put("message", "");
            db.execSQL(pQuery);
            count++;
            mResultSet.put("rowcount", String.valueOf(count));
        } catch (Exception e) {
            mResultSet.put("status", "failed");
            mResultSet.put("message", e.getMessage());
            e.printStackTrace();
        }
        return mResultSet;
    }

    public HashMap<String, Object> executeQueries(ArrayList<DbQuery> pQueries) {
        HashMap<String, Object> mResultMap = new HashMap<>();
        HashMap<String, Object> mResultSet;
        String currentQuery = null;
        try {
            SQLiteDatabase db = this.getWritableDatabase(password);
            for (DbQuery mQuery : pQueries) {
                currentQuery = mQuery.getQuery();
                switch (mQuery.getType()) {
                    case Select:
                        mResultSet = getQueryResult(db, mQuery.getQuery());
                        break;
                    case Insert:
                    case Update:
                    case Delete:
                        mResultSet = performDataBaseOperation(db, mQuery.getQuery());
                        break;
                    default:
                        mResultSet = new HashMap<>();
                        mResultSet.put("message", "queryType Mismatched");
                        mResultSet.put("status", "failed");
                        break;
                }
                mResultMap.put("result", mResultSet);

                if (!mResultSet.getOrDefault("status", "").equals("success")) {
                    ErrorLogger.databaseError(
                            "Failed to execute query: " + (String) mResultSet.get("message"),
                            currentQuery,
                            (String) mResultSet.get("message"));
                }
            }
        } catch (Exception e) {
            ErrorLogger.databaseError(
                    "Failed to execute query: " + e.getMessage(),
                    currentQuery,
                    e.getMessage());
            e.printStackTrace();
        }
        return mResultMap;
    }

    private HashMap<String, Object> getQueryResult(SQLiteDatabase db, String pQuery) {
        ArrayList<HashMap<String, String>> mRows = new ArrayList<>();
        HashMap<String, Object> mResultSet = new HashMap<>();
        mResultSet.put("rowcount", "0");
        mResultSet.put("status", "success");
        mResultSet.put("message", "");
        String[] mColomnNames;
        Cursor cursor = null;
        try {
            cursor = db.rawQuery(pQuery, null);
            if (cursor != null && cursor.getCount() > 0) {
                mResultSet.put("rowcount", String.valueOf(cursor.getCount()));
                cursor.moveToFirst();
                mColomnNames = cursor.getColumnNames();
                while (!cursor.isAfterLast()) {
                    HashMap<String, String> mTempMap = new HashMap<>();
                    for (String mCol : mColomnNames) {
                        mTempMap.put(mCol, cursor.getString(cursor.getColumnIndex(mCol)));
                    }
                    mRows.add(mTempMap);
                    cursor.moveToNext();
                }
            }
        } catch (Exception e) {
            mResultSet.put("status", "failed");
            mResultSet.put("message", e.getMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        mResultSet.put("rows", mRows);
        return mResultSet;
    }

    public void addTestUser(int userId) {
        addTestUser(userId, 0);
    }

    public void addTestUser(int userId, Integer stepGoal) {
        ArrayList<String> paramAList = new ArrayList<>();
        String condition = UserTable.Cols.ID + "=?";
        paramAList.add(String.valueOf(userId));

        ContentValues values = new ContentValues();
        values.put(UserTable.Cols.ID, userId);
        values.put(UserTable.Cols.NAME, "Simulator");
        values.put(UserTable.Cols.BIRTH_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.GENDER_ID, "M");
        values.put(UserTable.Cols.ETHNICITY_ID, 1);
        values.put(UserTable.Cols.SKIN_TONE_ID, 0);
        values.put(UserTable.Cols.ADDRESS, "Pune");
        values.put(UserTable.Cols.COUNTRY, "INDIA");
        values.put(UserTable.Cols.ZIP, "123456");
        values.put(UserTable.Cols.PASSWORD, "lifeplusPassword");
        values.put(UserTable.Cols.HEIGHT_FT, 101);
        values.put(UserTable.Cols.HEIGHT_IN, 101);
        values.put(UserTable.Cols.WEIGHT, 60);
        values.put(UserTable.Cols.WEIGHT_UNIT, "MKS");
        values.put(UserTable.Cols.TNC_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.STEP_GOAL, stepGoal);
        values.put(UserTable.Cols.HW_ID, "HW_ID");
        values.put(UserTable.Cols.GLUCOSE_UNIT, "mg/dl");
        values.put(UserTable.Cols.AUTO_MEASURE, "N");
        values.put(UserTable.Cols.AUTO_FREQUENCY, 15);
        values.put(UserTable.Cols.SLEEP_TRACKING, "N");
        values.put(UserTable.Cols.POWER_SAVE, "Y");
        values.put(UserTable.Cols.CGM_DEBUG, "YES");
        values.put(UserTable.Cols.REGISTRATION_STATE, 1);
        values.put(UserTable.Cols.WEATHER_UNIT, 1);
        values.put(UserTable.Cols.UPDATE_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.UPLOAD_DATE, System.currentTimeMillis());
        insertOrUpdateIntoTable(UserTable.TABLE_NAME, values, condition, paramAList);
    }

    private void generateEthnicities(SQLiteDatabase pDb) {
        ContentValues contentValues = new ContentValues();
        HashMap<Integer, String> mData = new HashMap<>();
        mData.put(1, "American Indian or Alaska Native");
        mData.put(2, "Asian");
        mData.put(3, "Black or African American");
        mData.put(4, "Hispanic or Latino");
        mData.put(5, "Native Hawaiian or Other Pacific Islander");
        mData.put(6, "White");
        mData.put(7, "Mixed Race");
        mData.put(8, "Decline to specify"); //New type added in ethnicity
        for (int mKey : mData.keySet()) {
            contentValues.put(EthnicitiesTable.Cols.ID, mKey);
            contentValues.put(EthnicitiesTable.Cols.NAME, mData.get(mKey));
            pDb.insert(EthnicitiesTable.TABLE_NAME, null, contentValues);
        }
    }

    private void generateGender(SQLiteDatabase mDb) {
        ContentValues contentValues = new ContentValues();
        HashMap<String, String> mGenderData = new HashMap<>();
        mGenderData.put("M", "MALE");
        mGenderData.put("F", "FEMALE");
        mGenderData.put("O", "Other");
        for (String mKey : mGenderData.keySet()) {
            contentValues.put(GenderTable.Cols.ID, mKey);
            contentValues.put(GenderTable.Cols.NAME, mGenderData.get(mKey));
            mDb.insert(GenderTable.TABLE_NAME, null, contentValues);
        }
    }

    private void addIntoUserTable(SQLiteDatabase db) {
        ContentValues values = new ContentValues();
        values.put(UserTable.Cols.ID, 1);
        values.put(UserTable.Cols.NAME, "Simulator");
        values.put(UserTable.Cols.BIRTH_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.GENDER_ID, "M");
        values.put(UserTable.Cols.ETHNICITY_ID, 1);
        values.put(UserTable.Cols.SKIN_TONE_ID, 4);
        values.put(UserTable.Cols.ADDRESS, "Pune");
        values.put(UserTable.Cols.COUNTRY, "INDIA");
        values.put(UserTable.Cols.ZIP, "123456");
        values.put(UserTable.Cols.PASSWORD, "lifeplusPassword");
        values.put(UserTable.Cols.HEIGHT_FT, 101);
        values.put(UserTable.Cols.HEIGHT_IN, 101);
        values.put(UserTable.Cols.WEIGHT, 60);
        values.put(UserTable.Cols.WEIGHT_UNIT, "MKS");
        values.put(UserTable.Cols.TNC_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.STEP_GOAL, 72);
        values.put(UserTable.Cols.HW_ID, "HW_ID");
        values.put(UserTable.Cols.GLUCOSE_UNIT, "mg/dl"); //Changed from KG to mg/dl as glucose unit cannot be KG
        values.put(UserTable.Cols.AUTO_MEASURE, "N");
        values.put(UserTable.Cols.AUTO_FREQUENCY, 15);
        values.put(UserTable.Cols.SLEEP_TRACKING, "N");
        values.put(UserTable.Cols.POWER_SAVE, "Y");
        values.put(UserTable.Cols.CGM_DEBUG, "YES");
        values.put(UserTable.Cols.REGISTRATION_STATE, 1);
        values.put(UserTable.Cols.WEATHER_UNIT, 1);
        values.put(UserTable.Cols.UPDATE_DATE, System.currentTimeMillis());
        values.put(UserTable.Cols.UPLOAD_DATE, System.currentTimeMillis());
        db.insert(UserTable.TABLE_NAME, null, values);
    }

    private void addDeviceValues(SQLiteDatabase db) {
        ContentValues values = new ContentValues();
        values.put(DevicesTable.Cols.ID, 1);
        values.put(DevicesTable.Cols.DATE_ADDED, System.currentTimeMillis());
        values.put(DevicesTable.Cols.HW_ID, "HW_ID");
        db.insert(DevicesTable.TABLE_NAME, null, values);
    }

    public void addUnsuccessfulMeasure(long measureTime) {
        ContentValues values = new ContentValues();
        values.put(MeasuresTable.Cols.SESSION_ID, 1);
        values.put(MeasuresTable.Cols.TYPE, "U");
        values.put(MeasuresTable.Cols.MEASURE_TIME, String.valueOf(measureTime));
        values.put(MeasuresTable.Cols.O2, 0);
        values.put(MeasuresTable.Cols.RESPIRATION, 0);
        values.put(MeasuresTable.Cols.HEART_RATE, 0);
        values.put(MeasuresTable.Cols.BPSYS, 0);
        values.put(MeasuresTable.Cols.BPDIA, 0);
        values.put(MeasuresTable.Cols.GLUCOSE, 0);
        values.put(MeasuresTable.Cols.UPLOAD_DATE, String.valueOf(System.currentTimeMillis()));
        try {
            SQLiteDatabase db = getWritableDatabase(password);
            long mRowCount = db.insert(MeasuresTable.TABLE_NAME, null, values);
            Log.d("rows", String.valueOf(mRowCount));
        } catch (Exception e) {
            Log.e("error measures", "unsuccessful measure error: " + e.getMessage());
        }
    }

    public void addIntoMeasurable(HashMap<String, Object> pValues, String pUploadDate) {
        try {
            ContentValues values = new ContentValues();
            values.put(MeasuresTable.Cols.SESSION_ID, 1);
            values.put(MeasuresTable.Cols.TYPE, "R");

            int mYear = (Integer) pValues.get("UTC_Year");
            int mMon = (Integer) pValues.get("UTC_Month");
            int mDay = (Integer) pValues.get("UTC_Day");
            int mHour = (Integer) pValues.get("UTC_Hour");
            int mMinute = (Integer) pValues.get("UTC_Minutes");
            int mSecond = (Integer) pValues.get("UTC_Seconds");

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
            String measureTime = String.valueOf(date.getTime());

            values.put(MeasuresTable.Cols.MEASURE_TIME, measureTime);
            values.put(MeasuresTable.Cols.O2, (Integer) pValues.get("OxygenSaturation"));
            values.put(MeasuresTable.Cols.RESPIRATION, (Integer) pValues.get("RespirationRate"));
            values.put(MeasuresTable.Cols.HEART_RATE, (Integer) pValues.get("HeartRate"));
            values.put(MeasuresTable.Cols.BPSYS, (Integer) pValues.get("BloodPressureSYS"));
            values.put(MeasuresTable.Cols.BPDIA, (Integer) pValues.get("BloodPressureDIA"));
            values.put(MeasuresTable.Cols.GLUCOSE, (Integer) pValues.get("BloodGlucose"));
            values.put(MeasuresTable.Cols.UPLOAD_DATE, pUploadDate);

            SQLiteDatabase db = getWritableDatabase(password);
            long mRowCount = db.insert(MeasuresTable.TABLE_NAME, null, values);
            Log.d("rows", String.valueOf(mRowCount));
        } catch (Exception e) {
            Log.e("error measures", "measures error: " + e.getMessage());
        }
    }

    public ArrayList<HashMap<String, Object>> getOfflineMeasureData() {
        ArrayList<HashMap<String, Object>> mOfflineData = new ArrayList<>();
        Cursor cursor = null;
        SQLiteDatabase db = null;
        String Query = " select * " + " from " + MeasuresTable.TABLE_NAME + " where " + MeasuresTable.Cols.UPLOAD_DATE + " IS NULL ";
        try {
            db = getReadableDatabase(password);
            cursor = db.rawQuery(Query, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    HashMap<String, Object> mData = new HashMap<>();
                    mData.put(MeasuresTable.Cols.SESSION_ID, cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.SESSION_ID)));
                    mData.put(MeasuresTable.Cols.TYPE, cursor.getString(cursor.getColumnIndex(MeasuresTable.Cols.TYPE)));
                    mData.put(MeasuresTable.Cols.MEASURE_TIME, cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.MEASURE_TIME)));
                    mData.put("OxygenSaturation", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.O2)));
                    mData.put("RespirationRate", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.RESPIRATION)));
                    mData.put("HeartRate", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.HEART_RATE)));
                    mData.put("BloodPressureDIA", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.BPDIA)));
                    mData.put("BloodGlucose", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.GLUCOSE)));
                    mData.put("BloodPressureSYS", cursor.getInt(cursor.getColumnIndex(MeasuresTable.Cols.BPSYS)));
                    mOfflineData.add(mData);
                    cursor.moveToNext();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return mOfflineData;
    }

    public ArrayList<String> getAllTimeStampFromMeasureTable() {
        ArrayList<String> mAllTimeStamp = new ArrayList<>();
        Cursor cursor = null;
        SQLiteDatabase db = null;
        String Query = " select " + MeasuresTable.Cols.MEASURE_TIME + " from " + MeasuresTable.TABLE_NAME;
        try {
            db = getReadableDatabase(password);
            cursor = db.rawQuery(Query, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    String mTime = cursor.getString(cursor.getColumnIndex(MeasuresTable.Cols.MEASURE_TIME));
                    mAllTimeStamp.add(mTime);
                    cursor.moveToNext();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return mAllTimeStamp;
    }

    public ArrayList<String> getMealsTimeStamp() {
        ArrayList<String> mAllTimeStampsFromMealsTable = new ArrayList<>();
        Cursor cursor = null;
        SQLiteDatabase db = null;
        String Query = " select  " + MealsTable.Cols.UTCYEAR + " ," +
                MealsTable.Cols.UTCMONTH + " ," + MealsTable.Cols.UTCDAY + " ,"
                + MealsTable.Cols.UTCHOUR + " ," + MealsTable.Cols.UTCMINUTE + " ,"
                + MealsTable.Cols.UTCSECOND + " from "
                + MealsTable.TABLE_NAME;
        try {
            db = getReadableDatabase(password);
            cursor = db.rawQuery(Query, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    String mYear = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCYEAR)));
                    String mMonth = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCMONTH)));
                    String mDay = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCDAY)));
                    String mHour = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCHOUR)));
                    String mMinute = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCMINUTE)));
                    String mSecond = String.valueOf(cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.UTCSECOND)));
                    String mTimeStamp = mYear + "/" + mMonth + "/" + mDay + " " + mHour + ":" + mMinute + ":" + mSecond;
                    mAllTimeStampsFromMealsTable.add(mTimeStamp);
                    cursor.moveToNext();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return mAllTimeStampsFromMealsTable;
    }

    public ArrayList<HashMap<String, Object>> getOfflineDataSteps() {
        ArrayList<HashMap<String, Object>> mOfflineData = new ArrayList<>();
        Cursor cursor = null;
        SQLiteDatabase db = null;
        String Query = " select * " + " from " + StepsTable.TABLE_NAME + " where " + StepsTable.Cols.UPLOAD_DATE + " IS NULL ";
        try {
            db = getReadableDatabase(password);
            cursor = db.rawQuery(Query, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    HashMap<String, Object> mData = new HashMap<>();
                    mData.put("Time", cursor.getLong(cursor.getColumnIndex(StepsTable.Cols.TIME)));
                    mData.put("Steps", cursor.getInt(cursor.getColumnIndex(StepsTable.Cols.STEPS)));
                    mOfflineData.add(mData);
                    cursor.moveToNext();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return mOfflineData;
    }

    public ArrayList<HashMap<String, Object>> getOfflineMealsData() {
        ArrayList<HashMap<String, Object>> mOfflineData = new ArrayList<>();

        Cursor cursor = null;
        SQLiteDatabase db = null;
        String Query = " select * " + " from " + MealsTable.TABLE_NAME + " where " + MealsTable.Cols.UPLOAD_DATE + " IS NULL ";
        try {
            db = getReadableDatabase(password);
            cursor = db.rawQuery(Query, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    HashMap<String, Object> mData = new HashMap<>();
                    mData.put("Meal_Type", cursor.getInt(cursor.getColumnIndex(MealsTable.Cols.MEALTYPE)));
                    mData.put("MealsTimeStamp", cursor.getLong(cursor.getColumnIndex(MealsTable.Cols.TIME)));

                    mOfflineData.add(mData);
                    cursor.moveToNext();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return mOfflineData;
    }

    public void addStepDataTable(HashMap<String, Object> stepsData, String uploadDate) {
        ArrayList<String> params = new ArrayList<>();
        params.add(String.valueOf(stepsData.get("Year")));
        params.add(String.valueOf(stepsData.get("Day")));
        params.add(String.valueOf(stepsData.get("Month")));
        params.add(String.valueOf(stepsData.get("Hour")));
        String condition = StepsTable.Cols.YEAR + "=? AND " + StepsTable.Cols.DAY + "=? AND " +
                StepsTable.Cols.MONTH + "=? AND " + StepsTable.Cols.OPSTATUS + "=?";

        ContentValues values = new ContentValues();
        values.put(StepsTable.Cols.TIME, (Long) stepsData.get("Time"));
        values.put(StepsTable.Cols.UPDATE_DATE, System.currentTimeMillis());
        values.put(StepsTable.Cols.UPLOAD_DATE, uploadDate);
        values.put(StepsTable.Cols.OPSTATUS, (Integer) stepsData.get("Hour"));
        values.put(StepsTable.Cols.STEPS_COUNT, (Integer) stepsData.get("Steps"));
        values.put(StepsTable.Cols.YEAR, (Integer) stepsData.get("Year"));
        values.put(StepsTable.Cols.DAY, (Integer) stepsData.get("Day"));
        values.put(StepsTable.Cols.MONTH, (Integer) stepsData.get("Month"));
        values.put(StepsTable.Cols.DAYOFWEEK, (Integer) stepsData.get("DayOfWeek"));

        insertOrUpdateIntoTable(StepsTable.TABLE_NAME, values, condition, params);
    }

    public void addRawData(HashMap<String, Object> pValues) {
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        SQLiteDatabase db = getWritableDatabase(password);
        ContentValues values = new ContentValues();
        values.put(RawDataTable.Cols.OPSTATUS, (Integer) pValues.get("OpStatus"));
        values.put(RawDataTable.Cols.TIME, (Integer) pValues.get("Time"));
        values.put(RawDataTable.Cols.CURRENTINDEX, (Integer) pValues.get("CurrentIndex"));
        values.put(RawDataTable.Cols.AFEDATA1, (Long) pValues.get("AFEData1"));
        values.put(RawDataTable.Cols.AFEDATA2, (Long) pValues.get("AFEData2"));
        values.put(RawDataTable.Cols.AFEDATA3, (Long) pValues.get("AFEData3"));
        values.put(RawDataTable.Cols.AFEDATA4, (Long) pValues.get("AFEData4"));
        values.put(RawDataTable.Cols.GYRO1A, (Integer) pValues.get("Gyro1a"));
        values.put(RawDataTable.Cols.GYRO2A, (Integer) pValues.get("Gyro2a"));
        values.put(RawDataTable.Cols.GYRO3A, (Integer) pValues.get("Gyro3a"));
        values.put(RawDataTable.Cols.ACCELEROMETER_X, (Integer) pValues.get("Accelerometer_X"));
        values.put(RawDataTable.Cols.ACCELEROMETER_Y, (Integer) pValues.get("Accelerometer_Y"));
        values.put(RawDataTable.Cols.ACCELEROMETER_Z, (Integer) pValues.get("Accelerometer_Z"));
        values.put(RawDataTable.Cols.AFEPHASE1, (Integer) pValues.get("AFEPHASE1"));
        values.put(RawDataTable.Cols.AFEPHASE2, (Integer) pValues.get("AFEPHASE2"));
        values.put(RawDataTable.Cols.AFEPHASE3, (Integer) pValues.get("AFEPHASE3"));
        values.put(RawDataTable.Cols.AFEPHASE4, (Integer) pValues.get("AFEPHASE4"));
        values.put(RawDataTable.Cols.AFEPHASE5, (Integer) pValues.get("AFEPHASE5"));
        values.put(RawDataTable.Cols.AFEPHASE6, (Integer) pValues.get("AFEPHASE6"));
        values.put(RawDataTable.Cols.AFEPHASE7, (Integer) pValues.get("AFEPHASE7"));
        values.put(RawDataTable.Cols.GYRO1A1, (Integer) pValues.get("Gyro1a"));
        values.put(RawDataTable.Cols.GYRO2A1, (Integer) pValues.get("Gyro2a"));
        values.put(RawDataTable.Cols.GYRO3A1, (Integer) pValues.get("Gyro3a"));
        values.put(RawDataTable.Cols.ACCELEROMETER_X1, (Integer) pValues.get("Accelerometer_X"));
        values.put(RawDataTable.Cols.ACCELEROMETER_Y1, (Integer) pValues.get("Accelerometer_Y"));
        values.put(RawDataTable.Cols.ACCELEROMETER_Z1, (Integer) pValues.get("Accelerometer_Z"));

        values.put(RawDataTable.Cols.UPLOAD_DATE, calendar.getTimeInMillis());
        long mRowCount = db.insert(RawDataTable.TABLE_NAME, null, values);
        Log.d("rows", "" + mRowCount);
    }

    public void addMealsData(HashMap<String, Object> pValues, String pUploadTimeInMilliSecond) {
        String timeStamp = pValues.get("UTC_Year") + "/" + pValues.get("UTC_Month") + "/" + pValues.get("UTC_Day")
                + " " + pValues.get("UTC_Hours") + ":" + pValues.get("UTC_Minutes") + ":" + pValues.get("UTC_Seconds");

        @SuppressLint("SimpleDateFormat") SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        Date date = null;
        try {
            date = sdf.parse(timeStamp);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        assert date != null;
        String timeInMilliSec = String.valueOf(date.getTime());
        ContentValues values = new ContentValues();
        values.put(MealsTable.Cols.TIME, timeInMilliSec);
        values.put(MealsTable.Cols.TYPE, "M");
        values.put(MealsTable.Cols.UPDATE_DATE, String.valueOf(System.currentTimeMillis()));
        values.put(MealsTable.Cols.UPLOAD_DATE, pUploadTimeInMilliSecond);
        values.put(MealsTable.Cols.MEALTYPE, (Integer) pValues.get("Meal_Type"));
        values.put(MealsTable.Cols.UTCYEAR, (Integer) pValues.get("UTC_Year"));
        values.put(MealsTable.Cols.UTCMONTH, (Integer) pValues.get("UTC_Month"));
        values.put(MealsTable.Cols.UTCDAY, (Integer) pValues.get("UTC_Day"));
        values.put(MealsTable.Cols.UTCHOUR, (Integer) pValues.get("UTC_Hours"));
        values.put(MealsTable.Cols.UTCMINUTE, (Integer) pValues.get("UTC_Minutes"));
        values.put(MealsTable.Cols.UTCSECOND, (Integer) pValues.get("UTC_Seconds"));
        values.put(MealsTable.Cols.NOTTAKENMEAL, "false");
        pValues.put(MealsTable.Cols.DETAILS, "");

        SQLiteDatabase db = getWritableDatabase(password);
        long mRowCount = db.insert(MealsTable.TABLE_NAME, null, values);
        Log.d("rows", "" + mRowCount);
    }


    private void addSessionValue(SQLiteDatabase db) {
        ContentValues values = new ContentValues();
        values.put(SessionsTable.Cols.ID, 1);
        values.put(SessionsTable.Cols.USER_ID, 1);
        values.put(SessionsTable.Cols.DEVICE_ID, 1);
        values.put(SessionsTable.Cols.LOGIN_DATE, System.currentTimeMillis());
        values.put(SessionsTable.Cols.LOGOUT_DATE, System.currentTimeMillis());
        values.put(SessionsTable.Cols.AUTH_TOKEN, "AuthToken");
        values.put(SessionsTable.Cols.REFRESH_TOKEN, "RefreshToken");
        values.put(SessionsTable.Cols.GATEWAY_TOKEN, "GateWay Token");
        db.insert(SessionsTable.TABLE_NAME, null, values);
    }

    public void updateAppSync(int pUserId, AppSync pAppSync) {
        ArrayList<String> paramAList = new ArrayList<>();
        String condition = UserTable.Cols.ID + "=?";
        paramAList.add(String.valueOf(pUserId));
        ContentValues mValues = new ContentValues();

        if (pAppSync.getBirthDate() != null && !pAppSync.getBirthDate().isEmpty()) {
            mValues.put(UserTable.Cols.BIRTH_DATE, pAppSync.getBirthDate());
        }

        mValues.put(UserTable.Cols.AUTO_MEASURE, pAppSync.getAutoMeasure() ? "Y" : "N");
        mValues.put(UserTable.Cols.AUTO_FREQUENCY, pAppSync.getAutoMeasureInterval());
        mValues.put(UserTable.Cols.GLUCOSE_UNIT, pAppSync.getGlucoseUnit());
        mValues.put(UserTable.Cols.HEIGHT_FT, pAppSync.getHeight_ft());
        mValues.put(UserTable.Cols.HEIGHT_IN, pAppSync.getHeight_in());
        mValues.put(UserTable.Cols.WEIGHT, pAppSync.getWeight());
        mValues.put(UserTable.Cols.WEIGHT_UNIT, pAppSync.getWeightUnit());
        mValues.put(UserTable.Cols.ETHNICITY_ID, pAppSync.getEthnicity());
        mValues.put(UserTable.Cols.SKIN_TONE_ID, pAppSync.getSkinTone());
        if (pAppSync.getWeatherUnit() == 0 || pAppSync.getWeatherUnit() == 1) {
            mValues.put(UserTable.Cols.WEATHER_UNIT, pAppSync.getWeatherUnit());
        }
        if (pAppSync.getGender() != null && !pAppSync.getGender().isEmpty()) {
            mValues.put(UserTable.Cols.GENDER_ID, pAppSync.getGender());
        }
        mValues.put(UserTable.Cols.UPDATE_DATE, System.currentTimeMillis());

        insertOrUpdateIntoTable(UserTable.TABLE_NAME, mValues, condition, paramAList);
    }

    public void updateMeasurable(String pUploadDate) {
        String mStrSQL = " UPDATE " + MeasuresTable.TABLE_NAME + " SET " + MeasuresTable.Cols.UPLOAD_DATE + "= " + pUploadDate + " WHERE " + MeasuresTable.Cols.UPLOAD_DATE + " IS NULL ";
        SQLiteDatabase db = getWritableDatabase(password);
        db.execSQL(mStrSQL);
    }

    public void updateStepsTable(String pUploadDate) {
        String mStrSQL = " UPDATE " + StepsTable.TABLE_NAME + " SET " + StepsTable.Cols.UPLOAD_DATE + "= " + pUploadDate + " WHERE " + StepsTable.Cols.UPLOAD_DATE + " IS NULL ";
        SQLiteDatabase db = getWritableDatabase(password);
        db.execSQL(mStrSQL);
    }

    public void updateMealsTable(String pUploadDate) {
        String mStrSQL = " UPDATE " + MealsTable.TABLE_NAME + " SET " + MealsTable.Cols.UPLOAD_DATE + "= " + pUploadDate + " WHERE " + MealsTable.Cols.UPLOAD_DATE + " IS NULL ";
        SQLiteDatabase db = getWritableDatabase(password);
        db.execSQL(mStrSQL);
    }

    public void updateCalibration(int pUserId, HashMap<String, Object> pDataBaseValues) {
        // TODO: doesn't store anything, invalid query.
//        ArrayList<String> mParamAList = new ArrayList<>();
//        String mCondition = UserTable.Cols.ID + "=?";
//        mParamAList.add(String.valueOf(pUserId));
//        ContentValues mValues = new ContentValues();
//        for (String mKey : pDataBaseValues.keySet()) {
//            mValues.put(mKey, String.valueOf(pDataBaseValues.get(mKey)));
//        }
//        insertOrUpdateIntoTable(UserTable.TABLE_NAME, mValues, mCondition, mParamAList);
    }

    private int insertOrUpdateIntoTable(String tableName, ContentValues values,
                                       String condition, ArrayList<String> paramAList) {
        int mUpdatedRows = 0;
        Cursor mCursor = null;
        SQLiteDatabase db = null;
        try {
            db = getWritableDatabase(password);
            String[] arr = new String[paramAList.size()];
            mCursor = db.query(tableName, null, condition, paramAList.toArray(arr), null, null, null);

            if (mCursor != null && mCursor.getCount() > 0) {
                mUpdatedRows = db.update(tableName, values, condition, paramAList.toArray(arr));
            } else {
                db.insert(tableName, null, values);
                mUpdatedRows = 1;
            }
        } catch (Exception ex) {
            ErrorLogger.databaseError("InsertOrUpdate", "", ex.getLocalizedMessage());
            ex.printStackTrace();
        } finally {
            if (mCursor != null) {
                mCursor.close();
            }
        }
        return mUpdatedRows;
    }

    public AppSync getAppSyncData(int userid) {
        AppSync mAppSync = new AppSync();
        Cursor mCursor = null;
        SQLiteDatabase db = null;
        try {
            db = this.getReadableDatabase(password);
            mCursor = db.rawQuery("SELECT " + UserTable.Cols.AUTO_MEASURE + ", " + UserTable.Cols.CGM_DEBUG
                    + ", " + UserTable.Cols.GLUCOSE_UNIT + ", " + UserTable.Cols.AUTO_FREQUENCY
                    + ", " + UserTable.Cols.POWER_SAVE + ", " + UserTable.Cols.BIRTH_DATE
                    + ", " + UserTable.Cols.WEIGHT + ", " + UserTable.Cols.WEIGHT_UNIT
                    + ", " + UserTable.Cols.HEIGHT_FT + ", " + UserTable.Cols.HEIGHT_IN
                    + ", " + UserTable.Cols.ETHNICITY_ID + ", " + UserTable.Cols.SKIN_TONE_ID
                    + ", " + UserTable.Cols.GENDER_ID + ", " + UserTable.Cols.WEATHER_UNIT
                    + ", " + UserTable.Cols.AGE_EXP
                    + " FROM " + UserTable.TABLE_NAME
                    + " WHERE " + UserTable.Cols.ID + " = " + userid, null);

            if (mCursor != null && mCursor.getCount() > 0) {
                mCursor.moveToFirst();
                while (!mCursor.isAfterLast()) {
                    mAppSync.setAutoMeasure(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.AUTO_MEASURE)));
                    mAppSync.setGlucoseUnit(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.GLUCOSE_UNIT)));
                    mAppSync.setCgmModeOn(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.CGM_DEBUG)));
                    mAppSync.setPowerSave(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.POWER_SAVE)));
                    mAppSync.setAutoMeasureInterval(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.AUTO_FREQUENCY)));
                    mAppSync.setBirthDate(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.BIRTH_DATE)));
                    mAppSync.setAge(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.AGE)));
                    mAppSync.setWeight(mCursor.getFloat(mCursor.getColumnIndex(UserTable.Cols.WEIGHT)));
                    mAppSync.setWeightUnit(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.WEIGHT_UNIT)));
                    mAppSync.setHeight_ft(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.HEIGHT_FT)));
                    mAppSync.setHeight_in(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.HEIGHT_IN)));
                    mAppSync.setEthnicity(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.ETHNICITY_ID)));
                    mAppSync.setSkinTone(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.SKIN_TONE_ID)));
                    mAppSync.setGender(mCursor.getString(mCursor.getColumnIndex(UserTable.Cols.GENDER_ID)));
                    mAppSync.setWeatherUnit(mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.WEATHER_UNIT)));
                    mCursor.moveToNext();
                }
            }
        } catch (Exception e) {
            Log.e(this.getClass().getName(), e.getLocalizedMessage());
            e.printStackTrace();
        } finally {
            if (mCursor != null) {
                mCursor.close();
            }
        }
        return mAppSync;
    }

    public UserSessionStruct getCurrSession() {
        UserSessionStruct mResult = null;
        Cursor mCursor = null;
        SQLiteDatabase db = null;
        try {
            db = this.getReadableDatabase(password);
            mCursor = db.rawQuery(" SELECT a." + SessionsTable.Cols.ID
                            + ", a." + SessionsTable.Cols.USER_ID
                            + ", a." + SessionsTable.Cols.DEVICE_ID
                            + ", b." + DevicesTable.Cols.HW_ID
                            + " FROM " + SessionsTable.TABLE_NAME + " a "
                            + " JOIN " + DevicesTable.TABLE_NAME + " b "
                            + " ON b." + DevicesTable.Cols.ID + " = a." + SessionsTable.Cols.DEVICE_ID
                            + " WHERE " + SessionsTable.Cols.LOGOUT_DATE + " = null "
                            + " LIMIT 1",
                    null);
            if (mCursor != null && mCursor.getCount() > 0) {
                mCursor.moveToFirst();
                while (!mCursor.isAfterLast()) {
                    int mSessionId = mCursor.getInt(mCursor.getColumnIndex(SessionsTable.Cols.ID));
                    String mUserId = String.valueOf(mCursor.getInt(mCursor.getColumnIndex(SessionsTable.Cols.USER_ID)));
                    String mDeviceId = mCursor.getString(mCursor.getColumnIndex(DevicesTable.Cols.HW_ID));
                    mResult = new UserSessionStruct(
                            String.valueOf(mSessionId), mUserId, mDeviceId, null, null,
                            "", "", "");
                    mCursor.moveToNext();
                }
            }
        } catch (Exception e) {
            // TODO remove after testing on real watch
            mResult = new UserSessionStruct(
                    "", "", "", null, null,
                    "", "", "");
        } finally {
            if (mCursor != null) {
                mCursor.close();
            }
        }
        return mResult;
    }

    public int getCurrentUserGoal(long userId) {
        Cursor mCursor = null;
        SQLiteDatabase db;
        int mResult = 0;
        try {
            db = this.getReadableDatabase(password);
            mCursor = db.rawQuery(" SELECT " + UserTable.Cols.STEP_GOAL
                            + " FROM " + UserTable.TABLE_NAME
                            + " WHERE " + UserTable.Cols.ID + " = " + userId, null);
            if (mCursor != null && mCursor.getCount() > 0) {
                mCursor.moveToFirst();
                while (!mCursor.isAfterLast()) {
                    mResult = mCursor.getInt(mCursor.getColumnIndex(UserTable.Cols.STEP_GOAL));
                    mCursor.moveToNext();
                }
            }
        } catch (Exception e) {
            mResult = 0;
        } finally {
            if (mCursor != null) {
                mCursor.close();
            }
        }
        return mResult;
    }

    public long getLatestMeasureTimestamp() {
        long result = 0L;
        Cursor cursor = null;
        try {
            SQLiteDatabase db = this.getReadableDatabase(password);
            cursor = db.rawQuery("SELECT " + MeasuresTable.Cols.MEASURE_TIME
                + " FROM " + MeasuresTable.TABLE_NAME
                + " WHERE " + MeasuresTable.Cols.SESSION_ID + " = 1"
                + " ORDER BY " + MeasuresTable.Cols.MEASURE_TIME + " DESC LIMIT 1", null);
        if (cursor != null && cursor.getCount() > 0) {
            cursor.moveToFirst();
            result = cursor.getLong(0);
        }
        } catch (Exception e) {
            Log.e(this.getClass().getName(), e.getLocalizedMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }

        return result;
    }

    public void reviewOfflineMeasures(long measureTime) {
        int interval = this.getAppSyncData(Global.getUserId()).getAutoMeasureInterval();
        if (interval > 0) {
            ArrayList<Long> measures = this.getMeasuresAfter(measureTime);
            measures.add(System.currentTimeMillis());
            Collections.sort(measures);
            long intervalMs = TimeUnit.MINUTES.toMillis(interval);
            for (int i = 0; i < measures.size(); i++) {
                if (i != 0) {
                    long value = measures.get(i);
                    long prevValue = measures.get(i - 1);
                    while ((value - prevValue) > (1.5 * intervalMs)) {
                        prevValue = prevValue + intervalMs;
                        this.addUnsuccessfulMeasure(prevValue);
                    }
                }
            }
        }
    }

    private ArrayList<Long> getMeasuresAfter(long measureTime) {
        ArrayList<Long> result = new ArrayList<>();
        Cursor cursor = null;
        try {
            SQLiteDatabase db = this.getReadableDatabase(password);
            cursor = db.rawQuery("SELECT " + MeasuresTable.Cols.MEASURE_TIME
                    + " FROM " + MeasuresTable.TABLE_NAME
                    + " WHERE " + MeasuresTable.Cols.SESSION_ID + " = 1"
                    + " AND " + MeasuresTable.Cols.MEASURE_TIME + " >= " + measureTime, null);
            if (cursor != null && cursor.getCount() > 0) {
                cursor.moveToFirst();
                while (!cursor.isAfterLast()) {
                    result.add(cursor.getLong(0));
                    cursor.moveToNext();
                }
            }
        } catch (Exception e) {
            Log.e(this.getClass().getName(), e.getLocalizedMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }

        return result;
    }
}
