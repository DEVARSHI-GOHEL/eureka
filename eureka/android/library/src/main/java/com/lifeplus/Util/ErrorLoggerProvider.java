package com.lifeplus.Util;

import java.util.Map;

public interface ErrorLoggerProvider {
    void log(String message);
    void setKeys(Map<String, String> keysAndValues);
    void setKey(String key, String value);
    void recordException(Throwable throwable);
}
