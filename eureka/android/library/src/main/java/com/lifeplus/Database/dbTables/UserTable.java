package com.lifeplus.Database.dbTables;

public class UserTable {
    public static final String TABLE_NAME = "users";

    public static class Cols {
        public static final String ID = "id";
        public static final String NAME = "name";
        public static final String BIRTH_DATE = "birth_date";
        public static final String GENDER_ID = "gender_id";
        public static final String ETHNICITY_ID = "ethnicity_id";
        public static final String SKIN_TONE_ID = "skin_tone_id";
        public static final String ADDRESS = "address";

        public static final String COUNTRY = "country";
        public static final String ZIP = "zip";
        public static final String PASSWORD = "password";
        public static final String HEIGHT_FT = "height_ft";
        public static final String HEIGHT_IN = "height_in";
        public static final String WEIGHT = "weight";

        public static final String WEIGHT_UNIT = "weight_unit";
        public static final String TNC_DATE = "tnc_date";
        public static final String STEP_GOAL = "step_goal";
        public static final String HW_ID = "hw_id";
        public static final String GLUCOSE_UNIT = "glucose_unit";
        public static final String AUTO_MEASURE = "auto_measure";

        public static final String AUTO_FREQUENCY = "auto_frequency";
        public static final String SLEEP_TRACKING = "sleep_tracking";
        public static final String POWER_SAVE = "power_save";
        public static final String CGM_DEBUG = "cgm_debug";
        public static final String REGISTRATION_STATE = "registration_state";
        public static final String WEATHER_UNIT = "weather_unit";
        public static final String UPDATE_DATE = "update_date";
        public static final String UPLOAD_DATE = "upload_date";

        // calculated field
        public static final String AGE = "age";
        public static final String AGE_EXP = "cast(ifnull(strftime('%Y.%m%d', 'now') - strftime('%Y.%m%d', " + BIRTH_DATE + "), 0) as int) AS " + AGE;
    }
}
