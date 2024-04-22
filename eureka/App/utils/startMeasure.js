import store from '../../store/store';
import MeasureCommandHandler from '../Containers/MeasureNowConnectionScreen/MeasureCommandHandler';
import {showErrorToast} from '../Components/UI/UIToast/UIToastHandler';
import RNDeviceInfo from 'react-native-device-info';
import {t} from "i18n-js";

import {
  INSTANT_CALIBRATE_STATE,
  AUTO_MEASURE_STATE,
  WATCH_CHARGER_STATE,
  INSTANT_MEASURE_STATE,
  OFFLINE_SYNC_STATE,
  WATCH_CONNECTION_STATE,
  WATCH_BATTERY_STATE,
  WATCH_WRIST_STATE,
} from '../constants/AppDataConstants';
import {
  watchChargerAction,
  watchSyncAction,
  watchConnectPopupAction,
} from '../Containers/HomeScreen/action';

export default async function (navigation) {
  let batteryLevel = await RNDeviceInfo.getBatteryLevel();

  if (
    store.getState().watchStatus.isWatchConnected !==
    WATCH_CONNECTION_STATE.CONNECTED
  ) {
    store.dispatch(watchConnectPopupAction(true));
    return;
  }

  if (store.getState().measure.operationState === INSTANT_MEASURE_STATE.ONGOING) {
    navigation?.navigate('MeasureNowConnectionScreen');
    return
  }

  if (batteryLevel.toFixed(2) < 0.11) {
    showErrorToast(t('watchSettingsScreen.watchSettingSaveDB_ErrorText'));
    return;
  }

  if (store.getState().calibrate.operationState == INSTANT_CALIBRATE_STATE.ONGOING) {
    MeasureCommandHandler.calibrateInProgress();
    return;
  }

  if (store.getState().measure.autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
    showErrorToast(t('CalibrateConnectionScreen.waitForResult'));
    return;
  }

  if (store.getState().watch.watchChargerValue == WATCH_CHARGER_STATE.CONNECTED) {
    store.dispatch(watchChargerAction(true));
    return;
  }

  if (store.getState().watch.offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START) {
    store.dispatch(watchSyncAction(true));
    return;
  }

  if (store.getState().watch.watchBatteryValue == WATCH_BATTERY_STATE.LOW) {
    showErrorToast(t('screenMeasureNowConnection.bottomLowBatteryText1'));
    return;
  }

  if (store.getState().watch.watchWristValue == WATCH_WRIST_STATE.NOT_ON_WRIST) {
    showErrorToast(t('commonMessages.ensure_device_is_on'));
    return;
  }

  navigation?.navigate('MeasureNowConnectionScreen');
}
