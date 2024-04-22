/**
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
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

import {
  UIButton,
  UILoader,
  UITextInput,
  UIModalDropdown,
  UILightMealIcon,
  UIModerateMealIcon,
  UIHeavyMealIcon,
  UITextBold,
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
import {API} from '../../Services/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Translate, useTranslation} from '../../Services/Translate';
import {
  isToday,
  getDateTimeInfo,
  toMs,
} from '../../Chart/AppUtility/DateTimeUtils';
import {useSelector} from 'react-redux';
import {MEALS_STATE} from '../../constants/AppDataConstants';
import MealsCommandHandler from './MealsCommandHandler';
import {
  showErrorToast,
  showSuccessToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {postWithAuthorization} from "../../Services/graphqlApi";

const MealScreen = ({navigation}) => {
  let date = new Date();
  let getToday = moment(date).format(Translate('dateFormats.dateInWordsShort'));
  let getTime = moment().format('LT');
  const mydate = new Date().setHours(0, 0, 0, 0);

  const {mealsRefresh} = useSelector((state) => ({
    mealsRefresh: state.meals.refresh,
  }));

  const [minTimeValue, setMinTimeValue] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [dateText, setDateText] = useState(getToday);

  const [timeField, setTimeField] = useState(getTime);
  const [note, setNote] = useState('');
  const [currentMeal, setCurrentMeal] = useState();
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [timeStamp, setTimeStamp] = useState(mydate);
  const [mealsList, setMealsList] = useState([]);
  const [checkedBox, setCheckedBox] = useState(false);
  const [firstMealState, setFirstMealState] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('mealScreen');
  /** ############################ */

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const showTimeicker = (time) => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirm = (date) => {
     hideDatePicker();
    date.setHours(0, 0, 0, 0);

    setDatePickerDate(date);
    setTimeStamp(date.valueOf());
    setDateText(moment(date).format(Translate('dateFormats.dateInWordsShort')));
    setCurrentMeal(null);
  };

  useEffect(() => {
    // setIsLoader(true);
    getMealList();
    // setIsLoader(false);
  }, [timeStamp]);

  useEffect(() => {
    if (mealsRefresh == MEALS_STATE.REFRESH_MEAL) {
      getMealList();
      MealsCommandHandler.resetMeals();
    }
  }, [mealsRefresh]);

  const getMealList = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');

      setIsLoader(true);
      setLoaderText(contentScreenObj.loaderMsg_1);
      let q =
        'query MyQuery($userId: Int, $timestamp: String) {mealList(timestamp: $timestamp, userId: $userId) {statusCode body {message success data {notTakenMeal timestamp mealSizeId mealSize mealId details}}}}';

      const response = await postWithAuthorization(
        Config.EUREKA_GRAPHQL_BASE_URL,
        {
          query: q,
          variables: {
            userId: Number(userId),
            timestamp: timeStamp,
          },
        },
      );
      setIsLoader(false);
      setLoaderText('');

      if (response.status === 200) {
        console.log('meal response', response);
          const data = response.data.data?.mealList?.body?.data
          if (data && typeof data === 'object') {
            const newList = response.data.data.mealList.body.data.map((item) => ({
            item,
            choice: modalItemStateArray,
            selected: 1,
            notTakenMeal: item?.notTakenMeal,
          }));

          setMealsList(newList);
      }

        // if (
        //   response.data.data.mealList.body.data.map((mealParam) => {
        //     let y;
        //     console.log('mealParam', Math.min(mealParam.timestamp));
        //     if (mealParam.timestamp === true) {
        //       // console.log('mealParam', mealParam),
        //       // alert('hi')
        //       setFirstMealState(true);
        //     } else {
        //       setFirstMealState(false);
        //     }
        //   })
        // );
      }
    } catch (error) {
      // setIsLoader(false);
        alert(contentScreenObj.errorMsg_3);
        console.log(contentScreenObj.errorMsg_3);
      }
  };

  const [modalItemStateArray, setModalItemStateArray] = useState([
    {
      id: 1,
      value: contentScreenObj.light_mealSize,
      crt_ts: '2020-06-03T13:07:49.220Z',
      updt_ts: '2020-06-03T13:07:49.220Z',
    },
    {
      id: 2,
      value: contentScreenObj.moderate_mealSize,
      crt_ts: '2020-06-03T13:08:47.030Z',
      updt_ts: '2020-06-03T13:08:47.030Z',
    },
    {
      id: 3,
      value: contentScreenObj.heavy_mealSize,
      crt_ts: '2020-06-03T13:08:56.818Z',
      updt_ts: '2020-06-03T13:08:56.818Z',
    },
  ]);

  const [modalItemSelectedObject, setModalItemSelectedObject] = useState({});

  const handleTime = (date) => {
    let newTime = moment(date).format('hh:mm A');
    const currentDate = new Date(Number(currentMeal.item.timestamp));
    currentDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
    const timestamp = new Date(currentDate).valueOf();
    // currentMeal.item.timestamp = timestamp;
    // hideTimePicker();
    var currentTimeVar = new Date().getTime();
    // console.log('currentTimeVar', currentTimeVar);
    var selectedTimeVar = new Date(date).getTime();
    console.log('selectedTimeVar', selectedTimeVar);
    // console.log(d2>d1);
    // console.log('')

    // date : selected date
    // selected date find in meals array
    // if its less than that then its first meal otherwise normal
    let isFirstMeal;
    let newTimeStampArray = [];
    mealsList.forEach((i, ind) => {
      // console.log('i', i.item.timestamp)
      newTimeStampArray.push(i.item.timestamp);
    });

    min(newTimeStampArray);

    // mealsList.find((e) => {
    //   console.log('selectedTimeVar', selectedTimeVar);

    //   console.log('e', e.item.timestamp);
    //   if (selectedTimeVar) < Number(e.item.timestamp)) {

    //     isFirstMeal = true
    //   } else {
    //     isFirstMeal = false;
    //   }
    // });

    console.log('isFirstMeal', isFirstMeal);
    hideTimePicker();
    if (
      moment(currentDate).isSameOrAfter(new Date(), 'day') &&
      currentTimeVar < selectedTimeVar
    ) {
      showErrorToast(contentScreenObj.errorMsg_1);
      // alert(contentScreenObj.errorMsg_1);
    } else {
      setTimeField(newTime);
      editMeal(currentMeal.item, selectedTimeVar);
      currentMeal.item.timestamp = timestamp;
      getMealList();

      if (selectedTimeVar < min(newTimeStampArray)) {
        showSuccessToast(contentScreenObj.errorMsg_2);
        // alert('You updated first meal');
      }
    }
  };

  useEffect(() => {
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);
    const unsubscribe = navigation.addListener('focus', () => {
      getMealList();
    });

    return unsubscribe;
  }, [navigation, timeStamp]);

  const deleteMeal = async (mealId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      let q =
        'mutation MyMutation($mealId: Int, $userId: Int) {deleteMeal(mealId: $mealId, userId: $userId) {body statusCode}}';
      const response = await postWithAuthorization(
        Config.EUREKA_GRAPHQL_BASE_URL,
        {
          query: q,
          variables: {
            userId: Number(userId),
            mealId: Number(mealId),
          },
        },
      );
      if (response.data.data.deleteMeal.statusCode === 200) {
        const newList = mealsList.filter((item) => item.item.mealId !== mealId);
        setMealsList(newList);
        setCurrentMeal(null);
      }
    } catch (error) {
      // console.log('del meal error', error.response);
      setIsLoader(false);
      setLoaderText('');
    }
  };

  const editMeal = async (item, selectedTimeVar) => {
    const userId = await AsyncStorage.getItem('user_id');
    let q =
      'mutation MyMutation($details: String, $timestamp: String, $mealId: Int, $size: Int, $userId: Int) {editMeals(details: $details,timestamp: $timestamp, mealId: $mealId, size: $size, userId: $userId) {body statusCode}}';

    postWithAuthorization(
      Config.EUREKA_GRAPHQL_BASE_URL,
      {
        query: q,
        variables: {
          userId: Number(userId),
          mealId: Number(item.mealId),
          size: Number(item.mealSizeId),
          details: item.details,
          timestamp: selectedTimeVar,
        },
      }
    )
      .then((response) => {
        console.log('edit', response);
        if (response.data.data.editMeals.statusCode === 200) {
          // setIsLoader(false);
          setCurrentMeal(null);
          return;
        }
        alert(contentScreenObj.errorMsg_3);
      })
      .catch((e) => {
        console.log('edit MealError', e);
        // setIsLoader(false);
        alert(contentScreenObj.errorMsg_3);
      });
  };

  const modalOptionItem = (indParam, valueParam) => {
    let iconName;
    let iconTitle;
    let accessibilityId;

    if (indParam.id === 1) {
      iconName = (
        <UILightMealIcon fill="#000" widthParam={25} heightParam={25} />
      );
      iconTitle = indParam.value;
      accessibilityId ="meal-type-light"
    } else if (indParam.id === 2) {
      iconName = (
        <UIModerateMealIcon fill="#000" widthParam={25} heightParam={25} />
      );
      iconTitle = indParam.value;
      accessibilityId ="meal-type-moderate"
    } else if (indParam.id === 3) {
      iconName = (
        <UIHeavyMealIcon fill="#000" widthParam={25} heightParam={25} />
      );
      iconTitle = indParam.value;
      accessibilityId ="meal-type-heavy"
    }

    return (
      <View style={styles.modalItem} accessibilityLabel={accessibilityId}>
        <View style={styles.iconStyle}>{iconName}</View>
        <Text>{iconTitle}</Text>
      </View>
    );
  };

  const modalOptionFun = (indParam, valueParam, item) => {
    setModalItemSelectedObject(modalItemStateArray[indParam]);
  };

  let selectedModalItem;
  let selectedModalItemIcon;
  if (modalItemSelectedObject.id === 1) {
    selectedModalItemIcon = (
      <View style={{marginTop: 0}}>
        <UILightMealIcon fill="#000" widthParam={27} heightParam={27} />
      </View>
    );
  } else if (modalItemSelectedObject.id === 2) {
    selectedModalItemIcon = (
      <View style={{marginTop: 0}}>
        <UIModerateMealIcon fill="#000" widthParam={27} heightParam={27} />
      </View>
    );
  } else if (modalItemSelectedObject.id === 3) {
    selectedModalItemIcon = (
      <View style={{marginTop: 0}}>
        <UIHeavyMealIcon fill="#000" widthParam={27} heightParam={27} />
      </View>
    );
  } else {
    selectedModalItemIcon = null;
  }

  selectedModalItem = (
    <View style={styles.selectedModalItem}>
      <View style={styles.iconStyle}>{selectedModalItemIcon}</View>

      <Text style={styles.selectedTxt}>
        {modalItemSelectedObject.value
          ? modalItemSelectedObject.value
          : 'Please Select'}
      </Text>
      <View style={styles.selectedArrowWrap}>
        <FontAwesomeIcon name="angle-down" color="#000" size={28} />
      </View>
    </View>
  );

  const renderItems = (current) => {
    return (
      <View style={styles.selectedModalItem}>
        <View style={styles.iconStyle}>{selectedModalItemIcon}</View>

        {parseInt(current) === 0 && (
          <Text style={styles.selectedTxt}>Please Select</Text>
        )}
        {parseInt(current) === 1 && (
          <>
            <View style={{marginTop: 0}}>
              <UILightMealIcon fill="#000" widthParam={27} heightParam={27} />
            </View>
            <Text
              style={styles.selectedTxt}
              accessibilityLabel="meals-size-home-text">
              {contentScreenObj.light_mealSize}
            </Text>
          </>
        )}
        {parseInt(current) === 2 && (
          <>
            <View style={{marginTop: 0}}>
              <UIModerateMealIcon
                fill="#000"
                widthParam={27}
                heightParam={27}
              />
            </View>
            <Text
              style={styles.selectedTxt}
              accessibilityLabel="meals-size-home-text">
              {contentScreenObj.moderate_mealSize}
            </Text>
          </>
        )}
        {parseInt(current) === 3 && (
          <>
            <View style={{marginTop: 0}}>
              <UIHeavyMealIcon fill="#000" widthParam={27} heightParam={27} />
            </View>
            <Text
              style={styles.selectedTxt}
              accessibilityLabel="meals-size-home-text">
              {contentScreenObj.heavy_mealSize}
            </Text>
          </>
        )}
        <View style={styles.selectedArrowWrap}>
          <FontAwesomeIcon name="angle-down" color="#000" size={28} />
        </View>
      </View>
    );
  };

  // if(isCommingSoon){
  //   return <UICommingSoon />
  // }
  /**
   * Uniq array no dublicate values
   * @param {array} input
   */
  const min = (input) => {
    let uniqeInput = _.uniq(input);
    console.log('uniqeInput', uniqeInput);
    if (toString.call(uniqeInput) !== '[object Array]') return false;
    return Math.min.apply(null, uniqeInput);
  };

  const renderMeals = (item, index) => {
    const time = getDateTimeInfo(Number(item.item.timestamp));

    const firstmealTxtRenderUI = (takenMealParam) => {
      // console.log('takenMealParam', takenMealParam);
      // console.log('mealsList', mealsList);

      let newTimeStampArray = [];

      // mealsList.forEach((i, ind) => {
      //   // console.log('i', i.item.timestamp)
      //   newTimeStampArray.push(i.item.timestamp);
      // });

      // min(newTimeStampArray);

      console.log('mealsList', mealsList[0]);

      let firstmealTxt;

      if (index === 0) {
        firstmealTxt = (
          <View style={styles.chkboxRow}>
            <Text
              style={{
                color: Colors.gray,
                ...Fonts.fontSemiBold,
                ...Fonts.h2,
                marginTop: -3,
                // marginLeft: 15
              }}>
              {contentScreenObj.firstMeal}
            </Text>
          </View>
        );
      } else {
        firstmealTxt = null;
      }

      return firstmealTxt;
    };

    return (
      <View style={styles.mealBox} key={index}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => {
              setCurrentMeal(item);
              showTimeicker();
            }}
            accessible={false}
          >
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={(time) => handleTime(time, item)}
              onCancel={hideTimePicker}
              // maximumDate={new Date()}
            />
            <Text
              accessibilityLabel="meal-add-time"
              style={{
                color: Colors.blue,
                ...Fonts.fontSemiBold,
                ...Fonts.h2,
                textDecorationLine: 'underline',
              }}>
              {time.timeInWords}
            </Text>
          </TouchableOpacity>

          {firstmealTxtRenderUI(item.item.timestamp)}

          <TouchableOpacity
            onPress={() => deleteMeal(item.item.mealId)}
            accessibilityLabel="meal-delete"
            accessible={false}
          >
            <EvilFont name="trash" style={styles.deletemealIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <View style={styles.inputPicker}>
            <UIModalDropdown
              accessibilityLabel="meal-size-dropdown"
              defaultIndex={Number(item.item.mealSizeId)}
              dropdownStyle={[
                styles.modalDropdownStyle,
                {marginTop: -23, height: 36 * modalItemStateArray.length},
              ]}
              renderRow={(ind, value) => modalOptionItem(ind, value)}
              animated={false}
              accessible
              dropdownTextStyle={styles.modalDropdownTxtStyle}
              renderSeparator={() => <View />}
              onSelect={(ind, value) => {
                setMealsList((innerValue) => {
                  return innerValue.map((inner) => {
                    if (inner.item.mealId === item.item.mealId) {
                      const selectedIndex = Number(ind);
                      item.item.mealSizeId = Number(selectedIndex + 1);
                      return item;
                    }
                    return inner;
                  });
                });
                // return modalOptionFun(ind, value, item);
                setCurrentMeal(item);
                editMeal(item.item);
              }}
              options={item.choice}
              style={{
                // borderWidth:1,
                // paddingVertical:10,
                paddingHorizontal: 0,
                marginHorizontal: 0,
                // height:50
              }}
              dropdownTextHighlightStyle={{backgroundColor: '#fff'}}>
              {/* {selectedModalItem} */}

              {renderItems(item.item.mealSizeId)}
            </UIModalDropdown>
          </View>
        </View>

        <UITextInput
          placeholder={contentScreenObj.addNotes}
          // value={
          //   currentMeal && currentMeal.item.mealId === item.item.mealId
          //     ? note
          //     : item.item.details
          // }
          value={item.item.details}
          accessibilityLabel="meal-add-note"
          autoCapitalize="none"
          style={{backgroundColor: '#fff'}}
          onChangeText={(text) => {
            item.item.details = text;
            setNote(text);
            setCurrentMeal(item);
          }}
          onSubmitEditing={() => {
            setCurrentMeal(item);
            editMeal(item.item);
          }}
          onBlur={() => {
            setCurrentMeal(item);
            editMeal(item.item);
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={GlobalStyle.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
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
              accessibilityLabel="meal-datePicker"
              accessible={false}
            >
              <AntIcon name="calendar" color="#000" size={20} />
            </TouchableOpacity>
            <Text style={styles.dateText} accessibilityLabel="meal-dateValue">
              {dateText}
            </Text>
            <TouchableOpacity
              accessibilityLabel="meal-todayValue"
              accessible={false}
              onPress={() => {
                setTimeStamp(new Date().setHours(0, 0, 0, 0).valueOf());
                setDateText(getToday);
                setDatePickerDate(new Date());
              }}
            >
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
            style={GlobalStyle.gradientContainer}>
            {mealsList.length < 1 ? (
              <UITextBold
                style={styles.emptyMealText}
                accessibilityLabel="meal-none">
                {contentScreenObj.noMealText}
              </UITextBold>
            ) : (
              mealsList.map((item, index) => renderMeals(item, index))
            )}
            {/* <FlatList
            data={mealsList}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => renderMeals(item, index)}
            ListEmptyComponent={
              <UITextBold style={styles.emptyMealText}>
                There are no meals to show for this day
              </UITextBold>
            }
          /> */}
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          <UIButton
            mode="contained"
            labelStyle={{color: '#fff'}}
            accessibilityLabel="add-meal"
            onPress={
              () =>
                navigation.navigate('AddMealScreen', {
                  datePickerDate: datePickerDate,
                  mealsList: mealsList,
                })
              // navigation.navigate('AddMealScreen', datePickerDate)
            }>
            {contentScreenObj.addMeal_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MealScreen;
