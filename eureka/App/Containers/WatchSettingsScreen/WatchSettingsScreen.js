/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {BackHandler, Modal, SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View,} from 'react-native';
import {List} from 'native-base';
import {Colors, Fonts} from '../../Theme';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {UIButton, UILoader, UIModal, UIPicker} from '../../Components/UI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Config} from '../../Theme/Constant/Constant';
import {DB_STORE} from '../../storage/DbStorage';
import {useDispatch, useSelector} from 'react-redux';
import {AUTO_MEASURE_STATE, GLUCOSE_UNIT,} from '../../constants/AppDataConstants';
import AppSyncCommandHandler from './AppSyncCommandHandler';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {Translate, useTranslation} from '../../Services/Translate';
import {showErrorToast, showSuccessToast,} from '../../Components/UI/UIToast/UIToastHandler';

import {pairConnectReset} from '../ConnectWatchScreen/action';
import {refreshHomeScreen} from '../HomeScreen/DashboardRefreshUtil';
import {SKIN_TONE_DUMMY_ID} from '../PersonalInfoScreen/components/SkinTonePicker/SkinTonePicker';
import {postWithAuthorization} from '../../Services/graphqlApi';
import FirmwareUpdatesPanel from './components/FirmwareUpdatesPanel/FirmwareUpdatesPanel';
import {getLabelByUnits} from "../../Chart/AppUtility/ChartAxisUtils";
import {t} from "i18n-js";

