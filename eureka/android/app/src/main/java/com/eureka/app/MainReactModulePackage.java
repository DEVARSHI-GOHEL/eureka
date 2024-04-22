package com.eureka.app;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.google.firebase.crashlytics.CustomKeysAndValues;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import com.lifeplus.LifePlusReactModule;
import com.lifeplus.Util.ErrorLoggerProvider;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class MainReactModulePackage implements ReactPackage {
    private final ErrorLoggerProvider provider = new ErrorLoggerProvider() {
        @Override
        public void log(String message) {
            FirebaseCrashlytics.getInstance().log(message);
        }
        @Override
        public void setKeys(Map<String, String> keysAndValues) {
            CustomKeysAndValues.Builder builder = new CustomKeysAndValues.Builder();
            keysAndValues.forEach(builder::putString);
            FirebaseCrashlytics.getInstance().setCustomKeys(builder.build());
        }
        @Override
        public void setKey(String key, String value) {
            FirebaseCrashlytics.getInstance().setCustomKey(key, value);
        }
        @Override
        public void recordException(Throwable throwable) {
            FirebaseCrashlytics.getInstance().recordException(throwable);
        }
    };

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {

        List<NativeModule> modules = new ArrayList<>();

        modules.add(new LifePlusReactModule(reactContext, provider));
        return modules;

    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
