import {NativeEventEmitter, Platform} from 'react-native';

import * as RNFS from 'react-native-fs';

import LifePlusModuleExport from '../../LifePlusModuleExport';
import Events from './Events';
import AppSyncCommandHandler from '../Containers/WatchSettingsScreen/AppSyncCommandHandler';
import CalibrateCommandHandler from '../Containers/CalibrateControlWrapper/CalibrateCommandHandler';
import MeasureCommandHandler from '../Containers/MeasureNowConnectionScreen/MeasureCommandHandler';
import ConnectCommandHandler from '../Containers/ConnectWatchScreen/ConnectCommandHandler';
import MealsCommandHandler from '../Containers/MealScreen/MealsCommandHandler';
import WatchCommandHandler from '../Containers/HomeScreen/WatchCommandHandler';
import DEBUG_LOGGER from '../utils/DebugLogger';
import {CONNECT_ERROR, CONNECT_SUCCESS} from '../constants/ConnectDeviceConstant';
import {APP_SYNC_ERROR, APP_SYNC_SUCCESS} from '../constants/AppSyncConstants';
import {MEASURE_ERROR, MEASURE_PROGRESS, MEASURE_SUCCESS} from '../constants/MeasureUIConstants';
import {CALIBRATION_ERRORS, CALIBRATION_SUCCESS} from '../constants/CalibrationConstants';
import {FIRMWARE_UPDATE, OFFLINE_DATA_READ, WATCH_BATTERY_CONS} from '../constants/WatchConstants';
import {
  INSTANT_CALIBRATE_STATE,
  WATCH_BATTERY_STATE,
  WATCH_CHARGER_STATE,
  WATCH_WRIST_STATE,
} from '../constants/AppDataConstants';
import {COMMON_ERRORS} from '../constants/CommonConstants';
import store, {dispatch} from '../../store/store';
import {POST_DEBUG_LOGS, Sign_In_Api} from '../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {refreshTokenApi} from '../Services/AuthService';
import {
  firmwareStartFlashing,
  firmwareUpdateDFUConnected,
  firmwareUpdateResultError,
  firmwareUpdateStartedAction,
} from "../Containers/FirmwareUpdateScreen/redux/actions";
import {showIncompatibleDeviceDialog} from "../Components/ApplicationOverlay/redux/actions";
import {postWithAuthorization} from "../Services/graphqlApi";
import {timerTickHandler} from "./handlers/TimerTickHandler";
import {setUpdatedFirmwareVersion} from "../../reducers/firmwareVersionReducer/actions";
import {selectFirmwareUpdateParams} from "../Containers/FirmwareUpdateScreen/redux/selectors";
import {setWatchVersion} from "../../reducers/firmwareVersionReducer/richActions";
import {getErrorMessage} from "../Services/Translate";
import {selectStoredFirmwareUpdateMeta} from "../../reducers/firmwareVersionReducer/selectors";
import {selectWatchConnected} from "../Containers/HomeScreen/homeSelectors";
import {sleep} from "../utils/sleep";
import {showShutdownModalAction, showMeasureFailedModalAction} from '../../reducers/modalControlReducer/actions';

const FILE_NAME = 'NativeEventHandler.js';
let functionName;

const START_VALUE_MS = 1000;
const MAX_RETRY_DELAY = 17 * 60 * 1000; // maximum time to make a retry query in milliseconds
const UPLOAD_CLOUD_DATA_METHODS = ['uploadDeviceData', 'addMeals', 'addStepCount'];
const EventEmitterHandle = new NativeEventEmitter(LifePlusModuleExport);

let hasEventsAttached = false;
let tempAction = '';
let firmwareUpdateParams;

