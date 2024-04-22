import {
  APP_SYNC_COMPLETED,
  APP_SYNC_GENERAL_FAILURE,
  APP_SYNC_UNIT_FAILURE,
  START_APP_SYNC,
  TOGGLE_CGM_DEBUG,
  TOGGLE_DEBUG_LOG,
  RESET_APP_SYNC,
} from './actionType';

const initialState = {
  generalError: '',
  unitError: '',
  cgmDebugValue: false,
  debugLogValue: false,
  appSyncCompleted: false,
};

function appSyncReducer(state = initialState, action) {
  switch (action.type) {
    case START_APP_SYNC:
      return {
        generalError: '',
        unitError: '',
      };
    case APP_SYNC_UNIT_FAILURE:
      return {
        generalError: '',
        unitError: action.error,
      };
    case APP_SYNC_GENERAL_FAILURE:
      return {
        generalError: action.error,
        unitError: '',
      };
    case TOGGLE_CGM_DEBUG:
      return {
        ...state,
        cgmDebugValue: action.value,
      };
    case TOGGLE_DEBUG_LOG:
      return {
        ...state,
        debugLogValue: action.value,
      };
    case APP_SYNC_COMPLETED:
      return {
        ...state,
        appSyncCompleted: true,
      };
    case RESET_APP_SYNC:
      return {
        ...state,
        appSyncCompleted: false,
      };
    default:
      return state;
  }
}

export default appSyncReducer;
