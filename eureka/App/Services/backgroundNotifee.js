import notifee from '@notifee/react-native';
import {Platform} from 'react-native';
import i18n from "i18n-js";

const stateStatus = {
  channelId: null,
  isInBackground: false,
  prevNotification: [],
};

export const closeLocalNotificationByType = async (type) => {
  if (stateStatus.prevNotification?.[type]) {
    await notifee.cancelDisplayedNotification(stateStatus.prevNotification[type]);
  }
}

const setChannelId = async (channelId) => {
  if (Platform.OS === 'ios' || stateStatus.channelId) return true;
  
  stateStatus.channelId = await notifee.createChannel(channelId);

  return !!stateStatus.channelId;
};

export const switcherIsInBackground = (bool) => {
  stateStatus.isInBackground = bool;
};

export const watchNotifyHandler = async (notifyObj) => {
  if (!stateStatus.isInBackground) return;

  const { title, body, channelId, data, type } = notifyObj;

  closeLocalNotificationByType(type);

  if (!(await setChannelId(channelId))) return;
  stateStatus.prevNotification[type] = await notifee.displayNotification({
    title:i18n.t(title),
    body:i18n.t(body),
    data,
    android: {
      channelId: stateStatus.channelId,
      pressAction: {
        id: 'default',
      },
    },
  });
};
