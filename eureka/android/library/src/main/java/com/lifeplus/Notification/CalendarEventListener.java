package com.lifeplus.Notification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.CalendarContract;
import android.util.Log;

import com.lifeplus.Ble.BleDevice;
import com.lifeplus.Ble.BleServices;
import com.lifeplus.Pojo.Enum.BleProcEnum;
import com.lifeplus.Pojo.Enum.BroadcastEnum;

import java.util.Calendar;
import java.util.Date;

public class CalendarEventListener extends BroadcastReceiver {

    public CalendarEventListener() {}

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
            case CALENDAR_EVENT:
                if (intent.getAction().equalsIgnoreCase(CalendarContract.ACTION_EVENT_REMINDER)) {
                    Log.i("CalendarEventListener", "Received Calendar event");
                    Uri uri = intent.getData();
                    if (uri == null) {
                        Log.w("CalendarEventListener", "Event reminder does not contain calendar details");
                        return;
                    }
                    String alertTime = uri.getLastPathSegment();
                    String selection = CalendarContract.CalendarAlerts.ALARM_TIME + " = ?";

                    Cursor alertCursor = null;
                    Cursor eventCursor = null;
                    try {
                        alertCursor = context.getContentResolver().query(
                                CalendarContract.CalendarAlerts.CONTENT_URI_BY_INSTANCE,
                                new String[]{CalendarContract.CalendarAlerts.EVENT_ID},
                                selection,
                                new String[]{alertTime},
                                null
                        );
                        if (alertCursor != null && alertCursor.getCount() > 0) {
                            alertCursor.moveToFirst();
                            long eventId = alertCursor.getLong(alertCursor.getColumnIndex(CalendarContract.CalendarAlerts.EVENT_ID));

                            eventCursor = context.getContentResolver().query(
                                    CalendarContract.Events.CONTENT_URI, new String[]{
                                            CalendarContract.Events.TITLE,
                                            CalendarContract.Events.DTSTART,
                                            CalendarContract.Events.EVENT_LOCATION,
                                            CalendarContract.Events.DESCRIPTION
                                    },
                                    CalendarContract.Events._ID + " = ?",
                                    new String[]{Long.toString(eventId)},
                                    null
                            );

                            if (eventCursor != null && eventCursor.getCount() > 0) {
                                eventCursor.moveToFirst();
                                String title = eventCursor.getString(eventCursor.getColumnIndex(CalendarContract.Events.TITLE));
                                long startDateMs = eventCursor.getLong(eventCursor.getColumnIndex(CalendarContract.Events.DTSTART));
                                String location = eventCursor.getString(eventCursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION));
                                String description = eventCursor.getString(eventCursor.getColumnIndex(CalendarContract.Events.DESCRIPTION));
                                Date startDate = new Date(startDateMs);
                                sendCalendarEventNotificationToWatch(title, location, description, startDate);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    } finally {
                        if(alertCursor != null) alertCursor.close();
                        if(eventCursor != null) eventCursor.close();
                    }
                }
                break;
            case UNKNOWN:
                break;
        }
    }

    private void sendCalendarEventNotificationToWatch(String eventName, String location, String notes, Date dateOfEvent) {
        if (BleDevice._blueToothGatt != null && BleServices.getCurrentProc() == BleProcEnum.NONE) {
            byte[] mFinalArray;
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(dateOfEvent);
            mFinalArray = NotificationUtils.createNotificationByteArray(eventName, location, notes, calendar);
            NotificationUtils.writeNotificationsCharacteristic(mFinalArray);
        } else if (BleDevice._blueToothGatt != null) {
            Handler mainHandler = new Handler(Looper.getMainLooper());
            mainHandler.postDelayed(
                    () -> sendCalendarEventNotificationToWatch(
                            eventName,
                            location,
                            notes,
                            dateOfEvent
                    ),
                    1000
            );
        }
    }
}
