/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Col, Left, Grid, Card, CardItem, Body} from 'native-base';
import {Fonts} from '../../Theme';
import {
  UIButton,
  UIGlucoseSvgIcon,
  UIBellSvgIcon,
  UIOrangeBellSvgIcon,
  UIRedBellSvgIcon,
  UIHeartSvgIcon,
  UIBLPressureSvgIcon,
  UIRespirationSvgIcon,
  UIOxygenSatSvgIcon,
  UIStepsWalkSvgIcon,
} from '../../Components/UI';
import AntIcon from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useSelector, useDispatch} from 'react-redux';
import {Translate, useTranslation} from '../../Services/Translate';
import {UiMapper} from '../../constants/MeasureUIConstants';
import {
  MEASURE_TREND,
  DATA_BOUNDS_TYPE,
} from '../../Chart/AppConstants/VitalDataConstants';
import {
  refreshHomeScreen,
  getConnectionStatus,
} from './DashboardRefreshUtil';
import {
  INSTANT_MEASURE_STATE,
  OFFLINE_SYNC_STATE,
} from '../../constants/AppDataConstants';
import CalibrateCommandHandler from '../CalibrateControlWrapper/CalibrateCommandHandler';
import startMeasure from '../../utils/startMeasure';
import {watchSyncAction} from './action';
import CheckProfileModal from "./components/CheckProfileModal/CheckProfileModal";
import AlarmIcon from "../../Components/AlarmIcon";

