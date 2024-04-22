import store from '../../../store/store';
import {
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';

import {
  offlineSyncCompleteAction,
  offlineSyncStartAction,
  watchBatteryStateAction,
  watchChargerStateAction,
  watchWristStateAction,
} from './action';
import {refreshHomeScreen} from './DashboardRefreshUtil';

const _DISPATCH = store.dispatch;

function offlineSyncReadFailed(error) {
  showErrorToast(error.eventDescription);
  // showErrorToast('Could not establish connection to watch. Try again later.');
}

function offlineSyncStart() {
  _DISPATCH(offlineSyncStartAction());
}

function offlineSyncCompleted() {
  _DISPATCH(offlineSyncCompleteAction());
  refreshHomeScreen();
}

function setWatchBatterStatus(value) {
  _DISPATCH(watchBatteryStateAction(value));
}

function setWatchChargerStatus(value) {
  _DISPATCH(watchChargerStateAction(value));
}

function setWatchWristStatus(value) {
  _DISPATCH(watchWristStateAction(value));
}

const WatchCommandHandler = {
  offlineSyncCompleted,
  offlineSyncReadFailed,
  offlineSyncStart,
  setWatchBatterStatus,
  setWatchChargerStatus,
  setWatchWristStatus,
};

export default WatchCommandHandler;
