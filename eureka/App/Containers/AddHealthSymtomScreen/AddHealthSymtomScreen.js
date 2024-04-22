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
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  BackHandler,
} from 'react-native';

import {Label} from 'native-base';
import {
  UIButton,
  UILoader,
  UITextInput,
  UIGenericPlaceholder, UIPicker,
} from '../../Components/UI';
import AntIcon from 'react-native-vector-icons/AntDesign';
import IconFont from 'react-native-vector-icons/FontAwesome';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import GlobalStyle from '../../Theme/GlobalStyle';
import styles from './styles';
import {Colors, Fonts, Get_master_Api, Sign_In_Api} from '../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {API} from '../../Services/API';
import {useNetStatus} from '../../Services/Hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {useNetInfo} from '@react-native-community/netinfo';
import {useTranslation} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

const AddHealthSymtomScreen = ({navigation, ...props}) => {
  let date = new Date();
  let getTime = moment().format('LT');
  console.log('time 1', getTime);

  // let gettimestamp = date.getTime(getTime);

  // console.log('gettimestamp',gettimestamp);

  // console.log('time', );

  let {dateParam} = props.route.params;

  // console.log('onlyDate', onlyDate);

  const netInfo = useNetInfo();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [timeField, setTimeField] = useState(getTime);
  const [timeFieldTimeStamp, setTimeFieldTimeStamp] = useState('');

  const [type, setType] = useState('default');
  const [symptomDetails, setSymptomDetails] = useState('');
  const [checked, setChecked] = React.useState('lightMeal');
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [symptomArray, setSymptomArray] = useState([]);

  const [netVisibility, setNetVisibility] = useNetStatus(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('addHealthSymptomScreen');

  /** ############################ */

  let dateMoment = moment().format('L');
  let dateMomentSplit = dateMoment.split('/');
  let dateMomentReverse = dateMomentSplit.reverse();
  let payloadDate = `${dateMomentReverse[0]}-${dateMomentReverse[2]}-${dateMomentReverse[1]}`;

  /**
   * date to timestamp common funtion
   * @param {*} dateParam
   */
  const dateToTimeStamp = (dateParamS) => {
    let pickedDate = new Date(dateParamS);
    let timeStampDate = pickedDate.getTime();
    return timeStampDate;
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleTimeStamp = () => {
    // let onlyDate = dateParam.setHours(0,0,0,0);
    let date = new Date(dateParam);
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    let currentSeconds = currentDate.getSeconds();
    console.log('currentTime', currentHour, currentMinutes, currentSeconds);

    console.log(
      'handleTimeStamp===========',
      date.setHours(currentHour, currentMinutes, currentSeconds),
    );
    let dateAndTime = date.setHours(
      currentHour,
      currentMinutes,
      currentSeconds,
    );

    // let newTime = moment(date).format('hh:mm A');
    // let tidateToTimeStamp = dateToTimeStamp(dateAndTime);

    console.log('handleTimeStamp tidateToTimeStamp', dateAndTime);

    setTimeFieldTimeStamp(dateAndTime);

    // setTimeField(newTime);
  };

  const [dayWarning, setDayWarning] = useState(false);

  const [timeSet, setTimeSet] = useState();
  let dayWarningTxt;
  const handleConfirm = (dateParamPicker) => {
    let date = new Date(dateParam);
    console.log('date+++++++++++++', date);
    let newTime = moment(dateParamPicker).format('hh:mm A');

    console.log('newtime+++++++++', newTime);
    hideDatePicker();

    let currentHour = dateParamPicker.getHours();
    let currentMinutes = dateParamPicker.getMinutes();
    let currentSeconds = dateParamPicker.getSeconds();
    console.log(
      'currentTime handle %%%%%%%%%%%%%%%%%%%%',
      currentHour,
      currentMinutes,
      currentSeconds,
    );

    let dateAndTime = date.setHours(
      currentHour,
      currentMinutes,
      currentSeconds,
    );

    // let CurrentTime =
    // setTimeSet(dateAndTime);

    console.log('current---------------', getTime, 'new-----------', newTime);

    if (dayWarning) {
      dayWarningTxt = (
        <View style={{flexDirection: 'row'}}>
          <IconFont
            name="warning"
            style={{color: 'red', fontSize: 16, marginRight: 8}}
          />
          <Text style={styles.warnText}>
            The value in Date is not a valid date.
          </Text>
        </View>
      );
    }
    let rt = date.getTime().toString();
    // console.log('newTime', newTime)
    var currentTimeVar = new Date().getTime();
    console.log('currentTimeVar', currentTimeVar);
    var selectedTimeVar = new Date(date).getTime();
    console.log('selectedTimeVar', selectedTimeVar);
    // console.log(d2>d1);

    if (currentTimeVar < selectedTimeVar) {
      alert(contentScreenObj.errorMsg_1);
    } else {
      // alert('added');
      setTimeField(newTime);
      setTimeFieldTimeStamp(dateAndTime);
    }

    // return false;

    // if ( > newTime) {

    //   setDayWarning(true);
    //   alert('if')
    // } else {
    //   alert('else')
    // }
    //   console.warn(typeof(rt), rt)
    //   console.warn(typeof(newTime),'new', newTime)

    // console.log('handleTimeStamp tidateToTimeStamp handle __________________', dateAndTime);

    // setTimeField(newTime);
    // setTimeFieldTimeStamp(dateAndTime);
    // console.log('timeFieldTimeStamp',timeFieldTimeStamp);
  };

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
      headerLeft: (props) => (
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
      headerLeft: (props) => {
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
   * get relationtype list Api call
   */
  const getSymptomList = () => {
    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    API.postApi(
      Get_master_Api,
      {
        dataType: 'getSymptomsType',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('symptom type', response);
        if (response.data.statusCode === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          /**
           * setting the ethinicity value to array state
           */
          setSymptomArray(response.data.body.data.master_data_list);
          console.log(symptomArray)
        }
      })
      .catch(function (error) {
        console.log('err', error);
        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  /**
   * add user contact list Api call
   */
  const addHealthSymptomApi = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');
    // console.warn(userId)

    // const getAgreementUserState = `mutation add($userId:Int,$date:String,$time:String,$type:Int,$details:String){addSymptoms(userId:$userId,date:$date,time:$time,type:$type,details:$details){statusCode body}}`
    const getAgreementUserState = `mutation MyMutation($userId: Int, $type: Int, $timestamp: String, $details: String) {addSymptoms(details: $details, timestamp: $timestamp, type: $type, userId: $userId) {body statusCode}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: getAgreementUserState,
        variables: {
          userId: userIdAsync,
          type: `${type}`,
          timestamp: `${timeFieldTimeStamp}`,
          details: `${symptomDetails}`,
        },
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('add symptom', response);
        if (response.status === 200) {
          if (
            response.data.data !== null &&
            response.data.data.addSymptoms.statusCode === 500
          ) {
            setIsLoader(false);
            setLoaderText(contentScreenObj.loaderMsg_1);

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();


          }
          if (response.data.data.addSymptoms.statusCode === 503) {
            setIsLoader(false);

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            // alert('Error')
          } else if (response.data.data.addSymptoms.statusCode === 200) {
            setIsLoader(false);
            setLoaderText(contentScreenObj.loaderMsg_1);

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            navigation.goBack();
          }
        }
      })
      .catch(function (error) {
        console.log('err 1', error);

        // setNetVisibility(error);

        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  useEffect(() => {
    getSymptomList();

    if (timeFieldTimeStamp == '') {
      handleTimeStamp();
    }
  }, []);

  if (netVisibility) {
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
  let continueBtnDisableState;

  if (type !== 'default') {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* <UIGenericPlaceholder
        visiblity={netVisibility}
        // errorIcon={true}
        noInternetIcon={netVisibility}
        // noDataIcon={true}
        // loadingIcon={true}
        message='No Internet Connection'
      /> */}
      {isLoader && <UILoader title={loaderText} />}
      <ScrollView style={styles.mainScrollView}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={['#f1fbff', '#fff']}
          style={styles.gradientContainer}>
          <View style={styles.inputWrap}>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              // maximum={new Date()}
            />

            <Label style={[styles.inputLabel, {marginBottom: 4}]}>
              {contentScreenObj.time_InputText}
            </Label>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showDatePicker}
              accessibilityLabel="symptom-entry-time"
              style={styles.timeField}
              accessible={false}
            >
              <Text style={styles.timeText}>{timeField}</Text>
              {/* <UITextInput
                placeholder={'Add notes here...'}
                value={timeField}
                labelText={'Time'}
                autoCapitalize="none"
                onTouchStart={showDatePicker}
                editable={false}
                // accessible={false}
                // onKeyPress={Keyboard.dismiss()}
                style={{ backgroundColor: '#fff' }}
                onChangeText={(text) => setEmail(text)}
              /> */}
            </TouchableOpacity>
            {dayWarningTxt}
          </View>

          <View style={styles.inputWrap}>
            <Label style={styles.inputLabel}>
              {contentScreenObj.type_PickerText}
            </Label>
            <View style={styles.inputPicker}>
              <UIPicker
                mode="dropdown"
                style={{width: '99.5%', paddingRight: '.5%'}}
                textStyle={{
                  color: type === 'default' ? '#B3B3B3' : '#000',
                  ...Fonts.fontMedium,
                  paddingLeft: 10,
                }}
                iosIcon={
                  <MaIcon
                    name="arrow-drop-down"
                    style={{color: Colors.gray, fontSize: 26}}
                  />
                }
                selectedValue={type}
                accessibilityLabel="symptom-type-list"
                onValueChange={(selectedItem) => {
                  console.log('selectedItem', selectedItem);
                  if (selectedItem === 'default') {
                    // alert('Please select type')
                  } else {
                    setType(selectedItem);
                  }
                }}>
                <UIPicker.Item
                  label={contentScreenObj.selectOne}
                  value={'default'}
                  color="#999"
                />
                {symptomArray.map((item, itemId) => {
                  return (
                    <UIPicker.Item
                      accessibilityLabel="symptom-type-items"
                      label={contentScreenObj[item.value] || item.value}
                      value={item.id.toString()}
                      key={item.id}
                    />
                  );
                })}
              </UIPicker>
            </View>
          </View>

          <View style={styles.inputWrap}>
            <UITextInput
              labelText={contentScreenObj.symptomDetails_InputText}
              value={symptomDetails}
              style={styles.symptomTextfield}
              placeholder={contentScreenObj.symptomDetails_PlaceholderText}
              multiline={true}
              textAlignVertical={'top'}
              accessibilityLabel="symptom-text-input"
              onChangeText={(text) => setSymptomDetails(text)}
            />
          </View>
        </LinearGradient>
      </ScrollView>
      <View style={styles.bttnWrap}>
        <UIButton
          mode="contained"
          labelStyle={{color: '#fff'}}
          style={
            continueBtnDisableState === true ? {backgroundColor: '#A4C8ED'} : {}
          }
          disabled={continueBtnDisableState}
          accessibilityLabel="add-button"
          onPress={addHealthSymptomApi}>
          {contentScreenObj.add_ButtonText}
        </UIButton>
      </View>
    </SafeAreaView>
  );
};

export default AddHealthSymtomScreen;
