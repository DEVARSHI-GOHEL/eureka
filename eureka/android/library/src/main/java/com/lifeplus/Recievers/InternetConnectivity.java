package com.lifeplus.Recievers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import com.lifeplus.OfflineUpload.OfflineCloudUpload;

public class InternetConnectivity extends BroadcastReceiver {

    @Override
    public void onReceive(final Context context, final Intent intent) {
        if (isNetworkAvailable(context)) {
            new OfflineCloudUpload( context );
        }
    }

    public static boolean isNetworkAvailable(Context pCon) {
        ConnectivityManager connectivityManager = (ConnectivityManager) pCon.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }
}
