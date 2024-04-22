package com.lifeplus.Pojo;

import com.google.gson.annotations.SerializedName;

public class DatabaseTunnel {
    @SerializedName("databaseTunnel")
    DbQueries dbQueries;

    public DbQueries getDbQueries() {
        return dbQueries;
    }
}
