import AsyncStorage from '@react-native-async-storage/async-storage';
import {DB_STORE} from '../storage/DbStorage';
import {API} from '../Services/API';
import {Get_Api_Keys, Login_Api} from '../Theme';

export const storeTokens = async function (tokensData) {
  await AsyncStorage.multiSet([
    ['auth_token', tokensData.authToken + ''],
    ['refresh_token', tokensData.refreshToken + ''],
    ['graphql_token', tokensData.graphQlApiKey + ''],
    ['gpl_token', tokensData.GPLApiKey + ''],
  ]);
};


export const storeUserAuthDetails = async function (finalUserData) {
  await AsyncStorage.multiSet([
    ['user_id', finalUserData.userId + ''],
    ['user_name', finalUserData.firstName + ' ' + finalUserData.lastName],
    ['session_id', finalUserData.sessionId + ''],
    ['device_local_db_id', finalUserData.device_local_db_id + ''],
    ['device_msn', ''],
    ['user_state', finalUserData.state + ''],
    ['to_pair_device_msn', finalUserData.deviceMSN + ''],
    ['app_info_sync', 'true'],
    [
      'user_pp_name',
      finalUserData.userPicName ? finalUserData.userPicName : '',
    ],
    ['already_launched', JSON.stringify(true)],
  ]);
};

export const removeUserAuthDetails = async function () {
  await DB_STORE.UTILS.invalidateSession();
  await AsyncStorage.multiRemove([
    'user_id',
    'user_name',
    'session_id',
    'device_local_db_id',
    'device_msn',
    'user_state',
    'to_pair_device_msn',
    'auth_token',
    'refresh_token',
    'graphql_token',
    'gpl_token',
    'app_info_sync',
    'calibrate_submit_time',
    'user_pp_name',
  ]);
  await AsyncStorage.removeItem('asyncWatchId');
};

export const appSyncApiKey = async () => {
  console.log('appSyncApiKey called #####################');
  return API.getApi(Get_Api_Keys, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (res) => {
      console.log('appSyncApiKey res ##########################', res);
      let response;
      if (res !== undefined) {
        response = res.data.data;
        await AsyncStorage.setItem('gpl_token', response.apiKeyGPL);
      }

      return response;
    })
    .catch((err) => {
      console.log('appSyncApiKey err #####################', err);
      throw new Error('There is some error');
    });
};

const UserLogout = async (navigation) => {
  await removeUserAuthDetails();
  console.log('UserLogout########');
  alert('Your session has expired please login again');

  navigation &&
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInScreen'}],
    });
};

export const refreshTokenApi = async (navigation, callbackFun) => {
  console.log('refreshTokenApi called #####################');

  let refresh_token = await AsyncStorage.getItem('refresh_token');

  console.log('refresh_token#####', refresh_token);

  return API.postApi(
    Login_Api,
    {
      refreshToken: `Bearer ${refresh_token}`,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
    .then(async (res) => {

      if (
        res &&
        res.status === 200 &&
        res.data.statusCode !== 303 &&
        res.data.statusCode !== 302
      ) {
        /**
         * setting new token to auth_token storage
         */
        await AsyncStorage.setItem('auth_token', res.data.token);
        if (callbackFun !== undefined) {
          callbackFun();
        }
      } else if (
        (res && res.data.statusCode === 303) ||
        res.data.statusCode === 302
      ) {
        // Alert.alert('Logout the user');
        if (navigation) {
          UserLogout(navigation);
        }
      }

    })
    .catch((err) => {
      console.log('refreshTokenApi err #####################', err);
      throw new Error('Error');
    });
};
