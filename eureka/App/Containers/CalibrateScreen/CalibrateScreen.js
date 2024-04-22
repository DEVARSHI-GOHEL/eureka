/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FatherIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {UIButton, UITextInput} from '../../Components/UI';
import {useDispatch, useSelector} from 'react-redux';

import CalibrateCommandHandler from '../CalibrateControlWrapper/CalibrateCommandHandler';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {showErrorToast} from '../../Components/UI/UIToast/UIToastHandler';

import {getDateTimeInfo, isToday} from '../../Chart/AppUtility/DateTimeUtils';
import {
  AUTO_MEASURE_STATE,
  CALIBRATE_RANGES,
  GLUCOSE_UNIT,
  WATCH_BATTERY_STATE,
  WATCH_CHARGER_STATE,
  WATCH_CONNECTION_STATE,
  WATCH_WRIST_STATE,
} from '../../constants/AppDataConstants';
import RNDeviceInfo from 'react-native-device-info';
import {
  watchChargerAction,
  watchConnectPopupAction,
} from '../HomeScreen/action';
import {
  replaceDecimalSeparatorToDot,
  setNumberSeparatorByLocale,
  useTranslation,
} from '../../Services/Translate';
import {RegexUnitMMOL, RegexUnitMGDL} from './regex';
import {t} from "i18n-js";


