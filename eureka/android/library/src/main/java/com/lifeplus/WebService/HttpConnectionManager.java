package com.lifeplus.WebService;

import android.util.Log;

import com.google.gson.Gson;
import com.lifeplus.Pojo.LoggerStruct;
import com.lifeplus.Pojo.OpenWeatherStruct;
import com.lifeplus.Util.LpLogger;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpConnectionManager {
    public static OpenWeatherStruct openWeather(String pLat, String pLng, String pWeatherUnit){
        OpenWeatherStruct mWeatherData = new OpenWeatherStruct();
        try {
            String strUrl = "https://api.openweathermap.org/data/3.0/onecall?appid=5dda89eaa61f71e16049178d932ddafc&lat="+pLat+"&lon="+pLng+"&exclude=minutely,alerts&units="+pWeatherUnit;
            URL url = new URL( strUrl );
            HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setReadTimeout( 20000 );
            urlConnection.setConnectTimeout( 25000 );
            urlConnection.setRequestProperty("Host", "api.openweathermap.org");
            urlConnection.setRequestMethod( "GET" );
            InputStream iStream;
            urlConnection.connect();
            int responseStatusCode = urlConnection.getResponseCode();
            if (responseStatusCode == HttpURLConnection.HTTP_OK) {
                iStream = urlConnection.getInputStream();
                String response = convertStreamToString( iStream );
                mWeatherData = new Gson().fromJson(response, OpenWeatherStruct.class);
//                if (mWeatherData.getWeather().size() > 0) {
//                    HashMap<String, Object> mCurrWeather = mWeatherData.getWeather().get(0);
//                    LpLogger.lpToast(pContext, "Weather condition at (" + pLat + ", " + pLng + "): " + mCurrWeather.get("main") + " (" + mCurrWeather.get("description"));
//                } else {
//                    LpLogger.lpToast(pContext, "Unable to get weather in required format");
//                }
            }
        } catch (Exception e){
            LpLogger.logError(new LoggerStruct("openWheather", "HttpConnectionManager",
                    "Exception in reading weather data."));
            Log.e("Error", e.getLocalizedMessage());
        }
        return mWeatherData;
    }

    private static String convertStreamToString(InputStream inputStream) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(inputStream));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
