import {DB_STORE} from '../storage/DbStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DEBUG_LOGGER from '../utils/DebugLogger';
let FILE_NAME = 'NotificationCommandHandler.js';
import store from '../../store/store';
import {
  toggleCgmDebug,
  toggleDebugLog,
} from '../Containers/WatchSettingsScreen/action';

const changeCGMDebugMode = async (data) => {
  try {
    let userId = await AsyncStorage.getItem('user_id');
    console.log(data, 'cgm_debug');
    store.dispatch(toggleCgmDebug(data.cgm_debug_enabled));
    let res = await DB_STORE.UPDATE.userInfo({
      id: userId,
      cgm_debug: data.cgm_debug_enabled ? "'Y'" : "'N'",
    });
    DEBUG_LOGGER(
      `Changed CGM Debug Mode`,
      'changeCGMDebugMode',
      FILE_NAME,
      '6',
    );
    console.log(res, 'db updated');
  } catch (error) {
    DEBUG_LOGGER(
      `Coudn't Change CGM Debug Mode`,
      'changeCGMDebugMode',
      FILE_NAME,
      '6',
    );
    console.log(error, 'error in notification cgmdebug');
  }
};

const changeDebugLogMode = async (data) => {
  try {
    console.log(data, 'debug_log');
    await AsyncStorage.setItem(
      'debug_log_enabled',
      JSON.stringify(data.debug_log_enabled),
    );
    store.dispatch(toggleDebugLog(data.debug_log_enabled));
    DEBUG_LOGGER(
      `Changed Debug Log Mode`,
      'changeDebugLogMode',
      FILE_NAME,
      '32',
    );
  } catch (error) {
    console.log(error, 'error in notification');
    DEBUG_LOGGER(
      `Couldn't Change Debug Log Mode`,
      'changeDebugLogMode',
      FILE_NAME,
      '32',
    );
  }
};

export {changeCGMDebugMode, changeDebugLogMode};
