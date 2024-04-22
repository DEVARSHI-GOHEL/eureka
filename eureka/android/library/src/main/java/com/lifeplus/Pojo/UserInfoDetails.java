package com.lifeplus.Pojo;

public class UserInfoDetails {
    private byte setting; // Setting to be set by program based on following setting values
    public byte getSetting() {
        return setting;
    }
    public byte setting_autoMeasureEnabled;
    public byte setting_mealConfirmationEnabled;
    public byte setting_vibrationEnabled;
    public byte setting_glucoseUnit;
    public byte setting_bleClass1;
    public byte setting_calculatingOff;

    private static final int position_autoMeasureEnabled = 0;
    private static final int position_mealConfirmationEnabled = 1;
    private static final int position_vibrationEnabled = 2;
    private static final int position_glucoseUnit = 3;
    private static final int position_bleClass1 = 4;
    private static final int position_calculatingOff = 5;

    public byte autoMeasurePeriod;
    public byte userAge;
    public short userWeight;
    public short userHeight;
    public byte userEtnicity;
    public byte userGender;

    public UserInfoDetails() {
        setting = 0;
    }

    private void UpdateBitPosition(int value, int position)
    {
        if (value == 1) {
            setting |= 1 << position;
        } else {
            setting |= ~(1 << position);
        }
    }

    public void UpdateSetting() {
        UpdateBitPosition(setting_autoMeasureEnabled,position_autoMeasureEnabled);
        UpdateBitPosition(setting_mealConfirmationEnabled,position_mealConfirmationEnabled);
        UpdateBitPosition(setting_vibrationEnabled,position_vibrationEnabled);
        UpdateBitPosition(setting_glucoseUnit,position_glucoseUnit);
        UpdateBitPosition(setting_bleClass1,position_bleClass1);
        UpdateBitPosition(setting_calculatingOff,position_calculatingOff);
    }
}
