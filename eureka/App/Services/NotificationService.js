import {API} from './API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SAVE_FCM_TOKEN_API} from '../Theme/Constant/Constant';
import messaging from '@react-native-firebase/messaging';
import {
  changeCGMDebugMode,
  changeDebugLogMode,
} from '../Notification/NotificationCommandHandler';
import DEBUG_LOGGER from '../utils/DebugLogger';
import {postWithAuthorization} from "./graphqlApi";

let FILE_NAME = 'NotificationService.js';

const getFcmToken = async (id) => {
  const fcmToken = await messaging().getToken();

  let userId = await AsyncStorage.getItem('user_id');

  if (fcmToken && id) {
    registerToken(fcmToken, id);
    console.log('Your Firebase Token is:', fcmToken);
  } else if (fcmToken && userId) {
    registerToken(fcmToken, userId);
    console.log('Your Firebase Token is:', fcmToken);
  } else {
    console.log('Failed', 'No token received');
    DEBUG_LOGGER("Couldn't Get Firebase Token", 'getFcmToken', FILE_NAME, '13');
  }
};

const registerToken = async (token, userId) => {
  try {
    const deviceMSN = await AsyncStorage.getItem('device_msn');
    const registerFirebaseToken = `mutation MyMutation($userId: Int, $deviceToken: String, $deviceMSN: String) {registerForPushNotification(deviceMSN: $deviceMSN, deviceToken: $deviceToken, userId: $userId) {body statusCode}}`;

    const response = await postWithAuthorization(
      SAVE_FCM_TOKEN_API,
      {
        query: registerFirebaseToken,
        variables: {
          userId,
          deviceToken: token,
          deviceMSN,
        },
      }
    );

    let statusCode = response.data.data.registerForPushNotification.statusCode
    if (statusCode === 200) {
      console.log('Device Token Registered');
      DEBUG_LOGGER(
        'Firebase Device Token Registered',
        'registerToken',
        FILE_NAME,
        '59',
      );
    } else if (statusCode === 502) {
      DEBUG_LOGGER(
        'Firebase Device Already Registered',
        'registerToken',
        FILE_NAME,
        '66',
      );
    } else {
      DEBUG_LOGGER(
        `Firebase Device Token Couldn't Registered`,
        'registerToken',
        FILE_NAME,
        '73',
      );
    }
  } catch (error) {
    console.log(error, 'Firebase Token Error');
    alert(
      `Lifeplus servers faced an error while completing this request. Please try again later.`,
    );
  }
};

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    getFcmToken();
    console.log('Authorization status:', authStatus);
  }
};

const getDataNotification = () => {
  messaging().onMessage(async (remoteMessage) => {
    DEBUG_LOGGER(`Got Notification`, 'getDataNotification', FILE_NAME, '102');
    let data = JSON.parse(remoteMessage.data.default);
    console.log(JSON.parse(remoteMessage.data.default), 'notification message');
    switch (data.type) {
      case 'cgm_debug':
        changeCGMDebugMode(data);
        break;
      case 'debug_log':
        changeDebugLogMode(data);
    }
  });
};

export {getFcmToken, requestUserPermission, getDataNotification};
