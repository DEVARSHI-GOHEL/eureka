const getApplicationOverlayStore = (appState) => appState.applicationOverlay;
export const isIncompatible = (appState) => getApplicationOverlayStore(appState).showIncompatibleDeviceDialog;
