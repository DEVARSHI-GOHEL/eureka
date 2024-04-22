import {FirmwareUpdateResult, FirmwareUpdateState} from "./constants";

const getFirmwareStore = (appState) => appState.firmwareUpdate;
export const isFirmwareUpdateVisible = (appState) => getFirmwareStore(appState).showScreen;
export const getFirmwareUpdateState = (appState) => getFirmwareStore(appState).updateState;
export const getDownloadPercentage = (appState) => getFirmwareStore(appState).downloadPercentage || 0;

export const isFirmwareUpdateFailed = (appState) => getFirmwareStore(appState).updateResult === FirmwareUpdateResult.FAIL;
export const getFirmwareUpdateErrorMessage = (appState) => getFirmwareStore(appState).errorMessage;
export const getFirmwareUpdateErrorInstallAgain = (appState) => getFirmwareStore(appState).allowInstallAgain;
export const isFirmwareUpdateSucceed = (appState) => getFirmwareStore(appState).updateResult === FirmwareUpdateResult.SUCCESS;
export const isFirmwareUpdateResultModalVisible = (appState) => getFirmwareStore(appState).updateResult !== FirmwareUpdateResult.INITIAL;
export const isAskModalVisible = (appState) => getFirmwareStore(appState).showAskStartDialog;
export const isDFUConnected = (appState) => getFirmwareStore(appState).dfuConnected;
export const selectExpectWatchToConnect = (appState) => getFirmwareStore(appState).expectWatchToConnect;
export const getFileSize = (appState) => getFirmwareStore(appState).fileSize;
export const getUploadStart = (appState) => getFirmwareStore(appState).uploadStartedAt;
export const selectFirmwareUpdateParams = (appState) => getFirmwareStore(appState).firmwareUpdateParams;

export const selectFirmwareUpdateStarted = (appState) => getFirmwareStore(appState).updateState === FirmwareUpdateState.STARTED;
export const selectFirmwareWizardVisible = (appState) => getFirmwareStore(appState).wizardVisible;
export const selectFirmwareFlashingTime = (appState) => {
    const {flashingFrom, flashingDurationSec} = getFirmwareStore(appState);
    return {flashingFrom, flashingDurationSec};
};
