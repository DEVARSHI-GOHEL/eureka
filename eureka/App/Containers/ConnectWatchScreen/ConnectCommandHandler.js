import AsyncStorage from '@react-native-async-storage/async-storage';

import store from '../../../store/store';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {DEVICE_STATUS_RENDERER} from '../HomeScreen/DashboardRefreshUtil';
import {shouldResetHome} from '../HomeScreen/action';
const _DISPATCH = store.dispatch;

import {
  pairConnectReset,
  pairConnectStarted,
  pairConnectSuccess,
  pairConnectGeneralFailure,
  pairConnectBluetoothFailure,
  pairConnectLocationFailure,
  // watchFailureCodeAction
} from './action';
import NavigationService from "../../Navigators/NavigationService";
import {
  isDFUConnected,
  selectExpectWatchToConnect,
  selectFirmwareWizardVisible
} from "../FirmwareUpdateScreen/redux/selectors";
import {selectUpdatedFirmwareVersion} from "../../../reducers/firmwareVersionReducer/selectors";

function resetPairConnect() {
  _DISPATCH(pairConnectReset());
}

function startPairConnect(_cb) {
  _DISPATCH(pairConnectStarted());
  // DEVICE_STATUS_RENDERER.setWatchSync();
  if (_cb) _cb();
}

function generalFailPairConnect(error) {


  _DISPATCH(pairConnectGeneralFailure(error));
  showErrorToast(error.eventDescription);

  DEVICE_STATUS_RENDERER.setWatchDisconnected();

  const expectWatchToConnect = selectExpectWatchToConnect(store.getState()) ;
  const dfu = isDFUConnected(store.getState()) ;

  if (expectWatchToConnect  && !dfu) {
    NavigationService.reset({
      routes: [{name: 'DeviceRegistrationScreen'}],
    })
  }
}

function generalBluetoothPairConnect(error) {
  _DISPATCH(pairConnectBluetoothFailure(error));
  showErrorToast(error.eventDescription);
  // showErrorToast('Could not establish connection to watch. Try again later.');
  DEVICE_STATUS_RENDERER.setWatchDisconnected();
}

function generalLocationPairConnect(error) {
  _DISPATCH(pairConnectLocationFailure(error));
  showErrorToast(error.eventDescription);
  // showErrorToast('Could not establish connection to watch. Try again later.');
  DEVICE_STATUS_RENDERER.setWatchDisconnected();
}

function successPairConnect(msn) {
  handlePairConnectSuccess(msn);
  _DISPATCH(pairConnectSuccess(msn));
  _DISPATCH(shouldResetHome(true));
  showSuccessToast('Watch successfully paired and connected.');
  DEVICE_STATUS_RENDERER.setWatchConnected();
}

async function handlePairConnectSuccess(msn) {
  //Yash-This msn should come in response payload from watch
  let pairedDeviceMsn = await AsyncStorage.getItem('to_pair_device_msn');
  await AsyncStorage.setItem('device_msn', pairedDeviceMsn);
}

const ConnectCommandHandler = {
  resetPairConnect,
  startPairConnect,
  generalFailPairConnect,
  successPairConnect,
  generalBluetoothPairConnect,
  generalLocationPairConnect,
  handlePairConnectSuccess,
};

export default ConnectCommandHandler;
