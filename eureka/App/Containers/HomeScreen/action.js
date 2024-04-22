import {
  SET_WATCH_CONNECTION,
  SET_WATCH_WORN_STATUS,
  SET_HEALTH_VALUES,
  SET_WATCH_WORN_POPUP_VISIBILITY,
  SET_WATCH_CONNECTION_POPUP_VISIBILITY,
  SET_WATCH_SYNC_VISIBILITY,
  SHOULD_REFRESH_SCREEN,
  OFFLINE_SYNC_COMPLETED,
  OFFLINE_SYNC_PROGRESS,
  OFFLINE_SYNC_START,
  SET_WATCH_BATTERY_STATUS,
  SET_WATCH_CHARGER_STATUS,
  SET_WATCH_WRIST_STATUS,
  SET_WATCH_CHARGER_VISIBILITY,
} from './actionType';

export function watchConnectionAction(isWatchConnectedParam) {
  // console.log('hello', isWatchConnectedParam)

  return {
    type: SET_WATCH_CONNECTION,
    isWatchConnected: isWatchConnectedParam,
  };
}

export function watchWornAction(isWatchWornProperlyParam) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_WORN_STATUS,
    isWatchWornProperly: isWatchWornProperlyParam,
  };
}

export function homeHealthOverviewUpdateAction(data) {
  let actionData = {
    type: SET_HEALTH_VALUES,
    bloodGlucoseValue: data.bloodGlucoseValue,
    heartRateValue: data.heartRateValue,
    bloodPressureSystolicValue: data.bloodPressureSystolicValue,
    bloodPressureDiastolicValue: data.bloodPressureDiastolicValue,
    respirationRateValue: data.respirationRateValue,
    oxygenSaturationValue: data.oxygenSaturationValue,
    stepsWalkValue: data.stepsWalkValue,

    bloodGlucoseTrend: data.bloodGlucoseTrend,
    heartRateTrend: data.heartRateTrend,
    bloodPressureTrend: data.bloodPressureTrend,
    respirationRateTrend: data.respirationRateTrend,
    oxygenSaturationTrend: data.oxygenSaturationTrend,

    bloodGlucoseColor: data.bloodGlucoseColor,
    heartRateColor: data.heartRateColor,
    bloodPressureColor: data.bloodPressureColor,
    respirationRateColor: data.respirationRateColor,
    oxygenSaturationColor: data.oxygenSaturationColor,

    glucoseUnit: data.glucoseUnit,
    stepGoalPercent: data.stepGoalPercent,
    stepGoal: data.stepGoal,
    measureUpdateTime: data.measureUpdateTime,
  };

  return actionData;
}

export function watchWornPopupAction(visibility) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_WORN_POPUP_VISIBILITY,
    watchWornPopupVisibility: visibility,
  };
}

export function watchConnectPopupAction(visibility) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_CONNECTION_POPUP_VISIBILITY,
    watchConnectedPopupVisibility: visibility,
  };
}

export function watchSyncAction(visibility) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_SYNC_VISIBILITY,
    watchSyncVisibility: visibility,
  };
}

export function watchChargerAction(visibility) {
  // console.log('hello', isWatchConnectedParam)
  return {
    type: SET_WATCH_CHARGER_VISIBILITY,
    watchChargerVisibility: visibility,
  };
}

export function shouldResetHome(value) {
  return {
    type: SHOULD_REFRESH_SCREEN,
    value,
  };
}

//watch related Actions

export function offlineSyncStartAction() {
  return {
    type: OFFLINE_SYNC_START,
  };
}
export function offlineSyncCompleteAction() {
  return {
    type: OFFLINE_SYNC_COMPLETED,
  };
}
export function offlineSyncProgressAction() {
  return {
    type: OFFLINE_SYNC_PROGRESS,
  };
}

export function watchBatteryStateAction(status) {
  return {
    type: SET_WATCH_BATTERY_STATUS,
    status,
  };
}

export function watchChargerStateAction(status) {
  return {
    type: SET_WATCH_CHARGER_STATUS,
    status,
  };
}

export function watchWristStateAction(status) {
  return {
    type: SET_WATCH_WRIST_STATUS,
    status,
  };
}
