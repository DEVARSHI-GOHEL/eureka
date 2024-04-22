const getFirmwareVersionStore = (appState) => appState.firmwareVersionReducer;

export const selectWatchFirmwareVersion = (appState) => getFirmwareVersionStore(appState).watchVersion;
export const selectNewFirmwareVersion = (appState) => getFirmwareVersionStore(appState).newVersion;
export const selectNewFirmwareExists = (appState) => getFirmwareVersionStore(appState).newVersionAvailable;
export const selectUpdatedFirmwareVersion = (appState) => getFirmwareVersionStore(appState).updatedFirmwareVersion;
export const selectFirmwareUploadResult = (appState) => { return getFirmwareVersionStore(appState).uploadResult || {} };

export const selectFirmwareUpdateFlagIsSet = (appState) => !!getFirmwareVersionStore(appState).updatedFirmwareVersion;
export const selectStoredFirmwareUpdateMeta = (appState) => getFirmwareVersionStore(appState).firmwareUpdateParams;
