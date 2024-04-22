import {
  SHOW_TOAST, 
  HIDE_TOAST
} from './actionTypes';

/**
 * 
 */
export function showToastAction(toastTypeParam, messageParam) {
  return {
    type: SHOW_TOAST,
    toastType:toastTypeParam,
    message:messageParam,
  };
}

/**
 * 
 * 
 */
export function hideToastAction() {
  return {
    type: HIDE_TOAST
  };
}


