package com.lifeplus.Events;

import com.lifeplus.Pojo.Enum.NoParamEventEnum;

public class NoParamEvent implements EventBase {
    private final NoParamEventEnum _purpose;

    public NoParamEvent(NoParamEventEnum pPurpose) {
        _purpose = pPurpose;
    }

    public NoParamEventEnum getPurpose() {
        return _purpose;
    }

    @Override
    public String getData() {
        return "";
    }
}
