const Events = {
  AUTO_MEASURE_DATA: 'Measures',
  INSTANT_MEASURE_SUCCESS: 'InstantMeasures',
  INSTANT_MEASURE_FAIL: '',
  INSTANT_MEASURE_PROGRESS: 'PercentStatus',
  INSTANT_MEASURE_RESULT: 'InstantMeasureResult',
  CALIBRATION_RESULT: 'CalibrationResult',
  CONNECT_SUCCESS: '',
  CONNECT_FAIL: '',
  PAIR_SUCCESS: '',
  PAIR_FAIL: '',
  SCAN_RESULT: 'ScanResult',
  APP_SYNC_SUCCESS: 'AppSyncResult',
  APP_SYNC_FAILED: '',
  MEAL_RESULT: 'MealDataResult',
  STEP_COUNT_RESULT: 'StepCountResult',
  CALIBRATION_STEP_TWO_PROGRESS: 'RawDataPercentage',
  COMMON_RESULT: 'CommonResult', // listener is doing nothing, consider removing
  DEBUG_LOG: 'DebugLog',
  UPLOAD_ON_CLOUD: 'UploadOnCloud',
  FW_UPDATE: "FwUpdate",
  TIMER_TICK: "TimerTick",
  INCOMPATIBLE_DEVICE: "IncompatibleDevice",
};

export default Events;
