import {
  APP_SYNC_GENERAL_FAILURE,
  APP_SYNC_UNIT_FAILURE,
  START_APP_SYNC,
  TOGGLE_CGM_DEBUG,
  TOGGLE_DEBUG_LOG,
  APP_SYNC_COMPLETED,
  RESET_APP_SYNC,
} from './actionType';

export function syncUnitFailure(error) {
  return {
    type: APP_SYNC_UNIT_FAILURE,
    error,
  };
}
export function syncGeneralFailure(error) {
  return {
    type: APP_SYNC_GENERAL_FAILURE,
    error,
  };
}

export function startAppSync() {
  return {
    type: START_APP_SYNC,
  };
}

export function toggleCgmDebug(value) {
  return {
    type: TOGGLE_CGM_DEBUG,
    value,
  };
}

export function toggleDebugLog(value) {
  return {
    type: TOGGLE_DEBUG_LOG,
    value,
  };
}

export function appSyncCompleted() {
  return {
    type: APP_SYNC_COMPLETED,
  };
}

export function resetAppSync() {
  return {
    type: RESET_APP_SYNC,
  };
}
