import {
  WATCH_MEASURE_SUCCESS,
  WATCH_MEASURE_GENERAL_ERROR,
  WATCH_MEASURE_IN_PROGRESS,
  WATCH_MEASURE_RESET,
  WATCH_MEASURE_BATTERY_LOW,
  WATCH_MEASURE_CONNECTION_BLUETOOTH_ERROR,
  AUTO_MEASURE_IN_PROGRESS,
} from './actionTypes';

import {
  INSTANT_MEASURE_STATE,
  INSTANT_MEASURE_FAILURE_CODE,
  AUTO_MEASURE_STATE,
} from '../../constants/AppDataConstants';

const initialState = {
  operationState: INSTANT_MEASURE_STATE.RESET,
  percentage: 0,
  failureCode: 0,
  autoMeasureState: AUTO_MEASURE_STATE.NOT_STARTED,
};

function measureReducer(state = initialState, action) {
  switch (action.type) {
    case WATCH_MEASURE_IN_PROGRESS:
      return {
        ...state,
        operationState: INSTANT_MEASURE_STATE.ONGOING,
        percentage: action.percentage,
      };
    case WATCH_MEASURE_SUCCESS:
      return {
        ...state,
        percentage: 100,
        operationState: INSTANT_MEASURE_STATE.SUCCESS,
      };
    case WATCH_MEASURE_GENERAL_ERROR:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_MEASURE_STATE.FAILED,
        failureCode: INSTANT_MEASURE_FAILURE_CODE.GENERAL_FAILURE,
      };
    case WATCH_MEASURE_RESET:
      return {
        ...state,
        ...initialState,
      };
    case WATCH_MEASURE_BATTERY_LOW:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_MEASURE_STATE.FAILED,
        failureCode: INSTANT_MEASURE_FAILURE_CODE.BATTERY_LOW,
      };
    case WATCH_MEASURE_CONNECTION_BLUETOOTH_ERROR:
      return {
        ...state,
        percentage: action.percentage ? action.percentage : state.percentage,
        operationState: INSTANT_MEASURE_STATE.FAILED,
        failureCode: INSTANT_MEASURE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE,
      };
    case AUTO_MEASURE_IN_PROGRESS:
      return {
        ...state,
        autoMeasureState: action.status,
      };
    default:
      return state;
  }
}

export default measureReducer;