const NativeEventHandler = {
  SEND: {
    connect: function (userId, AuthenticationId) {
      LifePlusModuleExport.deviceConnect(
        JSON.stringify({userId, AuthenticationId}),
      );
    },
    instantMeasure: function () {
      LifePlusModuleExport.startInstantMeasure();
      tempAction = 'm';
      DEBUG_LOGGER(
        'instantMeasure measure started',
        'instantMeasure',
        FILE_NAME,
        '58',
      );
    },
    startFirmwareUpdate: async function (userId, filePath, device_msn, version) {
      firmwareUpdateParams = {userId, device_msn, version, filePath};
      return LifePlusModuleExport.startFirmwareUpdate(JSON.stringify({"FirmwareUpdateFilePath": filePath})).then(
          (response) => {
            let respData = JSON.parse(response);
            console.log("===========FIRMWARE UPDATE STARTED: ", respData);
            return response;
          })
    },
    startDfuMode: async function () {
      return LifePlusModuleExport.startDfuMode();
    },
    postFirmwareUpdate: async function ({message, status}) {
      const {
        userId,
        filePath,
        device_msn,
        version,
      } = selectStoredFirmwareUpdateMeta(store.getState());

      let success = status == "success";

      let installationResult = `mutation PostFirmwareInstallationResult($deviceMSN: String!, $version: String!, $success: Boolean!, $error: String, $userId: Int!) {
        postFirmwareInstallationResult(deviceMSN: $deviceMSN, version: $version, success: $success, error: $error, userId: $userId){
          body
          statusCode
        }
      }`
      try {
        let res = await postWithAuthorization(
            Sign_In_Api,
            {
              query: installationResult,
              variables: {
                userId: Number(userId),
                deviceMSN: device_msn,
                version: version,
                success: success,
                error: message,
              },
              operationName: 'PostFirmwareInstallationResult',
            }
        )
        console.log("POST FIRMWARE UPDATE result", res);
        if (res != undefined) {
          let fileRes = await RNFS.exists(filePath);
          console.log('file exists: ', fileRes);

          if (fileRes) {
            try {
              await RNFS.unlink(filePath);
              console.log('FILE DELETED');
            } catch (err) {
              console.log(err.message);
            }
          }
        }

      } catch (err) {
        console.log('POST FIRMWARE UPDATE error', err);
      };
    },
    calibrate: function (data) {
      LifePlusModuleExport.calibrate(data).then((rtData) => {
        console.log('calibration return', rtData);
        calibrationHandler(rtData);
      });
      tempAction = 'c';
      DEBUG_LOGGER('calibrate started', 'Calibrate', FILE_NAME, '61');
    },
    appSync: function (value) {
      return LifePlusModuleExport.appSync(JSON.stringify(value)).then(
        (data) => {
          appSyncHandler(data);
        },
      );
    },
    apiError: function (value) {
      LifePlusModuleExport.apiError(value);
    },
    updateDailyStepGoal: function () {
      LifePlusModuleExport.updateDailyStepGoal();
    }
  },
  HANDLE: {
    connectSuccess: function (data) {
      ConnectCommandHandler.successPairConnect(data.AuthenticationId);
    },

    connectFail: function (error) {
      const ERROR_CODE = error.result;

      switch (ERROR_CODE) {
        case CONNECT_ERROR.BLE_NO_PERMISSION:
          // case CONNECT_ERROR.UNABLE_START_SERVICE_DISCOVERY:
          // case CONNECT_ERROR.UNABLE_START_SCANNING:
          ConnectCommandHandler.generalBluetoothPairConnect(error);
          break;
        case CONNECT_ERROR.LOCATION_NO_PERMISSION:
          ConnectCommandHandler.generalLocationPairConnect(error);
          break;
        case CONNECT_ERROR.WATCH_UNAVAILABLE:
          ConnectCommandHandler.generalFailPairConnect(error);
          break;
        case CONNECT_ERROR.WATCH_REJECT_BOND:
        case CONNECT_ERROR.INDICATE_SBSCRIPTION_FAIL:
        case CONNECT_ERROR.GATT_DISCOVER_FAIL:
        case CONNECT_ERROR.GATT_WRITE_FAIL:
        case CONNECT_ERROR.GATT_READ_FAIL:
        case CONNECT_ERROR.UNABLE_START_SCANNING:
        case CONNECT_ERROR.UNABLE_START_SERVICE_DISCOVERY:
        case CONNECT_ERROR.INVALID_DEVICE:

        case CONNECT_SUCCESS.DISCOVERING_SERVICES:
          // ConnectCommandHandler.generalFailPairConnect(error);
          break;

        default:
        // ConnectCommandHandler.generalFailPairConnect(error);
      }
    },
    appSyncSuccess: function () {
      AppSyncCommandHandler.appSyncCompleted();
    },

    appSyncFail: function (error) {
      const ERROR_CODE = error.result;
      switch (ERROR_CODE) {
        case APP_SYNC_ERROR.INVALID_USER:
        case APP_SYNC_ERROR.INVALID_MSN:
        case APP_SYNC_ERROR.APPSYNC_ERROR:
          AppSyncCommandHandler.unitAppSync(error);
          break;
        case COMMON_ERRORS.OTHER_PROC_RUNNING:
          break;
        case CONNECT_ERROR.INVALID_DEVICE:
          break;
        default:
          AppSyncCommandHandler.generalAppSync(error);
      }
    },
    instantMeasureProgress: function (data) {
      if (data.processcompletes) {
        console.log(tempAction);
        try {
          let percentage = data.processcompletes.split('%')[0] * 1; //ASMIT CHANGE - THIS NEEDS TO GET CHANGED FROM NATIVE END

          if (isNaN(percentage)) {
            throw new Error(
              'Percentage value for measure progress cannot be parsed',
            );
          }

          if (tempAction == 'm') {
            MeasureCommandHandler.measureProgress(percentage);
          }
          if (tempAction == 'c')
            CalibrateCommandHandler.calibrateProgress(percentage);

          DEBUG_LOGGER(
            `${
              tempAction == 'm' ? 'instant measure' : 'calibration'
            } in progress ` +
              percentage +
              '% ',
            'instantMeasureProgress',
            FILE_NAME,
            '154',
          );
        } catch (e) {
          console.log(e);
        }
      }
      if (data.transfercompletes) {

        try {
          let percentage = data.transfercompletes.split('%')[0] * 1; //ASMIT CHANGE - THIS NEEDS TO GET CHANGED FROM NATIVE END

          if (
            store.getState().calibrate.step !== INSTANT_CALIBRATE_STATE.STEP_TWO
          ) {
            CalibrateCommandHandler.calibrateStepTwo();
          }

          if (isNaN(percentage)) {
            throw new Error(
              'Percentage value for transfer progress cannot be parsed',
            );
          }
          CalibrateCommandHandler.calibrateProgress(percentage);

          // CalibrateCommandHandler.calibrateStepTwo();

          DEBUG_LOGGER(
            'calibrate  in progress' + percentage + 'percentage ',
            'calibrateProgress',
            FILE_NAME,
            '175',
          );
        } catch (e) {
          console.log(e);
        }
      }
    },
    instantMeasureSuccess: function () {
      DEBUG_LOGGER(
        'instant Measure Successful',
        'instantMeasureSuccess',
        FILE_NAME,
        '187',
      );
      MeasureCommandHandler.measureSuccess();
      // if (tempAction == 'm') MeasureCommandHandler.measureSuccess();
      // if (tempAction == 'c') CalibrateCommandHandler.calibrateSuccess();
    },
    instantMeasureFail: function (error) {
      const ERROR_CODE = error.result;
      DEBUG_LOGGER(
        JSON.stringify(`instantMeasureFail ${JSON.stringify(error)}`),
        'instantMeasureFail',
        FILE_NAME,
        '210',
      );
      switch (ERROR_CODE) {
        case MEASURE_ERROR.UNABLE_START_INSTANT_MEASURE:
        case MEASURE_ERROR.VITAL_READ_COMMAND_FAILED:
        case '014':
          MeasureCommandHandler.measureFail(error.eventDescription);
          break;
        default:
          MeasureCommandHandler.measureGeneralFail();
      }
    },
    calibrationFail: function (error) {
      const ERROR_CODE = error.result;

      switch (ERROR_CODE) {
        case CALIBRATION_ERRORS.INVALID_DBP:
        case CALIBRATION_ERRORS.INVALID_GLUCOSE:
        case CALIBRATION_ERRORS.INVALID_HR:
        case CALIBRATION_ERRORS.INVALID_RR:
        case CALIBRATION_ERRORS.INVALID_SBP:
        case CALIBRATION_ERRORS.INVALID_SPO2:
        case CALIBRATION_ERRORS.UNABLE_START_CALIBRATION:
          CalibrateCommandHandler.calibrateGeneralFail();
          break;
        case CALIBRATION_ERRORS.CALIBRATE_ERR_AUTO_MEASURE_IN_PROGRESS:
        case CALIBRATION_ERRORS.CALIBRATE_ERR_INSTANT_MEASURE_IN_PROGRESS:
          CalibrateCommandHandler.measureInProgress();
          CalibrateCommandHandler.calibrateGeneralFail();
          break;
        case CALIBRATION_ERRORS.CALIBRATE_ERR_CALIBRATE_IN_PROGRESS:
          CalibrateCommandHandler.calibrateInProgress();
          break;
        default:
          CalibrateCommandHandler.calibrateGeneralFail();
      }
    },
    calibrationSuccess: function () {
      CalibrateCommandHandler.calibrateSuccess();
    },
    watchSuccess: function (code) {
      switch (code) {
        case OFFLINE_DATA_READ.OFFLINE_VITAL_READ_START:
          WatchCommandHandler.offlineSyncStart();
          break;
        case OFFLINE_DATA_READ.OFFLINE_VITAL_READ_COMPLETE:
          WatchCommandHandler.offlineSyncCompleted();
          break;
        case WATCH_BATTERY_CONS.WATCH_BATTERY_NORMAL:
          WatchCommandHandler.setWatchBatterStatus(WATCH_BATTERY_STATE.NORMAL);
          break;
        case WATCH_BATTERY_CONS.WATCH_BATTERY_LOW:
          WatchCommandHandler.setWatchBatterStatus(WATCH_BATTERY_STATE.LOW);
          break;
        case WATCH_BATTERY_CONS.WATCH_CHARGER_CONNECTED:
          WatchCommandHandler.setWatchChargerStatus(
            WATCH_CHARGER_STATE.CONNECTED,
          );
          break;
        case WATCH_BATTERY_CONS.WATCH_CHARGER_DISCONNECTED:
          WatchCommandHandler.setWatchChargerStatus(
            WATCH_CHARGER_STATE.NOT_CONNECTED,
          );
          break;
        case WATCH_BATTERY_CONS.WATCH_NOT_ON_WRIST:
          WatchCommandHandler.setWatchWristStatus(
            WATCH_WRIST_STATE.NOT_ON_WRIST,
          );
          break;
        case WATCH_BATTERY_CONS.WATCH_ON_WRIST:
          WatchCommandHandler.setWatchWristStatus(WATCH_WRIST_STATE.ON_WRIST);
          break;
        case WATCH_BATTERY_CONS.WATCH_SHUTDOWN_IN_PROGRESS:
          dispatch(showShutdownModalAction());
          break;
        case MEASURE_ERROR.MEASURE_FAILED:
          dispatch(showMeasureFailedModalAction());
          break;
        case '997':
          break;
        default:
          // alert(code);
          break;
        // throw code;
      }
    },
    watchFail: function (code) {
      switch (code) {
        default:
          throw code;
      }
    },
    postDebugLog: async function (request) {
      try {
        let isDebugEnabled = await AsyncStorage.getItem('debug_log_enabled');
        if (!JSON.parse(isDebugEnabled)) {
          console.log('Debug Logger Is Disabled');
          return;
        }
        const response = await postWithAuthorization(POST_DEBUG_LOGS, request);
        console.log('debug post', response);
        if (response.data.body) {
          const statusCode = response.data.body.statusCode;
          if (statusCode == 302 || statusCode == 303) {
            await refreshTokenApi(null, () => {
              NativeEventHandler.HANDLE.postDebugLog(request);
            });
          }
        }
      } catch (error) {
        console.log('debug post error', error);
      }
    },
    uploadCloudData: async function (request, retryDelayInMilliseconds = START_VALUE_MS) {

      try {
        const response = await postWithAuthorization(Sign_In_Api, request);

        if (response?.status != 200 || !response?.data?.data) {
          throw new Error(getErrorMessage('failed_to_complete', response.status));
        }
        
        const method = UPLOAD_CLOUD_DATA_METHODS.find(key => !!response.data.data?.[key]?.statusCode);
        const statusCode = method ? response.data.data[method].statusCode : null;
        
        if (!statusCode) {
          throw new Error(getErrorMessage('failed_to_graphql', response.status));
        }
        
        if (statusCode == 302 || statusCode == 303) {
          await refreshTokenApi(null, () => {
            NativeEventHandler.HANDLE.uploadCloudData(request);
          });
        }

      } catch (error) {

        if (retryDelayInMilliseconds <= MAX_RETRY_DELAY) {

          DEBUG_LOGGER(`ERROR uploadCloudData: ${error.message}`,
            'HANDLE.uploadCloudData',
            FILE_NAME,
            '398',
          );

          setTimeout(() => {
            NativeEventHandler.HANDLE.uploadCloudData(request, retryDelayInMilliseconds * 2);
          }, retryDelayInMilliseconds);

        } else {
          DEBUG_LOGGER('ERROR uploadCloudData: ${error.message} --- Finished',
          'HANDLE.uploadCloudData',
          FILE_NAME,
          '398',
        );
        }
      }
    },
  },
};

