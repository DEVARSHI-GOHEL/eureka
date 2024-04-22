import {
  WATCH_CALIBRATE_SUCCESS,
  WATCH_CALIBRATE_GENERAL_ERROR,
  WATCH_CALIBRATE_IN_PROGRESS,
  WATCH_CALIBRATE_RESET,
  WATCH_CALIBRATE_BATTERY_LOW,
  WATCH_CALIBRATE_CONNECTION_BLUETOOTH_ERROR,
  CGM_ON,
  CGM_OFF,
  AUTO_CALIBRATE_ON,
  AUTO_CALIBRATE_OFF,
  STEP_ONE,
  STEP_THREE,
  STEP_TWO,
  WATCH_CALIBRATE_SHOW_INITIAL_FORM,
} from './actionTypes';

import {
  INSTANT_CALIBRATE_STATE,
  INSTANT_CALIBRATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

const initialState = {
  operationState: INSTANT_CALIBRATE_STATE.RESET,
  percentage: 0,
  failureCode: 1,
  cgm: false,
  autoCalibrate: false,
  step: INSTANT_CALIBRATE_STATE.STEP_ONE,
};

function calibrateReducer(state = initialState, action) {
  switch (action.type) {
    case WATCH_CALIBRATE_IN_PROGRESS:
      return {
        ...state,
        operationState: INSTANT_CALIBRATE_STATE.ONGOING,
        percentage: action.percentage,
      };
    case WATCH_CALIBRATE_SUCCESS:
      return {
        ...state,
        percentage: 100,
        operationState: INSTANT_CALIBRATE_STATE.SUCCESS,
      };
    case WATCH_CALIBRATE_GENERAL_ERROR:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_CALIBRATE_STATE.FAILED,
        failureCode: INSTANT_CALIBRATE_FAILURE_CODE.GENERAL_FAILURE,
      };
    case WATCH_CALIBRATE_RESET:
      return {
        ...state,
        ...initialState,
        operationState: INSTANT_CALIBRATE_STATE.RESET,
        step: INSTANT_CALIBRATE_STATE.STEP_ONE,
      };
    case WATCH_CALIBRATE_BATTERY_LOW:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_CALIBRATE_STATE.FAILED,
        failureCode: INSTANT_CALIBRATE_FAILURE_CODE.BATTERY_LOW,
      };
    case WATCH_CALIBRATE_CONNECTION_BLUETOOTH_ERROR:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_CALIBRATE_STATE.FAILED,
        failureCode: INSTANT_CALIBRATE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE,
      };
    case WATCH_CALIBRATE_SHOW_INITIAL_FORM:
      return {...state,
        operationState: INSTANT_CALIBRATE_STATE.INITIAL,
      };
    case CGM_ON:
      return {
        ...state,
        cgm: true,
        autoCalibrate: true,
      };
    case CGM_OFF:
      return {
        ...state,
        cgm: false,
      };
    case AUTO_CALIBRATE_ON:
      return {
        ...state,
        autoCalibrate: true,
      };
    case AUTO_CALIBRATE_OFF:
      return {
        ...state,
        autoCalibrate: false,
      };
    case STEP_ONE:
      return {
        ...state,
        step: INSTANT_CALIBRATE_STATE.STEP_ONE,
      };
    case STEP_TWO:
      return {
        ...state,
        step: INSTANT_CALIBRATE_STATE.STEP_TWO,
      };
    case STEP_THREE:
      return {
        ...state,
        step: INSTANT_CALIBRATE_STATE.STEP_THREE,
      };
    default:
      return state;
  }
}

export default calibrateReducer;