const HomeScreen = ({navigation, route}) => {
  const {
    bloodGlucoseValue,
    heartRateValue,
    bloodPressureSystolicValue,
    bloodPressureDiastolicValue,
    respirationRateValue,
    oxygenSaturationValue,
    stepsWalkValue,
    bloodGlucoseTrend,
    heartRateTrend,
    bloodPressureTrend,
    respirationRateTrend,
    oxygenSaturationTrend,
    bloodGlucoseColor,
    heartRateColor,
    bloodPressureColor,
    respirationRateColor,
    oxygenSaturationColor,
    glucoseUnit,
    stepGoalPercent,
    measureUpdateTime,
    measureState,
    shouldResetHome,
    percentage,
    offlineSyncData,
  } = useSelector((state) => ({
    bloodGlucoseValue: state.home.bloodGlucoseValue,
    heartRateValue: state.home.heartRateValue,
    bloodPressureSystolicValue: state.home.bloodPressureSystolicValue,
    bloodPressureDiastolicValue: state.home.bloodPressureDiastolicValue,
    respirationRateValue: state.home.respirationRateValue,
    oxygenSaturationValue: state.home.oxygenSaturationValue,
    stepsWalkValue: state.home.stepsWalkValue,
    bloodGlucoseTrend: state.home.bloodGlucoseTrend,
    heartRateTrend: state.home.heartRateTrend,
    bloodPressureTrend: state.home.bloodPressureTrend,
    respirationRateTrend: state.home.respirationRateTrend,
    oxygenSaturationTrend: state.home.oxygenSaturationTrend,
    bloodGlucoseColor: state.home.bloodGlucoseColor,
    heartRateColor: state.home.heartRateColor,
    bloodPressureColor: state.home.bloodPressureColor,
    respirationRateColor: state.home.respirationRateColor,
    oxygenSaturationColor: state.home.oxygenSaturationColor,
    glucoseUnit: state.home.glucoseUnit,
    stepGoalPercent: state.home.stepGoalPercent,
    measureUpdateTime: state.home.measureUpdateTime,
    measureState: state.measure.operationState,
    shouldResetHome: state.home.shouldResetHome,
    percentage: state.measure.percentage,
    offlineSyncData: state.watch?.offlineSyncData,
  }));

  const vitalUnits= useTranslation('vitalUnits');
  const dispatch = useDispatch();
  const contentScreenObj = useTranslation('homeScreen');


  let currentStep = stepsWalkValue;
  let setStepProgress;
  setStepProgress = `${stepGoalPercent}%`;

  useEffect(() => {
    refreshHomeScreen();
    if (shouldResetHome) {
      getConnectionStatus();
    }
    CalibrateCommandHandler.resetCalibrate();
  }, [shouldResetHome]);

  let isSyncing = offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START;

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView style={styles.mainScrollView}>
        <View style={styles.healthOverviewWrap}>
          <Grid>
            <Col style={styles.rightSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="BloodGlucoseBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('BloodGlucoseScreen');
                  }}
                  accessible={false}>
                  <View style={styles.bellArea}>
                    {bloodGlucoseValue == 0 ? (
                      <></>
                    ) : (
                      <AlarmIcon alarmType={bloodGlucoseColor}/>
                    )}
                  </View>
                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIGlucoseSvgIcon
                        widthParam={32}
                        heightParam={32}
                        fill={
                          UiMapper.measureColorMap[
                            bloodGlucoseValue == 0 ? 0 : bloodGlucoseColor
                          ]
                        }
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>{vitalUnits[glucoseUnit]}</Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="BloodGlucoseValue">
                          {bloodGlucoseValue == 0 || bloodGlucoseValue
                            ? bloodGlucoseValue
                            : '--'}
                        </Text>
                        {bloodGlucoseTrend == MEASURE_TREND.none ||
                        bloodGlucoseValue == 0 ||
                        bloodGlucoseColor == DATA_BOUNDS_TYPE.normal ||
                        bloodGlucoseColor == DATA_BOUNDS_TYPE.none ? (
                          <></>
                        ) : bloodGlucoseTrend == MEASURE_TREND.down ? (
                          <AntIcon name="caretdown" />
                        ) : (
                          <AntIcon name="caretup" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.blgHeading}
                      </Text>
                    </Body>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            </Col>
            <Col style={styles.leftSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="HeartRateBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('HeartRateScreen');
                  }}
                  accessible={false}>
                  <View style={styles.bellArea}>
                    {heartRateValue == 0 ? <></> :  <AlarmIcon alarmType={heartRateColor} />}
                  </View>

                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIHeartSvgIcon
                        widthParam={32}
                        heightParam={32}
                        fill={
                          UiMapper.measureColorMap[
                            heartRateValue == 0 ? 0 : heartRateColor
                          ]
                        }
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>
                        {contentScreenObj.heartRateUnit}
                      </Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="HeartRateValue">
                          {heartRateValue == 0 || heartRateValue
                            ? heartRateValue
                            : '--'}
                        </Text>
                        {heartRateTrend == MEASURE_TREND.none ||
                        heartRateValue == 0 ||
                        heartRateColor == DATA_BOUNDS_TYPE.normal ||
                        heartRateColor == DATA_BOUNDS_TYPE.none ? (
                          <></>
                        ) : heartRateTrend == MEASURE_TREND.down ? (
                          <AntIcon name="caretdown" />
                        ) : (
                          <AntIcon name="caretup" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.heartRateHeading}
                      </Text>
                    </Body>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            </Col>
          </Grid>

          <Grid>
            <Col style={styles.rightSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="BloodPressureBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('BloodPressureScreen');
                  }}
                  accessible={false}>
                  <View style={styles.bellArea}>
                    {bloodPressureSystolicValue == 0 &&
                    bloodPressureDiastolicValue == 0 ? (
                      <></>
                    ) : (
                      <AlarmIcon alarmType={bloodPressureColor} />
                    )}
                  </View>

                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIBLPressureSvgIcon
                        widthParam={36}
                        heightParam={36}
                        fill={
                          UiMapper.measureColorMap[
                            bloodPressureSystolicValue == 0 &&
                            bloodPressureDiastolicValue == 0
                              ? 0
                              : bloodPressureColor
                          ]
                        }
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>
                        {contentScreenObj.bpUnit}
                      </Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="BloodPressureValue">
                          {(bloodPressureSystolicValue == 0 ||
                            bloodPressureSystolicValue) &&
                          (bloodPressureDiastolicValue == 0 ||
                            bloodPressureDiastolicValue)
                            ? bloodPressureSystolicValue +
                              '/' +
                              bloodPressureDiastolicValue
                            : '--'}
                        </Text>
                        {bloodPressureTrend == MEASURE_TREND.none ||
                        (bloodPressureSystolicValue == 0 &&
                          bloodPressureDiastolicValue == 0) ||
                        bloodPressureColor == DATA_BOUNDS_TYPE.normal ||
                        bloodPressureColor == DATA_BOUNDS_TYPE.none ? (
                          <></>
                        ) : bloodPressureTrend == MEASURE_TREND.down ? (
                          <AntIcon name="caretdown" />
                        ) : (
                          <AntIcon name="caretup" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.bpHeading}
                      </Text>
                    </Body>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            </Col>
            <Col style={styles.leftSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="RespirationRateBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('RespirationRateScreen');
                  }}
                  accessible={false}>
                  <View style={styles.bellArea}>
                    {respirationRateValue == 0 ? (
                      <></>
                    ) : (
                      <AlarmIcon alarmType={respirationRateColor} />
                    )}
                  </View>

                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIRespirationSvgIcon
                        widthParam={36}
                        heightParam={36}
                        fill={
                          UiMapper.measureColorMap[
                            respirationRateValue == 0 ? 0 : respirationRateColor
                          ]
                        }
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>
                        {contentScreenObj.rspRateUnit}
                      </Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="RespirationRateValue">
                          {respirationRateValue == 0 || respirationRateValue
                            ? respirationRateValue
                            : '--'}
                        </Text>
                        {respirationRateTrend == MEASURE_TREND.none ||
                        respirationRateValue == 0 ||
                        respirationRateColor == DATA_BOUNDS_TYPE.normal ||
                        respirationRateColor == DATA_BOUNDS_TYPE.none ? (
                          <></>
                        ) : respirationRateTrend == MEASURE_TREND.down ? (
                          <AntIcon name="caretdown" />
                        ) : (
                          <AntIcon name="caretup" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.rspRateHeading}
                      </Text>
                    </Body>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            </Col>
          </Grid>

          <Grid>
            <Col style={styles.rightSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="OxygenSaturationBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('OxygenSaturationScreen');
                  }}
                  accessible={false}>
                  <View style={styles.bellArea}>
                    {oxygenSaturationValue == 0 ? (
                      <></>
                    ) : (
                      <AlarmIcon alarmType={oxygenSaturationColor} />
                    )}
                  </View>

                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIOxygenSatSvgIcon
                        widthParam={36}
                        heightParam={36}
                        fill={
                          UiMapper.measureColorMap[
                            oxygenSaturationValue == 0
                              ? 0
                              : oxygenSaturationColor
                          ]
                        }
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>
                        {contentScreenObj.OSUnit}
                      </Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="OxygenSaturationValue">
                          {oxygenSaturationValue == 0 || oxygenSaturationValue
                            ? oxygenSaturationValue
                            : '--'}
                        </Text>
                        {oxygenSaturationTrend == MEASURE_TREND.none ||
                        oxygenSaturationValue == 0 ||
                        oxygenSaturationColor == DATA_BOUNDS_TYPE.normal ||
                        oxygenSaturationColor == DATA_BOUNDS_TYPE.none ? (
                          <></>
                        ) : oxygenSaturationTrend == MEASURE_TREND.down ? (
                          <AntIcon name="caretdown" />
                        ) : (
                          <AntIcon name="caretup" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.OSHeading}
                      </Text>
                    </Body>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            </Col>
            <Col style={styles.leftSpace}>
              <Card
                style={styles.healthOverviewBox}
                accessibilityLabel="StepsWalkedBox">
                <TouchableOpacity
                  onPress={() => {
                    if (isSyncing) {
                      dispatch(watchSyncAction(true));
                      return;
                    }
                    navigation.navigate('StepsWalkedScreen');
                  }}
                  accessible={false}>
                  <CardItem style={styles.iconHeader}>
                    <Left style={{paddingLeft: 0, marginLeft: 0}}>
                      <UIStepsWalkSvgIcon
                        widthParam={36}
                        heightParam={36}
                        fill={currentStep == 0 ? '#999' : '#D0E7FF'}
                      />
                    </Left>
                  </CardItem>
                  <CardItem style={styles.textWrap}>
                    <Body>
                      <Text style={styles.rateParam}>
                        {contentScreenObj.stepsUnit}
                      </Text>
                      <View style={styles.infoWrap}>
                        <Text
                          style={styles.rateText}
                          accessibilityLabel="StepsValue">
                          {currentStep == 0 || currentStep ? currentStep : '--'}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={styles.healthKey}>
                        {contentScreenObj.stepsHeading}
                      </Text>
                    </Body>
                  </CardItem>

                  <View style={styles.progressBarWrap}>
                    <View style={styles.progressBar}>
                      {currentStep == 0 ? (
                        <></>
                      ) : (
                        <Animatable.View
                          delay={1000}
                          animation="slideInUp"
                          iterationCount={1}
                          direction="normal"
                          style={{height: setStepProgress}}>
                          <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 0, y: 1}}
                            colors={['#1876D4', '#04CDF1']}
                            style={{height: '100%', borderRadius: 5}}
                          />
                        </Animatable.View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            </Col>
          </Grid>

          <Grid>
            <Col>
              <Text
                style={styles.lastUpdateText}
                accessibilityLabel="measurement-updated-time">
                {measureUpdateTime ? `${contentScreenObj.lastUpdate}: ${measureUpdateTime}`  : ''}
              </Text>
            </Col>
          </Grid>

          <Grid>
            <Col style={styles.mealBox}>
              <View style={[styles.rightMealSpace, styles.lastRowBox]}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MealScreen')}
                  accessibilityLabel="meal-block"
                  accessible={false}>
                  <ImageBackground
                    style={styles.imageStyle}
                    source={require('../../assets/images/bitmap.jpg')}>
                    <View style={styles.navWrap}>
                      <Text style={styles.mealText}>
                        {contentScreenObj.meals_ButtonText}
                      </Text>
                      <AntIcon name="arrowright" style={styles.navArrow} />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </Col>

            <Col style={styles.mealBox}>
              <View style={[styles.leftMealSpace, styles.lastRowBox]}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HealthSymptomScreen')}
                  accessibilityLabel="healthSymptom-block"
                  accessible={false}>
                  <ImageBackground
                    style={styles.imageStyle}
                    source={require('../../assets/images/health_symptom.jpg')}>
                    <View style={styles.navWrap}>
                      <Text style={styles.mealText}>
                        {contentScreenObj.healthSymptoms_ButtonText}
                      </Text>
                      <AntIcon name="arrowright" style={styles.navArrow} />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </Col>
          </Grid>
          {!!contentScreenObj.informationalText && (
            <Grid>
              <Col>
                <Text
                  style={styles.infoText}
                  accessibilityLabel="measurement-updated-time">
                  {contentScreenObj.informationalText}
                </Text>
              </Col>
            </Grid>
          )}
        </View>
      </ScrollView>

      <View style={styles.bttnWrap}>
        <UIButton
          // style={styles.bttnArea}
          style={styles.bttnArea}
          mode="contained"
          accessibilityLabel="measurement-now-overview-btn"
          labelStyle={styles.buttonText}
          onPress={() => {
            if (isSyncing) {
              dispatch(watchSyncAction(true));
              return;
            }
            startMeasure(navigation);
          }}>
          {measureState == INSTANT_MEASURE_STATE.ONGOING
            ? Translate('commonHomeDetails.measuring_ButtonText', {percentage})
            : contentScreenObj.measure_ButtonText
          }
        </UIButton>
        <UIButton
          style={[styles.bttnArea, styles.cancelBttn]}
          mode="outlined"
          accessibilityLabel="home-shareData-button"
          labelStyle={{...Fonts.fontSemiBold}}
          onPress={() => navigation.navigate('ShareDataScreen')}>
          {contentScreenObj.shareData_ButtonText}
        </UIButton>
      </View>
      <CheckProfileModal navigation={navigation}/>
    </SafeAreaView>
  );
};


export default HomeScreen;
