import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  Modal,
  ScrollView,
  View,
  Text,
  BackHandler,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';

import {UITextInput, UIButton, UILoader, UIModal} from '../../Components/UI';
import IconFont from 'react-native-vector-icons/FontAwesome';
import FeatherFont from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {API} from '../../Services/API';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {Fonts, Update_User_Api} from '../../Theme';
import GlobalStyle from '../../Theme/GlobalStyle';
import {useNetInfo} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appSyncApiKey} from '../../Services/AuthService';
import {Translate} from '../../Services/Translate';
import {Config} from '../../Theme/Constant/Constant';

const ForgotPasswordScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();
  const [email, setEmail] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('forgotPasswordScreen'))) {
      const forgotPasswordScreenContentObject = Translate(
        'forgotPasswordScreen',
      );
      setContentScreenObj(forgotPasswordScreenContentObject);
    }
  });
  /** ############################ */

  let email_reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  let continueBtnDisableState;
  if (email !== '' && email.trim() !== '' && email_reg.test(email) !== false) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  const emailValidate = (text) => {
    if (email === '') {
      setEmailWarning(false);
    } else if (email_reg.test(email) === false) {
      setEmailWarning(true);
      return false;
    } else {
      setEmailWarning(false);
    }
  };

  let emailWarningTxt;
  if (emailWarning) {
    emailWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>{contentScreenObj.email_ErrorText}</Text>
      </View>
    );
  }

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
  /**
   * Forgot password Api call
   */
  const onForgetPassword = async (gplKeyParam) => {
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
    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);

    /**
     * hbackhandler disabled
     */
    backHandleHeaderDisableFun();

    let getforgetQuery = `mutation password{forgetPassword(emailId:\"${email}\"){statusCode body}}`;

    /**
     * Api call
     */
    API.postApi(
      Update_User_Api,
      {
        query: getforgetQuery,
        variables: null,
        operationName: 'password',
      },
      {
        headers: {
          'x-api-key': gplKeyParam,
          'Content-Type': 'application/json',
        },
      },
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        setIsLoader(false);

        if (response.data.data.forgetPassword.statusCode === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          setEmail('');
          /**
           * Show alert if email or password or both are wrong
           */
          setModalVisible(!modalVisible);
        } else if (response.data.data.forgetPassword.statusCode === 201) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            contentScreenObj.errorMsg_3,
            contentScreenObj.errorMsg_4,
            [{text: contentScreenObj.OK_PopUpButtonText}],
          );
        } else {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            contentScreenObj.errorMsg_5,
            contentScreenObj.errorMsg_6,
            [{text: 'OK'}],
          );
        }
      })
      .catch(function (error) {
        console.log('error------', error);
        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        Alert.alert(contentScreenObj.errorMsg_5, contentScreenObj.errorMsg_7, [
          {text: contentScreenObj.OK_PopUpButtonText},
        ]);
      });
  };

  const okModalFun = () => {
    navigation.goBack();
  };

  /**
   * forgotPasswordApiWrapper
   * first calls app sync api
   * it returns two api tokens as object
   * then as a param passing gpl token to onForgetPassword function
   * not storing the keys to asyncstorage because there is no need for it.
   * @param {*} params
   */
  async function forgotPasswordApiWrapper(params) {
    // call the token api wtih try catch
    try {
      // token api
      let resultTokenValues = await appSyncApiKey();

      if (resultTokenValues !== undefined) {
        // call your actual forgot password function by passing the token value
        onForgetPassword(resultTokenValues.apiKeyGPL);
      }
    } catch (e) {
      // handle the error you had thrown in the api
      console.log(e);
      alert('There is some error');
    }
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader />}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 70}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.3}}
          colors={['#f1fbff', '#fff']}
          style={styles.gradientContainer}>
          <View style={{flex: 1}}>
            <Text style={styles.createAccHeading}>
              {contentScreenObj.heading}
            </Text>
            <Text style={{...Fonts.fontMedium, ...Fonts.h3, marginBottom: 20}}>
              {contentScreenObj.description}
            </Text>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.email_InputText}
                placeholder={contentScreenObj.email_InputText}
                value={email}
                error={emailWarning}
                autoCapitalize={'none'}
                onBlur={(text) => emailValidate(text)}
                // onChangeText={(text) => setEmail(text)}
                onChangeText={(text) => {
                  setEmail(text.replace(/ /g, ''));
                  // setWarningFun(text)
                }}
                accessibilityLabel="forgotpassword"
              />
              {emailWarningTxt}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.bttnWrap}>
          <UIButton
            accessibilityLabel="forgot-password-continue"
            labelStyle={{color: '#fff'}}
            style={
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={continueBtnDisableState}
            mode="contained"
            onPress={forgotPasswordApiWrapper}>
            {contentScreenObj.continue_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <UIModal
          Icon={
            <FeatherFont
              name="check-circle"
              style={GlobalStyle.iconStyle}
              color="green"
            />
          }
          modalClose={(val) => okModalFun(val)}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.forgotPassword_PopUpText}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={(val) => okModalFun(val)}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
