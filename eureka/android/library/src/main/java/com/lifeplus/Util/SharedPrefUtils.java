package com.lifeplus.Util;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedPrefUtils {

    public static String getString(Context context, String key) {
        SharedPreferences prefs = context.getSharedPreferences(context.getPackageName(), Context.MODE_PRIVATE);
        return prefs.getString(key, "");
    }

    public static void saveString(Context context, String key, String value) {
        SharedPreferences prefs = context.getSharedPreferences(context.getPackageName(), Context.MODE_PRIVATE);
        SharedPreferences.Editor edit = prefs.edit();
        edit.putString(key, value);
        edit.apply();
    }
}