const attachEvents = function () {
  if (hasEventsAttached) {
    console.log('EVENTS ARE ALREADY ATTACHED. NO NEED TO REATTACH');
    return;
  }

  hasEventsAttached = true;

  detachEvents();

  EventEmitterHandle.addListener(Events.AUTO_MEASURE_DATA, (e) => {
    logEvent(e, Events.AUTO_MEASURE_DATA);
  });

  EventEmitterHandle.addListener(Events.FW_UPDATE, (e) => {

    logEvent(e, Events.FW_UPDATE);
    const eventResult = JSON.parse(e[Events.FW_UPDATE]);

    if (eventResult) {
      if (eventResult.result.result == FIRMWARE_UPDATE.FIRMWARE_UPDATE_START) {
        dispatch(firmwareUpdateDFUConnected());
        return;
      }
      if (eventResult.result.result == FIRMWARE_UPDATE.FIRMWARE_UPDATE_COMPLETE) {

        if (eventResult.result.status === 'success'){
          dispatch(setUpdatedFirmwareVersion( eventResult.result?.message, eventResult.result?.status));
          dispatch(firmwareStartFlashing());
          return;
        }
        // error case, the success state
        NativeEventHandler.SEND.postFirmwareUpdate( eventResult.result);

      }
      // error or undefined states
      dispatch(firmwareUpdateResultError(eventResult.result.message));
    }
  });

  EventEmitterHandle.addListener(Events.INSTANT_MEASURE_PROGRESS, (e) => {
    logEvent(e, Events.INSTANT_MEASURE_PROGRESS);
    let jsonStr = e[Events.INSTANT_MEASURE_PROGRESS];

    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        let progressData = JSON.parse(jsonStr);
        NativeEventHandler.HANDLE.instantMeasureProgress(progressData.result);
      } catch (e) {
        console.log(e);
      }
    }
  });

  EventEmitterHandle.addListener(Events.INSTANT_MEASURE_SUCCESS, (e) => {
    logEvent(e, Events.INSTANT_MEASURE_SUCCESS);
    let jsonStr = e[Events.INSTANT_MEASURE_SUCCESS];

    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        // let progressData = JSON.parse(jsonStr);
        instantMeasureHandler(jsonStr);
        // NativeEventHandler.HANDLE.instantMeasureSuccess(progressData);
      } catch (e) {
        console.log(e);
      }
    }
  });

  EventEmitterHandle.addListener(Events.INSTANT_MEASURE_RESULT, (e) => {
    logEvent(e, Events.INSTANT_MEASURE_RESULT);
    let jsonStr = e[Events.INSTANT_MEASURE_RESULT];
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        instantMeasureHandler(jsonStr);
      } catch (e) {
        console.log(e);
      }
    }
  });

  EventEmitterHandle.addListener(Events.DEBUG_LOG, (e) => {
    NativeEventHandler.HANDLE.postDebugLog(e.DebugLog);
  });
  EventEmitterHandle.addListener(Events.UPLOAD_ON_CLOUD, (e) => {
    NativeEventHandler.HANDLE.uploadCloudData(JSON.parse(e.UploadOnCloud));
  });
  EventEmitterHandle.addListener(Events.SCAN_RESULT, (e) => {
    logEvent(e, Events.SCAN_RESULT);

    let jsonStr = e[Events.SCAN_RESULT];
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        if (jsonStr.CommonResult) {
          handleCommonResults(jsonStr.CommonResult);
        } else {
          handleConnect(jsonStr);
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
  EventEmitterHandle.addListener(Events.CALIBRATION_RESULT, (e) => {
    logEvent(e, Events.CALIBRATION_RESULT);
    DEBUG_LOGGER('Calibrate Result', 'event listener', FILE_NAME, '327');
    let jsonStr = e[Events.CALIBRATION_RESULT];
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        // CalibrateCommandHandler.calibrateSuccess();
        // let progressData = JSON.parse(jsonStr);
        calibrationHandler(jsonStr);
      } catch (e) {
        console.log(e);
      }
    }
  });
  EventEmitterHandle.addListener(Events.CALIBRATION_STEP_TWO_PROGRESS, (e) => {
    logEvent(e, Events.CALIBRATION_STEP_TWO_PROGRESS);
    DEBUG_LOGGER('Calibrate RawDataMeasure', 'event listener', FILE_NAME, '345');
    let jsonStr = e[Events.CALIBRATION_STEP_TWO_PROGRESS];
    // alert('Raw Data Percentage' + JSON.stringify(jsonStr));
    if (!jsonStr) {
      jsonStr = e;
    }

    let progressData = JSON.parse(jsonStr);

    let percentage = progressData.result.transfercompletes.split('%')[0] * 1; //ASMIT CHANGE - THIS NEEDS TO GET CHANGED FROM NATIVE END

    if (isNaN(percentage)) {
      throw new Error('Percentage value for measure progress cannot be parsed');
    }

    if (jsonStr) {
      try {
        CalibrateCommandHandler.calibrateProgress(percentage);
        if (percentage > 99) {
          CalibrateCommandHandler.calibrateStepThree();
        }

        // CalibrateCommandHandler.calibrateSuccess();
        // let progressData = JSON.parse(jsonStr);
        // calibrationHandler(jsonStr);
      } catch (e) {
        console.log(e);
      }
    }
  });
  EventEmitterHandle.addListener(Events.MEAL_RESULT, (e) => {
    logEvent(e, Events.MEAL_RESULT);
    DEBUG_LOGGER('Meals Result Event', 'Event Listener', FILE_NAME, '377');
    let jsonStr = e[Events.MEAL_RESULT];
    // alert('Meals Event' + JSON.stringify(jsonStr));
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        MealsCommandHandler.refreshMeals();
      } catch (e) {
        console.log(e);
      }
    }
  });
  EventEmitterHandle.addListener(Events.STEP_COUNT_RESULT, (e) => {
    logEvent(e, Events.STEP_COUNT_RESULT);
    // DEBUG_LOGGER('Step Count Event', 'Event Listener', FILE_NAME, '345');
    let jsonStr = e[Events.STEP_COUNT_RESULT];
    // alert('Steps Event' + JSON.stringify(jsonStr));
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
        MeasureCommandHandler.autoMeasureSuccess();
      } catch (e) {
        console.log(e);
      }
    }
  });
  EventEmitterHandle.addListener(Events.APP_SYNC_SUCCESS, (e) => {
    logEvent(e, Events.APP_SYNC_SUCCESS);
    let jsonStr = e[Events.APP_SYNC_SUCCESS];
    if (!jsonStr) {
      jsonStr = e;
    }

    if (!jsonStr) return;

    setWatchVersion(jsonStr.FirmwareRevision, EVENT_MANAGER.SEND.postFirmwareUpdate);
    try {
      appSyncHandler(jsonStr.InstantMeasureResult);
    } catch (e) {
      console.log(e);
    }

  });

  // TODO: This listener is doing nothing. It should be removed or fixed.
  EventEmitterHandle.addListener(Events.COMMON_RESULT, (e) => {
    logEvent(e, Events.COMMON_RESULT);

    let jsonStr = e[Events.COMMON_RESULT];
    if (!jsonStr) {
      jsonStr = e;
    }

    if (jsonStr) {
      try {
      } catch (e) {
        console.log(e);
      }
    }
  });

  EventEmitterHandle.addListener(Events.TIMER_TICK, () => {
    timerTickHandler();
  });

  if (Platform.OS === 'android') {
    EventEmitterHandle.addListener(Events.INCOMPATIBLE_DEVICE, () => {
      dispatch(showIncompatibleDeviceDialog())
    });
  }
};

