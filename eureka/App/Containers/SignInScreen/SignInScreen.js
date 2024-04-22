import React, {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import {
    Alert,
    BackHandler,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {UIButton, UILoader, UILogo, UITextInput} from '../../Components/UI';
import EnIcon from 'react-native-vector-icons/Entypo';
import IconFont from 'react-native-vector-icons/FontAwesome';
import {API} from '../../Services/API';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {useDispatch} from 'react-redux';
import {Login_Api, Sign_In_Api} from '../../Theme';
import {APP_RELEASE_DATE, APP_VERSION} from '../../Theme/Constant/Constant';
import {Snackbar} from 'react-native-paper';
import {GLUCOSE_UNIT, USER_REGISTRATION_STATE, WEATHER_UNIT, WEIGHT_UNIT,} from '../../constants/AppDataConstants';
import {DB_STORE} from '../../storage/DbStorage';
import {removeUserAuthDetails, storeTokens, storeUserAuthDetails,} from '../../Services/AuthService';
import DeviceInfo from 'react-native-device-info';
import {loginSuccess} from './action';
import {getFcmToken} from '../../Services/NotificationService';
import {Translate} from '../../Services/Translate';

/**
 * no internet check
 */
import {useNetInfo} from '@react-native-community/netinfo';
import {SKIN_TONE_DUMMY_ID} from "../PersonalInfoScreen/components/SkinTonePicker/SkinTonePicker";
import {getWatchSettingsData} from "../WatchSettingsScreen/api";

/**
 * SignInScreen -
 * @param {Object} navigation - nav
 *
 * @return React Jsx
 */

const SignInScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();

  const dispatch = useDispatch();

  const [email, setEmail] = useState(''); // test3.eureka@yopmail.com lifeplus.eureka@gmail.com // eureka6666@yopmail.com
  const [password, setPassword] = useState(''); //Nandita123$
  const [passSecureVisibility, setPassSecureVisibility] = useState(true);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);

  const [visible, setVisible] = React.useState(false);

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('signInScreen'))) {
      const signInScreenContentObject = Translate('signInScreen');
      setContentScreenObj(signInScreenContentObject);
    }
  });
  /** ############################ */

  const onToggleSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);
  const scrollRef = useRef();

  let keyboardWillShowSub;
  let keyboardWillHideSub;

  const emailValidate = (text) => {
    let reg =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (reg.test(email) === false) {
      setEmailWarning(true);
      return false;
    } else {
      setEmailWarning(false);
    }
  };

  useEffect(() => {
    keyboardWillShowSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow,
    );
    keyboardWillHideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide,
    );

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
  }, []);

  const keyboardWillShow = () => {
    scrollRef.current.scrollToEnd({animated: true});
  };

  const keyboardWillHide = () => {
    scrollRef.current.scrollTo({x: 0, y: 0, animated: true});
  };

  let emailWarningTxt;
  if (emailWarning) {
    emailWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText} accessibilityLabel="invalid-email-error">
          {contentScreenObj.email_ErrorText}
        </Text>
      </View>
    );
  }

  const checkFun = async () => {
    const alreadyLaunched = await AsyncStorage.getItem('already_launched');
    if (alreadyLaunched !== null) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  };

  useEffect(() => {
    checkFun();
  }, []);

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
   * Sign In button disable and Email Reg
   */
  let continueBtnDisableState;
  let reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  /**
   * Email & Password UI validation checking
   */
  if (
    email !== '' &&
    reg.test(email) !== false &&
    // email.trim() !== '' &&
    password !== ''
  ) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

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
   * Login Api call
   */
  const onSignIn = async () => {
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

    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

    backHandleHeaderDisableFun();

    let osName = Platform.OS;
    let osVersion = DeviceInfo.getSystemVersion();
    let isTablet = DeviceInfo.isTablet();
    let deviceName = 'not implemented';
    let resolution =
      Dimensions.get('screen').height + ' x ' + Dimensions.get('screen').width;
    let deviceModel = DeviceInfo.getModel();
    let deviceInfo = {
      osName,
      osVersion,
      isTablet,
      deviceName,
      resolution,
      deviceModel,
      appVersion: APP_VERSION,
    };

    /**
     * Api call
     */
    API.postApi(
      Login_Api,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'device-info': JSON.stringify(deviceInfo),
        },
      },
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('sign in res--------------', response);

        if (response && response.data.statusCode === 200) {
          response.data.data.firstName = response.data.data.firstName
            ? response.data.data.firstName
            : '';
          response.data.data.lastName ? response.data.data.lastName : '';
          let fullName = `${response.data.data.firstName} ${response.data.data.lastName}`;
          console.log(
            'response.data.data.emailId-------',
            response.data.data.emailId,
          );

          if (response.data.data.emailId !== '') {
            await AsyncStorage.setItem(
              'user_emailid',
              response.data.data.emailId,
            );
          }
          /**
           * After success redirect to next page
           */
          if (response.data.data.userId !== undefined) {
            /* ASMIT CHANGE
             ============================================================================================
              1. FETCH ENTIRE USER INFORMATION FROM CLOUD
              2. CHECK IF DEVICE EXIST, IF NOT INSERT
              3. CHECK IF USER EXIST IN LOCAL DB
              4. INSERT OR UPDATE USER INFO IN LOCAL DB
              5. CHECK IF SESSION EXIST OF USER
              6. IF SESSION EXIST THEN UPDATE SESSION AND USER DETAILS TO LOCAL CACHE
              7. IF SESSION DOES NOT EXIST THEN CREATE NEW SESSION THEN UPDATE LOCAL CACHE
              8. MOVE TO NEXT SCREEN ACCORDING TO STATE OF USER
              9. IF SIGNED IN AND SESSION DEVICE EXIST THEN UPDATE CACHE AND MOVE TO HOME SCREEN
              =============================================================================================
            */

            handleUserSignIn(response.data.data)
              .then((finalUserData) => {
                routeUserToNextStep(finalUserData);
                dispatch(loginSuccess(true, finalUserData.userId, fullName));
                getFcmToken(finalUserData.userId);
              })
              .catch((e) => {
                console.log(e);
                setIsLoader(false);
                setLoaderText('');
                backHandleHeaderNormalFun();
                Alert.alert(
                  contentScreenObj.errorMsg_3,
                  e.message ? e.message : contentScreenObj.errorMsg_4,
                  [{text: contentScreenObj.OK_ButtonText}],
                );
              });
          }
        } else if (response.data.statusCode === 201) {
          setIsLoader(false);
          setLoaderText('');

          backHandleHeaderNormalFun();

          Alert.alert(
            contentScreenObj.errorMsg_3,
            contentScreenObj.errorMsg_6,
            [{text: 'OK'}],
          );
        } else {
          setIsLoader(false);
          setLoaderText('');

          backHandleHeaderNormalFun();
          onToggleSnackBar();
        }
      })
      .catch(function (error) {
        console.log('err', error.response);
        setIsLoader(false);
        setLoaderText('');

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        setVisible(true);
      });
  };

  const routeUserToNextStep = function (finalUserData) {
    console.log('finalUserData.state', finalUserData.state);

    if (!finalUserData) {
      throw new Error('We faced an error while signing you in.');
    }

    setIsLoader(false);
    setLoaderText('');

    backHandleHeaderNormalFun();

    if (
      finalUserData.state + '' ==
      USER_REGISTRATION_STATE.HAS_NOT_FILLED_TC + ''
    ) {
      navigation.reset({
        index: 0,
        routes: [{name: 'TermConditionScreen'}],
      });
    } else if (
      finalUserData.state + '' ==
      USER_REGISTRATION_STATE.HAS_NOT_FILLED_PERSONAL_INFO + ''
    ) {
      //Not filled Personal Account info
      navigation.reset({
        index: 0,
        routes: [{name: 'PersonalInfoScreen'}],
      });
    } else if (
      finalUserData.state + '' ==
      USER_REGISTRATION_STATE.HAS_PASSTHROUGH + ''
    ) {
      // every thing fine you can  take user to next page - on fresh sign in I should always go to device connect and pair page
      navigation.reset({
        index: 0,
        routes: [{name: 'DeviceRegistrationScreen'}],
      });
    }
  };

  return (
    <SafeAreaView
      style={styles.mainContainer}
      contentInsetAdjustmentBehavior="automatic">
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : null}
        style={{flex: 1}}>
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          duration={4000}
          style={{backgroundColor: 'rgba(248, 99, 99, 0.8)'}}
          wrapperStyle={{bottom: '0%', left: 0, right: 0, zIndex: 99999}}
          accessibilityLabel="signIn-error-text">
          {contentScreenObj.errorMsg_8}
        </Snackbar>

        <ScrollView keyboardShouldPersistTaps="handled" ref={scrollRef}>
          <View style={{height: 400}}>
            <View style={styles.imageContent}>
              <View style={styles.logoArea}>
                <UILogo widthParam={35} heightParam={35} />
                <Text style={styles.logoText}>{contentScreenObj.logo_text}</Text>
              </View>
              <Image
                style={styles.signInImage}
                source={require('../../assets/images/signin_watch.jpg')}
              />
            </View>
          </View>
          <View style={styles.getStartedView}>
            <View style={styles.gradientContainer}>
              <View style={styles.inputWrap}>
                <UITextInput
                  labelText={contentScreenObj.email_InputText}
                  placeholder={contentScreenObj.email_InputText}
                  value={email}
                  autoCapitalize="none"
                  onBlur={(text) => emailValidate(text)}
                  onChangeText={(text) => {
                    setEmail(text.replace(/ /g, ''));
                  }}
                  accessibilityLabel="signIn-email-field"
                />
                {emailWarningTxt}
              </View>
              <View style={styles.inputWrap}>
                <UITextInput
                  labelText={contentScreenObj.password_InputText}
                  placeholder={contentScreenObj.password_InputText}
                  secureTextEntry={passSecureVisibility}
                  value={password}
                  maxLength={30}
                  autoCapitalize="none"
                  accessibilityLabel="signIn-password-field"
                  onChangeText={(text) => {
                    setPassword(text.replace(/ /g, ''));
                  }}
                  iconsRight={
                    <EnIcon
                      accessibilityLabel="signIn-password-eye-icon"
                      onPress={() =>
                        setPassSecureVisibility(!passSecureVisibility)
                      }
                      name={passSecureVisibility ? 'eye-with-line' : 'eye'}
                      style={styles.inputIcon}
                    />
                  }
                />
              </View>
              <View style={[styles.forgrtPassword, {marginTop: 0}]}>
                <TouchableOpacity
                  testID="forgot-password"
                  onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  style={[styles.signInBttn, {justifyContent: 'flex-start'}]}
                  accessibilityLabel="signIn-forgot-password-button"
                  accessible={false}>
                  <Text style={[styles.forgotText, {alignSelf: 'flex-start'}]}>
                    {contentScreenObj.forgotPassword_ButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
              <UIButton
                testID="sign-in"
                labelStyle={{color: '#fff'}}
                style={
                  continueBtnDisableState === true
                    ? {backgroundColor: '#A4C8ED'}
                    : {}
                }
                disabled={continueBtnDisableState}
                mode="contained"
                onPress={onSignIn}
                accessibilityLabel="signIn-button">
                {contentScreenObj.signIn_ButtonText}
              </UIButton>
              <View style={styles.haveAccountContent}>
                <Text style={styles.leftText}>
                  {contentScreenObj.dontHaveAccountText}
                </Text>
                <TouchableOpacity
                  testID="sign-up"
                  style={styles.signInBttn}
                  onPress={() => navigation.navigate('SignUpScreen')}
                  accessibilityLabel="signUp-button"
                  accessible={false}>
                  <Text style={styles.rightText}>
                    {contentScreenObj.signUp_ButtonText}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.versionWrap}>
                <View>
                  <Text style={[styles.leftText, styles.versionWrapTxt]}>
                    {`${contentScreenObj.version} :` + APP_VERSION}{' '}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.leftText, styles.versionWrapTxt]}>
                    {`${contentScreenObj.releasedDate} :` + APP_RELEASE_DATE}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

