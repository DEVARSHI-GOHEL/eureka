import React, {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {Label} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import RNDeviceInfo from 'react-native-device-info';
import moment from 'moment';
import IconFont from 'react-native-vector-icons/FontAwesome';
import FeatherFont from 'react-native-vector-icons/Feather';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {useNetInfo} from '@react-native-community/netinfo';
import {RNCamera} from 'react-native-camera';
import LifePlusModuleExport from '../../../LifePlusModuleExport';

import {Colors, Fonts, Sign_In_Api, Update_User_Api} from '../../Theme';
import {
  UIButton,
  UIGenericPlaceholder,
  UILoader,
  UIModal,
  UIPicker,
  UITextInput,
} from '../../Components/UI';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {useCountries} from '../../assets/languages/countries/countries';
import {appSyncApiKey, refreshTokenApi} from '../../Services/AuthService';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import AppSyncCommandHandler from '../WatchSettingsScreen/AppSyncCommandHandler';
import {showErrorToast} from '../../Components/UI/UIToast/UIToastHandler';
import {
  getErrorMessage,
  Translate,
  useTranslation,
} from '../../Services/Translate';
import {
  AUTO_MEASURE_STATE,
  USER_REGISTRATION_STATE,
  WEIGHT_UNIT,
} from '../../constants/AppDataConstants';
import {DB_STORE} from '../../storage/DbStorage';
import SkinTonePicker from './components/SkinTonePicker';
import {prepareAllUserInfoQuery} from './api';
import {
  isValidSkinToneId,
  SKIN_TONE_DUMMY_ID,
} from './components/SkinTonePicker/SkinTonePicker';
import {postWithAuthorization} from '../../Services/graphqlApi';
import HeightComponent from './components/HeightComponent';
import {feetToMeters} from './tools';
import {isHeightValid} from './components/HeightComponent/HeightComponent';
import {IMPERIAL_SYSTEM, KG, POUND, useMeasurement} from './hooks/measurement';
import WeightComponent from './components/WeightComponent';
import {useWeight} from './components/WeightComponent/hooks';
import {t} from 'i18n-js';
import {TouchableOpacity} from 'react-native-gesture-handler';
import CameraComponent from '../../Components/Camera/CameraComponent';

const ETHNICITY_ARRAY = [
  {id: 1, value: 'ethnicity_1'},
  {id: 2, value: 'ethnicity_2'},
  {id: 3, value: 'ethnicity_3'},
  {id: 4, value: 'ethnicity_4'},
  {id: 5, value: 'ethnicity_5'},
  {id: 6, value: 'ethnicity_6'},
  {id: 7, value: 'ethnicity_7'},
  {id: 8, value: 'ethnicity_8'},
  {id: 9, value: 'ethnicity_9'},
  {id: 42, value: 'ethnicity_42'},
  {id: 43, value: 'ethnicity_43'},
  {id: 75, value: 'ethnicity_75'},
];

const PersonalInfoScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();
  let monthRef = useRef();
  let yearRef = useRef();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  //YASH
  //Changed TextInput for feet and inch TO DropDown
  // const [feet, setFeet] = useState('');
  // const [inch, setInch] = useState('');
  const [feet, setFeet] = useState('default');
  const [inch, setInch] = useState('default');
  const [meter, setMeter] = useState('');
  const [ethnicity, setEthnicity] = useState('default');
  const [skinTone, setSkinTone] = useState(SKIN_TONE_DUMMY_ID);
  const countries = useCountries();

  const [gender, setGender] = useState('default');
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [patientIdState, setPatientIdState] = useState('');

  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    const checkCamera = async () => {
      const isReady = await cameraRef.current?.getCamera().isReady();
      setIsCameraReady(isReady);
    };

    checkCamera();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const options = {quality: 0.5, base64: true};
        const data = await cameraRef.current.takePictureAsync(options);
        console.log(data); // Image URI
        console.log(Object.keys(data));

        // Call the skinToneDetectionMethod
        // const result = await CustomModule.skinToneDetectionMethod();
        // console.log("Skin tone detection result:", result);

        // Call the displayImage method
        const imageResult = await LifePlusModuleExport.displayImage(
          data.base64,
        );
        console.log('Display image result:', imageResult);
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    } else {
      console.warn('Camera is not ready');
    }
  };

  const {
    heightType,
    setHeightType,
    weightType,
    setWeightType,
    unitsOfMeasurement,
    setUnitsOfMeasurement,
  } = useMeasurement();
  const weightParams = useWeight('', weightType);
  //  const [weight, setWeight] = useState('');

  function testProps(id) {
    return {testID: id, accessibilityLabel: id};
  }

  const [listSelectedItem, setListSelectedItem] = useState({});
  const [dayWarning, setDayWarning] = useState(false);
  const [monthWarning, setMonthWarning] = useState(false);
  const [yearWarning, setYearWarning] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('personalInfoScreen');
  /** ############################ */

  let dayWarningTxt;
  if (dayWarning) {
    dayWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>{contentScreenObj.date_ErrorText}</Text>
      </View>
    );
  }

  let monthWarningTxt;
  if (monthWarning) {
    monthWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>{contentScreenObj.month_ErrorText}</Text>
      </View>
    );
  }

  let yearWarningTxt;
  if (yearWarning) {
    yearWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>
          {contentScreenObj.year_ErrorText} {moment().year()}.
        </Text>
      </View>
    );
  }

  const monthDayNumberCheck = (dayP, monthP) => {
    // console.warn('d, m, y', dayP, monthP);

    if (month == 4 || month == 6 || month == 9 || month == 11) {
      // console.warn('if');
      if (day <= 30) {
        setDayWarning(false);
      } else {
        // console.warn('else');
        // alert('day is invalide')
        setDayWarning(true);
      }
    } else if (
      month == 1 ||
      month == 3 ||
      month == 5 ||
      month == 7 ||
      month == 8 ||
      month == 10 ||
      month == 12
    ) {
      if (day <= 31) {
        setDayWarning(false);
      } else {
        setDayWarning(true);
      }
    }
    // else if (month == 2){
    //   if(day <= 28){
    //     setDayWarning(false);
    //   } else {
    //     setDayWarning(true);
    //   }
    // }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getUserPersonalInfo();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const dayValidateFun = () => {
    // monthDayNumberCheck(day, month);
    // console.warn(day > 0);

    if (day > 0) {
      setDayWarning(false);
    } else {
      setDayWarning(true);
    }

    leapYear(month, year);
  };

  const monthValidateFun = () => {
    // monthDayNumberCheck(day, month)

    /**
     * month
     */
    if (month > 12) {
      setMonthWarning(true);
    } else {
      setMonthWarning(false);
    }

    leapYear(month, year);

    // leapYear()
  };

  const yearValidateFun = () => {
    // monthDayNumberCheck(day, month)
    leapYear(month, year);
    // console.warn(Number(year) >= 1900)
    /**
     * year
     */
    if (year === '') {
      setYearWarning(false);
    } else if (Number(year) >= 1900 && Number(year) <= moment().year()) {
      setYearWarning(false);
    } else {
      // console.warn('else')
      setYearWarning(true);
    }
  };

  const leapYear = (monthParam, yearParam) => {
    console.log('leap fun');
    // console.warn('month', parseInt('')==0);

    //leap year

    if (year % 100 === 0 ? year % 400 === 0 : year % 4 === 0) {
      if (month > 0 && month == 2) {
        if (day > 0 && day <= 29) {
          setDayWarning(false);
        } else if (day > 0 && day > 28) {
          // console.log('else feb and no leap year');
          setDayWarning(true);
        } else {
          setDayWarning(true);
        }
      } else if (
        month > 0 &&
        (month == 4 || month == 6 || month == 9 || month == 11)
      ) {
        // alert('')
        if (day > 0 && day <= 30) {
          setDayWarning(false);
        } else if (day > 0 && day >= 31) {
          // console.warn('else');
          // alert('day is invalide')
          setDayWarning(true);
        } else {
          setDayWarning(true);
        }
      } else if (
        month > 0 &&
        (month == 1 ||
          month == 3 ||
          month == 5 ||
          month == 7 ||
          month == 8 ||
          month == 10 ||
          month == 12)
      ) {
        if (day > 0 && day <= 31) {
          setDayWarning(false);
        } else if (day > 0 && day > 31) {
          setDayWarning(true);
        }
      } else if (month > 0 && month == 2) {
        if (day > 0 && day <= 28) {
          setDayWarning(false);
        } else {
          setDayWarning(true);
        }
      } else if (parseInt(month) == 0 || month == '') {
        if (parseInt(day) == 0 || parseInt(day) > 31) {
          setDayWarning(true);
        } else {
          setDayWarning(false);
        }

        if (parseInt(month) == 0 || parseInt(month) > 12) {
          setMonthWarning(true);
        } else {
          setMonthWarning(false);
        }
      }
    } else {
      //not a leap year
      // console.log('if');
      if (
        month > 0 &&
        (month == 4 || month == 6 || month == 9 || month == 11)
      ) {
        // alert('')
        if (day > 0 && day <= 30) {
          setDayWarning(false);
        } else if (day > 0 && day >= 31) {
          // console.warn('else');
          // alert('day is invalide')
          setDayWarning(true);
        } else {
          setDayWarning(true);
        }
      } else if (
        month > 0 &&
        (month == 1 ||
          month == 3 ||
          month == 5 ||
          month == 7 ||
          month == 8 ||
          month == 10 ||
          month == 12)
      ) {
        if (day > 0 && day <= 31) {
          setDayWarning(false);
        } else if (day > 31) {
          setDayWarning(true);
        } else {
          setDayWarning(true);
        }
      } else if (month > 0 && month == 2) {
        if (day > 0 && day <= 28) {
          setDayWarning(false);
        } else if (day > 0 && day > 28) {
          setDayWarning(true);
        } else {
          setDayWarning(true);
        }
      } else if (parseInt(month) == 0 || month == '') {
        if (parseInt(day) == 0) {
          setDayWarning(true);
        } else {
          setDayWarning(false);
        }

        if (parseInt(month) == 0) {
          setMonthWarning(true);
        } else {
          setMonthWarning(false);
        }
      }
    }
  };

  // temporary condition for route api check
  let disableText;
  if (props.route.params?.routeFrom === 'ProfileScreen') {
    disableText = false;
  } else {
    disableText = true;
  }

  const {userId, autoMeasureState} = useSelector(state => ({
    userId: state.auth.userId,
    //  userState: action.auth.userState
    autoMeasureState: state.measure.autoMeasureState,
  }));

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
      headerLeft: props => (
        <HeaderBackButton
          {...props}
          onPress={() => {}}
          tintColor={'lightgray'}
          headerBackTitle={' '}
        />
      ),
    });
  };

  /**
   * revert header and hardware back back to normal state and user can able to back
   */
  const backHandleHeaderNormalFun = () => {
    setIsBackEnable(false);
    navigation.setOptions({
      headerLeft: props => {
        return (
          <HeaderBackButton
            {...props}
            onPress={() => navigation.goBack(null)}
            headerBackTitle={' '}
            tintColor={'black'}
          />
        );
      },
    });
  };

  /**
   * add personal info Api call
   */
  const onAddPersonalInfo = async () => {
    if (autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
      showErrorToast(t('CalibrateConnectionScreen.waitForResult'));
      return;
    }

    let currentUserState = await AsyncStorage.getItem('user_state');

    if (currentUserState == USER_REGISTRATION_STATE.HAS_PASSTHROUGH) {
      getUserPersonalInfo(__patientId => {
        updateUserPersonalInfo(__patientId, () => {
          navigation.navigate('DeviceRegistrationScreen');
        });
      });
      return;
    }

    let userId = await AsyncStorage.getItem('user_id');
    let dotVisible = `${inch !== '' ? '.' : ''}`;
    const heightImperial = `${feet}${dotVisible}${inch}`;

    const addPersonalInfo = `mutation create{addUserInfo(userCredId:${userId},birthDay:\"${year}-${month}-${day}\",gender:\"${gender}\",height:${
      heightImperial * 1
    },weight:${
      weightParams.resultWeight * 1
    },ethnicityId:${ethnicity},skinToneId:${skinTone},country:\"${
      listSelectedItem.code
    }\",unitOfMeasurement:\"${unitsOfMeasurement}\"){statusCode body}}`;

    let userModel = {
      id: userId,
      birth_date: "'" + year + '-' + month + '-' + day + "'",
      gender_id: "'" + gender + "'",
      ethnicity_id: ethnicity,
      skin_tone_id: skinTone,
      country: "'" + listSelectedItem.code + "'",
      height_ft: feet * 1,
      height_in: inch * 1,
      weight: Math.round(
        weightParams.resultWeight ? weightParams.resultWeight * 1 : 0,
      ), //ASMIT CHANGE - WRONG TYPE IN DB
      weight_unit: "'" + unitsOfMeasurement + "'",
      registration_state: USER_REGISTRATION_STATE.HAS_PASSTHROUGH,
    };

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    //ASMIT CHANGE
    //SHOULD UPDATE LOCAL DB STATE OF USER

    /**
     * Api call
     */
    postWithAuthorization(Sign_In_Api, {
      query: addPersonalInfo,
      variables: null,
      operationName: 'create',
    })
      /**
       * Get response from Api and call async storage
       */
      .then(async response => {
        console.log('onAddPersonalInfo res', response);

        if (response.data.data.addUserInfo.statusCode === 200) {
          /**
           * Store unique UserId in async storage
           */

          let userId = await AsyncStorage.getItem('user_id');

          setIsLoader(false);
          setLoaderText('');

          await DB_STORE.UPDATE.userInfo(userModel);
          await AsyncStorage.setItem(
            'user_state',
            JSON.stringify(USER_REGISTRATION_STATE.HAS_PASSTHROUGH),
          );

          //Yash Need To Be Confirmed
          // let newUser = await DB_STORE.GET.userInfo(userId);
          // sendSyncCommand(newUser.rows[0]);
          /**
           *
           * After success redirect to next page
           */
          if (userId !== undefined) {
            // setIsLoader(false);
            // setLoaderText('')
            // getUserStateApi(userId);
            navigation.navigate('DeviceRegistrationScreen');
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'DeviceRegistrationScreen' }]
            // });
            /**
             * Revert back header to normal
             */
            // backHandleHeaderNormalFun();

            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'CheckEmailScreen' }]
            // });
          }
        } else if (response.data.data.addUserInfo.statusCode === 201) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          if (
            props.route.params &&
            props.route.params.routeFrom === 'ProfileScreen'
          ) {
            backHandleHeaderNormalFun();
          }
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            contentScreenObj.errorMsg_3,
            contentScreenObj.errorMsg_4,
            [{text: contentScreenObj.OK_PopUpButtonText}],
          );
        } else if (response.data.data.addUserInfo.statusCode === 500) {
          setIsLoader(false);
          setLoaderText('');
          console.log(response.data.data.addUserInfo);

          /**
           * Revert back header to normal
           */
          if (
            props.route.params &&
            props.route.params.routeFrom === 'ProfileScreen'
          ) {
            backHandleHeaderNormalFun();
          }
          /**
           * Show alert if email or password or both are wrong
           */

          Alert.alert(
            'Error',
            'Lifeplus servers face an error while saving your details.',
            [{text: 'OK'}],
          );
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          if (
            props.route.params &&
            props.route.params.routeFrom === 'ProfileScreen'
          ) {
            backHandleHeaderNormalFun();
          }
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            'Error',
            'Lifeplus servers could not save your details. Please try again later.',
            [{text: 'OK'}],
          );
        }
      })
      .catch(function (error) {
        console.log('onAddPersonalInfo error', error.response);
        setIsLoader(false);
        setLoaderText('');

        /**
         * Revert back header to normal
         */
        if (
          props.route.params &&
          props.route.params.routeFrom === 'ProfileScreen'
        ) {
          backHandleHeaderNormalFun();
        }
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(getErrorMessage('failed_to_complete'));
      });
  };

  /**
   * get user info Api call
   */
  const getUserPersonalInfo = async _cb => {
    let userIdAsync = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = prepareAllUserInfoQuery(userIdAsync);

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    if (
      props.route.params &&
      props.route.params.routeFrom === 'ProfileScreen'
    ) {
      setLoaderText(contentScreenObj.loaderMsg_1);
    } else {
      setLoaderText(contentScreenObj.loaderMsg_2);
    }

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(Update_User_Api, {
      query: getAgreementUserState,
      variables: null,
      operationName: 'patient',
    })
      /**
       * Get response from Api and call async storage
       */
      .then(async response => {
        if (response.status === 200) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          if (
            props.route.params &&
            props.route.params.routeFrom === 'ProfileScreen'
          ) {
            backHandleHeaderNormalFun();
          }

          if (
            response.data.data.getUserDetails.statusCode === 200 &&
            response.data.data.getUserDetails.body.data
          ) {
            let {
              birthDay,
              height,
              country,
              unitOfMeasurement,
              weight,
              ethnicityId,
              skinToneId,
              gender,
              patientId,
            } = response.data.data.getUserDetails.body.data || {};

            //An update callback has been passed
            if (_cb) {
              _cb(patientId);
              return;
            }

            const [year, month, day] = birthDay
              ? birthDay.split('-')
              : ['', '', ''];
            setDay(day);
            setMonth(month);
            setYear(year);

            const [feet, inch] = height ? height.split('.') : ['', ''];
            setFeet(feet);
            const inchesToSet = isNaN(inch) ? '0' : inch + '';
            setInch(inchesToSet);
            setMeter(feetToMeters(feet, inchesToSet));
            setUnitsOfMeasurement(unitOfMeasurement);

            weightParams.setWeight(
              weight,
              unitOfMeasurement == IMPERIAL_SYSTEM ? POUND : KG,
            );

            setEthnicity(ethnicityId ? ethnicityId : 0);

            setSkinTone(skinToneId);

            setGender(gender ? gender : '');

            setPatientIdState(patientId);

            if (country) {
              let selectedCountry = countries.filter((item, index) => {
                return item.code === country;
              });

              setListSelectedItem(selectedCountry[0] || {});
            } else {
              setListSelectedItem({});
            }
          } else if (
            response.data.data.getUserDetails.statusCode === 303 ||
            response.data.data.getUserDetails.statusCode === 302
          ) {
            // missing 302 and expired 303

            setIsLoader(true);
            setLoaderText(contentScreenObj.loaderMsg_1);

            await refreshTokenApi(navigation, getUserPersonalInfo);

            // call relevant api if needed
          } else {
            /**
             * Show alert if somingthing wrong from api side
             */
            alert(
              'Lifeplus servers faced an error while completing this request. Please try again later.',
            );
          }
        }
      })
      .catch(async error => {
        console.log(error.response);

        /**
         * Revert back header to normal
         */
        if (
          props.route.params &&
          props.route.params.routeFrom === 'ProfileScreen'
        ) {
          backHandleHeaderNormalFun();
        }

        if (error.response.status === 401) {
          await appSyncApiKey();

          // call relevant api if needed
          getUserPersonalInfo();
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(
            'Lifeplus servers faced an error while completing this request. Please try again later.',
          );
        }
      });
  };

  /**
   * update user info Api call
   */
  const updateUserPersonalInfo = async (_patient_id, _cb) => {
    if (netInfo.isConnected !== true) {
      Alert.alert(contentScreenObj.errorMsg_1, contentScreenObj.errorMsg_2, [
        {text: contentScreenObj.OK_PopUpButtonText},
      ]);
      return false;
    }
    if (autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
      showErrorToast(t('CalibrateConnectionScreen.waitForResult'));
      return;
    }

    let userId = await AsyncStorage.getItem('user_id');
    let device_msn = await AsyncStorage.getItem('device_msn');

    let dotVisible = `${inch !== '' ? '.' : ''}`;
    let mystring = `${feet}${dotVisible}${inch}`;
    let measurementValue =
      weightType === 'lb' ? WEIGHT_UNIT.FPS : WEIGHT_UNIT.MKS;

    if (!_patient_id || isNaN(_patient_id)) _patient_id = patientIdState;

    const updatePersonalInfoPayload = `mutation edit{editUser(patientId:\"${_patient_id}\",birthDay:\"${year}-${month}-${day}\",gender:\"${gender}\",height:\"${
      mystring * 1
    }\",weight:\"${
      weightParams.resultWeight * 1
    }\",ethnicityId:\"${ethnicity}\",skinToneId:\"${skinTone}\",country:\"${
      listSelectedItem.code
    }\",unitOfMeasurement:\"${measurementValue}\"){statusCode body}}`;

    let userModel = {
      id: userId,
      birth_date: "'" + year + '-' + month + '-' + day + "'",
      gender_id: "'" + gender + "'",
      ethnicity_id: ethnicity,
      skin_tone_id: skinTone,
      country: "'" + listSelectedItem.code + "'",
      height_ft: feet,
      height_in: inch,
      weight: Math.round(
        weightParams.resultWeight ? weightParams.resultWeight * 1 : 0,
      ), //ASMIT CHANGE - WRONG TYPE IN DB
      weight_unit: "'" + measurementValue + "'",
      hw_id: "'" + device_msn + "'",
    };

    console.log('usermodel', userModel);
    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    await DB_STORE.UPDATE.userInfo(userModel);
    let newUser = await DB_STORE.GET.userInfo(userId);

    await sendSyncCommand(newUser.rows[0]);

    /**
     * Api call
     */
    postWithAuthorization(Update_User_Api, {
      query: updatePersonalInfoPayload,
      variables: null,
      operationName: 'edit',
    })
      /**
       * Get response from Api and call async storage
       */
      .then(async response => {
        console.log('personal info update', response);
        setIsLoader(false);
        setLoaderText('');

        if (response.data.data.editUser.statusCode === 200) {
          /**
           * Revert back header to normal
           */
          if (props.route.params?.routeFrom === 'ProfileScreen') {
            backHandleHeaderNormalFun();
          }

          /**
           * Show alert if email or password or both are wrong
           */
          if (props.route.params?.routeFrom === 'ProfileScreen') {
            setModalVisible(!modalVisible);
          }

          if (_cb) _cb();
        } else if (
          response.data.data.editUser.statusCode === 303 ||
          response.data.data.editUser.statusCode === 302
        ) {
          // invalid auth token + expired auth token
          // missing 302 and expired 303

          setIsLoader(true);

          await refreshTokenApi(navigation, updateUserPersonalInfo);

          // call relevant api if needed
          // addContactApi()
        } else {
          setIsLoader(false);
          setLoaderText('');
          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(
            'Lifeplus servers faced an error while completing this request. Please try again later.',
          );
        }
      })
      .catch(async error => {
        console.log(error);

        /**
         * Revert back header to normal
         */
        if (
          props.route.params &&
          props.route.params.routeFrom === 'ProfileScreen'
        ) {
          backHandleHeaderNormalFun();
        }

        if (error.response.status === 401) {
          // again setting gpl_token to async
          await appSyncApiKey();

          // call relevant api if needed
          updateUserPersonalInfo();
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(
            'Lifeplus servers faced an error while completing this request. Please try again later.',
          );
        }
      });
  };

  /**
   * Handle if connect to network was changed
   */
  useEffect(() => {
    if (props.route.params?.routeFrom === 'ProfileScreen') {
      if (netInfo.isConnected) getUserPersonalInfo();
      return;
    }

    if (
      props.route.params?.routeFrom === 'ConnectWatchScreen' // this case is not valid, the caller function is commented
    ) {
      if (netInfo.isConnected) getUserPersonalInfo();

      navigation.setOptions({
        headerLeft: () => <HeaderBackButton tintColor={'lightgray'} />,
      });
      return;
    }

    if (props.route.params?.routeFrom !== 'ProfileScreen') {
      backHandleHeaderDisableFun();
    }
  }, [netInfo.isConnected]);

  let isLeapYearCondition;

  if (year % 100 === 0 ? year % 400 === 0 : year % 4 === 0) {
    if (month == 2) {
      if (day <= 29) {
        // console.log('if feb and leap year');
        isLeapYearCondition = false;
      } else if (day > 28) {
        // console.log('else feb and no leap year');
        isLeapYearCondition = true;
      }
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
      // alert('')
      if (day <= 30) {
        isLeapYearCondition = false;
      } else if (day >= 31) {
        // console.warn('else');
        // alert('day is invalide')
        isLeapYearCondition = true;
      }
    } else if (
      month == 1 ||
      month == 3 ||
      month == 5 ||
      month == 7 ||
      month == 8 ||
      month == 10 ||
      month == 12
    ) {
      if (day <= 31) {
        isLeapYearCondition = false;
      } else if (day > 31) {
        isLeapYearCondition = true;
      }
    } else if (month == 2) {
      if (day <= 28) {
        isLeapYearCondition = false;
      } else {
        isLeapYearCondition = true;
      }
    }
  } else {
    //not a leap year
    // console.log('if');
    if (month == 4 || month == 6 || month == 9 || month == 11) {
      // alert('')
      if (day <= 30) {
        isLeapYearCondition = false;
      } else if (day >= 31) {
        // console.warn('else');
        // alert('day is invalide')
        isLeapYearCondition = true;
      }
    } else if (
      month == 1 ||
      month == 3 ||
      month == 5 ||
      month == 7 ||
      month == 8 ||
      month == 10 ||
      month == 12
    ) {
      if (day <= 31) {
        isLeapYearCondition = false;
      } else if (day > 31) {
        isLeapYearCondition = true;
      }
    } else if (month == 2) {
      if (day <= 28) {
        isLeapYearCondition = false;
      } else if (day > 28) {
        isLeapYearCondition = true;
      }
    }
  }

  let continueBtnDisableState;

  const validHeight = isHeightValid(heightType, meter, feet, inch);

  if (
    day !== '' &&
    day > 0 &&
    day <= 31 &&
    month !== '' &&
    month > 0 &&
    month <= 12 &&
    year !== '' &&
    year >= 1900 &&
    year <= moment().year() &&
    !isLeapYearCondition &&
    validHeight &&
    weightParams.resultWeight !== '' &&
    weightParams.resultWeight <= 500 &&
    weightParams.resultWeight >= 1 &&
    ethnicity !== 'default' &&
    isValidSkinToneId(skinTone) &&
    gender !== 'default' &&
    listSelectedItem !== null &&
    listSelectedItem !== undefined &&
    Object.keys(listSelectedItem).length !== 0
  ) {
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

  const onContinue = () => {
    if (continueBtnDisableState) {
      return;
    }
    onAddPersonalInfo();
  };

  if (isCameraReady) {
    return (
      <CameraComponent handleCloseCamera={() => setIsCameraReady(false)} />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        // behavior={Platform.OS === "ios" ? "padding" : null}
        // style={{ flex: 1 }}
        behavior="padding"
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 66 : -500}>
        <ScrollView
          style={styles.mainScrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#A4C8ED']}
            />
          }>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            {disableText ? (
              <View style={{flex: 1}}>
                <Text
                  style={styles.createAccHeading}
                  accessibilityLabel="personalInfo-heading">
                  {contentScreenObj.heading}
                </Text>
                <Text style={styles.subHeading}>
                  {contentScreenObj.description}
                </Text>
              </View>
            ) : null}

            <View style={{marginTop: 25}}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.birthDate_InputText}
              </Label>
              <View style={{flexDirection: 'row'}}>
                <View style={[styles.inputWrap, {marginRight: 10, flex: 1}]}>
                  <UITextInput
                    // labelText={'Date of Birth'}
                    placeholder={contentScreenObj.DOB_Day}
                    value={day}
                    maxLength={2}
                    keyboardType={'numeric'}
                    accessibilityLabel="birth-day"
                    error={dayWarning}
                    onChangeText={text => {
                      if (text.length == 2) {
                        monthRef.current.focus();
                      }

                      setDay(text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''));
                    }}
                    onBlur={dayValidateFun}
                  />
                  {dayWarningTxt}
                </View>
                <View style={[styles.inputWrap, {marginRight: 10, flex: 1}]}>
                  <UITextInput
                    labelEmptyLabelText={true}
                    ref={monthRef}
                    value={month}
                    placeholder={contentScreenObj.DOB_Month}
                    keyboardType={'numeric'}
                    maxLength={2}
                    error={monthWarning}
                    accessibilityLabel="birth-month"
                    onChangeText={text => {
                      if (text.length == 2) {
                        yearRef.current.focus();
                      }
                      setMonth(
                        text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                      );
                    }}
                    onBlur={monthValidateFun}
                  />
                  {monthWarningTxt}
                </View>
                <View style={[styles.inputWrap, {flex: 1}]}>
                  <UITextInput
                    labelEmptyLabelText={true}
                    ref={yearRef}
                    value={year}
                    placeholder={contentScreenObj.DOB_Year}
                    keyboardType={'numeric'}
                    maxLength={4}
                    error={yearWarning}
                    accessibilityLabel="birth-year"
                    onChangeText={text =>
                      setYear(text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''))
                    }
                    onBlur={yearValidateFun}
                  />
                  {yearWarningTxt}
                </View>
              </View>
            </View>
            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.ethnicity_PickerText}
              </Label>
              <View style={styles.inputPicker} accessibilityLabel="ethnicity">
                <View accessibilityLabel={'selected-ethnicity-' + ethnicity}>
                  <UIPicker
                    mode="dropdown"
                    style={{width: '99.5%', paddingRight: '.5%'}}
                    textStyle={{
                      color: ethnicity === 'default' ? '#B3B3B3' : '#000',
                      ...Fonts.fontMedium,
                      paddingLeft: 10,
                    }}
                    iosIcon={
                      <MaIcon
                        name="arrow-drop-down"
                        style={{color: Colors.gray, fontSize: 26}}
                      />
                    }
                    selectedValue={ethnicity}
                    placeholder={contentScreenObj.selectOne}
                    onValueChange={selectedItem => {
                      console.log('selectedItem', selectedItem);
                      if (selectedItem === 'default') {
                        // alert('Please select type')
                      } else {
                        setEthnicity(selectedItem);
                      }
                    }}>
                    <UIPicker.Item
                      label={contentScreenObj.selectOne}
                      value={'default'}
                      color="#999"
                    />
                    {ETHNICITY_ARRAY.map((item, itemId) => {
                      return (
                        <UIPicker.Item
                          label={contentScreenObj[item.value]}
                          value={item.id.toString()}
                          key={item.id}
                        />
                      );
                    })}
                  </UIPicker>
                </View>
              </View>
            </View>
            <View>
              <Label style={styles.inputLabel}>
                {contentScreenObj.skinTone_PickerText}
              </Label>
              <View style={styles.skinTypeView}>
                <SkinTonePicker
                  selectedId={skinTone}
                  setSkinTone={setSkinTone}
                />
                <Text style={styles.fontStyleST}>
                  No Skin Tone selected yet
                </Text>
                <UIButton
                  style={[GlobalStyle.WrapForSlinglebttn]}
                  mode="contained"
                  accessibilityLabel="logout-ok"
                  labelStyle={{...Fonts.fontSemiBold}}
                  onPress={() => {
                    setIsCameraReady(true);
                  }}>
                  Select your Skin Tone
                </UIButton>
                <Text style={[styles.fontStyleST, styles.infoUnderlineText]}>
                  Learn how to select your Skin Tone
                </Text>
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.gender_PickerText}
              </Label>
              <View style={styles.inputPicker} accessibilityLabel="gender">
                <View accessibilityLabel={'selected-gender-' + gender}>
                  <UIPicker
                    mode="dialog"
                    style={{width: '99.5%', paddingRight: '.5%'}}
                    textStyle={{
                      color: gender === 'default' ? '#B3B3B3' : '#000',
                      ...Fonts.fontMedium,
                      paddingLeft: 10,
                    }}
                    iosIcon={
                      <MaIcon
                        name="arrow-drop-down"
                        style={{color: Colors.gray, fontSize: 26}}
                      />
                    }
                    selectedValue={gender}
                    placeholder={contentScreenObj.selectOne}
                    onValueChange={selectedItem => {
                      console.log('selectedItem', selectedItem);
                      if (selectedItem === 'default') {
                        // alert('Please select type')
                      } else {
                        setGender(selectedItem);
                      }
                    }}
                    // onValueChange={(selectedItem) => setGender(selectedItem)}
                  >
                    <UIPicker.Item
                      label={contentScreenObj.selectOne}
                      value={'default'}
                      color="#999"
                    />
                    <UIPicker.Item
                      label={contentScreenObj.gender_1}
                      value="M"
                    />
                    <UIPicker.Item
                      label={contentScreenObj.gender_2}
                      value="F"
                    />
                    <UIPicker.Item
                      label={contentScreenObj.gender_3}
                      value="O"
                    />
                    <UIPicker.Item
                      label={contentScreenObj.gender_4}
                      value="D"
                    />
                  </UIPicker>
                </View>
              </View>
            </View>
            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.height_PickerText}
              </Label>
              <HeightComponent
                {...{
                  heightType,
                  setHeightType,
                  contentScreenObj,
                  setFeet,
                  feet,
                  inch,
                  setInch,
                  meter,
                  setMeter,
                }}
              />
            </View>
            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.weight_InputText}
              </Label>
              <WeightComponent
                {...{
                  setWeightType,
                  weightType,
                  ...weightParams,
                }}
              />
            </View>
            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.country_PickerText}
              </Label>
              <View
                style={styles.inputPicker}
                accessibilityLabel="country-picker-outer">
                <View
                  accessibilityLabel={
                    'selected-country-' + listSelectedItem.code
                  }>
                  <UIPicker
                    mode="modal"
                    style={{width: '99.5%', paddingRight: '.5%'}}
                    textStyle={{
                      color:
                        listSelectedItem.code === 'default'
                          ? '#B3B3B3'
                          : '#000',
                      ...Fonts.fontMedium,
                      paddingLeft: 10,
                    }}
                    iosIcon={
                      <MaIcon
                        name="arrow-drop-down"
                        style={{color: Colors.gray, fontSize: 26}}
                      />
                    }
                    selectedValue={listSelectedItem.code}
                    placeholder={contentScreenObj.selectOne}
                    onValueChange={selected => {
                      setListSelectedItem({code: selected});
                    }}>
                    <UIPicker.Item
                      label={contentScreenObj.selectOne}
                      value={'default'}
                      color="#999"
                    />
                    {countries.map((item, itemId) => {
                      return (
                        <UIPicker.Item
                          label={item.Name}
                          value={item.code.toString()}
                          key={item.code}
                          color="#000"
                        />
                      );
                    })}
                  </UIPicker>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          {disableText ? (
            <UIButton
              style={
                continueBtnDisableState === true
                  ? {backgroundColor: '#A4C8ED'}
                  : {}
              }
              disabled={continueBtnDisableState}
              mode="contained"
              labelStyle={{color: '#fff'}}
              accessibilityLabel="personalInfo-continue-bttn"
              onPress={onContinue}>
              Continue
            </UIButton>
          ) : (
            <UIButton
              style={
                continueBtnDisableState === true
                  ? {backgroundColor: '#A4C8ED'}
                  : {}
              }
              disabled={continueBtnDisableState}
              mode="contained"
              labelStyle={{color: '#fff'}}
              accessibilityLabel="personalInfo-saveChanges-bttn"
              onPress={updateUserPersonalInfo}>
              {contentScreenObj.saveChange_ButtonText}
            </UIButton>
          )}
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
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.savePersonalInfo_PopUpText}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                accessibilityLabel="logout-ok"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}>
                OK
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

