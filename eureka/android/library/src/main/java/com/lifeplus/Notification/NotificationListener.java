package com.lifeplus.Notification;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.ContactsContract;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;

import androidx.core.content.ContextCompat;

import com.lifeplus.Ble.BleDevice;
import com.lifeplus.Ble.BleServices;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.BroadcastEnum;

import java.util.Calendar;

public class NotificationListener extends BroadcastReceiver {

    public NotificationListener() {
    }

    PhoneStatListener _phoneStateListener;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) {
            return;
        }
        String mActionStr = intent.getAction();
        if (mActionStr == null) {
            return;
        }

        BroadcastEnum mAction = BroadcastEnum.getBroadcastEnum(mActionStr);
        switch (mAction) {
            case SMS_RECEIVED: // TODO
//                Bundle bundle = intent.getExtras();
//                if (bundle != null) {
//                    try {
//                        SmsMessage[] msgs = Telephony.Sms.Intents.getMessagesFromIntent(intent);
//                        for (SmsMessage mMessage : msgs) {
//                            byte[] mFinalArray = createNotificationByteArray("MESSAGE", mMessage.getOriginatingAddress(), mMessage.getMessageBody());
//                            writeNotificationsCharactristics(mFinalArray);
//                        }
//                    } catch (Exception e) {
//                        Log.e("Exception", e.getMessage());
//                    }
//                }
                break;
            case PHONE_STATE:
                TelephonyManager telephony = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
                if (_phoneStateListener == null) {
                    _phoneStateListener = new PhoneStatListener(context);
                    telephony.listen(_phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
                }
                break;
            case UNKNOWN:
                break;
        }
    }
}

class PhoneStatListener extends PhoneStateListener {
    Context _context;
    private boolean ring = false;
    private boolean callReceived = false;
    private int currentState = 0;

    public PhoneStatListener(Context context) {
        this._context = context;
    }

    @Override
    public void onCallStateChanged(int state, String incomingNumber) {
        super.onCallStateChanged(state, incomingNumber);

        byte[] mFinalArray = null;
        switch (state) {
            case TelephonyManager.CALL_STATE_IDLE:
                if (ring && !callReceived) {
                    if (currentState != TelephonyManager.CALL_STATE_IDLE) {
                        sendCallNotificationToWatch("MISSED CALL", incomingNumber);
                        currentState = TelephonyManager.CALL_STATE_IDLE;
                    }
                    ring = false;
                }
                callReceived = false;
                break;
            case TelephonyManager.CALL_STATE_RINGING:
                ring = true;
                if (currentState != TelephonyManager.CALL_STATE_RINGING) {
                    sendCallNotificationToWatch("INCOMING CALL", incomingNumber);
                    currentState = TelephonyManager.CALL_STATE_RINGING;
                }
                break;
            case TelephonyManager.CALL_STATE_OFFHOOK:
                if (ring) {
                    callReceived = true;
                }
                if (currentState != TelephonyManager.CALL_STATE_OFFHOOK) {
                    currentState = TelephonyManager.CALL_STATE_OFFHOOK;
                }
                break;
            default:
                break;
        }
    }

    private void sendCallNotificationToWatch(String message, String number) {
        if (BleDevice._blueToothGatt != null && BleServices.getCurrentProc() == BleProcEnum.NONE) {
            byte[] mFinalArray;

            int mContactPermission = ContextCompat.checkSelfPermission(_context, Manifest.permission.READ_CONTACTS);
            String mContactName = null;
            if (mContactPermission == PackageManager.PERMISSION_GRANTED) {
                mContactName = getContactName(_context, number);
            }

            String content = mContactName != null ? mContactName : "Unknown Caller";

            mFinalArray = NotificationUtils.createNotificationByteArray(message, number, content, Calendar.getInstance());
            NotificationUtils.writeNotificationsCharacteristic(mFinalArray);
        } else if (BleDevice._blueToothGatt != null) {
            Handler mainHandler = new Handler(Looper.getMainLooper());
            mainHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    sendCallNotificationToWatch(message, number);
                }
            }, 1000);
        }
    }

    public String getContactName(Context context, String phoneNumber) {
        try {
            ContentResolver mContentResolver = context.getContentResolver();
            Uri mUri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(phoneNumber));
            Cursor mCursor = mContentResolver.query(mUri, new String[]{ContactsContract.PhoneLookup.DISPLAY_NAME}, null, null, null);
            if (mCursor == null) {
                return null;
            }
            String mContactName = null;
            if (mCursor.moveToFirst()) {
                mContactName = mCursor.getString(mCursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME));
            }

            if (!mCursor.isClosed()) {
                mCursor.close();
            }
            return mContactName;
        } catch (Exception ex) {
            return null;
        }
    }
}
