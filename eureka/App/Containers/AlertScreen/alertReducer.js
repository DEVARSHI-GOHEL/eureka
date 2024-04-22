import moment from 'moment';
import {
  SET_ALERTS_AS_DELETED,
  SET_ALERTS_AS_EDITED,
  SET_ALERTS_AS_OPENED,
  SET_HIDE_ALERT_BADGE,
  SET_SHOW_ALERT_BADGE,
  } from './actionType';
import { getKey } from '../AlertScreen/alertSelectors';

function isItLessThanDay(ms) {
  return moment().subtract(1, 'days').unix() < moment(ms).unix()
}

export function addEditedWithoutDuplicities(list, item) {
  const key = getKey(item);
  const editedMap = new Map(Object.entries(list));
  const { time, id, notes } = item;

  editedMap.set(key, { time, id, notes });

  for (let [key, obj] of editedMap) {
    if (!isItLessThanDay(obj.time)) editedMap.delete(key);
  };

  return Object.fromEntries(editedMap);
}

export function addWithoutDuplicities(list, item) {
  let newList;
  if (Array.isArray(item)) {
     newList = new Set([...list, ...item]);
  }else{
     newList = new Set([...list, item]);
  }

  return Array.from(newList)
    .filter(key => key && isItLessThanDay(+key?.split('#')[0]));
}

const initialState = {
  isShowAlertBadge: false,
  newAlertList: [],
  deleted: [],
  edited: {},
};

function alertReducer(state = initialState, action) {
  switch (action.type) {

    case SET_HIDE_ALERT_BADGE:
      return { ...state, isShowAlertBadge: false}  

    case SET_SHOW_ALERT_BADGE:
      return { ...state, isShowAlertBadge: true }

    case SET_ALERTS_AS_OPENED:
      return {
        ...state,
        newAlertList: addWithoutDuplicities(state.newAlertList, action.payload)
      };

    case SET_ALERTS_AS_DELETED:
      return {
        ...state,
        deleted: addWithoutDuplicities(state.deleted, action.payload),
      };

    case SET_ALERTS_AS_EDITED:
      return {
        ...state,
        edited: addEditedWithoutDuplicities(
          state.edited,
          action.payload,
        ),
      };
    
    default:
      return state;
  }
}

export default alertReducer;
