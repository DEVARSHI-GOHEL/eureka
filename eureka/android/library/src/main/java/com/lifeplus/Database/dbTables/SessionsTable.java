package com.lifeplus.Database.dbTables;

public class SessionsTable {
    public static final String TABLE_NAME = "sessions";

    public static class Cols {
        public static final String ID = "id";
        public static final String USER_ID = "user_id";
        public static final String DEVICE_ID = "device_id";
        public static final String LOGIN_DATE = "login_date";
        public static final String LOGOUT_DATE = "logout_date";
        public static final String AUTH_TOKEN = "auth_token";
        public static final String REFRESH_TOKEN = "refresh_token";
        public static final String GATEWAY_TOKEN = "gateway_token";
    }
}
