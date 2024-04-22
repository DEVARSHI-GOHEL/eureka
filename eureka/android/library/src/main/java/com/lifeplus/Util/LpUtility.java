package com.lifeplus.Util;

import com.lifeplus.Pojo.Enum.BleCommandEnum;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Calendar;
import java.util.TimeZone;

public class LpUtility {
    public static String encodeHexString(byte[] byteArray) {
        if(byteArray == null) return "-";
        StringBuffer hexStringBuffer = new StringBuffer();
        for (int i = 0; i < byteArray.length; i++) {
            hexStringBuffer.append(byteToHex(byteArray[i]) + " ");
        }
        return hexStringBuffer.toString();
    }

    private static String byteToHex(byte num) {
        char[] hexDigits = new char[2];
        hexDigits[0] = Character.forDigit((num >> 4) & 0xF, 16);
        hexDigits[1] = Character.forDigit((num & 0xF), 16);
        return new String(hexDigits);
    }

    public static int byteArrToInt(byte pFirstByte, byte pSecondByte) {
        int result = 0;
        int mFirstInt = (pFirstByte < 0) ? 256 + pFirstByte : pFirstByte;
        int mSecondInt = (pSecondByte < 0) ? 256 + pSecondByte : pSecondByte;
        result = (mSecondInt * 256) + mFirstInt;
        return result;
    }

    public static long byteArrayToLong(byte pFirstByte, byte pSecondByte, byte pThirdByte, byte pFourthByte) {
        byte[] mbyteArray = new byte[4];
        mbyteArray[0] = pFirstByte;
        mbyteArray[1] = pSecondByte;
        mbyteArray[2] = pThirdByte;
        mbyteArray[3] = pFourthByte;
        return mbyteArray[0] << 24 | (mbyteArray[1] & 0xff) << 16
                | (mbyteArray[2] & 0xff) << 8 | (mbyteArray[3] & 0xff);
    }

    public static short byteArrayToShort(byte pFirstByte, byte pSecondByte) {
        byte[] mbyteArray = new byte[2];
        mbyteArray[0] = pFirstByte;
        mbyteArray[1] = pSecondByte;
        ByteBuffer wrapped = ByteBuffer.wrap(mbyteArray).order(ByteOrder.LITTLE_ENDIAN);
        short num = wrapped.getShort();
        return num;
    }

    public static int byteArrayToInteger(byte pFirstByte, byte pSecondByte, byte pThirdByte, byte pFourthByte) {
        byte[] mbyteArray = new byte[4];
        mbyteArray[0] = pFirstByte;
        mbyteArray[1] = pSecondByte;
        mbyteArray[2] = pThirdByte;
        mbyteArray[3] = pFourthByte;
        ByteBuffer wrapped = ByteBuffer.wrap(mbyteArray).order(ByteOrder.LITTLE_ENDIAN);
        int num = wrapped.getInt();
        return num;
    }

    public static int byteToInt(byte pByte) {
        return (pByte < 0) ? 256 + pByte : pByte;
    }

    public static byte[] intToByteArr(int pInteger) {
        byte[] result = new byte[2];

        result[0] = (byte)(pInteger % 256);
        int mRemainder = pInteger / 256;
        result[1] = (byte)mRemainder;

        return result;
    }

    public static int byteArrayToInt(byte pFirstByte, byte pSecondByte, byte pThirdByte, byte pFourthByte) {
        byte[] mbyteArray = new byte[4];
        mbyteArray[0] = pFirstByte;
        mbyteArray[1] = pSecondByte;
        mbyteArray[2] = pThirdByte;
        mbyteArray[3] = pFourthByte;
        return mbyteArray[0] << 24 | (mbyteArray[1] & 0xff) << 16
                | (mbyteArray[2] & 0xff) << 8 | (mbyteArray[3] & 0xff);
    }

    public static long byteArrayToDate(byte[] pCharData) {
        long result = 0;
        if(pCharData.length == 7) {
            Calendar date = Calendar.getInstance();
            date.setTimeZone(TimeZone.getTimeZone("UTC"));
            date.set(Calendar.YEAR, byteArrToInt(pCharData[0], pCharData[1]));
            date.set(Calendar.MONTH, pCharData[2] - 1);
            date.set(Calendar.DAY_OF_MONTH, pCharData[3]);
            date.set(Calendar.HOUR_OF_DAY, pCharData[4]);
            date.set(Calendar.MINUTE, pCharData[5]);
            date.set(Calendar.SECOND, pCharData[6]);
            date.set(Calendar.MILLISECOND, 0);

            result = date.getTimeInMillis();
        }
        return result;
    }

    public static long getTimeStamp(int year, int month, int day, int hour) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, year);
        cal.set(Calendar.DAY_OF_MONTH, day);
        cal.set(Calendar.MONTH, month - 1);
        cal.set(Calendar.HOUR_OF_DAY, hour);

        return cal.getTimeInMillis();
    }

    public static byte[] getTimeSyncData() {
        byte[] result = new byte[9];

        int mYear = Calendar.getInstance().get(Calendar.YEAR);
        result[0] = (byte)(mYear % 256);
        int mRemainder = mYear / 256;
        result[1] = (byte)mRemainder;

        int mMonth = Calendar.getInstance().get(Calendar.MONTH) + 1;
        result[2] = (byte)mMonth;

        int mDay = Calendar.getInstance().get(Calendar.DAY_OF_MONTH);
        result[3] = (byte)mDay;

        int mHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        result[4] = (byte)mHour;

        int mMinute = Calendar.getInstance().get(Calendar.MINUTE);
        result[5] = (byte)mMinute;

        int mSeconds = Calendar.getInstance().get(Calendar.SECOND);
        result[6] = (byte)mSeconds;

        int mFraction = 0;
        result[7] = (byte)mFraction;

        result[8] = (byte)1;
        result[8] = (byte)(result[8] << 1);

        return result;
    }

    public static byte[] TimeZoneToByteArr() {
        byte[] result = new byte[2];

        int timezone = Calendar.getInstance().get(Calendar.ZONE_OFFSET) / 1000 / 60 / 15;
        int dstOffset = Calendar.getInstance().get(Calendar.DST_OFFSET) / 1000 / 60 / 15;

        result[0] = (byte)(timezone);
        result[1] = (byte)dstOffset;

        return result;
    }

    public static byte[] getUpdateStepGoalByteArray(Integer stepGoal) {
        return ByteBuffer.allocate(10)
                .order(ByteOrder.LITTLE_ENDIAN)
                .put((byte) 0) // status byte is irrelevant when setting step goal
                .putInt(stepGoal)
                .array();
    }

    public static BleCommandEnum GetCommandForStepCountRead(int dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.SUNDAY:
                return BleCommandEnum.GET_STEP_COUNTER_SUN;
            case Calendar.MONDAY:
                return BleCommandEnum.GET_STEP_COUNTER_MON;
            case Calendar.TUESDAY:
                return BleCommandEnum.GET_STEP_COUNTER_TUE;
            case Calendar.WEDNESDAY:
                return BleCommandEnum.GET_STEP_COUNTER_WED;
            case Calendar.THURSDAY:
                return BleCommandEnum.GET_STEP_COUNTER_THU;
            case Calendar.FRIDAY:
                return BleCommandEnum.GET_STEP_COUNTER_FRI;
            case Calendar.SATURDAY:
                return BleCommandEnum.GET_STEP_COUNTER_SAT;
            default:
                return null;
        }
	}
}
