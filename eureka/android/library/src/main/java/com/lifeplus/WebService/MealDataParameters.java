package com.lifeplus.WebService;

import com.google.gson.annotations.SerializedName;

public class MealDataParameters {

    @SerializedName("userId")
    int userId;

    @SerializedName("size")
    int size;

    @SerializedName("timestamp")
    long timestamp;

    @SerializedName("details")
    String details;

    @SerializedName("notTakenMeal")
    Boolean notTakenMeal;

}

