import React, {memo, useEffect, useCallback, useState} from 'react';
import {Modal, SafeAreaView, Text, View, Image, ScrollView} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import GradientBackground from '../GradientBackground';
import NotifeeType from '../../constants/NotifeeConstants';
import startMeasure from '../../utils/startMeasure';
import styles from './styles';
import {UIButton} from '../UI';
import {hideMeasureFailedModalAction} from '../../../reducers/modalControlReducer/actions';
import {selectIsShowMeasureFailedModal} from '../../../reducers/modalControlReducer/selectors';
import {watchNotifyHandler, closeLocalNotificationByType} from '../../Services/backgroundNotifee';
import NavigationService from "../../Navigators/NavigationService";
import {Translate, useTranslation} from "../../Services/Translate";

const IMG = require('../../assets/images/handWithWatch.png');

const DOT = '●\t';

const HEADER = 'Unsuccessful measurement';
const TITLE = 'Please follow the steps below and repeat the measurement:';
const MESSAGES = [
  'text1',
  'text2',
  'text3',
  'text4',
  'text5',
  'text6',
];

export default memo(() => {
  const dispatch = useDispatch();
  
  const isShowMeasureFailedModal = useSelector(selectIsShowMeasureFailedModal);
  const trn = useTranslation('ModalMeasureFailed');

  const closeModalWindow = useCallback(() => {
    dispatch(hideMeasureFailedModalAction());
  }, [dispatch]);

  const handleOnMeasureClick = useCallback(() => {
    closeModalWindow();
    startMeasure(NavigationService); 
  }, [closeModalWindow]);

  useEffect(() => {
    if (isShowMeasureFailedModal) {
      watchNotifyHandler(NotifeeType.measureFailed);
    } else {
      closeLocalNotificationByType(NotifeeType.measureFailed.type);
    }
  }, [isShowMeasureFailedModal]);

  return (
    <Modal animationType="slide" visible={isShowMeasureFailedModal}>
      <SafeAreaView
        style={styles.mainContainer}
        contentInsetAdjustmentBehavior="automatic">
        <GradientBackground style={styles.gradientContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.header} accessibilityLabel="measure-failed-modal-title">
              {trn.header}
            </Text>

            <ScrollView>
              <View style={styles.watchView}>
                <Image source={IMG} />
              </View>

              <Text style={styles.title} accessibilityLabel="measure-failed-modal-title">
                {trn.title}
              </Text>

              {MESSAGES.map((text) => (
                  <Text accessibilityLabel="measure-failed-modal-message1" style={styles.text}>
                    {trn[text]}
                  </Text>
              ))}
            </ScrollView>
          </View>

          <View style={styles.bttnWrap}>
            <UIButton
              style={styles.bttn}
              mode="contained"
              onPress={handleOnMeasureClick}
              accessibilityLabel="measure-failed-modal-measure-button">
              {trn.btnMeasure}
            </UIButton>
            <UIButton
              style={styles.bttn}
              mode="contained"
              onPress={closeModalWindow}
              accessibilityLabel="measure-failed-modal-got-it-button">
              {Translate('ModalOnWatchShutdown.gotIt')}
            </UIButton>
          </View>
        </GradientBackground>
      </SafeAreaView>
    </Modal>
  );
});