async function handleUserSignIn(loginInfo) {
  //On new user successful signin, clean local storage/cache
  await removeUserAuthDetails();

  let userId = loginInfo.userId;
  let authToken = loginInfo.token;
  let refreshToken = loginInfo.refreshToken;
  let graphQlApiKey = loginInfo.apiKeyEureka;
  let GPLApiKey = loginInfo.apiKeyGPL;
  let profilePicName = loginInfo.profilePicUrl ? loginInfo.profilePicUrl : '';

  await AsyncStorage.setItem('auth_token', authToken);
  await storeTokens({
      authToken,
      refreshToken,
      graphQlApiKey,
      GPLApiKey,
  })

  let finalUserData = null;
  try {
    finalUserData = await prepareUserToProceed(
      userId,
      graphQlApiKey,
      authToken,
      refreshToken,
      GPLApiKey,
    );
    finalUserData.userPicName = profilePicName;
  } catch (e) {
    console.log(e);
    throw e;
  }

  await storeUserAuthDetails(finalUserData);

  return finalUserData;
}

async function prepareUserToProceed(
  userId,
  graphQlApiKey,
  authToken,
  refreshToken,
  GPLApiKey,
) {
  console.log(
    'prepareUserToProceed params',
    userId,
    graphQlApiKey,
    authToken,
    refreshToken,
    GPLApiKey,
  );
  const q = `query user{getUserAllInfo(userId:${userId}){statusCode body{success data{emailId firstName lastName state personalInfo stepGoal deviceMSN}}}}`;

  let response = {};
  let responseData = {};

  try {
    response = await API.postApi(
      Sign_In_Api,
      {
        query: q,
        variables: null,
        operationName: 'user',
      },
      {
        headers: {
          'x-api-key': graphQlApiKey,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    if (response.data.data.getUserAllInfo.statusCode === 200) {
      responseData = response.data.data.getUserAllInfo.body.data;

      responseData.personalInfo = JSON.parse(responseData.personalInfo);
    } else if (response.data.data.getUserAllInfo.statusCode === 301) {
      alert('Auth token missing');
    } else if (response.data.data.getUserAllInfo.statusCode === 303) {
      alert('Auth token expired');
    } else {
      throw new Error('Could not fetch user info on login');
    }
  } catch (e) {
    console.log('################# prepareUserToProceed catch', e);

    throw new Error(
      'You are not currently registered with Lifeplus or your account is not activated yet.',
    );
  }

  if (!responseData.deviceMSN) {
    responseData.deviceMSN = '';
  }

  let userInfo = {
    userId,
    ...responseData,
    graphQlApiKey,
    authToken,
    refreshToken,
    GPLApiKey,
  };
  let localDbDetails = await initializeUser(userInfo);

  if (!localDbDetails) {
    throw new Error(
      'We faced an error while completing your sign in request. Please try again later',
    );
  }

  return {...userInfo, ...localDbDetails};
}

async function initializeUser(userInfo) {
  console.log('++++++++++++++++++++++++++++++');
  console.log(userInfo);

  let deviceDetails = await setDeviceInfoToLocalDb(userInfo.deviceMSN);
  if (!deviceDetails) {
    return null;
  }

  let userDetails = await setUserInfoToLocalDb(userInfo);
  if (!userDetails) {
    return null;
  }

  let sessionDetails = await setSessionInfoToLocalDb(
    userInfo,
    deviceDetails.deviceDbId,
  );
  if (!sessionDetails) {
    return null;
  }

  return {
    userId: userInfo.userId,
    device_local_db_id: deviceDetails.deviceDbId,
    deviceMSN: deviceDetails.deviceMSN,
    sessionId: sessionDetails.sessionId,
  };
}

/**
 * Path tested on android
 * @param {*} deviceMsn
 */
async function setDeviceInfoToLocalDb(deviceMsn) {
  let device_local_db_id = 0;
  if (!deviceMsn) {
    console.log('Device msn is null or empty from sign in');
    return {
      deviceDbId: 0,
      deviceMSN: '',
    };
  }

  try {
    let deviceResult = await DB_STORE.GET.device(deviceMsn);
    let deviceDetails = deviceResult.rows[0];
    if (deviceDetails) {
      console.log('GOT DEVICE IN DB');
      device_local_db_id = deviceDetails.id;
    }

    if (!device_local_db_id || device_local_db_id + '' == '0') {
      let dmlResult = await DB_STORE.PUT.device(deviceMsn);
      if (!dmlResult) {
        console.log('DEVICE COULD NOT BE INSERTED');
        return null;
      }

      deviceResult = await DB_STORE.GET.device(deviceMsn);
      deviceDetails = deviceResult.rows[0];

      if (!deviceDetails) {
        console.log('DEVICE COULD NOT BE FETCHED AFTER INSERTION');
        return null;
      }

      device_local_db_id = deviceDetails.id;

      if (!device_local_db_id || device_local_db_id + '' == '0') {
        console.log('DEVICE ID COULD NOT BE FETCHED AFTER INSERTION');
        return null;
      }

      console.log('GOT DEVICE IN DB AFTER INSERTION');
    }

    return {
      deviceDbId: device_local_db_id * 1,
      deviceMSN: deviceMsn,
    };
  } catch (e) {
    console.log(
      '------------------------- INSIDE setDeviceInfoToLocalDb ------------------------------------',
    );
    console.log(e);
    return null;
  }
}

const getWatchSettings = async (userId) => {
    const watchSettingsData = await getWatchSettingsData(userId);

    const {autoMeasure, autoMeasureFrequency, cgmUnit} = watchSettingsData;
    return {
        glucose_unit: cgmUnit === 1 ? GLUCOSE_UNIT.MGDL : GLUCOSE_UNIT.MMOL,
        auto_measure: autoMeasure,
        auto_frequency: autoMeasureFrequency,
    }
}

async function setUserInfoToLocalDb(userInfo) {
  try {
    const userId = userInfo.userId;
    const userDbData = await DB_STORE.GET.userInfo(userId);

    let userModel = null;
    let dmlResult = null;

    if (userDbData && userDbData.rows[0]) {
      console.log('USER FOUND IN DB');

      userModel = getUserModel(userInfo, userDbData.rows[0]);

      dmlResult = await DB_STORE.UPDATE.userInfo(userModel);

      if (!dmlResult) {
        console.log('USER FOUND IN DB BUT COULD NOT BE UPDATED');
        return null;
      }
    } else {
      console.log('USER NOT FOUND IN DB. TRYING TO INSERT');
      const usersWatchSettings = await getWatchSettings(userId);

      userModel = getUserModel(userInfo, usersWatchSettings);
      dmlResult = await DB_STORE.PUT.userInfo(userModel);

      if (!dmlResult) {
        console.log('USER COULD NOT BE INSERTED');
        return null;
      }
    }

    return {userId: userInfo.userId};
  } catch (e) {
    console.log(
      '------------------------- INSIDE setUserInfoToLocalDb ------------------------------------',
    );
    console.log(e);
    return null;
  }
}

function getUserModel(userInfo, existingUserModel = {}) {
  let heightFt = 0;
  let heightInch = 0;
  let weight = 0;
  let unitOfMeasure = WEIGHT_UNIT.FPS;

  let weatherUnit = WEATHER_UNIT.IMPERIAL;

  try {
    if (userInfo.personalInfo.height) {
      let h = userInfo.personalInfo.height + '';

      heightFt = h.split('.')[0];
      heightInch = h.split('.')[1];

      heightFt = isNaN(heightFt) ? 0 : heightFt + '';
      heightInch = isNaN(heightInch) ? 0 : heightInch + '';
    }

    let w = userInfo.personalInfo.weight;
    let w_unit = userInfo.personalInfo.unitOfMeasurement;
    weight = isNaN(w) ? 0 : w * 1;
    unitOfMeasure = w_unit ? w_unit : WEIGHT_UNIT.FPS;
  } catch (e) {
    console.log(e);
  }

  if (unitOfMeasure === WEIGHT_UNIT.MKS) {
      weatherUnit = WEATHER_UNIT.METRIC;
  }

  userInfo.personalInfo.DOB = userInfo.personalInfo.DOB
    ? userInfo.personalInfo.DOB
    : '';
  userInfo.personalInfo.gender = userInfo.personalInfo.gender
    ? userInfo.personalInfo.gender
    : 'M';
  userInfo.firstName = userInfo.firstName ? userInfo.firstName : '';
  userInfo.lastName = userInfo.lastName ? userInfo.lastName : '';
  userInfo.personalInfo.country = userInfo.personalInfo.country
    ? userInfo.personalInfo.country
    : '';

  let stepGoalForUser = 0;
  stepGoalForUser =
    userInfo.stepGoal && !isNaN(userInfo.stepGoal) ? userInfo.stepGoal : 0;
  stepGoalForUser =
    stepGoalForUser == 0
      ? existingUserModel && existingUserModel.step_goal
        ? existingUserModel.step_goal
        : 1000
      : stepGoalForUser;

  let userModel = {
    id: userInfo.userId,
    name: "'" + userInfo.firstName + ' ' + userInfo.lastName + "'",
    birth_date: "'" + userInfo.personalInfo.DOB + "'",
    gender_id: "'" + userInfo.personalInfo.gender + "'",
    ethnicity_id: isNaN(userInfo.personalInfo.ethnicityId)
      ? 1
      : userInfo.personalInfo.ethnicityId * 1,
    skin_tone_id: isNaN(userInfo.personalInfo.skinToneId)
      ? SKIN_TONE_DUMMY_ID
      : userInfo.personalInfo.skinToneId * 1,
    address: "'not available'",
    country: "'" + userInfo.personalInfo.country + "'",
    zip: "'1000'",
    password: "'xxx'",
    height_ft: heightFt,
    height_in: heightInch,
    weight: weight, //ASMIT CHANGE - WRONG TYPE IN DB
    weight_unit: "'" + unitOfMeasure + "'",
    tnc_date: existingUserModel.tnc_date
      ? "'" + existingUserModel.tnc_date + "'"
      : "'" + Date.now() + "'",
    step_goal: stepGoalForUser,
    hw_id: "'" + userInfo.deviceMSN + "'",
    glucose_unit: existingUserModel.glucose_unit
      ? "'" + existingUserModel.glucose_unit + "'"
      : "'" + GLUCOSE_UNIT.MGDL + "'",
    weather_unit: isNaN(existingUserModel.weather_unit) ? weatherUnit : existingUserModel.weather_unit,
    auto_measure: existingUserModel.auto_measure
      ? "'" + existingUserModel.auto_measure + "'"
      : "'Y'",
    auto_frequency: existingUserModel.auto_frequency
      ? existingUserModel.auto_frequency
      : 10,
    sleep_tracking: existingUserModel.sleep_tracking
      ? "'" + existingUserModel.sleep_tracking + "'"
      : "'Y'",
    power_save: existingUserModel.power_save
      ? "'" + existingUserModel.power_save + "'"
      : "'N'",
    cgm_debug: existingUserModel.cgm_debug
      ? "'" + existingUserModel.cgm_debug + "'"
      : "'N'",
    registration_state: userInfo.state,
  };

  return userModel;
}

async function setSessionInfoToLocalDb(userInfo, device_local_db_id) {
  try {
    let sessionModel = null;
    sessionModel = getSessionModel(userInfo);
    let dmlResult = await DB_STORE.UTILS.invalidateSession();

    if (!dmlResult) {
      console.log('EXISTING SESSIONS COULD NOT BE INVALIDATE');
      return null;
    }

    dmlResult = await DB_STORE.PUT.session(sessionModel);

    if (!dmlResult) {
      console.log('NEW SESSION COULD NOT INSERTED/CREATED');
      return null;
    }

    let activeUserSessionId = null;
    let activeUserSessionResult = await DB_STORE.GET.activeSession(
      userInfo.userId,
    );

    if (!activeUserSessionResult || !activeUserSessionResult.rows[0]) {
      console.log(
        'NEW SESSION HAS BEEN INSERTED BUT COULD NOT BE FETCHED BECAUSE IT SEEMS NOT TO BE AVAILABLE',
      );
      return null;
    }

    let activeUserSession = activeUserSessionResult.rows[0];

    if (!activeUserSession.id) {
      console.log(
        'NEW SESSION HAS BEEN INSERTED, RETRIEVED, BUT SESSION ID COULD NOT BE FOUND',
      );
      return null;
    }

    activeUserSessionId = activeUserSession.id * 1;

    return {sessionId: activeUserSessionId};
  } catch (e) {
    console.log(
      '------------------------- INSIDE setSessionInfoToLocalDb ------------------------------------',
    );
    console.log(e);
    return null;
  }
}

function getSessionModel(userInfo, device_local_db_id) {
  return {
    user_id: userInfo.userId,
    device_id: null, //Only set from native if device gets connected
    auth_token: userInfo.authToken,
    refresh_token: userInfo.refreshToken,
    gateway_token: userInfo.graphQlApiKey,
  };
}

export default SignInScreen;
