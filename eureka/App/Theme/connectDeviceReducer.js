import {
  PAIRING_STATE,
  PAIRING_STATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

import {
  PAIR_CONNECT_RESET,
  PAIR_CONNECT,
  PAIR_CONNECT_SUCCESS,
  PAIR_CONNECT_GENERAL_FAILURE,
} from './actionTypes';

const initialState = {
  deviceActivationCode: '',
  operationState: PAIRING_STATE.PAIR_NOT_STARTED,
  failureCode: 0,
};

function connectDeviceReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_DEVICE_ACTIVATION_CODE':
      return {
        ...state,
        deviceActivationCode: action.deviceActivationCode,
      };
    case 'REMOVE_DEVICE_ACTIVATION_CODE':
      return {
        ...state,
        deviceActivationCode: action.deviceActivationCode,
      };
    case PAIR_CONNECT_RESET:
      return {
        ...state,
        deviceActivationCode: '',
        operationState: PAIRING_STATE.PAIR_NOT_STARTED,
        failureCode: 0,
      };
    case PAIR_CONNECT:
      return {
        ...state,
        deviceActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_STARTED,
        failureCode: 0,
      };
    case PAIR_CONNECT_SUCCESS:
      return {
        ...state,
        deviceActivationCode: action.deviceActivationCode,
        operationState: PAIRING_STATE.PAIR_CONNECT_SUCCESS,
        failureCode: 0,
      };

    case PAIR_CONNECT_GENERAL_FAILURE:
      return {
        ...state,
        deviceActivationCode: '',
        operationState: PAIRING_STATE.PAIR_CONNECT_FAILED,
        failureCode: PAIRING_STATE_FAILURE_CODE.GENERAL_FAILURE,
      };
    default:
      return state;
  }
}

export default connectDeviceReducer;
