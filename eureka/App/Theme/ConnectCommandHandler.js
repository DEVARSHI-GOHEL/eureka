import AsyncStorage from '@react-native-async-storage/async-storage';

import store from '../../../store/store';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Component/UI/UIToast/UIToastHandler';
import { DEVICE_STATUS_RENDERER } from '../HomeScreen/DashboardRefreshUtil';
const _DISPATCH = store.dispatch;

import {
  pairConnectReset,
  pairConnectStarted,
  pairConnectSuccess,
  pairConnectGeneralFailure,
  // watchFailureCodeAction
} from './action';
import {t} from "i18n-js";

function resetPairConnect() {
  _DISPATCH(pairConnectReset());
}

function startPairConnect(_cb) {
  _DISPATCH(pairConnectStarted());
  DEVICE_STATUS_RENDERER.setWatchSync();
  if (_cb) _cb();
}

function generalFailPairConnect() {
  _DISPATCH(pairConnectGeneralFailure());
  showErrorToast(t('commonMessages.message_4'));
  DEVICE_STATUS_RENDERER.setWatchDisconnected();
}

function successPairConnect(msn) {
  handlePairConnectSuccess(msn);
  _DISPATCH(pairConnectSuccess(msn));
  showSuccessToast('Watch successfully paired and connected.');
  DEVICE_STATUS_RENDERER.setWatchConnected();
}

function handlePairConnectSuccess(msn) {
  AsyncStorage.setItem('device_msn', msn);
}

const ConnectCommandHandler = {
  resetPairConnect,
  startPairConnect,
  generalFailPairConnect,
  successPairConnect,
};

export default ConnectCommandHandler;