// Yash
// Changed To Event Based Callback
function handleConnect(data) {
  logEvent(data, Events.CONNECT_SUCCESS);
  functionName = 'handleConnect';
  DEBUG_LOGGER(JSON.stringify(data), functionName, FILE_NAME, '512');
  let connectData = null;

  try {

    connectData = JSON.parse(data);
    connectData = connectData.result;

    if (connectData.result == CONNECT_SUCCESS.WATCH_CONNECTED) {
      NativeEventHandler.HANDLE.connectSuccess(connectData.data);
      DEBUG_LOGGER(connectData.message, functionName, FILE_NAME, '447');
    } else {
      throw {
        result: connectData.result,
        eventDescription: connectData.message,
        functionName: functionName,
        fileName: FILE_NAME,
        lineNumber: '534',
      };
    }
  } catch (e) {
    DEBUG_LOGGER(e.eventDescription, functionName, FILE_NAME, e.lineNumber);
    NativeEventHandler.HANDLE.connectFail(e);
  }
}

function handleCommonResults(data) {
  functionName = 'handleCommonResult';

  DEBUG_LOGGER(JSON.stringify(data), functionName, FILE_NAME, '545');
  let watchData = null;
  watchData = JSON.parse(data);
  watchData = watchData.result;
  try {
    NativeEventHandler.HANDLE.watchSuccess(watchData.result);
    return;
  } catch (e) {
    NativeEventHandler.HANDLE.watchFail(watchData.result);
    DEBUG_LOGGER(e.eventDescription, functionName, FILE_NAME, e.lineNumber);
  }
}

