import store from '../../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {t} from 'i18n-js';

import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {refreshHomeScreen} from '../HomeScreen/DashboardRefreshUtil';
import {INSTANT_MEASURE_STATE} from '../../constants/AppDataConstants';

const _DISPATCH = store.dispatch;

import {
  watchInProgressAction,
  watchSuccessAction,
  watchErrorAction,
  watchResetAction,
  watchBatteryLavelAction,
  watchBluetoothAction,
  stepOne,
  stepTwo,
  stepThree,

  // watchFailureCodeAction
} from './action';

function resetCalibrate(_cb) {
  _DISPATCH(watchResetAction());
  if (_cb) _cb();
}

function startCalibrate(calibrateCommandCallback) {
  if (
    store.getState().measure.operationState == INSTANT_MEASURE_STATE.ONGOING
  ) {
    measureInProgress();
    return;
  }

  _DISPATCH(watchInProgressAction(0));

  if (calibrateCommandCallback) calibrateCommandCallback();

  AsyncStorage.setItem('calibrate_submit_time', Date.now() + '');
}

function calibrateProgress(percentage) {
  _DISPATCH(watchInProgressAction(percentage));
}

function calibrateGeneralFail(percentage) {
  _DISPATCH(watchErrorAction(percentage));
  showErrorToast(t('commonMessages.calibration_failed_try_again'));
}

function calibrateSuccess() {
  _DISPATCH(watchSuccessAction());
  showSuccessToast('Your calibration is complete.');
  refreshHomeScreen();
}

function measureInProgress() {
  showErrorToast(
    t('commonMessages.measuring_wait')
  );
}

function calibrateInProgress() {
  showErrorToast(t('commonMessages.measuring_in_progress'));
}

function calibrateStepOne() {
  _DISPATCH(stepOne());
}

function calibrateStepTwo() {
  _DISPATCH(stepTwo());
}

function calibrateStepThree() {
  _DISPATCH(stepThree());
}

const CalibrateCommandHandler = {
  resetCalibrate,
  startCalibrate,
  calibrateProgress,
  calibrateGeneralFail,
  calibrateSuccess,
  measureInProgress,
  calibrateStepOne,
  calibrateStepTwo,
  calibrateStepThree,
  calibrateInProgress,
};

export default CalibrateCommandHandler;
