import {
  SHOW_TOAST,
  HIDE_TOAST
} from './actionTypes';

// import {
//   UI_TOAST_STATE
// } from '../../../constants/AppDataConstants';

const initialState = {
  // visibilityState : false, //FAILED : 0, SUCCESS: 1, ONGOING : 2,
  toastType: 0, // 0 error, 1 success
  message: "",
  isVisible: false
};

function UIToastReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_TOAST:
      return {
        ...state,
        // visibilityState: true,

        toastType: action.toastType,
        message: action.message,
        isVisible: true
      }
    case HIDE_TOAST:
      return {
        ...state,
        // visibilityState: false,
        isVisible: false
      }
    default:
      return state;
  }
}

export default UIToastReducer;