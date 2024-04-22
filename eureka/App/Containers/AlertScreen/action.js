import {
SET_ALERTS_AS_DELETED,
SET_ALERTS_AS_EDITED,
SET_ALERTS_AS_OPENED,
SET_HIDE_ALERT_BADGE,
SET_NEW_ALERTS_LIST,
SET_SHOW_ALERT_BADGE,
} from './actionType';

export function setShowAlertBadge() {
  return {
    type: SET_SHOW_ALERT_BADGE,
  };
}

export function setHideAlertBadge() {
  return {
    type: SET_HIDE_ALERT_BADGE,
  };
}

// this function adding alert id to processed alerts list
export function setAlertAsOpened(key) {
  return {
    type: SET_ALERTS_AS_OPENED,
    payload: key
  };
}

// this function adding alert id to deleted alerts list
export function setAlertAsDeleted(key) {
  return {
    type: SET_ALERTS_AS_DELETED,
    payload: key
  };
}

// this function adding alert id to edited alerts list
export function setAlertAsEdited(obj) {
  
  return {
    type: SET_ALERTS_AS_EDITED,
    payload: obj
  };
}
