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
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import {
  ListItem,
} from 'native-base';
import {RadioButton} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import {UITextInput, UIButton, UICommingSoon} from '../../Components/UI';
import {Colors, Fonts} from '../../Theme';
import styles from './styles';
import {Translate} from '../../Services/Translate';

const ShareDataScreen = ({navigation}) => {
  const [isCommingSoon, setIsCommingSoon] = useState(true);
  const [message, setMessage] = useState('');
  const [latestMeasurement, setLatestMeasurement] = useState(false);
  const [todayMeasurement, setTodayMeasurement] = useState(false);
  const [weekMeasurement, setWeekMeasurement] = useState(false);
  const [monthMeasurement, setMonthMeasurement] = useState(false);
  const [threeMonthMeasurement, setThreeMonthMeasurement] = useState(false);
  const [sixMonthMeasurement, setSixMonthMeasurement] = useState(false);

  const [oneYearMeasurement, setOneYearMeasurement] = useState(false);

  const [radioValue, setRadioValue] = useState('latest');

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('shareData'))) {
      const shareDataContentObject = Translate('shareData');
      setContentScreenObj(shareDataContentObject);
    }
  });
  /** ############################ */

  const setShareData = (valueParam) => {
    // setLatestMeasurement(valueParam);
    setRadioValue(valueParam);
  };

  let continueBtnDisableState;

  if (
    radioValue !== ''
    // message !== ''
  ) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  if (isCommingSoon) {
    // return <UICommingSoon />
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* <RadioButton.Group
        onValueChange={value => setShareData(value)}
        value={radioValue}
      >
        <View>
        <TouchableOpacity activeOpacity={0.5}  onPress={() => setShareData('first')} style={{ backgroundColor: '#fff' }}>
          <Text>First</Text>
          <RadioButton uncheckedColor={Colors.lightGray} color={Colors.blue} value="first"  />
          </TouchableOpacity>
        </View>

        <View>
          <Text>Second</Text>
          <RadioButton value="second" onPress={() => setShareData('second')} />
        </View>
      </RadioButton.Group> */}

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
            <View style={styles.inputWrap}>
              <Text style={styles.diseaseHeading}>
                {contentScreenObj.heading}
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setShareData(value)}
                value={radioValue}>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('latest')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="latest-radio-button"
                    accessible={false}
                  >
                    <View>
                      <RadioButton.Android
                        uncheckedColor={Colors.lightGray}
                        color={Colors.blue}
                        value="latest"
                      />
                    </View>
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="latest-radio-text">
                      {contentScreenObj.option_1}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('today')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="today-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="today"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="today-radio-text">
                      {contentScreenObj.option_2}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('1w')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="week-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="1w"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="week-radio-text">
                      {contentScreenObj.option_3}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('2m')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="current-month-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="2m"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="current-month-radio-text">
                      {contentScreenObj.option_4}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('3m')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="three-month-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="3m"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="three-month-radio-text">
                      {contentScreenObj.option_5}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('6m')}
                    style={styles.radioBttnRow}
                    accessibilityLabel="six-month-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="6m"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="six-month-radio-text">
                      {contentScreenObj.option_6}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
                <ListItem style={styles.chekboxRow}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setShareData('1y')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: -8,
                    }}
                    accessibilityLabel="one-year-radio-button"
                    accessible={false}
                  >
                    <RadioButton.Android
                      uncheckedColor={Colors.lightGray}
                      color={Colors.blue}
                      value="1y"
                    />
                    <Text
                      style={styles.diseaseText}
                      accessibilityLabel="one-year-radio-text">
                      {contentScreenObj.option_7}
                    </Text>
                  </TouchableOpacity>
                </ListItem>
              </RadioButton.Group>
              <View style={styles.medicalinputWrap}>
                <UITextInput
                  labelText={contentScreenObj.dataDetails_InputText}
                  value={message}
                  style={styles.sharedataTextfield}
                  placeholder={contentScreenObj.dataDetails_PlaceholderText}
                  multiline={true}
                  textAlignVertical={'top'}
                  accessibilityLabel="shareData-note"
                  onChangeText={(text) => setMessage(text)}
                />
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          <UIButton
            style={[styles.bttnArea, styles.nextBttn, {flex: 1}]}
            mode="outlined"
            labelStyle={{...Fonts.fontSemiBold}}
            accessibilityLabel="shareData-cancel-button"
            onPress={() => navigation.navigate('Home')}>
            {contentScreenObj.cancel_ButtonText}
          </UIButton>
          <UIButton
            // style={[styles.bttnArea, { flex:1}]}
            accessibilityLabel="shareData-next-button"
            mode="contained"
            disabled={continueBtnDisableState}
            labelStyle={[
              {...Fonts.fontSemiBold},
              continueBtnDisableState === true ? {color: '#fff'} : {},
            ]}
            style={[
              styles.bttnArea,
              // GlobalStyle.borderColor,
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {},
            ]}
            onPress={() =>
              navigation.navigate('ContactsScreen', {
                routeFrom: 'ShareDataScreen',
                rangeProp: radioValue,
                detailsProp: message,
              })
            }>
            {contentScreenObj.next_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ShareDataScreen;
