/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Image, SafeAreaView, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import styles from './styles';
import {UIButton} from '../../Components/UI';
import GlobalStyle from '../../Theme/GlobalStyle';
import {stepCalibrationInitialForm} from '../CalibrateControlWrapper/action';
import {useTranslation} from '../../Services/Translate';
import GradientBackground from "../../Components/GradientBackground";

const CalibrateIntroScreen = () => {
  const dispatch = useDispatch();
  const trn = useTranslation('calibrateIntroScreen');

  return (
    <SafeAreaView style={styles.mainContainer}>
      <GradientBackground >
        <View style={styles.mainScrollView}>
          <View
            style={styles.mainContent}>
            <Text style={styles.header}>{trn.title}</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/calibration_graphic.png')}
                style={styles.image}
              />
            </View>
            <Text style={GlobalStyle.description}>{trn.description}</Text>
          </View>
          <View style={styles.bttnWrap}>
            <UIButton
              labelStyle={{color: '#fff'}}
              mode="contained"
              accessibilityLabel="calibrate-form-submit"
              onPress={() => {
                dispatch(stepCalibrationInitialForm());
              }}>
              {trn.button}
            </UIButton>
          </View>
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default CalibrateIntroScreen;
