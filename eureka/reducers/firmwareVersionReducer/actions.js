import {actions} from './type';

const UNDEFINED_VERSION  = 'undetected';

export const saveWatchFirmwareVersion = (watchVersion) => ({
  type: actions.FIRMWARE_VERSION_SET_WATCH_VERSION,
  watchVersion: watchVersion || UNDEFINED_VERSION
});
export const saveNewFirmwareVersion = (newVersion, isAvailable) => ({ type: actions.FIRMWARE_VERSION_SET_NEW_VERSION, newVersion, isAvailable});
export const setNewVersionsIsAvailable = (isAvailable) => ({ type: actions.FIRMWARE_VERSION_SET_NEW_VERSION_AVAILABLE, isAvailable});
export const setUpdatedFirmwareVersion = (message, status) => ({ type: actions.FIRMWARE_VERSION_SET_UPDATE_VERSION,  message, status});
export const resetUpdatedFirmwareVersion = () => ({ type: actions.FIRMWARE_VERSION_RESET_UPDATE_VERSION});


export const storeFirmwareUpdateMeta = (
    userId,
    filePath,
    device_msn,
    version,
) => ({
    type: actions.FIRMWARE_STORE_META,
    firmwareUpdateParams: {
        userId,
        filePath,
        device_msn,
        version,
    },
});