function appSyncHandler(data) {
  let appSyncData = 'null';
  functionName = 'appSyncHandler';

  try {
    appSyncData = JSON.parse(data);
    appSyncData = appSyncData.result;

    if (appSyncData.result == APP_SYNC_SUCCESS.APPSYNC_ACKNOWLEDGE) {
      return;
    }

    if (appSyncData.result == APP_SYNC_SUCCESS.APP_SYNC_COMPLETED) {
      NativeEventHandler.HANDLE.appSyncSuccess(appSyncData.data);
      DEBUG_LOGGER(appSyncData.message, functionName, FILE_NAME, '587');
    } else {
      throw {
        result: appSyncData.result,
        eventDescription: appSyncData.message,
        functionName,
        fileName: FILE_NAME,
        lineNumber: '660',
      };
    }
  } catch (e) {
    DEBUG_LOGGER(e.eventDescription, functionName, FILE_NAME, e.lineNumber);
    NativeEventHandler.HANDLE.appSyncFail(e);
    return false;
  }
}

function instantMeasureHandler(data) {
  DEBUG_LOGGER(
    `entered in instant measure handler`,
    functionName,
    FILE_NAME,
    '600',
  );

  let connectData = null;
  // console.log(typeof data);
  // console.log(data);
  functionName = 'instantMeasureHandler';

  try {
    connectData =
      data.result && typeof data.result == 'string'
        ? JSON.parse(data.result)
        : JSON.parse(data);
    connectData = connectData.result;

    DEBUG_LOGGER(
      `${connectData.message} result code ${connectData.result}`,
      functionName,
      FILE_NAME,
      '609',
    );

    if (connectData.result == MEASURE_PROGRESS.AUTO_MEASURE_STARTED) {
      DEBUG_LOGGER(
        `auto measure started ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '617',
      );
      MeasureCommandHandler.autoMeasureStarted();
      return;
    } else if (connectData.result == MEASURE_PROGRESS.MEASURE_ACKNOWLEDGE) {
      DEBUG_LOGGER(
        `instantMeasure measure in progress ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '628',
      );
      return;
    } else if (connectData.result == MEASURE_PROGRESS.MEASURE_IN_PROGRESS) {
      DEBUG_LOGGER(
        `instantMeasure measure in progress ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '638',
      );

      return;
    } else if (connectData.result == MEASURE_SUCCESS.AUTO_MEASURE_COMPLETED) {
      DEBUG_LOGGER(
        `autoMeasure Completed ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '665',
      );

      MeasureCommandHandler.autoMeasureSuccess();

      return;
    } else if (
      connectData.result == MEASURE_SUCCESS.INSTANT_MEASURE_COMPLETED
    ) {
      DEBUG_LOGGER(
        `instantMeasure Success Message: -${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '656',
      );
      NativeEventHandler.HANDLE.instantMeasureSuccess(connectData.data);
    } else {
      DEBUG_LOGGER(
        `${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '683',
      );
      throw {
        result: connectData.result,
        eventDescription: `${connectData.message} result code ${connectData.result}`,
        functionName,
        fileName: FILE_NAME,
        lineNumber: '690',
      };
    }
    return;
  } catch (e) {
    DEBUG_LOGGER(e.eventDescription, functionName, FILE_NAME, e.lineNumber);
    NativeEventHandler.HANDLE.instantMeasureFail(e); // console.log(e);
    return;
  }
}

function calibrationHandler(data) {
  let connectData = null;
  console.log(typeof data);
  console.log(data);
  functionName = 'calibrationHandler';
  try {
    connectData =
      data.result && typeof data.result == 'string'
        ? JSON.parse(data.result)
        : JSON.parse(data);
    connectData = connectData.result;

    DEBUG_LOGGER(
      `${connectData.message} result code ${connectData.result}`,
      functionName,
      FILE_NAME,
      '602',
    );

    if (connectData.result == CALIBRATION_SUCCESS.CALIBRATION_ACKNOWLEDGE) {
      // alert('Calibration acknowledge');
      DEBUG_LOGGER(
        `calibration acknowledge ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '714',
      );

      return;
    }
    if (
      connectData.result == CALIBRATION_SUCCESS.CALIBRATION_MEASURE_COMPLETE
    ) {
      // alert('Calibration Measure Complete Code');

      DEBUG_LOGGER(
        `calibration measure complete ${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '728',
      );
      CalibrateCommandHandler.calibrateStepTwo();
      return;
    }
    // if (
    //   connectData.result == CALIBRATION_SUCCESS.CALIBRATION_MEASURE_PROGRESS
    // ) {
    //   // alert('Calibration Measure progress step Three');
    //   DEBUG_LOGGER(
    //     `calibration measure progress ${connectData.message} result code ${
    //       connectData.result
    //     }`,
    //     functionName,
    //     FILE_NAME,
    //     '504',
    //   );
    //   CalibrateCommandHandler.calibrateStepThree();
    //   return;
    // }
    // alert('Calibration Success');
    if (connectData.result == CALIBRATION_SUCCESS.CALIBRATION_SUCCESS) {
      NativeEventHandler.HANDLE.calibrationSuccess(connectData.data);
      DEBUG_LOGGER(
        `calibration Success Message: -${connectData.message} result code ${connectData.result}`,
        functionName,
        FILE_NAME,
        '753',
      );
    } else {
      throw {
        result: connectData.result,
        eventDescription: `calibration Error Message: -${connectData.message} result code ${connectData.result}`,
        functionName,
        fileName: FILE_NAME,
        lineNumber: '761',
      };
    }
  } catch (e) {
    DEBUG_LOGGER(e.eventDescription, functionName, FILE_NAME, e.lineNumber);
    NativeEventHandler.HANDLE.calibrationFail(e);
    return false;
  }
}

const detachEvents = function () {
  try {
    Object.keys(Events).forEach((eventKey) => {
      if (Events[eventKey]
        && typeof EventEmitterHandle?.removeCurrentListener === 'function')
        EventEmitterHandle.removeCurrentListener(Events[eventKey]);
    });
  } catch (e) {
    console.warn("Error 'detachEvents'", e);
  }
};


/**
 * This function will call native method, which initiate disconnecting from watch and start
 * waiting for DFU device.
 */
export const continueWithUploadingToWatch = async (  ) => {
  const {
    fileSize
  } = selectFirmwareUpdateParams(store.getState());

  const {
    userId,
    filePath,
    device_msn,
    version,
  } = selectStoredFirmwareUpdateMeta(store.getState());

  // wait one minute for disconnection.
  // it should take only few seconds, so 1 minute should be enough
  let counterSeconds = 60;

  while (counterSeconds >= 0) {
    if (!selectWatchConnected(store.getState())){

      EVENT_MANAGER.SEND.startFirmwareUpdate(
          userId,
          filePath,
          device_msn,
          version,
      );

      dispatch(firmwareUpdateStartedAction(fileSize));

      return;
    }
    await sleep(1000);
    counterSeconds--;

  }

  if (selectWatchConnected(store.getState())){
    // Watch should be disconnected before DFU mode ->  throw error
    //TODO; translate
    dispatch(firmwareUpdateResultError('Watch is not switched to updating mode.'));
  }
}

export const startDfuMode = () => {
  EVENT_MANAGER.SEND.startDfuMode();
}

function logEvent(e, e_name) {
  console.log(
    '========================================================================================',
  );
  console.log(e_name);
  console.log(e);
  console.log(
    '=========================================================================================',
  );
}

attachEvents();

export const EVENT_MANAGER = {
  ...NativeEventHandler,
  subscribe: attachEvents,
  unsubscribe: detachEvents,
};
