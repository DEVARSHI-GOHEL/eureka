package com.lifeplus.Pojo.Responses;

import com.lifeplus.Pojo.Enum.ResultCodeEnum;

import java.util.HashMap;

public class ResponseBase {
    protected final ResultCodeEnum _resultCode;
    protected final String _message;
    protected final String _simuId;

    protected ResponseBase(ResultCodeEnum pErrorCode) {
        _resultCode = pErrorCode;
        _message = "";
        _simuId = "";
    }

    protected ResponseBase(ResultCodeEnum pErrorCode, String pMessage) {
        _resultCode = pErrorCode;
        _message = (pMessage != null) ? pMessage : "";
        _simuId = "";
    }

    protected ResponseBase(String pSimuId, String pSimuMessage) {
        _resultCode = null;
        _message = (pSimuMessage != null) ? pSimuMessage : "";
        _simuId = (pSimuId != null) ? pSimuId : "";
    }

    protected HashMap<String, Object> getResponseMap() {
        HashMap<String, Object> result = new HashMap<>();
        result.put( "status", (_resultCode != null) ? _resultCode.getType() : "failed" );
        result.put( "result", ((_simuId.isEmpty()) ? ((_resultCode != null) ? _resultCode.getCode() : "") : _simuId));
        result.put( "message", ((_simuId.isEmpty()) ? ((_resultCode != null) ? _resultCode.getCode() + ": " + _resultCode.getDesc() + ((_message.isEmpty()) ? "" : " (" + _message + ")") : _message ) : _message));

        return result;
    }

    public String getResponseStr() {
        return "";
    }

    public ResultCodeEnum getResultCode() {
        return _resultCode;
    }
}