const WatchSettingsScreen = ({navigation, ...props}) => {
  const dispatch = useDispatch();
  const {
    debugLogValue,
    autoMeasureState,
    appSyncCompleted,
  } = useSelector((state) => ({
    debugLogValue: state.appSync.debugLogValue,
    autoMeasureState: state.measure.autoMeasureState,
    appSyncCompleted: state.appSync.appSyncCompleted,
  }));

  const [autoMeasurePicker, setAutoMeasurePicker] = useState('10');
  const [cgmUnitPicker, setCgmUnitPicker] = useState('mg/dl');
  const [weatherUnitPicker, setWeatherUnitPicker] = useState('0');
  const [autoMeasureSwitch, setAutoMeasureSwitch] = useState(false);
  const [debugLogEnabled, setdebugLogEnabled] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceMsn, setDeviceMsn] = useState('');
  const [isBackEnable, setIsBackEnable] = React.useState(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('watchSettingsScreen');
  /** ############################ */

  const autoMeasureToggleSwitch = async (switchValue) => {
    setAutoMeasureSwitch(switchValue);
  };

  const autoMeasureTogglePrecheck = function (switchValue) {
    if (switchValue) {
      autoMeasureToggleSwitch(switchValue); //simply go for switching on
    } else {
      setModalVisible(true);
    }
  };
  const appSyncRead = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const device_msn = await AsyncStorage.getItem('device_msn');

      await EVENT_MANAGER.SEND.appSync({
        userId,
        deviceMsn: device_msn,
      });
      console.log('app sync read called');
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    appSyncRead();
  }, []);

  useEffect(() => {
    if (appSyncCompleted) {
      getAsyncDbValues();
    }
  }, [appSyncCompleted]);

  useEffect(() => {
    setdebugLogEnabled(debugLogValue);
  }, [debugLogValue]);

  const switchOffAutoMeasure = () => {
    autoMeasureToggleSwitch(false);
    setModalVisible(false);
  };

  /**
   * getting value from asyncstorage/db
   * multiple get function of asyncstorage/db
   * then passing the multi dimension array to setDbValues parameter
   */
  const getAsyncDbValues = async () => {
    const settings = await getSettingsFromDb();
    console.log('getAsyncDbValue', settings);
    setDbValues(settings);
  };

  /**
   * setDbValues
   * it sets value from asyncstorage/db to local states
   * @param { Array } multivalueParam
   */
  const setDbValues = (settings) => {
    const pickerValueRound = Math.round(settings.auto_frequency * 1);

    setAutoMeasureSwitch(settings.auto_measure);

    setAutoMeasurePicker(pickerValueRound + '');
    setCgmUnitPicker(settings.glucose_unit);
    setWeatherUnitPicker(settings.weather_unit);
  };

  const onValueChangeFun = async (selectedItem) => {
    setAutoMeasurePicker(selectedItem);
  };

  const CGMUnitFun = async (selectedItem) => {
    setCgmUnitPicker(selectedItem);
  };

  const weatherUnitFun = async (selectedItem) => {
    console.log('selectedItem', selectedItem);

    setWeatherUnitPicker(selectedItem);
  };

  const setAllValueToLocalDb = async () => {
    const userId = await AsyncStorage.getItem('user_id');

    console.log('setAllValueToLocalDb fired-----------');

    try {
      const time =
        autoMeasurePicker && !isNaN(autoMeasurePicker)
          ? autoMeasurePicker * 1
          : 10;

      console.log(
        ' set local db value of autoMeasureSwitch',
        autoMeasureSwitch,
      );
      console.log(
        ' set local db value of autoMeasurePicker',
        autoMeasurePicker,
      );
      console.log(' auto_frequency value time variable ', time);

      console.log('object +++++', {
        id: userId,
        auto_measure: autoMeasureSwitch ? "'Y'" : "'N'",
        auto_frequency: time,
        glucose_unit: `'${cgmUnitPicker}'`,
        weather_unit: `'${weatherUnitPicker}'`
      });

      await storeInDb({
        id: userId,
        auto_measure: autoMeasureSwitch ? "'Y'" : "'N'",
        auto_frequency: time,
        glucose_unit: `'${cgmUnitPicker}'`,
        weather_unit: `'${weatherUnitPicker}'`
      });

      await sendSyncCommand();
    } catch (err) {
      console.log('error in ads', err.response.data);
    }
  };

  async function getAndSetDeviceMsn() {
    const device_msn = await AsyncStorage.getItem('device_msn');
    setDeviceMsn(device_msn);
  }

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
   * send watch settings to cloud
   */
  const sendWatchSettings = async () => {
    if (autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
      showErrorToast(t('CalibrateConnectionScreen.waitForResult'));
      return;
    }

    console.log(
      '#############2 autoMeasureSwitch, autoMeasurePicker',
      autoMeasureSwitch,
      autoMeasurePicker,
    );

    const userId = await AsyncStorage.getItem('user_id');

    const sendWatchSettingsMutation = `mutation MyMutation($userId: Int, $cgmUnit: Int, $autoMeasureFrequency: Int, $autoMeasure: Boolean = false) {saveSettings(autoMeasure: $autoMeasure, autoMeasureFrequency: $autoMeasureFrequency, cgmUnit: $cgmUnit, userId: $userId) {body statusCode}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

    /**
     * Api call
     */
    console.log(
      {
        userId: Number(userId),
        autoMeasure: autoMeasureSwitch,
        autoMeasureFrequency: Number(autoMeasurePicker),
      },
      'api call',
    );

    postWithAuthorization(
      Config.EUREKA_GRAPHQL_BASE_URL,
      {
        query: sendWatchSettingsMutation,
        variables: {
          userId: Number(userId),
          autoMeasure: autoMeasureSwitch,
          autoMeasureFrequency: Number(autoMeasurePicker),
          cgmUnit: cgmUnitPicker == 'mg/dL' ? 1 : 0,
        },
      }
    )
      .then(async (response) => {
        console.log('watch setting response', response);
        console.log(response.data, 'watchsetings response data');
        if (response.status === 200) {
          setIsLoader(false);
          setLoaderText('');

          showSuccessToast(contentScreenObj.watchSettingsSave_successMsg);
          setAllValueToLocalDb();
        } else if (response.data.data.signup.statusCode === 501) {
          setIsLoader(false);
          setLoaderText('');
        } else if (response.data.data.signup.statusCode === 502) {
          setIsLoader(false);
          setLoaderText('');
        } else if (response.data.data.signup.statusCode === 201) {
          setIsLoader(false);
          setLoaderText('');
        } else if (response.data.data.signup.statusCode === 500) {
          setIsLoader(false);
          setLoaderText('');
        }
      })
      .catch(async (error) => {
        console.log('watch save error', error);

        setIsLoader(false);
        setLoaderText('');
        if (error.toString() === 'Error: Network Error') {
          console.log('catch fired');

          const watchSettingsfromlocalDb = await getSettingsFromDb();

          console.log(
            'db data after no internet++++++++',
            watchSettingsfromlocalDb,
          );
        } else {
        }
      });
  };

  /**
   *
   */
  useEffect(() => {
    getAndSetDeviceMsn();
    getAsyncDbValues();
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <ScrollView>
        <LinearGradient
          colors={['#f1fbff', '#fff']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.2}}
          style={styles.settingsWrap}>
          <View style={styles.navArea}>
            <List style={styles.listSeperator}>
              <View style={styles.listRow}>
                <FirmwareUpdatesPanel />
              </View>
              <View style={styles.listRow}>
                <View style={styles.listRowTouch}>
                  <Text
                    style={styles.navText}
                    accessibilityLabel="auto-measure">
                    {contentScreenObj.autoMeasureHeading}
                  </Text>
                  <Switch
                    style={styles.switchSizeAdjust}
                    trackColor={{false: '#A4C8ED', true: '#1A74D3'}}
                    thumbColor={autoMeasureSwitch ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={autoMeasureTogglePrecheck}
                    value={autoMeasureSwitch}
                    accessibilityLabel="auto-measure-switch"
                  />
                </View>
                <View style={styles.iconRow}>
                  <Text
                    style={styles.settingsText}
                    accessibilityLabel="auto-measure-description">
                    {contentScreenObj.autoMeasureDescription}
                  </Text>
                </View>
              </View>
              {autoMeasureSwitch ? (
                <View style={styles.listRow}>
                  <Text style={styles.navText}>
                    {contentScreenObj.autoMeasureHeadingInterval}
                  </Text>
                  <View style={styles.inputPicker}>
                    <UIPicker
                      mode="dialog"
                      style={{width: '99.5%', paddingRight: '.5%'}}
                      textStyle={{
                        color:
                          autoMeasurePicker === 'default' ? '#B3B3B3' : '#000',
                        ...Fonts.fontMedium,
                      }}
                      itemStyle={{color: 'red', fontSize: 40}}
                      iosIcon={
                        <MaIcon
                          name="arrow-drop-down"
                          style={{color: Colors.gray, fontSize: 26}}
                        />
                      }
                      selectedValue={autoMeasurePicker}
                      placeholder={'10 min'}
                      accessibilityLabel="auto-measure-dropdown"
                      onValueChange={onValueChangeFun}>
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_5}
                        value="5"
                      />
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_10}
                        value="10"
                      />
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_15}
                        value="15"
                      />
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_20}
                        value="20"
                      />
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_30}
                        value="30"
                      />
                      <UIPicker.Item
                        label={contentScreenObj.autoMeasureDuration_60}
                        value="60"
                      />
                    </UIPicker>
                  </View>
                </View>
              ) : null}

              <View style={styles.listRow}>
                <View
                  style={[
                    styles.listRow,
                    {paddingVertical: 0, borderBottomWidth: 0},
                  ]}>
                  <Text style={styles.navText} accessibilityLabel="cgm-unit">
                    {contentScreenObj.bloodGlucoseUnit}
                  </Text>
                  <View style={styles.inputPicker}>
                    <UIPicker
                      mode="dialog"
                      style={{width: '99.5%', paddingRight: '.5%'}}
                      textStyle={{
                        color:
                          autoMeasurePicker === 'default' ? '#B3B3B3' : '#000',
                        ...Fonts.fontMedium,
                      }}
                      itemStyle={{color: 'red', fontSize: 40}}
                      iosIcon={
                        <MaIcon
                          name="arrow-drop-down"
                          style={{color: Colors.gray, fontSize: 26}}
                        />
                      }
                      selectedValue={cgmUnitPicker}
                      placeholder={'mg/dl'}
                      accessibilityLabel="cgm-unit-dropdown"
                      onValueChange={CGMUnitFun}>
                      {Object.keys(GLUCOSE_UNIT).map(function (
                        keyName,
                        keyIndex,
                      ) {
                        return (
                          <UIPicker.Item
                            label={getLabelByUnits(GLUCOSE_UNIT[keyName])}
                            value={GLUCOSE_UNIT[keyName]}
                            key={keyIndex}
                          />
                        );
                      })}
                    </UIPicker>
                  </View>
                </View>
              </View>

              <View style={styles.listRow}>
                <View
                  style={[
                    styles.listRow,
                    {paddingVertical: 0, borderBottomWidth: 0},
                  ]}>
                  <Text
                    style={styles.navText}
                    accessibilityLabel="weather-unit">
                    {contentScreenObj.weatherUnit}
                  </Text>
                  <View style={styles.inputPicker}>
                    <UIPicker
                      mode="dialog"
                      style={{width: '99.5%', paddingRight: '.5%'}}
                      textStyle={{
                        color:
                          autoMeasurePicker === 'default' ? '#B3B3B3' : '#000',
                        ...Fonts.fontMedium,
                      }}
                      itemStyle={{color: 'red', fontSize: 40}}
                      iosIcon={
                        <MaIcon
                          name="arrow-drop-down"
                          style={{color: Colors.gray, fontSize: 26}}
                        />
                      }
                      selectedValue={weatherUnitPicker}
                      accessibilityLabel="weather-unit-dropdown"
                      onValueChange={weatherUnitFun}>
                      <UIPicker.Item
                        label={contentScreenObj.weatherUnit_Imperial}
                        value={'1'}
                      />
                      <UIPicker.Item
                        label={contentScreenObj.weatherUnit_Metric}
                        value={'0'}
                      />
                    </UIPicker>
                  </View>
                </View>
              </View>

              {debugLogEnabled && (
                <View style={styles.listRow}>
                  <View style={styles.listRowTouch}>
                    <Text style={styles.navText} accessibilityLabel="CGM-debug">
                      Debug Log
                    </Text>
                    <Text style={styles.navText}>Enabled</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <Text
                      style={styles.settingsText}
                      accessibilityLabel="CGM-debug-description">
                      Debugging Helps Us To Find Problems Easily
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.listRow, styles.settingsBottomrow]}>
                <View style={styles.listRowTouch}>
                  <View style={[styles.listRowTouch, styles.watchDescRow]}>
                    <Text
                      style={styles.navText}
                      accessibilityLabel="setting-watch-id-label">
                      {/* {'Watch ID# '} */}
                      {contentScreenObj.watchIdText}
                    </Text>
                    <Text
                      style={styles.watchStatusText}
                      accessibilityLabel="setting-watch-id-text">
                      {' '}
                      {deviceMsn ? deviceMsn : 'Not Connected'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      dispatch(pairConnectReset());
                      await AsyncStorage.multiRemove([
                        'to_pair_device_msn',
                        'device_msn',
                      ]);
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'DeviceRegistrationScreen',
                          },
                        ],
                      });
                    }}
                    accessible={false}>
                    <Text
                      style={styles.settingsLinkText}
                      accessibilityLabel="reconnect-new-device">
                      {contentScreenObj.reconnectDevice}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </List>
          </View>
        </LinearGradient>
      </ScrollView>
      <View style={styles.bttnWrap}>
        <UIButton
          mode="contained"
          labelStyle={{color: '#fff'}}
          accessibilityLabel="watchSettings-saveChanges-btn"
          onPress={sendWatchSettings}>
          {contentScreenObj.saveChange_ButtonText}
        </UIButton>
      </View>
      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <UIModal
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.autoMeasure_PopUpText}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
                mode="outlined"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={(val) => switchOffAutoMeasure()}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
              <UIButton
                style={GlobalStyle.bttnArea}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={() => setModalVisible(false)}>
                {contentScreenObj.cancel_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

async function storeInDb(info) {
  const dmlResult = await DB_STORE.UPDATE.userInfo(info);

  if (!dmlResult) {
    return false;
  }
  console.log('dmlResult------------------', dmlResult);
  return true;
}

async function getSettingsFromDb() {
  console.log('getSettingsFromDb');
  let user = {};

  const user_id = await AsyncStorage.getItem('user_id');

  if (!user_id) {
    return null;
  }

  const userDbData = await DB_STORE.GET.userInfo(user_id);

  if (userDbData && userDbData.rows[0]) {
    user = userDbData.rows[0];

    console.log('USER FOUND -> ' + JSON.stringify(userDbData.rows[0]));
  }

  const settings = {
    user_id,
    auto_measure: user.auto_measure == 'Y',
    auto_frequency: isNaN(user.auto_frequency)
      ? '10'
      : user.auto_frequency + '', //default 10 mins -> key0
    sleep_tracking: user.sleep_tracking == 'Y',
    power_save: user.power_save == 'Y',
    cgm_debug: user.cgm_debug == 'Y',
    glucose_unit: user.glucose_unit,
    weather_unit: user.weather_unit
  };

  console.log('SETTINGS INIT - ' + JSON.stringify(settings));

  return settings;
}

async function sendSyncCommand() {
  const deviceMsn = await AsyncStorage.getItem('device_msn');

  const value = await getUserFromLocalDb();

  // this is very similar to eureka/App/Containers/PersonalInfoScreen/PersonalInfoScreen.js
  // consider refactoring
  AppSyncCommandHandler.startSync();

  const sendSyncCommand = {
    userId: value.id.toString(),
    deviceMsn,
    autoMeasure: value.auto_measure
  };
  console.log('sendSyncCommand watch', sendSyncCommand);
  await refreshHomeScreen();

  return EVENT_MANAGER.SEND.appSync(sendSyncCommand);
}

export default WatchSettingsScreen;

async function getUserFromLocalDb() {
  const user_id = await AsyncStorage.getItem('user_id');
  const userDbData = await DB_STORE.GET.userInfo(user_id);

  const userDetails = {
    birthDay: '1970-01-01',
    country: '',
    ethnicityId: '1',
    skinToneId: SKIN_TONE_DUMMY_ID,
    gender: 'M',
    height_ft: '0',
    height_in: '0',
    unitOfMeasurement: 'MKS',
    weight: '0',
    weather_unit: '0',
    patientId: user_id,
  };

  if (userDbData && userDbData.rows[0]) {
    const thisUser = userDbData.rows[0];
    userDetails.birthDay = thisUser.birth_date;
    userDetails.country = thisUser.country;
    userDetails.ethnicityId = isNaN(thisUser.ethnicity_id)
      ? 1
      : thisUser.ethnicity_id * 1;
    userDetails.skinToneId = isNaN(thisUser.skin_tone_id)
      ? SKIN_TONE_DUMMY_ID
      : thisUser.skin_tone_id * 1;
    userDetails.gender = thisUser.gender_id;
    userDetails.height_ft = (thisUser.height_ft * 1).toString();
    userDetails.height_in = (thisUser.height_in * 1).toString();
    userDetails.unitOfMeasurement = thisUser.weight_unit;
    userDetails.weight = (thisUser.weight * 1).toString();
    userDetails.weather_unit = thisUser.weather_unit;
    userDetails.patientId = user_id;

    return thisUser;
  }

  return null;
}
