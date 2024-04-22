import { FirmwareUpdateResult } from "./constants";
import { dispatch } from "../../../../store/store";
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
FIRMWARE_DUMMY_ACTION,
} from './type';
import {dispatchFirmwareUpdateStopAction} from "./richActions";

const showDFUTimeoutError = () => {
  dispatch(firmwareUpdateResultError('Can not connect to DFU'));
}

const showUpgradeTimeoutError = () => {
  dispatch(firmwareUpdateResultError('Firmware upgrade fails due to a timeout'));
}

const flashingDone = () => {
  dispatchFirmwareUpdateStopAction();
}

/**
 * Reset redux state - prepare for handling actions
 */
export const firmwareUpdateInit = () => ({ type: FIRMWARE_ACTION_INIT });

/**
 * Show "start soon" screen
 */
export const firmwareUpdateStartDownloading = () => ({ type: FIRMWARE_ACTION_START_DOWNLOADING });

/**
 * Save info about downloaded files.
 */
export const firmwareFilesDownloaded = (
  fileSize
) => ({
  type: FIRMWARE_ACTION_FILES_DOWNLOADED,
  firmwareUpdateParams: {
    fileSize
  },
});

/**
 * Store downloading progress of firmware files.
 *
 * @param downloadPercentage
 * @return {{type: string, downloadPercentage: number}}
 */
export const firmwareFilesDownloadProgress = (downloadPercentage) => {
  if (typeof downloadPercentage !== 'number') {
    console.warn(`firmwareFilesDownloadProgress accepts only number value. Current is: ${downloadPercentage}`);
    // dispatch no action in case of wrong type
    return { type: FIRMWARE_DUMMY_ACTION };
  }

  return { type: FIRMWARE_ACTION_FILES_DOWNLOAD_PROGRESS, downloadPercentage }
};

/**
 * Save time when updating process starts. Add file size to estimate the duration.
 */
export const firmwareUpdateStartedAction = (fileSize) => ({ type: FIRMWARE_ACTION_STARTED,  fileSize, showDFUTimeoutError });

/**
 * Show Updating status. This action has effect only when firmwareUpdateStartedAction was called before.
 */
export const firmwareUpdateShowStatusScreen = (force = false) => ({ type: FIRMWARE_ACTION_SHOW_UPDATE_PROGRESS, forceShow: force });

/**
 * Show "Update started" screen
 */
export const firmwareUpdateDFUConnected = () => ({
  type: FIRMWARE_ACTION_DFU_CONNECTED,
  showUpgradeTimeoutError
});

/**
 * Watch are connected back again - used after update.
 */
export const firmwareUpdateWatchConnected = () => ({ type: FIRMWARE_ACTION_WATCH_CONNECTED });

/**
 * Show error dialog
 */
export const firmwareUpdateResultError = (errorMessage, allowInstallAgain = false) => ({
  type: FIRMWARE_ACTION_SET_RESULT,
  updateResult: FirmwareUpdateResult.FAIL,
  errorMessage,
  allowInstallAgain,
});

/**
 * Show success dialog
 */
export const firmwareUpdateResultSuccess = () => ({
  type: FIRMWARE_ACTION_SET_RESULT,
  updateResult: FirmwareUpdateResult.SUCCESS
});

/**
 * After firmware was uploaded to watches, the watch start flashing.
 * This indicates, when the moment happened. After filesize/flashingSpeed second will be fired
 * action firmwareUpdateStop for ending the update process (this is set in reducer).
 */
export const firmwareStartFlashing = () => ({
  type: FIRMWARE_ACTION_FLASHING,
  flashingDone
});

/**
 * Stop update flow - no alert will show in this state - after timeout, there may come other errors. .
 */
export const firmwareUpdateStop = () => ({ type: FIRMWARE_ACTION_STOP });

/**
 * Show modal with question, whether user wants to start upgrading firmware.
 */
export const firmwareShowAskForStart = () => ({ type: FIRMWARE_ACTION_SHOW_ASK_START_MODAL });

/**
 * Hide modal
 * @return {{type: string}}
 */
export const firmwareHideAskForStart = () => ({ type: FIRMWARE_ACTION_HIDE_ASK_START_MODAL });

/**
 * Store info, whether the wizard is visible. It is used to prevent from checking firmware update.
 *
 * @param visible
 * @return {{visible, type: string}}
 */
export const setWizardIsVisible = (visible) => ({ type: FIRMWARE_SCREEN_WIZARD_SHOWN, visible });
