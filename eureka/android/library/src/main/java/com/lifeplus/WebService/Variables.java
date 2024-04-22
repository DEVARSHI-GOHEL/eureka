package com.lifeplus.WebService;

import com.google.gson.annotations.SerializedName;

import java.util.HashMap;

public class Variables {
    @SerializedName("userId")
    int userId;
    @SerializedName("deviceMSN")
    String deviceMSN;
    @SerializedName("type")
    int type;
    @SerializedName("ts")
    String ts;
    @SerializedName("data")
    String data;
    @SerializedName("vitals")
    HashMap<String,HashMap<String,Object>> mVitals;
    @SerializedName("measurementTime")
    String measurementTime;
}