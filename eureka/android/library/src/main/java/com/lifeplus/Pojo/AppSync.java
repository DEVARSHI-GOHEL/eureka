package com.lifeplus.Pojo;

import com.lifeplus.Util.LpUtility;

public class AppSync {
    public static int packetLen = 10;

    private String birthDate;
    private Integer age;
    private Integer height_ft;
    private Integer height_in;
    private Float weight;
    private String weightUnit;
    private Integer ethnicity;
    private Integer skinTone;
    private String gender;
    private String autoMeasure;
    private Integer autoMeasureInterval;
    private String cgmModeOn;
    private Integer cgmUnit;
    private Integer weatherUnit = 1;
    private String powerSave;
    private String glucoseUnit;
    private boolean calculationOff = false;

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setHeight_ft(Integer height_ft) {
        this.height_ft = height_ft;
    }

    public Integer getHeight_ft() {
        return height_ft;
    }

    public void setHeight_in(Integer height_in) {
        this.height_in = height_in;
    }

    public Integer getHeight_in() {
        return height_in;
    }

    private int getHeightMilliMeters() {
        return (int) Math.floor(((height_ft * 12 * 0.0254) + (height_in * 0.0254)) * 1000);
    }

    public Float getWeight() {
        return weight;
    }

    public void setWeight(Float weight) {
        this.weight = weight;
    }

    private float getWeightKg() {
        if ("MKS".equals(weightUnit)) {
            return weight;
        } else {
            return weight / 2.205f;
        }
    }

    public String getWeightUnit() {
        return weightUnit;
    }

    public void setWeightUnit(String weightUnit) {
        this.weightUnit = weightUnit;
    }

    public Integer getEthnicity() {
        return ethnicity;
    }

    public void setEthnicity(Integer ethnicity) {
        this.ethnicity = ethnicity;
    }

    public Integer getSkinTone() {
        return skinTone;
    }

    public void setSkinTone(Integer skinTone) {
        this.skinTone = skinTone;
    }


    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public boolean getAutoMeasure() {
        return ("Y".equalsIgnoreCase(autoMeasure));
    }

    public void setAutoMeasure(String autoMeasure) {
        this.autoMeasure = autoMeasure;
    }

    public Integer getAutoMeasureInterval() {
        return autoMeasureInterval;
    }

    public void setAutoMeasureInterval(Integer autoMeasureInterval) {
        this.autoMeasureInterval = autoMeasureInterval;
    }

    public String getCgmModeOn() {
        return cgmModeOn;
    }

    public void setCgmModeOn(String cgmModeOn) {
        this.cgmModeOn = cgmModeOn;
    }

    public Integer getCgmUnit() {
        return cgmUnit;
    }

    public void setCgmUnit(Integer cgmUnit) {
        this.cgmUnit = cgmUnit;
    }

    public int getWeatherUnit() {
        return weatherUnit;
    }

    public void setWeatherUnit(int weatherUnit) {
        this.weatherUnit = weatherUnit;
    }

    public String getPowerSave() {
        return powerSave;
    }

    public void setPowerSave(String powerSave) {
        this.powerSave = powerSave;
    }

    public String getGlucoseUnit() {
        return glucoseUnit;
    }

    public void setGlucoseUnit(String glucoseUnit) {
        this.glucoseUnit = glucoseUnit;
    }

    public void setCalculationOff(boolean isOff) {
        this.calculationOff = isOff;
    }

    public byte[] toByteArray() {
        byte[] data = new byte[packetLen];
        if (this.getAutoMeasure()) {
            data[0] = (byte) (data[0] | 0x01);
        } else {
            data[0] = (byte) (data[0] & 0xFE);
        }

        if ("mg/dL".equals(this.getGlucoseUnit())) {
            data[0] = (byte) (data[0] | (0x01 << 3));
        } else {
            data[0] = (byte) (data[0] & ~(0x01 << 3));
        }

        if (this.calculationOff) {
            data[0] = (byte) (data[0] | 0x20);
        } else {
            data[0] = (byte) (data[0] & 0xDF);
        }

        if (this.getAutoMeasureInterval() != null) {
            data[1] = this.getAutoMeasureInterval().byteValue();
        }

        if (this.getAge() != null) {
            data[2] = this.getAge().byteValue();
        }

        if (this.getWeight() != null) {
            float mWeightFloat = this.getWeightKg() * 1000 / 5;
            byte[] mWeight = LpUtility.intToByteArr(Math.round(mWeightFloat));
            data[3] = mWeight[0];
            data[4] = mWeight[1];
        }

        if ((this.getHeight_ft() != null) && (this.getHeight_in() != null)) {
            byte[] mHeight = LpUtility.intToByteArr(this.getHeightMilliMeters());
            data[5] = mHeight[0];
            data[6] = mHeight[1];
        }

        if (this.getEthnicity() != null) {
            data[7] = this.getEthnicity().byteValue();
        }

        switch (this.gender) {
            case "M":
                data[8] = 0;
                break;
            case "F":
                data[8] = 1;
                break;
            default:
                data[8] = 2;
                break;
        }

        if (data.length > 9) {
            data[9] = this.getSkinTone() != null ? this.getSkinTone().byteValue() : 3;
        }

        return data;
    }
}
