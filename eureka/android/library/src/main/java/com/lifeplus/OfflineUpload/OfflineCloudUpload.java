package com.lifeplus.OfflineUpload;

import android.content.Context;
import android.os.AsyncTask;

import com.lifeplus.Database.DbAccess;
import com.lifeplus.EventEmittersToReact;
import com.lifeplus.LifePlusReactModule;

import java.util.ArrayList;
import java.util.HashMap;

public class OfflineCloudUpload {
    private DbAccess _dataBaseAccess;

    public OfflineCloudUpload(Context pCon) {
        if (EventEmittersToReact.getInstance().isReady()) {
            _dataBaseAccess = DbAccess.getInstance(pCon);
            uploadVitalData();
            uploadMealsData();
            uploadStepsData();
        }
    }

    private void uploadVitalData() {
        ArrayList<HashMap<String, Object>> mOfflineData = _dataBaseAccess.getOfflineMeasureData();
        if (mOfflineData.size() > 0) {
            for (int i = 0; i < mOfflineData.size(); i++) {
                final HashMap<String, Object> map = mOfflineData.get(i);
                final String measureTime = mOfflineData.get(i).get("measure_time") != null ? String.valueOf(mOfflineData.get(i).get("measure_time")) : "0";
                AsyncTask.execute(() -> LifePlusReactModule.uploadOnCloud(map, measureTime));
            }
            _dataBaseAccess.updateMeasurable(String.valueOf(System.currentTimeMillis()));
        }
    }

    private void uploadMealsData() {
        ArrayList<HashMap<String, Object>> mOfflineData = _dataBaseAccess.getOfflineMealsData();
        if (mOfflineData.size() > 0) {
            for (int i = 0; i < mOfflineData.size(); i++) {
                int finalI = i;
                AsyncTask.execute(() -> LifePlusReactModule.uploadMealsOnCloud(mOfflineData.get(finalI)));
            }
            _dataBaseAccess.updateMealsTable(String.valueOf(System.currentTimeMillis()));
        }
    }

    private void uploadStepsData() {
        ArrayList<HashMap<String, Object>> mOfflineData = _dataBaseAccess.getOfflineDataSteps();
        if (mOfflineData.size() > 0) {
            for (int i = 0; i < mOfflineData.size(); i++) {
                int finalI = i;
                AsyncTask.execute(() -> LifePlusReactModule.uploadStepsOnCloud(mOfflineData.get(finalI)));
            }
            _dataBaseAccess.updateStepsTable(String.valueOf(System.currentTimeMillis()));
        }
    }
}
