import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {UIButton, UILoader, UITextInput,} from '../../Components/UI';
import IconFont from 'react-native-vector-icons/FontAwesome';
import EnIcon from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {API} from '../../Services/API';
import {Fonts, Sign_In_Api} from '../../Theme';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStyle from '../../Theme/GlobalStyle';
import {useNetInfo} from '@react-native-community/netinfo';
import {useErrorMessages, useTranslation} from '../../Services/Translate';
import {Get_Api_Keys} from '../../Theme/Constant/Constant';
import {deviceMsn_reg, email_reg, multiNationalName, password_reg} from "./matchers";


/**
 * SignUpScreen -
 * @param {*} param0
 */
const SignUpScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();
  const [name, setName] = useState(''); //nandita
  const [lastName, setLastName] = useState(''); //nandita
  const [email, setEmail] = useState(''); //nandita@alumnux.com
  const [password, setPassword] = useState(''); //Nandita123$
  const [passSecureVisibility, setPassSecureVisibility] = useState(true);
  const [fnameWarning, setFnameWarning] = useState(false);
  const [lnameWarning, setLnameWarning] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [deviceMsn, setDeviceMsn] = useState('');
  const [deviceMsnWarning, setDeviceMsnWarning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('signUpScreen');
  const errorMessages = useErrorMessages();

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
   * Sign In button disable and Email Reg
   */
  let continueBtnDisableState;

  if (
    name.trim() !== '' &&
    multiNationalName.test(name) !== false &&
    name.length > 1 &&
    lastName.trim() !== '' &&
    multiNationalName.test(lastName) !== false &&
    email.trim() !== '' &&
    email_reg.test(email) !== false &&
    password.trim() !== '' &&
    password_reg.test(password) !== false
  ) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  const firstNameValidate = (text) => {
    if (name === '') {
      setFnameWarning(false);
    } else if (multiNationalName.test(name) === false || name.length < 2) {
      // alert()
      setFnameWarning(true);
      return false;
    } else {
      setFnameWarning(false);
    }
  };
  let fnameWarningTxt;
  if (fnameWarning) {
    fnameWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text style={Fonts.fontWarning}>
          {contentScreenObj.firstName_ErrorText}
        </Text>
      </View>
    );
  }

  const lastNameValidate = (text) => {
    if (lastName === '') {
      setLnameWarning(false);
    } else if (multiNationalName.test(lastName) === false) {
      setLnameWarning(true);
      return false;
    } else {
      setLnameWarning(false);
    }
  };
  let lnameWarningTxt;
  if (lnameWarning) {
    lnameWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text style={Fonts.fontWarning}>
          {contentScreenObj.lastName_ErrorText}
        </Text>
      </View>
    );
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
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text style={Fonts.fontWarning} accessibilityLabel="email-error-text">
          {contentScreenObj.email_ErrorText}
        </Text>
      </View>
    );
  }

  const passwordValidate = (text) => {
    if (password === '') {
      setPasswordWarning(false);
    } else if (password_reg.test(password) === false) {
      setPasswordWarning(true);
    } else {
      setPasswordWarning(false);
    }
  };
  let passwordWarningTxt;
  if (passwordWarning) {
    passwordWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text
          style={Fonts.fontWarning}
          accessibilityLabel="password-error-text">
          {contentScreenObj.password_ErrorText}
        </Text>
      </View>
    );
  }
  const deviceMsnValidate = (text) => {
    if (deviceMsn_reg.test(deviceMsn) === false) {
      setDeviceMsnWarning(true);
      return false;
    } else {
      setDeviceMsnWarning(false);
    }
  };
  let deviceMsnWarningTxt;
  if (deviceMsnWarning) {
    deviceMsnWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text style={Fonts.fontWarning}>
          Please enter a valid Device MSN Id.
        </Text>
      </View>
    );
  }

  /**
   * First time user
   */
  const firstTimeUser = async () => {
    await AsyncStorage.setItem('already_launched', JSON.stringify(true));
  };

  useEffect(() => {
    firstTimeUser();
  });

  // return false;

  const onSignUp = async () => {
    /**
     * internet connection chekc
     */
    if (netInfo.isConnected !== true) {
      Alert.alert(contentScreenObj.errorMsg_1, contentScreenObj.errorMsg_2, [
        {text: contentScreenObj.OK_ButtonText},
      ]);
      return false;
    }
    Keyboard.dismiss();
    /**
     *  signUP api call
     */
    try {
      const signupQuery = `mutation create{signup(email:\"${email.trim()}\",password:\"${password.trim()}\",firstName:\"${name.trim()}\",lastName:\"${lastName.trim()}\"){statusCode body}}`;

      console.log('signupQuery', signupQuery);

      /**
       * Show loader after sign in button press
       */
      setIsLoader(true);
      setLoaderText(contentScreenObj.loaderMsg_1);

      /**
       * header to normal
       */
      backHandleHeaderDisableFun();

      let resp = await API.getApi(Get_Api_Keys);

      if (resp.data.statusCode != 200) {
        throw 'Something went wrong';
      }
      let headers = {
        'x-api-key': resp.data.data.apiKeyEureka,
        'Content-Type': 'application/json',
      };

      API.postApi(
        Sign_In_Api,
        {
          query: signupQuery,
          variables: null,
          operationName: 'create',
          // deviceMSN: deviceMsn,
        },
        {
          headers: headers,
        },
      )
        .then((response) => {
          console.log('sign up response', response.data.data.errors);
          let bodyMessage =
            response && response.data && response.data.data.signup.body;
          let jsonParseConvert = JSON.parse(bodyMessage);

          if (response.data.data.signup.statusCode === 200) {
            setIsLoader(true);
            setLoaderText(contentScreenObj.loaderMsg_1);
            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            navigation.reset({
              index: 0,
              routes: [{name: 'CheckEmailScreen'}],
            });
          } else if (response.data.data.signup.statusCode === 201) {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            Alert.alert(
              contentScreenObj.errorMsg_3,
              contentScreenObj.errorMsg_4,
              [{text: contentScreenObj.OK_ButtonText}],
            );
          } else if (response.data.data.signup.statusCode === 501) {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            Alert.alert(
              errorMessages.signup_title,
              contentScreenObj.errorMsg_6,
              [{text: contentScreenObj.OK_ButtonText}],
            );
          } else {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            /**
             * Show alert if email or password or both are wrong
             */
            Alert.alert(
              errorMessages.signup_title,
              errorMessages.failed_to_complete,
              [{text: contentScreenObj.OK_ButtonText}],
            );
          }
        })

        .catch(function (error) {
          console.log('error', error.response.data);

          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          // console.log(error)
          Alert.alert(
            errorMessages.signup_title,
            errorMessages.failed_to_complete
            [{text: contentScreenObj.OK_ButtonText}],
          );
        });
    } catch (error) {
      setIsLoader(false);
      setLoaderText('');

      /**
       * Revert back header to normal
       */
      backHandleHeaderNormalFun();
      /**
       * Show alert if somingthing wrong from api side
       */
      // console.log(error)
      Alert.alert(errorMessages.signup_title,
          errorMessages.base_net_is_failed,
          [
        {text: contentScreenObj.OK_ButtonText},
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.mainScrollView}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={GlobalStyle.globalGradientContainer}>
            <Text
              style={GlobalStyle.globalAppHeading}
              accessibilityLabel="createAccount-heading">
              {contentScreenObj.heading}
            </Text>
            <View style={GlobalStyle.globalFormWrap}>
              <UITextInput
                labelText={contentScreenObj.firstName_InputText}
                value={name}
                placeholder={contentScreenObj.firstName_InputText}
                error={fnameWarning}
                maxLength={32}
                autoCapitalize="words"
                onBlur={(text) => firstNameValidate(text)}
                onChangeText={setName}
                accessibilityLabel="first-name"
              />
              {fnameWarningTxt}

              <UITextInput
                labelText={contentScreenObj.lastName_InputText}
                placeholder={contentScreenObj.lastName_InputText}
                value={lastName}
                error={lnameWarningTxt}
                onBlur={(text) => lastNameValidate(text)}
                onChangeText={setLastName}
                accessibilityLabel="last-name"
              />
              {lnameWarningTxt}

              <UITextInput
                labelText={contentScreenObj.email_InputText}
                placeholder={contentScreenObj.email_InputText}
                value={email}
                autoCapitalize="none"
                error={emailWarning}
                onBlur={(text) => emailValidate(text)}
                onChangeText={(text) => {
                  setEmail(text.replace(/ /g, ''));
                  // setWarningFun(text)
                }}
                // onChangeText={text => setEmail(text)}
                accessibilityLabel="email"
              />
              {emailWarningTxt}

              <UITextInput
                labelText={contentScreenObj.password_InputText}
                placeholder={contentScreenObj.password_InputText}
                secureTextEntry={passSecureVisibility}
                value={password}
                error={passwordWarning}
                autoCapitalize="none"
                onBlur={(text) => passwordValidate(text)}
                onChangeText={(text) => setPassword(text)}
                accessibilityLabel="password"
                iconsRight={
                  <EnIcon
                    onPress={() =>
                      setPassSecureVisibility(!passSecureVisibility)
                    }
                    name={passSecureVisibility ? 'eye-with-line' : 'eye'}
                    style={styles.inputIcon}
                    accessibilityLabel="signUp-password-eye-icon"
                  />
                }
              />
              {passwordWarningTxt}
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={GlobalStyle.singleBttnWrap}>
          <UIButton
            style={
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={continueBtnDisableState}
            labelStyle={{color: '#fff'}}
            accessibilityLabel="signup-createAcc-button"
            mode="contained"
            onPress={onSignUp}>
            {contentScreenObj.continue_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
