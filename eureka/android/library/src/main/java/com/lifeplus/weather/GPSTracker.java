package com.lifeplus.weather;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.lifeplus.Util.ErrorLogger;

import java.util.ArrayList;

public class GPSTracker implements LocationListener {
    private Location _location;
    private static final long MIN_DISTANCE_CHANGE_FOR_UPDATES = 150; // 150 meters
    private static final long MIN_TIME_BW_UPDATES = 1000 * 60 * 10; // 10 minutes

    public GPSTracker() {
    }

    public void startLocationUpdates(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        try {
            if (context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                ErrorLogger.log("Missing location permission, location updates will not be received.");
            } else {
                ArrayList<String> selectedProviders = new ArrayList<>();
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    if (locationManager.isProviderEnabled(LocationManager.FUSED_PROVIDER)) {
                        selectedProviders.add(LocationManager.FUSED_PROVIDER);
                    }
                }
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    selectedProviders.add(LocationManager.GPS_PROVIDER);
                }
                if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    selectedProviders.add(LocationManager.NETWORK_PROVIDER);
                }
                if (selectedProviders.isEmpty()) {
                    selectedProviders.add(LocationManager.PASSIVE_PROVIDER);
                }

                Handler handler = new Handler(Looper.getMainLooper());
                for (final String provider : selectedProviders) {
                    handler.post(() -> {
                        locationManager.requestLocationUpdates(
                                provider,
                                MIN_TIME_BW_UPDATES,
                                MIN_DISTANCE_CHANGE_FOR_UPDATES,
                                this
                        );
                    });
                    if (_location == null) {
                        _location = locationManager.getLastKnownLocation(provider);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(this.getClass().getName(), "Exception in getting location updates" + e.getMessage());
            ErrorLogger.log(e.getLocalizedMessage());
        }
    }

    public void stopLocationUpdates(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        locationManager.removeUpdates(this);
    }

    public Location getCurrentLocation() {
        return this._location;
    }

    public void onLocationChanged(Location location) {
        if (location != null) {
            this._location = location;
        }
    }
}
