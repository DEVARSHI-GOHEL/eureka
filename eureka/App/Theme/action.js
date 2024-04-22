import {
  SET_DEVICE_ACTIVATION_CODE,
  REMOVE_DEVICE_ACTIVATION_CODE,
  PAIR_CONNECT_RESET,
  PAIR_CONNECT,
  PAIR_CONNECT_SUCCESS,
  PAIR_CONNECT_GENERAL_FAILURE,
} from './actionTypes';

export function setDeviceActivationCodeAction(deviceActivationCodeParam) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_DEVICE_ACTIVATION_CODE,
    deviceActivationCode: deviceActivationCodeParam,
  };
}

export function removeDeviceActivationCodeAction(deviceActivationCodeParam) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: REMOVE_DEVICE_ACTIVATION_CODE,
    deviceActivationCode: deviceActivationCodeParam,
  };
}

export function pairConnectReset() {
  return {
    type: PAIR_CONNECT_RESET,
  };
}

export function pairConnectStarted() {
  return {
    type: PAIR_CONNECT,
  };
}

export function pairConnectSuccess(watchMsn) {
  return {
    type: PAIR_CONNECT_SUCCESS,
    deviceActivationCode: watchMsn,
  };
}

export function pairConnectGeneralFailure() {
  return {
    type: PAIR_CONNECT_GENERAL_FAILURE,
  };
}
