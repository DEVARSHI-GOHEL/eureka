import React, {memo, useEffect, useCallback} from 'react';
import {Image, Modal, SafeAreaView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {t} from 'i18n-js';

import GradientBackground from '../GradientBackground';
import NotifeeType from '../../constants/NotifeeConstants';
import styles from './styles';
import {UIButton} from '../UI';
import {watchNotifyHandler, closeLocalNotificationByType} from '../../Services/backgroundNotifee';
import {isShowSkinNotDetectedModalAction, hideSkinNotDetectedModalAction} from '../../../reducers/modalControlReducer/actions';
import {selectIsShowSkinNotDetected} from '../../../reducers/modalControlReducer/selectors';

import {
  selectIsWatchBatteryNormal, 
  selectIsWatchChargerDisconnected,
  selectIsWatchNotOnWrist, 
} from '../../Containers/HomeScreen/homeSelectors';
import {selectIsMeasuring} from "../../Containers/MeasureNowConnectionScreen/selectors";
import {Translate} from "../../Services/Translate";
import {selectFirmwareUpdateInProgress} from "../../Ble/handlers/TimerTickHandler";

const MAIN_IMG = require('../../assets/images/skinNotDetected.png');
const MARKER = '●';

const MESSAGES = [
  'ModalSkinNotDetected.message1',
  'ModalSkinNotDetected.message2',
  'ModalSkinNotDetected.message3',
  'ModalSkinNotDetected.message4',
];

export default memo(() => {
  const dispatch = useDispatch();

  const firmwareUpdateInProgress = useSelector(selectFirmwareUpdateInProgress);

  const isSkinNotDetected = useSelector(selectIsShowSkinNotDetected);
  const isWatchBatteryNormal = useSelector(selectIsWatchBatteryNormal);
  const isWatchChargerDisconnected = useSelector(selectIsWatchChargerDisconnected);
  const isWatchNotOnWrist = useSelector(selectIsWatchNotOnWrist);
  const isMeasuring = useSelector(selectIsMeasuring);

  const isShowModal = !firmwareUpdateInProgress && isSkinNotDetected;

  const closeModalWindow = useCallback(() => {
    dispatch(hideSkinNotDetectedModalAction());
  }, [dispatch]);

  useEffect(() => {
    if (isShowModal) {
      watchNotifyHandler(NotifeeType.skinNotDetected);
    } else {
      closeLocalNotificationByType(NotifeeType.skinNotDetected.type);
    }
  }, [isShowModal]);

  useEffect(() => {
    dispatch(isShowSkinNotDetectedModalAction(
      isWatchBatteryNormal && isWatchChargerDisconnected && isWatchNotOnWrist && !isMeasuring
    ))
  }, [isWatchBatteryNormal, isWatchChargerDisconnected, isWatchNotOnWrist , isMeasuring]);

  

  return (
    <Modal animationType="slide" visible={isShowModal}>
      <SafeAreaView
        style={styles.mainContainer}
        contentInsetAdjustmentBehavior="automatic">
        <GradientBackground style={styles.gradientContainer}>

          <View style={styles.watchView}>
            <Text
              style={styles.header}
              accessibilityLabel="measure-failed-modal-title">
              {t('ModalSkinNotDetected.header')}
            </Text>
            <Image style={styles.watch} source={MAIN_IMG} />
          </View>

          <View style={styles.rowsView}>
            {MESSAGES.map((text, ind) => (
              <View style={styles.row} accessibilityLabel={`measure-failed-modal-message${ind}`}>
                <Text style={styles.marker}>{MARKER}</Text>
                <Text style={styles.text}>{t(text)}</Text>
              </View>
            ))}
          </View>

          <UIButton
            mode="contained"
            onPress={closeModalWindow}
            accessibilityLabel="measure-failed-modal-got-it-button">
            {Translate('ModalOnWatchShutdown.gotIt')}
          </UIButton>

        </GradientBackground>
      </SafeAreaView>
    </Modal>
  );
});
