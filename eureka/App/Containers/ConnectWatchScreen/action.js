import {
  SET_WATCH_ACTIVATION_CODE,
  REMOVE_WATCH_ACTIVATION_CODE,
  PAIR_CONNECT_RESET,
  PAIR_CONNECT,
  PAIR_CONNECT_SUCCESS,
  PAIR_CONNECT_GENERAL_FAILURE,
  PAIR_CONNECT_BLUETOOTH_FAILURE,
  PAIR_CONNECT_LOCATION_FAILURE
} from './actionType';

export function setWatchActivationCodeAction(watchActivationCodeParam) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_ACTIVATION_CODE,
    watchActivationCode: watchActivationCodeParam,
  };
}

export function removeWatchActivationCodeAction(watchActivationCodeParam) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: REMOVE_WATCH_ACTIVATION_CODE,
    watchActivationCode: watchActivationCodeParam,
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
    watchActivationCode: watchMsn,
  };
}

export function pairConnectGeneralFailure(error) {
  return {
    type: PAIR_CONNECT_GENERAL_FAILURE,
    error,
  };
}
export function pairConnectBluetoothFailure(error) {
  return {
    type: PAIR_CONNECT_BLUETOOTH_FAILURE,
    error,
  };
}
export function pairConnectLocationFailure(error) {
  return {
    type: PAIR_CONNECT_LOCATION_FAILURE,
    error,
  };
}
