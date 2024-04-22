import React, {useState, useRef, useEffect} from 'react';
import _ from 'lodash'
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity, ScrollView
} from 'react-native';

import styles from './styles';
import {UIButton, UILoader, UITextInput, UILogo} from '../../Components/UI';
import {Translate, useTranslation} from '../../Services/Translate';

const WelcomeScreen = ({navigation, ...props}) => {

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('welcomeScreen')

  /** ############################ */

  return (
    <SafeAreaView style={[styles.mainContainer]} contentInsetAdjustmentBehavior="automatic">
      <ScrollView style={styles.innerContainer}>
        <View style={styles.logoArea}>
          <UILogo widthParam={35} heightParam={35}/>
          <Text style={styles.logoText}>{contentScreenObj.logo_text}</Text>
        </View>

        <View style={styles.imageContent}>
          <Image style={styles.signInImage}
                 source={require('../../assets/images/signin_watch.jpg')}/>
        </View>

        <View style={styles.getStartedView}>
          <Text style={styles.welcomeHeading}>{contentScreenObj.heading}</Text>
          <Text style={styles.subHeading}>{contentScreenObj.subHeading}</Text>
          <View style={styles.startBttnWrap}>
            <UIButton onPress={() => navigation.navigate('SignUpScreen')}
                      accessibilityLabel="get-started-button">{contentScreenObj.getStarted_ButtonText}</UIButton>
          </View>
          <View style={styles.haveAccountContent}>
            <Text style={styles.leftText}>{contentScreenObj.haveAccountText}</Text>
            <TouchableOpacity
              style={styles.signInBttn}
              onPress={() => navigation.navigate('SignInScreen')}
              accessibilityLabel="sign-in-button"
              accessible={false}
            >
              <Text style={styles.rightText}>{contentScreenObj.signIn_ButtonText}</Text>
            </TouchableOpacity>
          </View>
          {!!contentScreenObj.additionalText && (<Text style={styles.additionalText}>{contentScreenObj.additionalText}</Text>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default WelcomeScreen;
