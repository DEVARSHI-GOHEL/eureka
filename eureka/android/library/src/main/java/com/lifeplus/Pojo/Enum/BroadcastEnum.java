package com.lifeplus.Pojo.Enum;

public enum BroadcastEnum {
    SMS_RECEIVED("android.provider.Telephony.SMS_RECEIVED".toUpperCase()),
    PHONE_STATE("android.intent.action.PHONE_STATE".toUpperCase()),
    CALENDAR_EVENT("android.intent.action.EVENT_REMINDER".toUpperCase()),
    UNKNOWN("");

    private String _action;

    BroadcastEnum(String pAction){
        _action = pAction;
    }

    String getStr() {
        return _action;
    }

    public static BroadcastEnum getBroadcastEnum(String pAction){
        BroadcastEnum result = BroadcastEnum.UNKNOWN;
        for (BroadcastEnum mAction : BroadcastEnum.values()) {
            if (mAction.getStr().equalsIgnoreCase(pAction)) {
                result = mAction;
                break;
            }
        }
        return result;
    }
}
