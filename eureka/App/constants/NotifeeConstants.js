import {AndroidImportance} from '@notifee/react-native';
import {ModalAction} from "../../reducers/modalControlReducer/actions";

export const channelId = {
  id: '12312312312',
  name: 'LifeLeaf Channel',
  importance: AndroidImportance.HIGH
};

export default {
  shutdownWatch: {
    channelId,
    data: {
      actionClose: ModalAction.hideShutdownModalAction
    },
    title: 'notifications.warning',
    body: 'notifications.shutdownWatch_body',
    type: 'SHUTDOWN_WATCH'
  },
  measureFailed: {
    channelId,
    data: {
      actionClose: ModalAction.hideMeasureFailedModalAction,
    },
    title: 'notifications.warning',
    body: 'ModalMeasureFailed.header',
    type: 'MEASURE_FAILED',
  },
  skinNotDetected: {
    channelId,
    data: {
      actionClose: ModalAction.hideSkinNotDetectedModalAction,
    },
    title: 'notifications.warning',
    body: 'ModalSkinNotDetected.header',
    type: 'SKIN_NOT_DETECTED',
  }
};
