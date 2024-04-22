import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  Image,
} from 'react-native';

import {UIButton} from '../../Components/UI';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {Translate} from '../../Services/Translate';

const CheckEmailScreen = ({navigation, ...props}) => {
/** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj]= useState({})

  useEffect(()=>{
    if(!_.isEmpty(Translate('checkEmailScreen'))){
      const checkEmailScreenContentObject = Translate('checkEmailScreen');
      setContentScreenObj(checkEmailScreenContentObject);
    }
  })
/** ############################ */

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
        enabled>
        <View style={styles.mainScrollView}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            <View style={{flex: 1}}>
              <Text
                style={styles.createAccHeading}
                accessibilityLabel="checkEmail-heading">
                {contentScreenObj.heading}
              </Text>
              <Text style={styles.subHeading}>{contentScreenObj.description}</Text>
              <View style={styles.iconContainer}>
                <Image
                  style={styles.icon}
                  source={require('../../assets/images/email.png')}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View>
              <UIButton
                mode="contained"
                accessibilityLabel="checkEmail-continue-button"
                onPress={() => navigation.navigate('SignInScreen')}>
                {contentScreenObj.continue_ButtonText}
              </UIButton>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CheckEmailScreen;
