import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistCombineReducers} from 'redux-persist';

import usersReducer from '../App/Containers/SignInScreen/usersReducer';
import calibrateReducer from '../App/Containers/CalibrateControlWrapper/calibrateReducer';
import measureReducer from '../App/Containers/MeasureNowConnectionScreen/measureReducer';
import {
  homeReducer,
  watchStatusReducer,
  watchReducer,
} from '../App/Containers/HomeScreen/homeReducer';

import UIToastReducer from '../App/Components/UI/UIToast/UIToastReducer';
import accountRemoveReducer from '../App/Containers/AccountRemoveProgressScreen/redux/reducer';
import appSyncReducer from '../App/Containers/WatchSettingsScreen/appSyncReducer';
import applicationOverlayReducer from '../App/Components/ApplicationOverlay/redux/reducer';
import connectWatchReducer from '../App/Containers/ConnectWatchScreen/connectWatchReducer';
import firmwareUpdateReducer from '../App/Containers/FirmwareUpdateScreen/redux/reducer';
import firmwareVersionReducer from './firmwareVersionReducer/reducer';
import mealsReducer from '../App/Containers/MealScreen/mealsReducer';
import modalControlReducer from './modalControlReducer/reducer';
import alerts from '../App/Containers/AlertScreen/alertReducer';

/**
 * Configure the storage. Be careful with blacklist and whitelist - don't combine those.
 * Whitelist was chosen because the stores will be temporary (not persisted) by default.
 *
 * @type {{storage, whitelist: string[], key: string}}
 */
const config = {
  key: 'rootReducer',
  storage: AsyncStorage,
  whitelist: ['firmwareVersionReducer', 'alerts'],
  blacklist: ['modalStatuses'],
};

export const rootReducer = persistCombineReducers(config, {
  accountRemove: accountRemoveReducer,
  alerts,
  appSync: appSyncReducer,
  applicationOverlay: applicationOverlayReducer,
  auth: usersReducer,
  calibrate: calibrateReducer,
  connectWatch: connectWatchReducer,
  firmwareUpdate: firmwareUpdateReducer,
  firmwareVersionReducer:firmwareVersionReducer,
  home: homeReducer,
  meals: mealsReducer,
  measure: measureReducer,
  modalStatuses: modalControlReducer,
  toast: UIToastReducer,
  watch: watchReducer,
  watchStatus: watchStatusReducer,
});

export default rootReducer;
