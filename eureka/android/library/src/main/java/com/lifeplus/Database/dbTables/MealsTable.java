package com.lifeplus.Database.dbTables;

public class MealsTable {
    public static final String TABLE_NAME = "meals";

    public static class Cols {
        public static final String ID = "Id";
        public static final String SESSION_ID = "session_id";
        public static final String TIME = "time";
        public static final String TYPE = "type";
        public static final String UPDATE_DATE = "update_date";
        public static final String UPLOAD_DATE = "upload_date";

        public static final String MEALTYPE = "mealtype";
        public static final String UTCYEAR = "utcyear";
        public static final String UTCMONTH = "utcmonth";
        public static final String UTCDAY = "utcday";
        public static final String UTCHOUR = "utchour";
        public static final String UTCMINUTE = "utcminute";
        public static final String UTCSECOND = "utcsecond";
        public static final String NOTTAKENMEAL = "notTakenMeal";
        public static final String DETAILS = "details";
    }
}
