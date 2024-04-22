import {
  FIRMWARE_ACTION_SHOW_ASK_START_MODAL,
  FIRMWARE_ACTION_HIDE_ASK_START_MODAL,
  FIRMWARE_ACTION_INIT,
  FIRMWARE_ACTION_START_DOWNLOADING,
  FIRMWARE_ACTION_FILES_DOWNLOADED,
  FIRMWARE_ACTION_FILES_DOWNLOAD_PROGRESS,
  FIRMWARE_ACTION_STARTED,
  FIRMWARE_ACTION_SHOW_UPDATE_PROGRESS,
  FIRMWARE_ACTION_DFU_CONNECTED,
  FIRMWARE_ACTION_WATCH_CONNECTED,
  FIRMWARE_ACTION_FLASHING,
  FIRMWARE_ACTION_STOP,
  FIRMWARE_ACTION_SET_RESULT,
  FIRMWARE_SCREEN_WIZARD_SHOWN,
} from './type';
import {FirmwareUpdateResult, FirmwareUpdateState} from './constants';
import moment from "moment";
import {ANIMATION_TO_FINISH} from "../components/CircleLoaderConfig";

/**
 * Flashing speed 1MB/20 sec = 52kb/sec
 */
export const ESTIMATED_FLASHING_SPEED_PER_SEC = 52428;


const INITIAL_STATE = {
    allowInstallAgain: false,
    dfuConnected: false,
    downloadPercentage: 0,
    errorMessage: '',
    expectWatchToConnect: false,
    fileSize: 0,
    flashingDurationSec: null,
    flashingFrom: null,
    resultModalVisible: null,
    showAskStartDialog: false,
    showScreen: false,
    timeout: null,
    updateResult: FirmwareUpdateResult.INITIAL, // values from FirmwareUpdateResult
    updateState: FirmwareUpdateState.INITIAL, // values from FirmwareUpdateState
    uploadStartedAt: null,
    wizardVisible: false,
};

// time constants
const MIN = 60 * 1000;
const FIVE_MINS = 5 * MIN;
const TWO_HOURS = 120 * MIN;

const INIT_PARAMS = {
    allowInstallAgain: false,
    dfuConnected: false,
    downloadPercentage: 0,
    errorMessage: null,
    expectWatchToConnect: false,
    firmwareUpdateParams: {},
    flashingDurationSec: null,
    flashingFrom: null,
    showScreen: false,
    updateResult: FirmwareUpdateResult.INITIAL,
    updateState: FirmwareUpdateState.INITIAL,
    uploadStartedAt: null,
}

const reducer = {
    [FIRMWARE_ACTION_INIT]: (state) => ({
        ...state,
        ...INIT_PARAMS,
    }),

    [FIRMWARE_ACTION_START_DOWNLOADING]: (state) => ({
        ...state,
        ...INIT_PARAMS,
        updateState: FirmwareUpdateState.START_SOON,
        showScreen: true,
        showAskStartDialog: false,
    }),
    [FIRMWARE_ACTION_FILES_DOWNLOADED]: (state, {
        firmwareUpdateParams: {
            fileSize
        }
    }) => ({
        ...state,
        errorMessage: null,
        updateState: FirmwareUpdateState.INITIAL,
        showScreen: false,
        uploadStartedAt: null,
        firmwareUpdateParams: {
            fileSize,
        },
    }),
    [FIRMWARE_ACTION_FILES_DOWNLOAD_PROGRESS]: (state, {downloadPercentage}) => ({
        ...state,
        downloadPercentage,
    }),
    [FIRMWARE_ACTION_STARTED]: (state, { fileSize, showDFUTimeoutError }) => ({
        ...state,
        updateState: FirmwareUpdateState.STARTED,
        fileSize,
        flashingDurationSec: fileSize / ESTIMATED_FLASHING_SPEED_PER_SEC,
        timeout: setTimeout(showDFUTimeoutError, FIVE_MINS),
    }),
    [FIRMWARE_ACTION_SHOW_UPDATE_PROGRESS]: (state, {forceShow}) => {
        if (state.updateState ===  FirmwareUpdateState.STARTED && !state.showScreen || forceShow){
            return {
                ...state,
                showScreen: true,
            }
        }
        return state;
    },
    [FIRMWARE_ACTION_DFU_CONNECTED]: (state, {showUpgradeTimeoutError}) => ({
        ...state,
        dfuConnected: true,
        expectWatchToConnect: true,
        uploadStartedAt: moment(),
        timeout: setTimeout(showUpgradeTimeoutError, TWO_HOURS)
    }),
    [FIRMWARE_ACTION_WATCH_CONNECTED] : (state) => ({
        ...state,
        expectWatchToConnect: false,
    }),
    [FIRMWARE_ACTION_FLASHING]: (state, {flashingDone}) => ({
        ...state,
        flashingFrom: moment(),
        timeout: setTimeout(flashingDone, Math.ceil(state.flashingDurationSec*1000 + ANIMATION_TO_FINISH)),
    }),
    [FIRMWARE_ACTION_STOP]: (state) => ({
        ...state,
        flashingFrom: null,
        updateResult: FirmwareUpdateResult.INITIAL, // hide modals
        showScreen: false, // hide screen
        updateState: FirmwareUpdateState.STOP,
        dfuConnected: false,
    }),
    [FIRMWARE_ACTION_SHOW_ASK_START_MODAL]: (state) => ({
        ...state,
        showAskStartDialog: true,
    }),
    [FIRMWARE_ACTION_HIDE_ASK_START_MODAL]: (state) => ({
        ...state,
        showAskStartDialog: false,
    }),
    [FIRMWARE_ACTION_SET_RESULT]: (state, {updateResult, errorMessage = '', allowInstallAgain = false}) => {

        return {
            ...state,
            updateResult,
            errorMessage,
            showScreen: false,
            dfuConnected: false,
            allowInstallAgain,
        }
    },
    [FIRMWARE_SCREEN_WIZARD_SHOWN]: (state,{visible}) => ({
        ...state,
        wizardVisible: visible,
    }),

}

const firmwareUpdateReducer = (state = INITIAL_STATE, action) => {
    const reducerFunction = reducer[action.type];
    if (!reducerFunction) return state;

    // if there was any timeout, stop it
    if (state.timeout) {
        clearTimeout(state.timeout)
    }

    return reducerFunction({...state, timeout: null}, action);
}

export default firmwareUpdateReducer;
