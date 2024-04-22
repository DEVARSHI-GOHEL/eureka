/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  BackHandler,
} from 'react-native';

import IconFont from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Fonts} from '../../Theme';
import {
  UITextInput,
  UIButton,
  UIToast,
  UILoader,
  UICommingSoon,
  UIGenericPlaceholder,
} from '../../Components/UI';
import * as Animatable from 'react-native-animatable';
import styles from './styles';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {Sign_In_Api} from '../../Theme';
import {Config} from '../../Theme/Constant/Constant';
import {API} from '../../Services/API';
import {APP_RELEASE_DATE, APP_VERSION} from '../../Theme/Constant/Constant';
import {useNetInfo} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNDeviceInfo from 'react-native-device-info';
import {Translate} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

const FeedbackScreen = ({navigation}) => {
  const netInfo = useNetInfo();

  const [message, setMessage] = useState('');

  const [animateState, setAnimateState] = useState('toastAnimation');

  const [snackVisible, setSnackVisible] = useState(false);

  const [isCommingSoon, setIsCommingSoon] = useState(true);

  const [isLoader, setIsLoader] = useState(false);

  const [loaderText, setLoaderText] = useState('');

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('feedbackScreen'))) {
      const feedbackScreenContentObject = Translate('feedbackScreen');
      setContentScreenObj(feedbackScreenContentObject);
    }
  });
  /** ############################ */

  /**
   * Disable back button during api call
   */
  const [isBackEnable, setIsBackEnable] = React.useState(false);
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isBackEnable) {
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isBackEnable, setIsBackEnable]),
  );

  /**
   * Disable header and hardware back during after any api call
   */
  const backHandleHeaderDisableFun = () => {
    setIsBackEnable(true); //block user to back press
    navigation.setOptions({
      headerLeft: ({navigation}) => (
        <HeaderBackButton tintColor={'lightgray'} />
      ),
    });
  };

  /**
   * revert header and hardware back back to normal state and user can able to back
   */
  const backHandleHeaderNormalFun = () => {
    setIsBackEnable(false);
    navigation.setOptions({
      headerLeft: ({}) => {
        return (
          <HeaderBackButton
            onPress={() => navigation.goBack(null)}
            tintColor={'black'}
          />
        );
      },
    });
  };

  const feedbackSubmitApi = async () => {
    /**
     * internet connection chekc
     */
    if (netInfo.isConnected !== true) {
      Alert.alert(contentScreenObj.errorMsg_1, contentScreenObj.errorMsg_2, [
        {text: contentScreenObj.OK_PopUpButtonText},
      ]);
      return false;
    }

    Keyboard.dismiss();

    const userId = await AsyncStorage.getItem('user_id');

    const feedbackQuery = `mutation add($userId: Int, $phoneModel: String, $osVersion: String, $message: String){addFeedback(userId:$userId,phoneModel:$phoneModel,osVersion:$osVersion,message:$message){statusCode body}}`;

    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    let phoneModel = RNDeviceInfo.getModel();
    let osVersion = RNDeviceInfo.getSystemVersion();

    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: feedbackQuery,
        variables: {
          userId: userId,
          phoneModel,
          osVersion,
          message: message,
        },
        operationName: 'add',
      }
    )

      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('feedback response', response);
        // return false;
        if (response.status === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          Keyboard.dismiss();
          showSuccessToast(contentScreenObj.loaderMsg_2);
          // submitAndClear();
          setMessage('');
        }
      })
      .catch(function (error) {
        console.log('err 1', error.response.data);
        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        showErrorToast(contentScreenObj.errorMsg_3);
        // alert('Error came from developer side!.')
      });
  };

  let continueBtnDisableState;

  if (message !== '') {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  if (netInfo.isConnected !== true) {
    return (
      <UIGenericPlaceholder
        // visiblity={netVisibility}
        // errorIcon={true}
        noInternetIcon={true}
        // noDataIcon={true}
        // loadingIcon={true}
        message="No Internet Connection"
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
        <ScrollView style={styles.mainScrollView}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            <Text
              style={styles.createAccHeading}
              accessibilityLabel="feedback-title">
              {contentScreenObj.heading}
            </Text>
            <Text
              style={styles.leftText}
              accessibilityLabel="feedback-description">
              {contentScreenObj.description}
            </Text>

            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.message_InputText}
                value={message}
                style={styles.feedbackTextfield}
                placeholder={contentScreenObj.feedbackMessage_PlaceholderText}
                multiline={true}
                textAlignVertical={'top'}
                onChangeText={(text) => setMessage(text)}
                accessibilityLabel="feedback-textInput"
              />
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          <UIButton
            // labelStyle={{ color: '#fff' }}
            mode="contained"
            labelStyle={{color: '#fff'}}
            style={
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={continueBtnDisableState}
            accessibilityLabel="send-feedback-bttn"
            onPress={() => {
              // Keyboard.dismiss();
              feedbackSubmitApi();
              // showSuccessToast("Thank you for your feedback !");
            }}>
            {contentScreenObj.send_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
