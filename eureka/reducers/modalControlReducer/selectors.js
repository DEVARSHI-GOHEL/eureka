const getStatusModalWindows = (appState) => appState.modalStatuses;

export const selectIsShowShutdownModal = (appState) =>
  getStatusModalWindows(appState).isShowShutdownModal;

export const selectIsShowMeasureFailedModal = (appState) =>
  getStatusModalWindows(appState).isShowMeasureFailedModal;

export const selectIsShowSkinNotDetected = (appState) =>
  getStatusModalWindows(appState).isShowSkinNotDetected;
