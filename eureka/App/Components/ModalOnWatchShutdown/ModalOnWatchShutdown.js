import React, {memo, useState, useRef, useEffect} from 'react';
import {Animated, Image, Modal, SafeAreaView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import GradientBackground from '../GradientBackground';
import NotifeeType from '../../constants/NotifeeConstants';
import styles from './styles';
import {UIButton} from '../UI';
import {watchNotifyHandler, closeLocalNotificationByType} from '../../Services/backgroundNotifee';
import {hideShutdownModalAction} from '../../../reducers/modalControlReducer/actions';
import {selectIsShowShutdownModal} from '../../../reducers/modalControlReducer/selectors';
import {Translate} from "../../Services/Translate";

const DURATION = 500;
const MAIN_IMG = require('../../assets/images/low_battery_main.png');
const RED_IMG = require('../../assets/images/low_battery_red.png');
const MESSAGE = 'Your watch has low battery\nand shutting down soon';

export default memo(() => {
  const [isUpRed, setUp] = useState(false);
  const dispatch = useDispatch();
  const animatedStyle = useRef(new Animated.Value(0)).current;

  const isShowShutdownModal = useSelector(selectIsShowShutdownModal);

  const closeModalWindow = () => {
    dispatch(hideShutdownModalAction());
  };

  const animation = (toValue) => {
    Animated.timing(animatedStyle, {
      toValue,
      duration: DURATION,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animation(isUpRed ? 1 : 0);
    setTimeout(() => setUp(!isUpRed), DURATION);
  }, [isUpRed]);

  useEffect(() => {
    if (isShowShutdownModal) {
      watchNotifyHandler(NotifeeType.shutdownWatch);
    } else {
      closeLocalNotificationByType(NotifeeType.skinNotDetected.type);
    }
  }, [isShowShutdownModal]);

  return (
    <Modal animationType="slide" visible={isShowShutdownModal}>
      <SafeAreaView
        style={styles.mainContainer}
        contentInsetAdjustmentBehavior="automatic">
        <GradientBackground style={styles.gradientContainer}>
          <View style={styles.watchView}>
            <Image style={styles.watch} source={MAIN_IMG} />
            <Animated.Image
              style={[styles.watch, {opacity: animatedStyle}]}
              source={RED_IMG}
            />
          </View>

          <Text accessibilityLabel="shutdown-modal-message" style={styles.text}>
            {MESSAGE}
          </Text>

          <View style={styles.startBttnWrap}>
            <UIButton
              mode="contained"
              onPress={closeModalWindow}
              accessibilityLabel="shutdown-modal-got-it-button">
              {Translate('ModalOnWatchShutdown.gotIt')}
            </UIButton>
          </View>
        </GradientBackground>
      </SafeAreaView>
    </Modal>
  );
});
