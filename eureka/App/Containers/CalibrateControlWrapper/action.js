import {
  WATCH_CALIBRATE_SUCCESS,
  WATCH_CALIBRATE_GENERAL_ERROR,
  WATCH_CALIBRATE_IN_PROGRESS,
  WATCH_CALIBRATE_RESET,
  WATCH_CALIBRATE_BATTERY_LOW,
  WATCH_CALIBRATE_CONNECTION_BLUETOOTH_ERROR,
  WATCH_CALIBRATE_SHOW_INITIAL_FORM,
  CGM_ON,
  CGM_OFF,
  AUTO_CALIBRATE_ON,
  AUTO_CALIBRATE_OFF,
  STEP_ONE,
  STEP_THREE,
  STEP_TWO,
} from './actionTypes';

/**
 *
 */
export function watchSuccessAction() {
  return {
    type: WATCH_CALIBRATE_SUCCESS,
  };
}

/**
 *
 * @param { Number } percentageParam
 */
export function watchErrorAction(percentage) {
  return {
    type: WATCH_CALIBRATE_GENERAL_ERROR,
    percentage,
  };
}

/**
 *
 * @param { Number } percentage
 */
export function watchInProgressAction(percentage) {
  return {
    type: WATCH_CALIBRATE_IN_PROGRESS,
    percentage,
  };
}

/**
 *
 */
export function watchResetAction() {
  return {
    type: WATCH_CALIBRATE_RESET,
  };
}

/**
 *
 */
export function watchBatteryLavelAction() {
  return {
    type: WATCH_CALIBRATE_BATTERY_LOW,
  };
}

/**
 *
 */
export function watchBluetoothAction() {
  return {
    type: WATCH_CALIBRATE_CONNECTION_BLUETOOTH_ERROR,
  };
}

export function stepCalibrationInitialForm() {
  return {
    type: WATCH_CALIBRATE_SHOW_INITIAL_FORM,
  };
}

export function cgmOn() {
  return {
    type: CGM_ON,
  };
}

export function cgmOff() {
  return {
    type: CGM_OFF,
  };
}

export function autoCalibrateOn() {
  return {
    type: AUTO_CALIBRATE_ON,
  };
}

export function autoCalibrateOff() {
  return {
    type: AUTO_CALIBRATE_OFF,
  };
}

export function stepOne() {
  return {
    type: STEP_ONE,
  };
}

export function stepTwo() {
  return {
    type: STEP_TWO,
  };
}
export function stepThree() {
  return {
    type: STEP_THREE,
  };
}
