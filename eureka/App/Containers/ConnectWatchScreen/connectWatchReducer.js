import {
  PAIRING_STATE,
  PAIRING_STATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

import {
  PAIR_CONNECT_RESET,
  PAIR_CONNECT,
  PAIR_CONNECT_SUCCESS,
  PAIR_CONNECT_GENERAL_FAILURE,
  PAIR_CONNECT_BLUETOOTH_FAILURE,
  PAIR_CONNECT_LOCATION_FAILURE,
} from './actionType';

const initialState = {
  watchActivationCode: '',
  operationState: PAIRING_STATE.PAIR_NOT_STARTED,
  failureCode: 0,
  connectError: '',
  bluetoothError: '',
  locationError: '',
};

function connectWatchReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_WATCH_ACTIVATION_CODE':
      return {
        ...state,
        watchActivationCode: action.watchActivationCode,
      };
    case 'REMOVE_WATCH_ACTIVATION_CODE':
      return {
        ...state,
        watchActivationCode: action.watchActivationCode,
      };

    case PAIR_CONNECT_RESET:
      return {
        ...state,
        watchActivationCode: '',
        operationState: PAIRING_STATE.PAIR_NOT_STARTED,
        failureCode: 0,
      };
    case PAIR_CONNECT:
      return {
        ...state,
        watchActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_STARTED,
        failureCode: 0,
      };
    case PAIR_CONNECT_SUCCESS:
      return {
        ...state,
        watchActivationCode: action.watchActivationCode,
        operationState: PAIRING_STATE.PAIR_CONNECT_SUCCESS,
        failureCode: 0,
      };

    case PAIR_CONNECT_GENERAL_FAILURE:
      return {
        ...state,
        watchActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_FAILED,
        failureCode: PAIRING_STATE_FAILURE_CODE.GENERAL_FAILURE,
        connectError: action.error,
        bluetoothError: '',
        locationError: '',
      };
    case PAIR_CONNECT_BLUETOOTH_FAILURE:
      return {
        ...state,
        watchActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_FAILED,
        failureCode: PAIRING_STATE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE,
        bluetoothError: action.error,
        locationError: '',
      };
    case PAIR_CONNECT_LOCATION_FAILURE:
      console.log('Asd');
      return {
        ...state,
        watchActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_FAILED,
        failureCode: PAIRING_STATE_FAILURE_CODE.LOCATION_NOT_AVAILABLE,
        locationError: action.error,
        bluetoothError: '',
      };
    default:
      return state;
  }
}

export default connectWatchReducer;
