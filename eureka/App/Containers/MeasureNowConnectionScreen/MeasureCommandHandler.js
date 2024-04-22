import store from '../../../store/store';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {refreshHomeScreen} from '../HomeScreen/DashboardRefreshUtil';
import {
  INSTANT_CALIBRATE_STATE,
  AUTO_MEASURE_STATE,
} from '../../constants/AppDataConstants';

const _DISPATCH = store.dispatch;

import {
  watchInProgressAction,
  watchSuccessAction,
  watchErrorAction,
  watchResetAction,
  watchBatteryLavelAction,
  watchBluetoothAction,
  // watchFailureCodeAction,
  autoMeasureStatusAction,
} from './action';
import {t} from 'i18n-js';

function startMeasure(measureCommandCallback) {
  if (
    store.getState().calibrate.operationState == INSTANT_CALIBRATE_STATE.ONGOING
  ) {
    calibrateInProgress();
    return;
  } else if (
    store.getState().measure.autoMeasureState == AUTO_MEASURE_STATE.STARTED
  ) {
    autoMeasureInProgress();
    return;
  }

  _DISPATCH(watchResetAction());

  if (measureCommandCallback) measureCommandCallback();
}

function measureProgress(percentage) {
  _DISPATCH(watchInProgressAction(percentage));
}

function measureGeneralFail(percentage) {
  _DISPATCH(watchErrorAction(percentage));
  showErrorToast(t('MeasureCommandHandler.failTryAgain'));
}

function measureFail(error) {
  showErrorToast(error);
}

function measureFailBatteryLow() {
  _DISPATCH(watchBatteryLavelAction());
  showErrorToast(t('MeasureCommandHandler.failLowBatery'));
}

function measureFailNoBle() {
  _DISPATCH(watchBluetoothAction());
  showErrorToast(t('MeasureCommandHandler.failBLEOff'));
}

function measureSuccess() {
  _DISPATCH(watchSuccessAction());

  showSuccessToast(t('MeasureCommandHandler.complete'));
  refreshHomeScreen();
}

function calibrateInProgress() {
  showErrorToast(t('MeasureCommandHandler.failLaterCalibration'));
}

function autoMeasureInProgress() {
  showErrorToast(t('MeasureCommandHandler.failWait'));
}

function autoMeasureSuccess() {
  _DISPATCH(autoMeasureStatusAction(AUTO_MEASURE_STATE.NOT_STARTED));

  refreshHomeScreen();
}
function autoMeasureStarted() {
  _DISPATCH(autoMeasureStatusAction(AUTO_MEASURE_STATE.STARTED));
}

const MeasureCommandHandler = {
  startMeasure,
  measureProgress,
  measureGeneralFail,
  measureFailBatteryLow,
  measureFailNoBle,
  measureSuccess,
  calibrateInProgress,
  autoMeasureSuccess,
  autoMeasureStarted,
  measureFail,
};

export default MeasureCommandHandler;
