import {
  WATCH_MEASURE_SUCCESS,
  WATCH_MEASURE_GENERAL_ERROR,
  WATCH_MEASURE_IN_PROGRESS,
  WATCH_MEASURE_RESET,
  WATCH_MEASURE_BATTERY_LOW,
  WATCH_MEASURE_CONNECTION_BLUETOOTH_ERROR,
  AUTO_MEASURE_IN_PROGRESS,
} from './actionTypes';

/**
 *
 */
export function watchSuccessAction() {
  return {
    type: WATCH_MEASURE_SUCCESS,
  };
}

/**
 *
 * @param { Number } percentageParam
 */
export function watchErrorAction(percentage) {
  return {
    type: WATCH_MEASURE_GENERAL_ERROR,
    percentage,
  };
}

/**
 *
 * @param { Number } percentage
 */
export function watchInProgressAction(percentage) {
  return {
    type: WATCH_MEASURE_IN_PROGRESS,
    percentage,
  };
}

/**
 *
 */
export function watchResetAction() {
  return {
    type: WATCH_MEASURE_RESET,
  };
}

/**
 *
 */
export function watchBatteryLavelAction() {
  return {
    type: WATCH_MEASURE_BATTERY_LOW,
  };
}

/**
 *
 */
export function watchBluetoothAction() {
  return {
    type: WATCH_MEASURE_CONNECTION_BLUETOOTH_ERROR,
  };
}

export function autoMeasureStatusAction(status) {
  return {
    type: AUTO_MEASURE_IN_PROGRESS,
    status,
  };
}
