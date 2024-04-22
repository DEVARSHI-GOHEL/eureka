import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';

import styles from './styles';
import Fonts from '../../Theme/Fonts';

const SyncingScreen = ({ navigation, ...props }) => {
  return (
    <SafeAreaView style={ styles.mainContainer} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.getStartedView}>
          <Text style={styles.welcomeHeading} accessibilityLabel="welcome-heading">Turn over{"\n"}a new leaf</Text>
          <Text style={styles.subHeading}>Feel secure, connected and take{"\n"}control of your life.</Text>
          <View style={styles.startBttnWrap}>
            <UIButton mode="contained" onPress={() => navigation.navigate('SignUpScreen')}>Get started</UIButton>
          </View>
          <View style={styles.haveAccountContent}>
            <Text style={styles.leftText}>Already have an account?</Text>
            <TouchableOpacity
              style={styles.signInBttn}
              onPress={() => navigation.navigate('SignInScreen')}
              accessible={false}
            >
              <Text style={styles.rightText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
}

export default SyncingScreen;
