import {LOGIN_SUCCESS, LOGOUT_USER} from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDebugState } from '../../Api/getDebugState';

export function loginSuccess(status, userId, userName) {
  console.log('loginSuccess', status, userId, userName);
  getDebugState(userId);
  return {
    type: LOGIN_SUCCESS,
    isLoggedIn: status,
    userId: userId,
    userName: userName,
  };
}

export function logoutSuccess() {
  return {
    type: LOGOUT_USER,
  };
}

export function setUserStateAction(
  loggedInStatusParam,
  userIdParam,
  fullNameParam,
) {
  console.log(
    'setUserStateAction',
    loggedInStatusParam,
    userIdParam,
    fullNameParam,
  );

  return (dispatch) => {
    AsyncStorage.multiSet([
      ['user_id', userIdParam + ''],
      ['user_name', fullNameParam],
    ])
      .then((res) => {
        console.log('res', res);
        /**
         * dispatching loginSuccess action
         * providing login status true/false
         * and user id in data as string
         */
        dispatch(loginSuccess(loggedInStatusParam, userIdParam, fullNameParam));
      })
      .catch((err) => {
        console.log('err', err);
        // dispatch(loading(false));
        // dispatch(error(err.message || 'ERROR'));
      });
  };
}