const CalibrateScreen = () => {
  const [blGlucose, setBlGlucose] = useState('');
  const [blPressureDIA, setBlPressureDIA] = useState('');
  const [blPressureDIAWarning, setBlPressureDIAWarning] = useState(false);
  const [blPressureSYS, setBlPressureSYS] = useState('');
  const [blPressureSYSWarning, setBlPressureSYSWarning] = useState(false);
  const [continueBtnDisableState, setContinueBtnDisableState]= useState(false);
  const [glucoseWarning, setGlucoseWarning] = useState(false);
  const [heartRate, setHeartRate] = useState('');
  const [heartRateWarning, setHeartRateWarning] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [oxygenSaturationWarning, setOxygenSaturationWarning] = useState(false);
  const [respirationRate, setRespirationRate] = useState('');
  const [respirationRateWarning, setRespirationRateWarning] = useState(false);

  const contentScreenObj = useTranslation('calibrateScreen');

  const dispatch = useDispatch();
  const {
    glucoseUnit,
    isWatchConnected,
    watchBatteryValue,
    watchChargerValue,
    watchWristValue,
    autoMeasureState,
  } = useSelector((state) => ({
    glucoseUnit: state.home.glucoseUnit,
    isWatchConnected: state.home.isWatchConnected,
    watchBatteryValue: state.watch.watchBatteryValue,
    watchChargerValue: state.watch.watchChargerValue,
    watchWristValue: state.watch.watchWristValue,
    autoMeasureState: state.measure.autoMeasureState,
  }));

  const IsSetMmolAsGlucoseUnit = glucoseUnit === GLUCOSE_UNIT.MMOL;
  const glucoseUnitFactor = IsSetMmolAsGlucoseUnit ? 18 : 1;
  const bloodGlucoseLow = !CALIBRATE_RANGES.BLOOD_GLUCOSE_LOW ? 0 : Math.ceil(CALIBRATE_RANGES.BLOOD_GLUCOSE_LOW / glucoseUnitFactor);
  const bloodGlucoseHigh = Math.floor(CALIBRATE_RANGES.BLOOD_GLUCOSE_HIGH / glucoseUnitFactor);

  const fromMmolToMgdl = (str) => {
    if (!IsSetMmolAsGlucoseUnit) return str;
    return `${Math.round(Number(replaceDecimalSeparatorToDot(str)) * 18) || 0}`;
  };

  const onChangeContinueBtnDisableState = useCallback(() => {
    setContinueBtnDisableState(!(
      (
        blGlucose !== ''
        || blPressureDIA !== ''
        || blPressureSYS !== ''
        || heartRate !== ''
        || oxygenSaturation !== ''
        || respirationRate !== ''
      )
      && !blPressureDIAWarning
      && !blPressureSYSWarning
      && !glucoseWarning
      && !heartRateWarning
      && !oxygenSaturationWarning
      && !respirationRateWarning
    ));
  }, [
    blGlucose,
    blPressureDIA,
    blPressureDIAWarning,
    blPressureSYS,
    blPressureSYSWarning,
    glucoseWarning,
    heartRate,
    heartRateWarning,
    oxygenSaturation,
    oxygenSaturationWarning,
    respirationRate,
    respirationRateWarning,
  ]);

  const blGlucoseValidateFun = (blGlucoseParam) => {
    if (blGlucoseParam === '') {
      setGlucoseWarning(false);
    } else if (
      Number(blGlucoseParam) < bloodGlucoseLow ||
      Number(blGlucoseParam) > bloodGlucoseHigh
    ) {
      setGlucoseWarning(true);
    } else {
      setGlucoseWarning(false);
    }
  };

  const onChangeGlucose = (numberAsString) => {
    const str = IsSetMmolAsGlucoseUnit
      ? replaceDecimalSeparatorToDot(numberAsString)
      : numberAsString;
    
    const Regex = IsSetMmolAsGlucoseUnit
      ? RegexUnitMMOL
      : RegexUnitMGDL;

    if (!Regex.test(str)) return;

    setBlGlucose(IsSetMmolAsGlucoseUnit ? setNumberSeparatorByLocale(str) : str);
    blGlucoseValidateFun(str);
  };

  const heartRateValidateFun = (heartRateParam) => {
    if (heartRateParam === '') {
      setHeartRateWarning(false);
    } else if (
      Number(heartRateParam) < CALIBRATE_RANGES.HEART_RATE_LOW ||
      Number(heartRateParam) > CALIBRATE_RANGES.HEART_RATE_HIGH
    ) {
      setHeartRateWarning(true);
    } else {
      setHeartRateWarning(false);
    }
  };

  const blPressureSYSValidateFun = (blPressureSYSParam) => {
    if (blPressureSYSParam === '') {
      setBlPressureSYSWarning(false);
    } else if (
      Number(blPressureSYSParam) < CALIBRATE_RANGES.BLOOD_PRESSURE_SYS_LOW ||
      Number(blPressureSYSParam) > CALIBRATE_RANGES.BLOOD_PRESSURE_SYS_HIGH
    ) {
      setBlPressureSYSWarning(true);
    } else {
      setBlPressureSYSWarning(false);
    }
  };

  const blPressureDIAValidateFun = (blPressureDIAParam) => {
    if (blPressureDIAParam === '') {
      setBlPressureDIAWarning(false);
    } else if (
      Number(blPressureDIAParam) < CALIBRATE_RANGES.BLOOD_PRESSURE_DIA_LOW ||
      Number(blPressureDIAParam) > CALIBRATE_RANGES.BLOOD_PRESSURE_DIA_HIGH
    ) {
      setBlPressureDIAWarning(true);
    } else {
      setBlPressureDIAWarning(false);
    }
  };

  const respirationRateValidateFun = (respirationRateParam) => {
    if (respirationRateParam === '') {
      setRespirationRateWarning(false);
    } else if (
      Number(respirationRateParam) < CALIBRATE_RANGES.RESPIRATION_RATE_LOW ||
      Number(respirationRateParam) > CALIBRATE_RANGES.RESPIRATION_RATE_HIGH
    ) {
      setRespirationRateWarning(true);
    } else {
      setRespirationRateWarning(false);
    }
  };

  const oxygenSaturationValidateFun = (oxygenSaturationParam) => {
    if (oxygenSaturationParam === '') {
      setOxygenSaturationWarning(false);
    } else if (
      Number(oxygenSaturationParam) < CALIBRATE_RANGES.OXYGEN_SATURATION_LOW ||
      Number(oxygenSaturationParam) > CALIBRATE_RANGES.OXYGEN_SATURATION_HIGH
    ) {
      setOxygenSaturationWarning(true);
    } else {
      setOxygenSaturationWarning(false);
    }
  };

  async function getAndSetLastSubmitTime() {
    let lastSubmitTime = await AsyncStorage.getItem('calibrate_submit_time');

    if (lastSubmitTime && !isNaN(lastSubmitTime)) {
      let dateTime = '';

      let dateTimeObj = getDateTimeInfo(lastSubmitTime * 1);

      if (dateTimeObj) {
        let date = isToday(lastSubmitTime * 1)
          ? 'Today'
          : dateTimeObj.dateInWords;
        let time = dateTimeObj.timeInWords;

        dateTime = date + ', ' + time;

        setLastSubmitTime(dateTime);
      }
    }
  }

  useEffect(() => {
    onChangeContinueBtnDisableState();
  }, [ onChangeContinueBtnDisableState ]);

  useEffect(() => {
    getAndSetLastSubmitTime();
  }, []);
 

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : null}
      >
        <View style={styles.mainScrollView}>
          <ScrollView>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.3}}
              colors={['#f1fbff', '#fff']}
              style={styles.gradientContainer}>
              <View style={styles.calibrateTopText}>
                <TouchableOpacity accessible={false}>
                  <FatherIcon style={styles.infoIcon} name="info" />
                </TouchableOpacity>
                <Text style={styles.subHeading}>
                  {contentScreenObj.description}
                </Text>
              </View>
              <View>
                <View style={styles.inputWrap}>
                  <UITextInput
                    labelText={contentScreenObj.blg_InputText}
                    keyboardType={'numeric'}
                    value={blGlucose}
                    iconsText={
                      <Text style={styles.inputText}>{glucoseUnit}</Text>
                    }
                    accessibilityLabel="blood-glucose"
                    error={glucoseWarning}
                    onChangeText={onChangeGlucose}
                  />
                  <Text style={styles.warnText}>
                    {`*${contentScreenObj.blg_unitInfo} ${bloodGlucoseHigh} ${glucoseUnit}.`}
                  </Text>
                </View>
                <View style={styles.inputWrap}>
                  <UITextInput
                    labelText={contentScreenObj.heartRate_InputText}
                    iconsText={
                      <Text style={styles.inputText}>
                        {contentScreenObj.heartRate_PlaceholderText}
                      </Text>
                    }
                    keyboardType={'numeric'}
                    value={heartRate}
                    error={heartRateWarning}
                    accessibilityLabel="heart-rate"
                    onChangeText={(text) => {
                      setHeartRate(
                        text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                      );
                      heartRateValidateFun(text);
                    }}
                  />
                  <Text style={styles.warnText}>
                    *{t('calibrateScreen.heartRate_unitInfo',{low:CALIBRATE_RANGES.HEART_RATE_LOW, high:CALIBRATE_RANGES.HEART_RATE_HIGH})}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={[styles.inputWrap, {marginRight: 10, flex: 1}]}>
                    <UITextInput
                      labelText={contentScreenObj.bpSYS_InputText}
                      value={blPressureSYS}
                      iconsText={
                        <Text style={styles.inputText}>
                          {contentScreenObj.bpSYS_PlaceholderText}
                        </Text>
                      }
                      keyboardType={'numeric'}
                      onChangeText={(text) => {
                        setBlPressureSYS(
                          text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                        );
                        blPressureSYSValidateFun(text);
                      }}
                      error={blPressureSYSWarning}
                      accessibilityLabel="blood-pressure-sys"
                    />
                    <Text style={styles.warnText}>
                      *{t('calibrateScreen.bpSYS_unitInfo',{low:CALIBRATE_RANGES.BLOOD_PRESSURE_SYS_LOW, high:CALIBRATE_RANGES.BLOOD_PRESSURE_SYS_HIGH})}
                    </Text>
                  </View>
                  <View style={[styles.inputWrap, {flex: 1}]}>
                    <UITextInput
                      labelText={contentScreenObj.bpDIA_InputText}
                      value={blPressureDIA}
                      iconsText={
                        <Text style={styles.inputText}>
                          {contentScreenObj.bpDIA_PlaceholderText}
                        </Text>
                      }
                      keyboardType={'numeric'}
                      error={blPressureDIAWarning}
                      onChangeText={(text) => {
                        setBlPressureDIA(
                          text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                        );
                        blPressureDIAValidateFun(text);
                      }}
                      accessibilityLabel="blood-pressure-dia"
                    />
                    <Text style={styles.warnText}>
                      *{t('calibrateScreen.bpDIA_unitInfo',{low:CALIBRATE_RANGES.BLOOD_PRESSURE_DIA_LOW, high:CALIBRATE_RANGES.BLOOD_PRESSURE_DIA_HIGH})}
                    </Text>
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <UITextInput
                    labelText={contentScreenObj.rspRate_InputText}
                    iconsText={
                      <Text style={styles.inputText}>
                        {contentScreenObj.rspRate_PlaceholderText}
                      </Text>
                    }
                    keyboardType={'numeric'}
                    value={respirationRate}
                    error={respirationRateWarning}
                    onChangeText={(text) => {
                      setRespirationRate(
                        text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                      );
                      respirationRateValidateFun(text);
                    }}
                    accessibilityLabel="respiration-rate"
                  />
                  <Text style={styles.warnText}>
                    *{t('calibrateScreen.rspRate_unitInfo',{low:CALIBRATE_RANGES.RESPIRATION_RATE_LOW, high:CALIBRATE_RANGES.RESPIRATION_RATE_HIGH})}
                  </Text>
                </View>
                <View style={styles.inputWrap}>
                  <UITextInput
                    labelText={contentScreenObj.OS_InputText}
                    iconsText={
                      <Text style={styles.inputText}>
                        {contentScreenObj.OS_PlaceholderText}
                      </Text>
                    }
                    keyboardType={'numeric'}
                    value={oxygenSaturation}
                    error={oxygenSaturationWarning}
                    onChangeText={(text) => {
                      setOxygenSaturation(
                        text.replace(/[- #*$;,.<>\{\}\[\]\\\/\D]/gi, ''),
                      );
                      oxygenSaturationValidateFun(text);
                    }}
                    accessibilityLabel="oxygen-saturation"
                  />
                  <Text style={styles.warnText}>
                    *{t('calibrateScreen.OS_unitInfo',{low:CALIBRATE_RANGES.OXYGEN_SATURATION_LOW, high:CALIBRATE_RANGES.OXYGEN_SATURATION_HIGH})}
                  </Text>
                </View>
                <Text style={styles.lastUpdateText}>
                  {lastSubmitTime ? t('calibrateScreen.last_submitted',{lastSubmitTime}):''}
                </Text>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
        <View style={styles.bttnWrap}>
          <UIButton
            style={
              continueBtnDisableState ||
              watchBatteryValue == WATCH_BATTERY_STATE.LOW ||
              // watchChargerValue == WATCH_CHARGER_STATE.CONNECTED ||
              watchWristValue == WATCH_WRIST_STATE.NOT_ON_WRIST
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={
              continueBtnDisableState ||
              watchBatteryValue == WATCH_BATTERY_STATE.LOW ||
              // watchChargerValue == WATCH_CHARGER_STATE.CONNECTED ||
              watchWristValue == WATCH_WRIST_STATE.NOT_ON_WRIST
            }
            labelStyle={{color: '#fff'}}
            mode="contained"
            accessibilityLabel="calibrate-form-submit"
            onPress={() => {
              if (isWatchConnected != WATCH_CONNECTION_STATE.CONNECTED) {
                dispatch(watchConnectPopupAction(true));
                return;
              }
              if (autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
                showErrorToast(t('CalibrateConnectionScreen.waitForResult'));
                return;
              }
              if (watchChargerValue == WATCH_CHARGER_STATE.CONNECTED) {
                dispatch(watchChargerAction(true));
                return;
              }
              startCalibration({
                Glucose: fromMmolToMgdl(blGlucose),
                SPO2: oxygenSaturation,
                RR: respirationRate,
                HR: heartRate,
                SBP: blPressureSYS,
                DBP: blPressureDIA,
              });
            }}>
            {contentScreenObj.start_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

async function startCalibration(data) {
  await AsyncStorage.setItem('calibrateData', JSON.stringify(data));
  let userId = await AsyncStorage.getItem('user_id');
  let deviceMsn = await AsyncStorage.getItem('device_msn');
  let batteryLevel = await RNDeviceInfo.getBatteryLevel();
  if (batteryLevel.toFixed(2) < 0.11) {
    showErrorToast(t('watchSettingsScreen.watchSettingSaveDB_ErrorText'));
    return;
  }

  CalibrateCommandHandler.startCalibrate(() => {
    EVENT_MANAGER.SEND.calibrate(JSON.stringify({...data, userId, deviceMsn}));
  });
}

export default CalibrateScreen;
