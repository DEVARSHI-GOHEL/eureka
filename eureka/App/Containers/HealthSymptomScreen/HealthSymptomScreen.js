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
  BackHandler,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import {
  UIButton,
  UILoader,
  UICommingSoon,
  UITextBold,
} from '../../Components/UI';
import AntIcon from 'react-native-vector-icons/AntDesign';
import GlobalStyle from '../../Theme/GlobalStyle';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {Colors, Fonts, Sign_In_Api, Get_master_Api, Config} from '../../Theme';
import styles from './styles';
import {API} from '../../Services/API';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import {SymptomRenderItemComp} from '../HealthSymptomScreen/SymptomRenderItemCom';
import {Translate} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

const HealthSymptomScreen = ({navigation, ...props}) => {
  const isFocused = useIsFocused();
  const {userId, userName} = useSelector((state) => ({
    userId: state.auth.userId,
    userName: state.auth.userName,
    //  userState: action.auth.userState
  }));

  let date = new Date();
  // console.log('date-----', moment.ISO_8601(date));

  // let timeStampVar = date.getTime()
  // let onlyDate = date.setHours(0, 0, 0, 0);

  console.log('date', date);

  let getMonth = moment(date).format('MMMM');
  let getToday = date.getDate();
  // note needed now
  // let calenderDate = moment(date).format("YYYY-MM-DD");

  const [isLoader, setIsLoader] = useState(true);
  const [loaderText, setLoaderText] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateText, setDateText] = useState(getToday);
  const [monthText, setMonthText] = useState(getMonth);
  const [datePayload, setDatePayload] = useState(date);
  const [datePayloadTimeStamp, setDatePayloadTimeStamp] = useState('');
  const [details, setDetails] = useState(Array(4).fill(''));
  const [getSymptom, setGetSymptom] = useState('default');
  const [type, setType] = useState('');
  const [symptomList, setSymptomList] = useState([]);
  const [symptomArray, setSymptomArray] = useState([]);
  const [editableVisibilityState, setEditableVisibilityState] = useState(false);
  const [isCommingSoon, setIsCommingSoon] = useState(true);
  const [deleteReload, setDeleteReload] = useState(false);

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('healthSymptomScreen'))) {
      const healthSymptomScreenContentObject = Translate('healthSymptomScreen');
      setContentScreenObj(healthSymptomScreenContentObject);
    }
  });
  /** ############################ */

  let disableText;
  if (
    props.route.params &&
    props.route.params.routeFrom === 'ShareDataScreen'
  ) {
    disableText = true;
  } else {
    disableText = false;
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
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
   * date to timestamp common funtion
   * @param {*} dateParam
   */
  const dateToTimeStamp = (dateParam) => {
    let pickedDate = new Date(dateParam);
    // var dates = new Date(dateParam.getTime());
    pickedDate.setHours(0, 0, 0, 0);
    let timeStampDate = pickedDate.getTime();

    console.log('timeStampDate=====', timeStampDate);
    return timeStampDate;
  };

  const handleTimeStamp = () => {
    let dateNow = new Date();
    // let calenderDate = moment(dateNow).format("YYYY-MM-DD");

    // setDatePayload(calenderDate);

    let timeStampCalender = dateToTimeStamp(dateNow);

    console.log('timeStampCalender', timeStampCalender);

    setDatePayloadTimeStamp(timeStampCalender);
  };

  /**
   * list of symptoms with details
   */
  const getSymptomTypeList = async () => {
    console.log('getSymptomTypeList called', datePayloadTimeStamp);

    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');

    const getSymptomTypeListState = `query MyQuery($timestamp: String, $userId: Int) {symptomsList(timestamp: $timestamp, userId: $userId) {statusCode body {message success data {creationDate details symptomsId symptomsType symptomsTypeId timestamp updationDate}}}}`;

    /**
     * Show loader after sign in button press
     */

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    console.log('datePayloadTimeStamp', datePayloadTimeStamp);

    if (datePayloadTimeStamp !== '') {
      // return false
      /**
       * Api call
       */
      postWithAuthorization(
        Sign_In_Api,
        {
          query: getSymptomTypeListState,
          variables: {
            userId: userIdAsync,
            timestamp: datePayloadTimeStamp,
          },
        }
      )
        /**
         * Get response from Api and call async storage
         */
        .then((response) => {
          console.log('res +++++++++++++++++++++++++++++++++++++', response);
          if (response.status === 200) {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            // setSymptomList([]);
            setSymptomList(response.data.data.symptomsList.body.data);
          }
        })
        .catch(function (error) {
          console.log('err 1+++++++++++++++++++', error.response);
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
        });
    }
  };

  /**
   * dropdown symptom
   */
  const getSymptomList = () => {
    console.log('getSymptomList called ===========================');
    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

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
        console.log('symptom type -------------', response);
        if (response.data.statusCode === 200) {
          /**
           * Revert back header to normal
           */
          // backHandleHeaderNormalFun();

          /**
           * setting the ethinicity value to array state
           */
          setSymptomArray(response.data.body.data.master_data_list);
        }
      })
      .catch(function (error) {
        console.log('err', error);
        setIsLoader(false);
        setLoaderText('');

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
   * edit api set symptom list
   */
  const setSymptomItem = async (
    symptomsIdProp,
    typeProp,
    detailsProp,
    dateProp,
  ) => {
    console.log(
      'symptomsIdProp, typeProp, detailsProp, dateProp=============',
      symptomsIdProp,
      typeProp,
      detailsProp,
      dateProp,
    );
    /**
     * Show loader after sign in button press
     */

    /**
     * header to normal
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');
    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: `mutation MyMutation($userId: Int, $timestamp: String, $type: Int, $symptomsId: Int, $details: String) {editSymptoms(details: $details, timestamp: $timestamp symptomsId: $symptomsId, type: $type, userId: $userId) {body statusCode}}`,

        variables: {
          userId: userIdAsync,
          symptomsId: `${symptomsIdProp}`,
          timestamp: dateProp,
          type: `${typeProp}`,
          details: `${detailsProp}`,
        },
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('set symptom type', response);
        if (response.data.data.editSymptoms.statusCode === 200) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */

          getSymptomTypeList();

          /**
           * setting the ethinicity value to array state
           */
        }
      })
      .catch(function (error) {
        console.log('err', error.response);
        setIsLoader(false);
        setLoaderText('');

        /**
         * Revert back header to normal
         */
        // backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  const setSymptomItemTime = (dateP) => {
    console.log('dateP', dateP);
    setSymptomItem();
  };
  /**
   * delete symptom item Api call
   */
  const deleteSymptomItem = async (symptomsIdProp, typeProp, detailsProp) => {
    console.log(
      'symptomsIdProp, typeProp, detailsProp-------',
      symptomsIdProp,
      typeProp,
      detailsProp,
    );

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    let userIdAsync = await AsyncStorage.getItem('user_id');
    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: `mutation MyMutation($symptomsId: Int, $userId: Int) {deleteSymptoms(symptomsId: $symptomsId, userId: $userId) {body statusCode}}`,
        variables: {
          userId: userIdAsync,
          symptomsId: `${symptomsIdProp}`,
        },
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('delete symptom type -------', response);
        if (response.data.data.deleteSymptoms.statusCode === 200) {
          /**
           * Revert back header to normal
           */
          // backHandleHeaderNormalFun();

          getSymptomTypeList();

          setDeleteReload(true);
          /**
           * setting the ethinicity value to array state
           */
        }
      })
      .catch(function (error) {
        console.log('err', error.response);
        setIsLoader(false);
        setLoaderText('');

        /**
         * Revert back header to normal
         */

        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  const handleConfirm = (date) => {
    let dateVar = date.getDate();
    let monthVar = date.getMonth();
    let monthVal = moment(date).format('MMMM');
    hideDatePicker();
    /**
     * dynamic setting calendar date
     * to api payload
     * fetching the ui again for previous/new data
     *
     */
    let calenderDate = moment(date).format('YYYY-MM-DD');

    setDatePayload(calenderDate);

    let timeStampCalender = dateToTimeStamp(date);

    console.log('timeStampCalender', timeStampCalender);

    setDatePayloadTimeStamp(timeStampCalender);

    setDateText(dateVar);
    setMonthText(monthVal);
  };

  const setTodayFun = () => {
    let dateVar = date.getDate();
    let monthVal = moment(date).format('MMMM');
    /**
     * dynamic setting calendar date
     * to api payload
     * fetching the ui again for previous/new data
     *
     */
    let calenderDate = moment().format('YYYY-MM-DD');

    setDatePayload(calenderDate);
    let timeStampCalender = dateToTimeStamp(date);

    console.log('timeStampCalender', timeStampCalender);

    setDatePayloadTimeStamp(timeStampCalender);
    setDateText(dateVar);
    setMonthText(monthVal);
  };

  const renderItemFun = (itemProps, indexMainParam) => {
    console.log('itemProps', itemProps);

    return (
      <SymptomRenderItemComp
        key={indexMainParam}
        pickerArrayData={symptomArray}
        selectedValueProp={itemProps.symptomsType}
        inputData={itemProps.details}
        onChangeFun={setSymptomItem}
        deleteSymptom={deleteSymptomItem}
        indexedStateProp={indexMainParam}
        {...itemProps}
      />
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (datePayloadTimeStamp === '') {
        handleTimeStamp();
      }

      // dropdown symptom
      getSymptomList();
      setTimeout(() => {
        // list of symptoms with details
        getSymptomTypeList();
      }, 2000);
    }, [datePayloadTimeStamp, deleteReload]),
  );

  return (
    <SafeAreaView style={GlobalStyle.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <ScrollView style={styles.mainScrollView}>
        <View style={styles.topArrow}>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
          <TouchableOpacity
            onPress={showDatePicker}
            accessibilityLabel="healthSymptom-calender-icon"
            accessible={false}>
            <AntIcon name="calendar" color="#000" size={20} />
          </TouchableOpacity>
          <Text
            style={styles.dateText}
            accessibilityLabel="healthSymptom-add-time">
            {monthText} {dateText}
          </Text>
          <TouchableOpacity
            onPress={() => setTodayFun()}
            accessibilityLabel="today-date"
            accessible={false}>
            <Text
              style={{
                color: Colors.blue,
                ...Fonts.fontSemiBold,
                ...Fonts.h2,
                textDecorationLine: 'underline',
              }}>
              {contentScreenObj.today_ButtonText}
            </Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={['#f1fbff', '#fff']}
          style={[
            GlobalStyle.gradientContainer,
            {paddingHorizontal: 0, paddingVertical: 0},
          ]}>
          {symptomList?.length < 1 ? (
            <UITextBold
              style={styles.emptyContent}
              accessibilityLabel="healthSymptom-no-symptom">
              {contentScreenObj.noMealText}
            </UITextBold>
          ) : (
            symptomList?.map((item, index) => renderItemFun(item, index))
          )}
        </LinearGradient>
      </ScrollView>
      <View style={styles.bttnWrap}>
        <UIButton
          accessibilityLabel="add-button-healthSymptomList"
          mode="contained"
          labelStyle={{color: '#fff'}}
          onPress={() =>
            navigation.navigate('AddHealthSymtomScreen', {
              dateParam: datePayload,
            })
          }>
          {contentScreenObj.addSymptom_ButtonText}
        </UIButton>
      </View>
    </SafeAreaView>
  );
};

export default HealthSymptomScreen;
