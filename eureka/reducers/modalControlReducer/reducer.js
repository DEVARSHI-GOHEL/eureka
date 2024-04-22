import {actions} from './actions';

const INITIAL_STATE = {
  isShowShutdownModal: false,
  isShowMeasureFailedModal: false,
  isShowSkinNotDetected: false,
};

const reducer = {
  [actions.SHUTDOWN_MODAL_SET_SHOW]: (state) => ({
    ...state,
    isShowShutdownModal: true,
  }),
  [actions.SHUTDOWN_MODAL_SET_HIDE]: (state) => ({
    ...state,
    isShowShutdownModal: false,
  }),
  [actions.MEASURE_FAILED_MODAL_SET_SHOW]: (state) => ({
    ...state,
    isShowMeasureFailedModal: true,
  }),
  [actions.MEASURE_FAILED_MODAL_SET_HIDE]: (state) => ({
    ...state,
    isShowMeasureFailedModal: false,
  }),
  [actions.SKIN_NOT_DETECT_SET_SHOW]: (state) => ({
    ...state,
    isShowSkinNotDetected: true,
  }),
  [actions.SKIN_NOT_DETECT_SET_HIDE]: (state) => ({
    ...state,
    isShowSkinNotDetected: false,
  }),
  [actions.SET_HIDE_FOR_ALL_MODALS]: () => {
    let state = {};
    Object.keys(INITIAL_STATE).forEach(key => {
      state[key] = false;
    });
    return state; 
  },
};

export default (state = INITIAL_STATE, action) =>
  typeof reducer[action.type] === 'function'
    ? reducer[action.type](state, action)
    : state;
