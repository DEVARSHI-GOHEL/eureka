package com.lifeplus.Pojo;

import java.util.Date;

public class UserSessionStruct {
    private final String id;
    private final String user_id;
    private final String device_id;
    private final Date login_date;
    private final Date logout_date;
    private final String auth_token;
    private final String refresh_token;
    private final String gateway_token;

    public UserSessionStruct(String pId, String pUserId, String pDeviceId, Date pLoginDate, Date pLogoutDate,
                             String pAuthToken, String pRefreshToken, String pGatewayToken) {
        id = pId;
        user_id = pUserId;
        device_id = pDeviceId;
        login_date = pLoginDate;
        logout_date = pLogoutDate;
        auth_token = pAuthToken;
        refresh_token = pRefreshToken;
        gateway_token = pGatewayToken;
    }

    public String getSessionId() {
        return id;
    }

    public String getUserId() {
        return user_id;
    }

    public String getDeviceId() {
        return device_id;
    }

    public Date getLoginDate() {
        return login_date;
    }

    public Date getLogoutDate() {
        return logout_date;
    }

    public String getAuthToken() {
        return auth_token;
    }

    public String getRefreshToken() {
        return refresh_token;
    }

    public String getGatewayToken() {
        return gateway_token;
    }
}
