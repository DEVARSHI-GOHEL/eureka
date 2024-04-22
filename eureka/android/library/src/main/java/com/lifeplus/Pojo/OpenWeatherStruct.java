package com.lifeplus.Pojo;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.HashMap;

public class OpenWeatherStruct {
    @SerializedName("lat")
    private float lat;

    @SerializedName("lon")
    private float lon;

    @SerializedName("timezone")
    private String timezone;

    @SerializedName("timezone_offset")
    private long offset;

    @SerializedName("current")
    private HashMap<String, Object> current;

    @SerializedName("hourly")
    private ArrayList<HashMap<String, Object>> hourly;

    @SerializedName("daily")
    private ArrayList<HashMap<String, Object>> daily;

    public float getLat() {
        return lat;
    }

    public void setLat(float lat) {
        this.lat = lat;
    }

    public float getLon() {
        return lon;
    }

    public void setLon(float lon) {
        this.lon = lon;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public long getOffset() {
        return offset;
    }

    public void setOffset(long offset) {
        this.offset = offset;
    }

    public HashMap<String, Object> getCurrent() {
        return current;
    }

    public void setCurrent(HashMap<String, Object> current) {
        this.current = current;
    }

    public ArrayList<HashMap<String, Object>> getHourly() {
        return hourly;
    }

    public void setHourly(ArrayList<HashMap<String, Object>> hourly) {
        this.hourly = hourly;
    }

    public ArrayList<HashMap<String, Object>> getDaily() {
        return daily;
    }

    public void setDaily(ArrayList<HashMap<String, Object>> daily) {
        this.daily = daily;
    }
}