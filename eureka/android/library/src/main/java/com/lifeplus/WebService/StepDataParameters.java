package com.lifeplus.WebService;
import com.google.gson.annotations.SerializedName;

public class StepDataParameters {

    @SerializedName("userId")
    int userId;
    @SerializedName("count")
    int count;
    @SerializedName("ts")
    String ts;
    @SerializedName("measurementTime")
    String measurementTime;
}
