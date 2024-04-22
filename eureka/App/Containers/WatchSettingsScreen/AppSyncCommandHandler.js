import store from '../../../store/store';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';

const _DISPATCH = store.dispatch;

import {
  syncGeneralFailure,
  syncUnitFailure,
  startAppSync,
  // watchFailureCodeAction
  appSyncCompleted as appSyncCompletedAction,
  resetAppSync,
} from './action';

function startSync() {
  _DISPATCH(startAppSync());
}

function generalAppSync(error) {
  _DISPATCH(syncGeneralFailure(error));
  showErrorToast(error.eventDescription);
}

function unitAppSync(error) {
  _DISPATCH(syncUnitFailure(error));
  showErrorToast(error.eventDescription);
}

function appSyncCompleted() {
  _DISPATCH(appSyncCompletedAction());
  setTimeout(() => {
    _DISPATCH(resetAppSync());
  }, 2000);
}

const AppSyncCommandHandler = {
  unitAppSync,
  generalAppSync,
  startSync,
  appSyncCompleted,
};

export default AppSyncCommandHandler;
