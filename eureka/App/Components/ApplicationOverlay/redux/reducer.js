import {
  INCOMPATIBLE_DEVICE_HIDE, INCOMPATIBLE_DEVICE_SHOW,
} from './actions';

const INITIAL_STATE = {
  showIncompatibleDeviceDialog: false
};

const reducer = {
  [INCOMPATIBLE_DEVICE_SHOW]: (state)=> ({
    ...state,
    showIncompatibleDeviceDialog: true,
  }),
  [INCOMPATIBLE_DEVICE_HIDE]: (state)=> ({
    ...state,
    showIncompatibleDeviceDialog: false,
  }),
}

const applicationOverlayReducer = (state = INITIAL_STATE, action) => {
  const reducerFunction = reducer[action.type];
  if (!reducerFunction) return state;

  return reducerFunction({ ...state} , action);
}

export default applicationOverlayReducer;
