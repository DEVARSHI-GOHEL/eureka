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
  Alert,
} from 'react-native';

import {Label} from 'native-base';

import {
  UIButton,
  UILoader,
  UITextInput,
  UIModalDropdown,
  UILightMealIcon,
  UIModerateMealIcon,
  UIHeavyMealIcon,
} from '../../Components/UI';
import AntIcon from 'react-native-vector-icons/AntDesign';
import GlobalStyle from '../../Theme/GlobalStyle';
import styles from './styles';
import {Colors, Fonts, Config} from '../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import EvilFont from 'react-native-vector-icons/EvilIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {RadioButton} from 'react-native-paper';
import {API} from '../../Services/API';
import {useNetStatus} from '../../Services/Hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import {Translate} from '../../Services/Translate';
import {
  getShortHour,
  getDateString,
  getDateTimeInfo,
  getAbsoluteHourInAmPm,
} from '../../Chart/AppUtility/DateTimeUtils';
import {postWithAuthorization} from "../../Services/graphqlApi";

const AddMealScreen = ({navigation, route}) => {
  const {mealsList, datePickerDate} = route.params;
  // console.log('mealsList', mealsList)
  let date = new Date();
  let getMonth = moment(date).format('MMMM');
  let getToday = date.getDate();
  let getTime = moment().format('LT');
  const [checkedBox, setCheckedBox] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [timeField, setTimeField] = useState(getTime);
  const [mainDate, setmainDate] = useState(new Date());
  const [dateText, setDateText] = useState(getToday);
  const [monthText, setMonthText] = useState(getMonth);
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('default');
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  // const [netVisibility, setNetVisibility] = useNetStatus(false);

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('addMealScreen'))) {
      const addMealScreenContentObject = Translate('addMealScreen');
      setContentScreenObj(addMealScreenContentObject);
    }
  });
  /** ############################ */

  let dateMoment = moment().format('L');
  let dateMomentSplit = dateMoment.split('/');
  let dateMomentReverse = dateMomentSplit.reverse();
  let payloadDate = `${dateMomentReverse[0]}/${dateMomentReverse[1]}/${dateMomentReverse[2]}`;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (time) => {
    let newTime = moment(time).format('hh:mm A');
    hideDatePicker();

    var currentTimeVar = new Date().getTime();
    console.log('currentTimeVar', currentTimeVar);
    var selectedTimeVar = new Date(time).getTime();
    console.log('selectedTimeVar', selectedTimeVar);
    // console.log(d2>d1);

    if (
      moment(datePickerDate).isSameOrAfter(new Date(), 'day') &&
      currentTimeVar < selectedTimeVar
    ) {
      alert(contentScreenObj.errorMsg_1);
    } else {
      // alert('added');
      setmainDate(time);
      setTimeField(newTime);
    }
  };

  const [modalItemStateArray, setModalItemStateArray] = useState([]);

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
  useEffect(() => {
    getMealList();
  }, []);

  const onMealAdd = async () => {
    try {
      setIsLoader(true);

      setLoaderText(contentScreenObj.loaderMsg_1);

      let size;
      // const mydate = moment().format('L');

      const mydate = datePickerDate;

      mydate.setHours(mainDate.getHours(), mainDate.getMinutes(), 0, 0);
      console.log('mydate', mydate);

      const timestamp = new Date(mydate).valueOf();

      const userId = await AsyncStorage.getItem('user_id');

      let q =
        'mutation MyMutation($userId: Int, $timestamp: String, $size: Int, $notTakenMeal: Boolean, $details: String) {addMeals(details: $details, notTakenMeal: $notTakenMeal, size: $size, timestamp: $timestamp, userId: $userId) {body statusCode}}';
      const response = await postWithAuthorization(
        Config.EUREKA_GRAPHQL_BASE_URL,
        {
          query: q,
          variables: {
            userId: Number(userId),
            size: checked,
            timestamp,
            details: message,
            notTakenMeal: checkedBox,
          },
        }
      );
      console.log('response', response);
      setIsLoader(false);
      setLoaderText('');

      navigation.goBack();
    } catch (error) {
      console.log('error, add', error);
      setIsLoader(false);
      setLoaderText('');
      alert(contentScreenObj.errorMsg_3);
    }
  };

  const min = (input) => {
    if (toString.call(input) !== '[object Array]') return false;
    return Math.min.apply(null, input);
  };

  const onMealAddWrapper = () => {
    const mydate = datePickerDate;

    mydate.setHours(
      mainDate.getHours(),
      mainDate.getMinutes(),
      mainDate.getSeconds(),
      0,
    );

    const timestamp = new Date(mydate).valueOf();

    /**
     * if added timestamp is less than listed timestamp then
     * it will give alert else not alert
     */
    let newTimeStampArray = [];

    mealsList.forEach((i, ind) => {
      // console.log('i', i.item.timestamp)
      newTimeStampArray.push(i.item.timestamp);
    });

    min(newTimeStampArray);

    if (mealsList.length > 0 && timestamp < min(newTimeStampArray)) {
      Alert.alert('', contentScreenObj.errorMsg_2, [
        {
          text: contentScreenObj.NO_PopUpButtonText,
        },
        {
          text: contentScreenObj.YES_PopUpButtonText,
          onPress: () => onMealAdd(),
        },
      ]);
    } else {
      onMealAdd();
    }
  };

  const getMealList = async () => {
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);
    try {
      let token = await AsyncStorage.getItem('graphql_token');
      const response = await API.postApi(
        `${Config.API_GATEWAY_BASE_URL}/masterdata`,
        {
          dataType: 'getMealSize',
        },
        {
          headers: {
            'x-api-key': token,
            'Content-Type': 'application/json',
          },
        },
      );
      setIsLoader(false);
      setLoaderText('');
      if (response.data.statusCode === 200) {
        /**
         * Revert back header to normal
         */

        /**
         * setting the ethinicity value to array state
         */
        setModalItemStateArray(response.data.body.data.master_data_list);
      }
    } catch (error) {
      alert(contentScreenObj.errorMsg_3);
      console.log('err', error);
      setIsLoader(false);
      setLoaderText('');
    }
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

  const renderMealOptionsList = (item, index) => {
    return (
      <View style={styles.radioArea} key={index}>
        <RadioButton.Android
          value={item.value}
          color={Colors.blue}
          uncheckedColor="#BEBEBE"
          status={checked === item.id ? 'checked' : 'unchecked'}
          onPress={() => setChecked(item.id)}
          accessibilityLabel="meal-radio-button"
          style={styles.checkIcon}
        />
        <View style={styles.align}>
          {item.id === 1 && (
            <UILightMealIcon widthParam={27} heightParam={27} fill="#000" />
          )}
          {item.id === 2 && (
            <UIModerateMealIcon fill="#000" widthParam={27} heightParam={27} />
          )}
          {item.id === 3 && (
            <UIHeavyMealIcon fill="#000" widthParam={27} heightParam={27} />
          )}
        </View>
        <Text
          style={{...Fonts.h3, ...Fonts.fontBold}}
          accessibilityLabel="meal-radio-text">
          {contentScreenObj[`mealSize_${item.id}`]}
        </Text>
      </View>
    );
  };
  const updateCheckbox = (idParam, checkedParam) => {};
  console.log('checkedBox', checkedBox);

  return (
    <SafeAreaView style={GlobalStyle.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <ScrollView style={styles.mainScrollView}>
        {/* <View style={styles.topArrow}>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
          <TouchableOpacity onPress={showDatePicker} >
            <AntIcon
              name='calendar' color='#000' size={20}
            />
          </TouchableOpacity>
          <Text style={styles.dateText}>{monthText} {dateText}</Text>
          <TouchableOpacity>
            <Text style={{ color: Colors.blue, ...Fonts.fontSemiBold, ...Fonts.h2, textDecorationLine: 'underline' }}>Today</Text>
          </TouchableOpacity>
        </View> */}
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={['#f1fbff', '#fff']}
          style={GlobalStyle.gradientContainer}>
          <View style={styles.inputWrap}>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              // maximumDate={new Date()}
            />
            <Label style={styles.inputLabel}>
              {contentScreenObj.time_InputText}
            </Label>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showDatePicker}
              accessibilityLabel="meal-entry-time"
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

            {/* <ListItem style={styles.chekboxRow}>
              <CheckBox
                style={[styles.chekboxColor, (checkedBox === true) ? { borderColor: '#006dd7', backgroundColor: '#006dd7' } : {}]}
                checked={checkedBox}
                onPress={(newValue) => {
                  setCheckedBox(!checkedBox);
                }} />
              <Body style={{ alignItems: 'flex-start' }}>
                <Text style={styles.didntHaveMealText}
                  accessibilityLabel="known-diseases-checkBox-text">I did not have any meal before this in the last 8 hours.</Text>
              </Body>
            </ListItem> */}
          </View>
          <View style={styles.radioAreaWrap}>
            <Label style={styles.inputLabel}>
              {contentScreenObj.mealSize_InputText}
            </Label>

            {modalItemStateArray.map((item, index) =>
              renderMealOptionsList(item, index),
            )}
          </View>
          <View style={styles.inputWrap}>
            <UITextInput
              labelText={contentScreenObj.mealDetails_InputText}
              value={message}
              style={styles.mealTextfield}
              placeholder={contentScreenObj.mealDetails_PlaceholderText}
              multiline={true}
              textAlignVertical={'top'}
              accessibilityLabel="meal-note"
              onChangeText={(text) => setMessage(text)}
            />
          </View>
        </LinearGradient>
      </ScrollView>
      <View style={styles.bttnWrap}>
        <UIButton
          mode="contained"
          labelStyle={{color: '#fff'}}
          disabled={!checked}
          style={!checked ? {backgroundColor: '#A4C8ED'} : {}}
          accessibilityLabel="add-meal-addButton"
          onPress={() => onMealAddWrapper()}>
          {contentScreenObj.add_ButtonText}
        </UIButton>
      </View>
    </SafeAreaView>
  );
};

export default AddMealScreen;
