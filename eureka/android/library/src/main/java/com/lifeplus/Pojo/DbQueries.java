package com.lifeplus.Pojo;

import com.google.gson.annotations.SerializedName;

public class DbQueries {

    @SerializedName("queryName")
    String queryName;
    @SerializedName("queryType")
    String queryType;
    @SerializedName("query")
    String query;

    public String getQueryType() {
        return queryType.toLowerCase();
    }
    public String getQueryName() {
        return queryName;
    }
    public String getQuery() {
        return query;
    }
}
