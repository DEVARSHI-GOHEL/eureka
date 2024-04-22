export const actions = {
  // Shutdown Watch Modal
  SHUTDOWN_MODAL_SET_HIDE: 'SHUTDOWN_MODAL_SET_HIDE',
  SHUTDOWN_MODAL_SET_SHOW: 'SHUTDOWN_MODAL_SET_SHOW', 

  // Measure Failed Modal
  MEASURE_FAILED_MODAL_SET_HIDE: 'MEASURE_FAILED_MODAL_SET_HIDE',
  MEASURE_FAILED_MODAL_SET_SHOW: 'MEASURE_FAILED_MODAL_SET_SHOW',

  // Watch Can Not Detect Skin
  SKIN_NOT_DETECT_SET_HIDE: 'SKIN_NOT_DETECT_SET_HIDE',
  SKIN_NOT_DETECT_SET_SHOW: 'SKIN_NOT_DETECT_SET_SHOW',

  // All Modals
  SET_HIDE_FOR_ALL_MODALS: 'SET_HIDE_FOR_ALL_MODALS',
};

// Shutdown Watch Modal Action
export const hideShutdownModalAction = () => ({ type: actions.SHUTDOWN_MODAL_SET_HIDE });
export const showShutdownModalAction = () => ({ type: actions.SHUTDOWN_MODAL_SET_SHOW });

// Measure Failed Modal Action
export const hideMeasureFailedModalAction = () => ({ type: actions.MEASURE_FAILED_MODAL_SET_HIDE });
export const showMeasureFailedModalAction = () => ({ type: actions.MEASURE_FAILED_MODAL_SET_SHOW });

// Watch Can Not Detect Skin Action
export const hideSkinNotDetectedModalAction = () => ({ type: actions.SKIN_NOT_DETECT_SET_HIDE });
export const isShowSkinNotDetectedModalAction = (bool) => ({ 
  type: bool ? actions.SKIN_NOT_DETECT_SET_SHOW : actions.SKIN_NOT_DETECT_SET_HIDE  
});

export const ModalAction = {
  hideShutdownModalAction:'hideShutdownModalAction',
  hideMeasureFailedModalAction:'hideMeasureFailedModalAction',
  hideSkinNotDetectedModalAction:'hideSkinNotDetectedModalAction',
}

const ModalActionFunctionMap = {
  hideShutdownModalAction: hideShutdownModalAction,
  hideMeasureFailedModalAction:hideMeasureFailedModalAction,
  hideSkinNotDetectedModalAction: hideSkinNotDetectedModalAction,
}

export const isModalAction = (key) => {
  return !!ModalActionFunctionMap[key];
}

export const callModalAction = (key) => {
  if (ModalActionFunctionMap[key]){
    return ModalActionFunctionMap[key]()
  }
  return null;
}

export const hideAllModalsAction = () => ({ type: actions.SET_HIDE_FOR_ALL_MODALS });
