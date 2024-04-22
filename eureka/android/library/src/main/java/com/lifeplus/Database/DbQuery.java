package com.lifeplus.Database;

public class DbQuery {
    private final DbQueryType _type;
    private final String _name;
    private final String _query;

    public DbQuery(DbQueryType pQueryType, String pName, String pQuery) {
        _type = pQueryType;
        _name = pName;
        _query = pQuery;
    }

    public DbQueryType getType() {
        return _type;
    }

    public String getQuery() {
        return _query;
    }

    public String getName() {
        return _name;
    }
}