// This function is not used -> remove?
async function getUserFromLocalDb() {
  let user_id = await AsyncStorage.getItem('user_id');
  let userDbData = await DB_STORE.GET.userInfo(user_id);

  let userDetails = {
    birthDay: '1970-01-01',
    country: '',
    ethnicityId: '1',
    skinToneId: undefined,
    gender: 'M',
    height_ft: '0',
    height_in: '0',
    unitOfMeasurement: 'MKS',
    weight: '0',
    patientId: user_id,
  };

  if (userDbData && userDbData.rows[0]) {
    let thisUser = userDbData.rows[0];
    userDetails.birthDay = thisUser.birth_date;
    userDetails.country = thisUser.country;
    userDetails.ethnicityId = isNaN(thisUser.ethnicity_id)
      ? 1
      : thisUser.ethnicity_id * 1;
    userDetails.skinToneId = thisUser.skin_tone_id;
    userDetails.gender = thisUser.gender_id;
    userDetails.height_ft = (thisUser.height_ft * 1).toString();
    userDetails.height_in = (thisUser.height_in * 1).toString();
    userDetails.unitOfMeasurement = thisUser.weight_unit;
    userDetails.weight = thisUser.weight;
    userDetails.patientId = user_id;

    console.log(
      '+++++++++++++++++++++++++ user details',
      JSON.stringify(userDetails),
    );
    return thisUser;
  }

  return null;
}

// This function is not called any more, the caller code was commented -> remove?
async function getEthnicityListFromLocalDb() {
  let ethnicity_list = [];

  let ethnicityData = await DB_STORE.GET.ethnicityList();

  try {
    let rows = ethnicityData.rows;

    rows.forEach(r => {
      ethnicity_list.push({id: r.id * 1, value: r.name});
    });
  } catch (e) {
    console.log(e);
  }

  return ethnicity_list;
}

async function sendSyncCommand(data) {
  let batteryLevel = await RNDeviceInfo.getBatteryLevel();

  if (batteryLevel.toFixed(2) < 0.11) {
    showErrorToast(t('watchSettingsScreen.watchSettingSaveDB_ErrorText'));
    return;
  }
  let deviceMsn = await AsyncStorage.getItem('device_msn');
  // this is very similar to eureka/App/Containers/WatchSettingsScreen/WatchSettingsScreen.js
  // consider refactoring
  AppSyncCommandHandler.startSync();

  let sendSyncCommand = {
    userId: data.id.toString(),
    deviceMsn,
    autoMeasure: data.auto_measure,
  };
  console.log('sendSyncCommand user', sendSyncCommand);

  return EVENT_MANAGER.SEND.appSync(sendSyncCommand);
}
