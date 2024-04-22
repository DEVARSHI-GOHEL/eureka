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

import {
  UITextInput,
  UIPicker,
} from '../../Components/UI';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import EvilFont from 'react-native-vector-icons/EvilIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {
  Colors,
  Fonts,
  Sign_In_Api,
  Update_User_Api,
  Get_master_Api,
  StepsGoal_Api,
} from '../../Theme';
import styles from './styles';
import {API} from '../../Services/API';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import {List, ListItem, Left, Right, Body, CheckBox} from 'native-base';
import MaIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Translate} from '../../Services/Translate';

const SymptomRenderItemComp = ({
  navigation,
  pickerArrayData,
  inputData,
  selectedValueProp,
  editableVisibility,
  onChangeFun,
  // onTimeChangeFun,
  indexedStateProp,
  deleteSymptom,
  ...props
}) => {
  // console.log('props', props);
  // console.log('symptomsTypeId',symptomsTypeId);
  let {symptomsTypeId, timestamp: timestampProp, symptomsId, timestamp} = props;
  // let date = new Date();
  let getTime = moment(Number(timestamp)).format('LT');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [timeField, setTimeField] = useState(getTime);

  const [timeStampNewState, setTimeStampNewState] = useState(timestampProp);

  const [type, setType] = useState(symptomsTypeId);
  const [timeState, setTimeState] = useState(getTime);
  const [details, setDetails] = useState(inputData);
  const [indexedState, setIndexedState] = useState(indexedStateProp);

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('healthSymptomScreen'))) {
      const healthSymptomScreenContentObject = Translate('healthSymptomScreen');
      setContentScreenObj(healthSymptomScreenContentObject);
    }
  });
  /** ############################ */

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log('timestampProp', timestampProp);
    let propDate = new Date(Number(timestampProp));

    console.log('propDate', propDate);

    console.log(
      '((((((((((((((((((((((((((((((((((((((((((((((',
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    );
    let getHoursVar = date.getHours();
    let getMinutesVar = date.getMinutes();
    let getSecondsVar = date.getSeconds();
    let propDateVar = propDate.setHours(
      getHoursVar,
      getMinutesVar,
      getSecondsVar,
    );

    console.log('propDateVar', propDateVar);

    // let convertedToTimeStamp = new Date(date).getTime();
    // console.log('convertedToTimeStamp', convertedToTimeStamp);

    // let newTime = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date);

    let newTime = moment(date).format('hh:mm A');
    console.log('newTime', newTime);
    // console.log('timeMoment',timeMoment);

    hideDatePicker();

    var currentTimeVar = new Date().getTime();
    console.log('currentTimeVar', currentTimeVar);
    var selectedTimeVar = new Date(propDate).getTime();
    console.log('selectedTimeVar', selectedTimeVar);
    // console.log(d2>d1);

    if (currentTimeVar < selectedTimeVar) {
      alert(contentScreenObj.errorMsg_1);
    } else {
      // alert('added');
      onChangeFun(symptomsId, type, details, propDateVar);
      setTimeState(newTime);
    }

    // setTimeField(newTime);
    // onChangeFun(symptomsId, type, details, propDateVar)
    // setTimeState(newTime);
    // onTimeChangeFun(symptomsId, selectedItem, details, timeStampNewState)
  };

  return (
    <View style={styles.mealBox}>
      <View style={styles.topRow}>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          // maximumDate={new Date()}
        />
        {/* showDatePicker */}
        <TouchableOpacity onPress={showDatePicker} accessible={false}>
          <Text
            style={{
              color: Colors.blue,
              ...Fonts.fontSemiBold,
              ...Fonts.h2,
              textDecorationLine: 'underline',
            }}
            accessibilityLabel="symptom-time">
            {timeState}
          </Text>
        </TouchableOpacity>

        {/* <Text>{time}</Text> */}

        {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={showDatePicker}
              style={styles.timeField}>
              <Text style={styles.timeText}>{timeField}</Text>
            </TouchableOpacity> */}

        <EvilFont
          accessibilityLabel="symptom-delete-icon"
          onPress={() => deleteSymptom(symptomsId)}
          name="trash"
          style={styles.deletemealIcon}
        />
      </View>

      <View style={styles.inputWrap}>
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
              <MaterialIcon
                name="arrow-drop-down"
                style={{color: Colors.gray, fontSize: 26}}
              />
            }
            selectedValue={type}
            accessibilityLabel="symptom-type-list"
            placeholder={'Headache'}
            onValueChange={(selectedItem, indexed) => {
              console.log('seelcted', selectedItem);
              console.log('indexed', indexed);

              setType(selectedItem);
              // setIndexedState(indexed)

              setTimeout(() => {
                onChangeFun(
                  symptomsId,
                  selectedItem,
                  details,
                  timeStampNewState,
                );
              }, 300);
            }}>
            {pickerArrayData.map((item, itemId) => {
              // console.log('item',item);
              // console.log('itemId',itemId);

              return (
                <UIPicker.Item
                  label={item.value}
                  value={item.id.toString()}
                  key={item.id}
                  accessibilityLabel="symptom-type-home-text"
                />
              );
            })}
          </UIPicker>
        </View>
      </View>
      <UITextInput
        placeholder={contentScreenObj.symptomDetails_PlaceholderText}
        value={details}
        autoCapitalize="none"
        style={{backgroundColor: '#fff'}}
        // onChangeText={(text) => setDetails(text)}
        onChangeText={(text) => {
          // details = text
          setDetails(text);
        }}
        onSubmitEditing={(e) => {
          console.log('e', e.nativeEvent.text);
          setDetails(e.nativeEvent.text);
          onChangeFun(symptomsId, type, e.nativeEvent.text, timeStampNewState);
        }}
        editable={editableVisibility}
        accessibilityLabel="symptom-text-input"
        onBlur={(e) => {
          setDetails(details);
          onChangeFun(symptomsId, type, details, timeStampNewState);
        }}
      />
    </View>
  );
};

export {SymptomRenderItemComp};
