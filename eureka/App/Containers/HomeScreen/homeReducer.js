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

import {
  WATCH_WORN_STATE,
  WATCH_CONNECTION_STATE,
  GLUCOSE_UNIT,
  OFFLINE_SYNC_STATE,
  WATCH_BATTERY_STATE,
  WATCH_CHARGER_STATE,
  WATCH_WRIST_STATE,
} from '../../constants/AppDataConstants';

const initialWatchStatusState = {
  isWatchConnected: WATCH_CONNECTION_STATE.NOT_CONNECTED,
  isWatchWornProperly: WATCH_WORN_STATE.WORN,
  watchWornPopupVisibility: false,
  watchConnectedPopupVisibility: false,
  watchSyncVisibility: false,
  watchChargerVisibility: false,
};

const initialState = {
  // watch stores
  bloodGlucoseValue: 0,
  heartRateValue: 0,
  bloodPressureSystolicValue: 0,
  bloodPressureDiastolicValue: 0,
  respirationRateValue: 0,
  oxygenSaturationValue: 0,
  stepsWalkValue: 0,
  bloodGlucoseTrend: 0,
  heartRateTrend: 0,
  bloodPressureTrend: 0,
  respirationRateTrend: 0,
  oxygenSaturationTrend: 0,

  bloodGlucoseColor: 0,
  heartRateColor: 0,
  bloodPressureColor: 0,
  respirationRateColor: 0,
  oxygenSaturationColor: 0,

  glucoseUnit: GLUCOSE_UNIT.MGDL,
  stepGoalPercent: 0,
  measureUpdateTime: '',
  shouldResetHome: false,
};

const watchInitialState = {
  offlineSyncData: OFFLINE_SYNC_STATE.SYNC_NOT_STARTED,
  watchBatteryValue: WATCH_BATTERY_STATE.NORMAL,
  watchChargerValue: WATCH_CHARGER_STATE.NOT_CONNECTED,
  watchWristValue: WATCH_WRIST_STATE.ON_WRIST,
};

function _homeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_WATCH_CONNECTION:
      return {
        ...state,
        isWatchConnected: action.isWatchConnected,
      };
    case SET_WATCH_WORN_STATUS:
      return {
        ...state,
        isWatchWornProperly: action.isWatchWornProperly,
      };
    case SET_WATCH_WORN_POPUP_VISIBILITY:
      return {
        ...state,
        watchWornPopupVisibility: action.watchWornPopupVisibility,
      };
    case SET_WATCH_CONNECTION_POPUP_VISIBILITY:
      return {
        ...state,
        watchConnectedPopupVisibility: action.watchConnectedPopupVisibility,
      };
    case SET_WATCH_SYNC_VISIBILITY:
      return {
        ...state,
        watchSyncVisibility: action.watchSyncVisibility,
      };
    case SHOULD_REFRESH_SCREEN:
      return {
        ...state,
        shouldResetHome: action.value,
      };

    case SET_HEALTH_VALUES:
      return {
        ...state,
        bloodGlucoseValue: action.bloodGlucoseValue,
        heartRateValue: action.heartRateValue,
        bloodPressureSystolicValue: action.bloodPressureSystolicValue,
        bloodPressureDiastolicValue: action.bloodPressureDiastolicValue,
        respirationRateValue: action.respirationRateValue,
        oxygenSaturationValue: action.oxygenSaturationValue,
        stepsWalkValue: action.stepsWalkValue,

        bloodGlucoseTrend: action.bloodGlucoseTrend,
        heartRateTrend: action.heartRateTrend,
        bloodPressureTrend: action.bloodPressureTrend,
        respirationRateTrend: action.respirationRateTrend,
        oxygenSaturationTrend: action.oxygenSaturationTrend,

        bloodGlucoseColor: action.bloodGlucoseColor,
        heartRateColor: action.heartRateColor,
        bloodPressureColor: action.bloodPressureColor,
        respirationRateColor: action.respirationRateColor,
        oxygenSaturationColor: action.oxygenSaturationColor,

        glucoseUnit: action.glucoseUnit,
        stepGoalPercent: action.stepGoalPercent,
        stepGoal: action.stepGoal,
        measureUpdateTime: action.measureUpdateTime,
      };

    default:
      return state;
  }
}

function _watchStatusReducer(state = initialWatchStatusState, action) {
  switch (action.type) {
    case SET_WATCH_CONNECTION:
      return {
        ...state,
        isWatchConnected: action.isWatchConnected,
      };
    case SET_WATCH_WORN_STATUS:
      return {
        ...state,
        isWatchWornProperly: action.isWatchWornProperly,
      };
    case SET_WATCH_WORN_POPUP_VISIBILITY:
      return {
        ...state,
        watchWornPopupVisibility: action.watchWornPopupVisibility,
      };
    case SET_WATCH_CONNECTION_POPUP_VISIBILITY:
      return {
        ...state,
        watchConnectedPopupVisibility: action.watchConnectedPopupVisibility,
      };
    case SET_WATCH_SYNC_VISIBILITY:
      return {
        ...state,
        watchSyncVisibility: action.watchSyncVisibility,
      };
    case SET_WATCH_CHARGER_VISIBILITY:
      return {
        ...state,
        watchChargerVisibility: action.watchChargerVisibility,
      };

    default:
      return state;
  }
}

function _watchReducer(state = watchInitialState, action) {
  switch (action.type) {
    case OFFLINE_SYNC_START:
      return {
        ...state,
        offlineSyncData: OFFLINE_SYNC_STATE.SYNC_START,
      };
    case OFFLINE_SYNC_PROGRESS:
      return {
        ...state,
        offlineSyncData: OFFLINE_SYNC_STATE.SYNC_PROGRESS,
      };
    case OFFLINE_SYNC_COMPLETED:
      return {
        ...state,
        offlineSyncData: OFFLINE_SYNC_STATE.SYNC_NOT_STARTED,
      };
    case SET_WATCH_BATTERY_STATUS:
      return {
        ...state,
        watchBatteryValue: action.status,
      };
    case SET_WATCH_CHARGER_STATUS:
      return {
        ...state,
        watchChargerValue: action.status,
      };
    case SET_WATCH_WRIST_STATUS:
      return {
        ...state,
        watchWristValue: action.status,
      };
    default:
      return state;
  }
}

export const homeReducer = _homeReducer;
export const watchStatusReducer = _watchStatusReducer;
export const watchReducer = _watchReducer;
