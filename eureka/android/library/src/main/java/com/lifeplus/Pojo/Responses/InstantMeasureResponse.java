package com.lifeplus.Pojo.Responses;

import com.google.gson.Gson;
import com.lifeplus.Pojo.Enum.ResultCodeEnum;

import java.util.HashMap;

public class InstantMeasureResponse extends ResponseBase {
    private String _userId = "";
    private String _authId = "";

    public InstantMeasureResponse(ResultCodeEnum pResponseCode) {
        super(pResponseCode);
    }

    public InstantMeasureResponse(ResultCodeEnum pResponseCode, String pMessage) {
        super(pResponseCode, pMessage);
    }

/*
    public CalibrationResponse(String pMessage) {
        super(pMessage);
    }
*/

    public InstantMeasureResponse(String pSimuId, String pSimuMessage) {
        super(pSimuId, pSimuMessage);
    }

    @Override
    public String getResponseStr() {
        HashMap<String, Object> mResultMap = new HashMap<>();

        HashMap<String, Object> result = getResponseMap();
        HashMap<String, String> mData = new HashMap<>();
        mData.put( "userId", _userId );
        mData.put( "AuthenticationId", _authId );
        result.put( "data", mData );

        mResultMap.put( "result",  result);
        return new Gson().toJson( mResultMap );
    }

    public String getUserId() {
        return _userId;
    }

    public void setUserId(String pUserId) {
        _userId = pUserId;
    }

    public String getAuthId() {
        return _authId;
    }

    public void setAuthId(String pAuthId) {
        _authId = pAuthId;
    }
}
