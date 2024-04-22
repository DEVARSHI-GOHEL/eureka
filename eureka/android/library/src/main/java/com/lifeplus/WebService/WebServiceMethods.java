package com.lifeplus.WebService;

import com.google.gson.Gson;
import com.lifeplus.Util.Global;

public class WebServiceMethods {
    public static String createUploadDataRequest(String pData, String pMeasureTime) {
        String mRequest = null;
        try {
            String mQuery = "\"query\": \"mutation upload($userId:Int,$deviceMSN:String,$ts:String,$measurementTime: String,$type:Int,$data:String){uploadDeviceData(userId:$userId,deviceMSN:$deviceMSN,ts:$ts,measurementTime: $measurementTime,type:$type,data:$data){statusCode body}}\"";

            Variables mVariable = new Variables();
            mVariable.userId = Global.getUserId();
            mVariable.deviceMSN = Global.getWatchMSN();
            mVariable.ts = String.valueOf(System.currentTimeMillis());  //"1566901254292";
            mVariable.type = 2;
            mVariable.data = pData;
            mVariable.measurementTime = pMeasureTime;
            String mData = new Gson().toJson(mVariable).replaceAll("\u0027","'");
            String mVariables = "\"variables\"" + ":" + mData ;
            mRequest = "{" + mQuery + "," + mVariables + "}";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mRequest;
    }

    public static String createMealsUploadDataRequest(int pType, long pTimeStamp) {
        String mRequest = null;
        try {
            String mQuery = "\"query\": \"mutation MyMutation($userId: Int, $timestamp: String, $size: Int, $notTakenMeal: Boolean, $details: String){addMeals(details: $details, notTakenMeal: $notTakenMeal, size: $size, timestamp: $timestamp, userId: $userId) {body statusCode}}\"";

            MealDataParameters mVariable = new MealDataParameters();
            mVariable.userId = Global.getUserId();
            mVariable.timestamp = pTimeStamp;  //"1566901254292";
            mVariable.size = pType;
            mVariable.notTakenMeal = false; //always false, commented checkbox in AddMealScreen.js
            mVariable.details = "";
            String mData = new Gson().toJson(mVariable).replaceAll("\u0027","'");
            String mVariables = "\"variables\"" + ":" + mData ;
            mRequest = "{" + mQuery + "," + mVariables + "}";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mRequest;
    }

    public static String createStepsUploadDataRequest(int stepsCount, long stepsTime) {
        String mRequest = null;
        try {
            String mQuery = "\"query\": \"mutation MyMutation($userId: Int, $ts: String, $count: Int) {addStepCount(count: $count, ts: $ts, userId: $userId) {body statusCode}}\"";

            StepDataParameters mVariable = new StepDataParameters();
            mVariable.userId = Global.getUserId();
            mVariable.ts =  String.valueOf(stepsTime);  //"1566901254292";
            mVariable.count = stepsCount;
            String mData = new Gson().toJson(mVariable).replaceAll("\u0027","'");
            String mVariables = "\"variables\"" + ":" + mData ;
            mRequest = "{" + mQuery + "," + mVariables + "}";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mRequest;
    }

    public static String createUploadRawDataRequest(String pData, long pMeasureTime) {
        String mRequest = null;
        try {
            String mQuery = "\"query\": \"mutation upload($userId:Int,$deviceMSN:String,$ts:String,$measurementTime: String,$type:Int,$data:String){uploadDeviceData(userId:$userId,deviceMSN:$deviceMSN,ts:$ts,measurementTime: $measurementTime,type:$type,data:$data){statusCode body}}\"";

            Variables mVariable = new Variables();
            mVariable.userId = Global.getUserId();
            mVariable.deviceMSN = Global.getWatchMSN();
            mVariable.ts = String.valueOf(System.currentTimeMillis());  //"1566901254292";
            mVariable.type = 6;
            mVariable.data = pData;
            mVariable.measurementTime = String.valueOf(pMeasureTime);
            String mData = new Gson().toJson(mVariable).replaceAll("\u0027","'");
            String mVariables = "\"variables\"" + ":" + mData ;
            mRequest = "{" + mQuery + "," + mVariables + "}";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mRequest;
    }
}
