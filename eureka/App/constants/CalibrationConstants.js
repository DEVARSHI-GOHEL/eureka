const CALIBRATION_SUCCESS = {
  CALIBRATION_ACKNOWLEDGE: 498,
  CALIBRATION_SUCCESS: 499,
  CALIBRATION_MEASURE_COMPLETE: 491,
  CALIBRATION_MEASURE_PROGRESS: 492,
};

const CALIBRATION_ERRORS = {
  UNABLE_START_CALIBRATION: 401,
  INVALID_SPO2: 402,
  INVALID_RR: 403,
  INVALID_HR: 404,
  INVALID_SBP: 405,
  INVALID_DBP: 406,
  INVALID_GLUCOSE: 407,
  CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS: '019',
  CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS: '020',
  CALIBRATE_ERR_CALIBRATE_IN_PROGRESS: '021',
};

export {CALIBRATION_SUCCESS, CALIBRATION_ERRORS};