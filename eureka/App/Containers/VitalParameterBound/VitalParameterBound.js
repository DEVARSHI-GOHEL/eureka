/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {SafeAreaView, ScrollView, Text, View,} from 'react-native';

import {Fonts} from '../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {VitalParameterBar} from '../../Components/VitalParameterBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {DB_STORE} from '../../storage/DbStorage';
import {refreshHomeScreen} from '../HomeScreen/DashboardRefreshUtil';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {Translate} from '../../Services/Translate';

export const VitalParameterBound = ({navigation, ...props}) => {
  const [initialPageState, setInitialPageState] = useState(0);

  const [glucoseUnit, setGlucoseUnit] = useState('');

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({})

  useEffect(() => {
    if (!_.isEmpty(Translate('vitalParameterBound'))) {
      const vitalParameterBoundContentObject = Translate('vitalParameterBound');
      setContentScreenObj(vitalParameterBoundContentObject);
    }
  })
  /** ############################ */

  const setAsyncValue = async (e) => {
    console.log('setAsyncValue', e);

    let bloodGlucoseParameterValue;
    if (initialPageState === 0) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MGDL;
    } else if (initialPageState === 1) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MMOL;
    }

    if (e !== undefined && e === 0) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MGDL;
    } else if (e !== undefined && e === 1) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MMOL;
    }

    console.log('bloodGlucoseParameterValue', bloodGlucoseParameterValue);
  };

  const putToDb = async function (e) {
    let bloodGlucoseParameterValue = null;
    if (e !== undefined && e === 0) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MGDL;
    } else if (e !== undefined && e === 1) {
      bloodGlucoseParameterValue = GLUCOSE_UNIT.MMOL;
    }

    let user_id = await AsyncStorage.getItem('user_id');
    await DB_STORE.UPDATE.userInfo({
      id: user_id,
      glucose_unit: "'" + bloodGlucoseParameterValue + "'",
    });
    refreshHomeScreen();
  };

  const getAsyncValue = async () => {
    console.log('getAsyncValue');

    let bloodGlucoseParameterTab;

    let user_id = await AsyncStorage.getItem('user_id');
    let userDbData = await DB_STORE.GET.userInfo(user_id);

    let getbloodaGlucose = GLUCOSE_UNIT.MGDL;
    if (userDbData && userDbData.rows[0]) {
      getbloodaGlucose = userDbData.rows[0].glucose_unit
        ? userDbData.rows[0].glucose_unit
        : GLUCOSE_UNIT.MGDL;
    }
    //let getbloodaGlucose = await AsyncStorage.getItem('blood_glucose_parameter');
    setGlucoseUnit(getbloodaGlucose);

    if (getbloodaGlucose === GLUCOSE_UNIT.MGDL) {
      // bloodGlucoseParameterTab = 0;
      // glucoseMMOL = <DataBounds
      // vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
      // withoutHeader={true}
      // glucoseUnit={GLUCOSE_UNIT.MGDL}
      // />
    } else if (getbloodaGlucose === GLUCOSE_UNIT.MMOL) {
      // bloodGlucoseParameterTab = 1;
      //   glucoseMMOL = <DataBounds
      //   vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
      //   withoutHeader={true}
      //   glucoseUnit={GLUCOSE_UNIT.MMOL}
      // />
    }

    setInitialPageState(bloodGlucoseParameterTab);
  };

  useEffect(() => {
    getAsyncValue();
  }, []);

  let glucoseMMOL;
  if (glucoseUnit === GLUCOSE_UNIT.MGDL) {
    // bloodGlucoseParameterTab = 0;

    glucoseMMOL = (
      <View>
        <Text
          style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
          accessibilityLabel="blood-glucose-unit">
          {GLUCOSE_UNIT.MGDL}
        </Text>
        <DataBounds
          vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
          withoutHeader={true}
          glucoseUnit={GLUCOSE_UNIT.MGDL}
        />
      </View>
    );
  } else if (glucoseUnit === GLUCOSE_UNIT.MMOL) {
    // bloodGlucoseParameterTab = 1;
    glucoseMMOL = (
      <View>
        <Text
          style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
          accessibilityLabel="blood-glucose-unit">
          {GLUCOSE_UNIT.MMOL}
        </Text>
        <DataBounds
          vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
          withoutHeader={true}
          glucoseUnit={GLUCOSE_UNIT.MMOL}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
        <LinearGradient
          colors={['#f1fbff', '#fff']}
          style={styles.settingsWrap}>
          <View style={styles.parameterBox}>
            <Text
              style={[GlobalStyle.heading, {...Fonts.h5, marginBottom: 0}]}
              accessibilityLabel="blood-glucose-settings">
              {contentScreenObj.blgHeading}
            </Text>
            {/* <View style={styles.tabArea}>
              <Tabs
                locked={true}
                tabContainerStyle={[
                  GlobalStyle.tabContainerCusStyle,
                  {marginHorizontal: 0},
                ]}
                tabBarUnderlineStyle={GlobalStyle.tabBarUnderlineCusStyle}
                page={initialPageState}
                onChangeTab={e => {
                  setInitialPageState(e.i);
                  putToDb(e.i);
                }}
                initialPage={initialPageState}>
                <Tab
                  activeTabStyle={GlobalStyle.activeTabCusStyle}
                  tabStyle={GlobalStyle.tabCusStyle}
                  textStyle={GlobalStyle.textCusStyle}
                  activeTextStyle={GlobalStyle.activeTextCusStyle}
                  heading={GLUCOSE_UNIT.MGDL}
                  accessibilityLabel="mg-settings">
                  <DataBounds
                    vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
                    withoutHeader={true}
                    glucoseUnit={GLUCOSE_UNIT.MGDL}
                  />
                </Tab>

                <Tab
                  activeTabStyle={GlobalStyle.activeTabCusStyle}
                  tabStyle={GlobalStyle.tabCusStyle}
                  textStyle={GlobalStyle.textCusStyle}
                  activeTextStyle={GlobalStyle.activeTextCusStyle}
                  heading={GLUCOSE_UNIT.MMOL}
                  accessibilityLabel="mmal-settings">
                  <DataBounds
                    vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
                    withoutHeader={true}
                    glucoseUnit={GLUCOSE_UNIT.MMOL}
                  />
                </Tab>
              </Tabs>
            </View> */}
            {glucoseMMOL}
          </View>

          <DataBounds vitalType={VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH} />

          <DataBounds vitalType={VITAL_CONSTANTS.KEY_HEART_RATE} />

          <DataBounds vitalType={VITAL_CONSTANTS.KEY_RESP_RATE} />

          <DataBounds vitalType={VITAL_CONSTANTS.KEY_OXY_SAT} />
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export function DataBounds({vitalType, glucoseUnit, withoutHeader}) {
  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({})

  useEffect(() => {
    if (!_.isEmpty(Translate('vitalParameterBound'))) {
      const vitalParameterBoundContentObject = Translate('vitalParameterBound');
      setContentScreenObj(vitalParameterBoundContentObject);
    }
  })
  /** ############################ */
  let bounds = <></>;
  let _sub = <></>;
  switch (vitalType) {
    case VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE:
      _sub = (
        <>
          <View style={styles.parameterBoxInner}>
            <Text
              style={[
                GlobalStyle.description,
                {marginBottom: 10, marginTop: 25},
              ]}
              accessibilityLabel="Fasting">
              {contentScreenObj.blg_fasting}
            </Text>
            <VitalParameterBar
              leftRedValue={convertData(60, glucoseUnit)}
              leftRedValuePer={'10%'}
              leftOrangeValue={convertData(65, glucoseUnit)}
              leftOrangeValuePer={'10%'}
              leftYellowValue={convertData(70, glucoseUnit)}
              leftYellowValuePer={'10%'}
              centerGreenValue={convertData(100, glucoseUnit)}
              centerGreenValuePer={'25%'}
              rightYellowValue={convertData(125, glucoseUnit)}
              rightYellowValuePer={'15%'}
              rightOrangeValue={convertData(350, glucoseUnit)}
              rightOrangeValuePer={'20%'}
              rightRedValuePer={'10%'}
              // 275
            />
          </View>

          <View style={styles.parameterBoxInner}>
            <Text
              style={[
                GlobalStyle.description,
                {marginBottom: 10, marginTop: 20},
              ]}
              accessibilityLabel="After-meal-within">
              {contentScreenObj.blg_afterMealwithinTwoHrs}
            </Text>
            <VitalParameterBar
              leftRedValue={convertData(60, glucoseUnit)}
              leftRedValuePer={'10%'}
              leftOrangeValue={convertData(65, glucoseUnit)}
              leftOrangeValuePer={'10%'}
              leftYellowValue={convertData(90, glucoseUnit)}
              leftYellowValuePer={'10%'}
              centerGreenValue={convertData(190, glucoseUnit)}
              centerGreenValuePer={'30%'}
              rightYellowValue={convertData(230, glucoseUnit)}
              rightYellowValuePer={'10%'}
              rightOrangeValue={convertData(350, glucoseUnit)}
              rightOrangeValuePer={'20%'}
              rightRedValuePer={'10%'}
            />
          </View>

          <View style={[styles.parameterBoxInner, {borderBottomWidth: 0}]}>
            <Text
              style={[
                GlobalStyle.description,
                {marginBottom: 10, marginTop: 25},
              ]}
              accessibilityLabel="After-meal-after">
              {contentScreenObj.blg_afterMealafterTwoHrs}
            </Text>
            {/* <VitalParameterBar
              leftRedValue={convertData(60, glucoseUnit)}
              leftRedValuePer={70}

              leftOrangeValue={convertData(65, glucoseUnit)}
              leftOrangeValuePer={20}

              leftYellowValue={convertData(90, glucoseUnit)}
              leftYellowValuePer={45}

              centerGreenValue={convertData(140, glucoseUnit)}
              centerGreenValuePer={70}

              rightYellowValue={convertData(200, glucoseUnit)}
              rightYellowValuePer={40}

              rightOrangeValue={convertData(350, glucoseUnit)}
              rightOrangeValuePer={30}

              rightRedValuePer={40}
            /> */}
            {/* set for width issue fix in small device. */}
            {/* tried to set the width as per fixed width */}
            <VitalParameterBar
              leftRedValue={convertData(60, glucoseUnit)}
              leftRedValuePer={'10%'}
              leftOrangeValue={convertData(65, glucoseUnit)}
              leftOrangeValuePer={'10%'}
              leftYellowValue={convertData(90, glucoseUnit)}
              leftYellowValuePer={'10%'}
              centerGreenValue={convertData(140, glucoseUnit)}
              centerGreenValuePer={'15%'}
              rightYellowValue={convertData(200, glucoseUnit)}
              rightYellowValuePer={'20%'}
              rightOrangeValue={convertData(350, glucoseUnit)}
              rightOrangeValuePer={'25%'}
              rightRedValuePer={'10%'}
            />
          </View>
        </>
      );

      bounds = withoutHeader ? (
        _sub
      ) : (
        <View style={styles.parameterBox}>
          <Text style={[GlobalStyle.heading, {...Fonts.h5}]}>
            Blood Glucose
          </Text>
          <View style={styles.tabArea}>{_sub}</View>
        </View>
      );

      break;

    case VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH:
    case VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW:
      _sub = (
        <>
          <View style={styles.parameterBoxInner}>
            <Text
              style={[
                GlobalStyle.description,
                {marginBottom: 10, marginTop: 25},
              ]}
              accessibilityLabel="Systolic-Blood-Pressure">
              {contentScreenObj.bp_systolic}
            </Text>
            {/* <VitalParameterBar
              leftRedValue={80}
              leftRedValuePer={70}

              leftOrangeValue={85}
              leftOrangeValuePer={20}

              leftYellowValue={90}
              leftYellowValuePer={20}

              centerGreenValue={130}
              centerGreenValuePer={90}

              rightYellowValue={140}
              rightYellowValuePer={25}

              rightOrangeValue={180}
              rightOrangeValuePer={50}

              rightRedValuePer={40}
            // 275
            /> */}
            {/* set for width issue fix in small device. */}
            {/* tried to set the width as per fixed width */}
            <VitalParameterBar
              leftRedValue={80}
              leftRedValuePer={'15%'}
              leftOrangeValue={85}
              leftOrangeValuePer={'9%'}
              leftYellowValue={90}
              leftYellowValuePer={'9%'}
              centerGreenValue={130}
              centerGreenValuePer={'29%'}
              rightYellowValue={140}
              rightYellowValuePer={'10%'}
              rightOrangeValue={180}
              rightOrangeValuePer={'13%'}
              rightRedValuePer={'15%'}
              // 275
            />
          </View>

          <View style={[styles.parameterBoxInner, {borderBottomWidth: 0}]}>
            <Text
              style={[
                GlobalStyle.description,
                {marginBottom: 10, marginTop: 25},
              ]}
              accessibilityLabel="Diastolic-Blood-Pressure">
              {contentScreenObj.bp_diastolic}
            </Text>
            {/* <VitalParameterBar
              leftRedValue={50}
              leftRedValuePer={70}

              leftOrangeValue={55}
              leftOrangeValuePer={20}

              leftYellowValue={60}
              leftYellowValuePer={20}

              centerGreenValue={90}
              centerGreenValuePer={90}

              rightYellowValue={100}
              rightYellowValuePer={25}

              rightOrangeValue={110}
              rightOrangeValuePer={50}

              rightRedValuePer={40}
            // 275
            /> */}
            {/* set for width issue fix in small device. */}
            {/* tried to set the width as per fixed width */}
            <VitalParameterBar
              leftRedValue={50}
              leftRedValuePer={'15%'}
              leftOrangeValue={55}
              leftOrangeValuePer={'9%'}
              leftYellowValue={60}
              leftYellowValuePer={'9%'}
              centerGreenValue={90}
              centerGreenValuePer={'29%'}
              rightYellowValue={100}
              rightYellowValuePer={'10%'}
              rightOrangeValue={110}
              rightOrangeValuePer={'13%'}
              rightRedValuePer={'15%'}
              // 275
            />
          </View>
        </>
      );
      bounds = withoutHeader ? (
        _sub
      ) : (
        <View style={styles.parameterBox}>
          <Text
            style={[GlobalStyle.heading, {...Fonts.h5, marginBottom: 0}]}
            accessibilityLabel="Blood-Pressure">
            {contentScreenObj.bpHeading}
          </Text>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
            accessibilityLabel="Blood-Pressure-mmHg">
            {contentScreenObj.bpUnit}
          </Text>
          <View style={styles.tabArea}>{_sub}</View>
        </View>
      );
      break;

    case VITAL_CONSTANTS.KEY_HEART_RATE:
      _sub = (
        <View style={[styles.parameterBoxInner, {borderBottomWidth: 0}]}>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 25}]}
            accessibilityLabel="Heart-Rate">
            {contentScreenObj.heartRateHeading}
          </Text>
          {/* <VitalParameterBar
              leftRedValue={40}
              leftRedValuePer={70}

              leftOrangeValue={50}
              leftOrangeValuePer={20}

              leftYellowValue={60}
              leftYellowValuePer={20}

              centerGreenValue={100}
              centerGreenValuePer={90}

              rightYellowValue={110}
              rightYellowValuePer={25}

              rightOrangeValue={130}
              rightOrangeValuePer={50}

              rightRedValuePer={40}
            // 275
            /> */}

          {/* set for width issue fix in small device. */}
          {/* tried to set the width as per fixed width */}
          <VitalParameterBar
            leftRedValue={40}
            leftRedValuePer={'16%'}
            leftOrangeValue={50}
            leftOrangeValuePer={'7%'}
            leftYellowValue={60}
            leftYellowValuePer={'8%'}
            centerGreenValue={100}
            centerGreenValuePer={'29%'}
            rightYellowValue={110}
            rightYellowValuePer={'9%'}
            rightOrangeValue={130}
            rightOrangeValuePer={'16%'}
            rightRedValuePer={'15%'}

            // 275
          />
        </View>
      );

      bounds = withoutHeader ? (
        _sub
      ) : (
        <View style={styles.parameterBox}>
          <Text
            style={[GlobalStyle.heading, {...Fonts.h5, marginBottom: 0}]}
            accessibilityLabel="Heart-Rate-title">
            {contentScreenObj.heartRateHeading}
          </Text>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
            accessibilityLabel="Heart-Rate-bpm">
            {contentScreenObj.heartRateUnit}
          </Text>
          <View style={styles.tabArea}>{_sub}</View>
        </View>
      );
      break;

    case VITAL_CONSTANTS.KEY_OXY_SAT:
      _sub = (
        <View style={[styles.parameterBoxInner, {borderBottomWidth: 0}]}>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 25}]}
            accessibilityLabel="Oxygen-Saturation">
            {contentScreenObj.OS_bound}
          </Text>
          {/* <VitalParameterBar

                centerGreenValue={100}
                centerGreenValuePer={78}

                rightYellowValue={95}
                rightYellowValuePer={78}

                rightOrangeValue={90}
                rightOrangeValuePer={78}

                rightRedValue={85}
                rightRedValuePer={80}

                onlyRight = {true}
              // 275
              /> */}
          {/* set for width issue fix in small device. */}
          {/* tried to set the width as per fixed width */}
          <VitalParameterBar
            centerGreenValue={100}
            centerGreenValuePer={'35%'}
            rightYellowValue={95}
            rightYellowValuePer={'24%'}
            rightOrangeValue={90}
            rightOrangeValuePer={'23%'}
            rightRedValue={85}
            rightRedValuePer={'18%'}
            onlyRight={true}
            // 275
          />
        </View>
      );

      bounds = withoutHeader ? (
        _sub
      ) : (
        <View style={styles.parameterBox}>
          <Text
            style={[GlobalStyle.heading, {...Fonts.h5, marginBottom: 0}]}
            accessibilityLabel="Oxygen-Saturation-title">
            {contentScreenObj.OSHeading}
          </Text>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
            accessibilityLabel="Oxygen-Saturation-parameter">
            {contentScreenObj.OSUnit}
          </Text>
          <View style={styles.tabArea}>{_sub}</View>
        </View>
      );
      break;

    case VITAL_CONSTANTS.KEY_RESP_RATE:
      _sub = (
        <View style={[styles.parameterBoxInner, {borderBottomWidth: 0}]}>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 25}]}
            accessibilityLabel="Respiration-Rate">
            {contentScreenObj.rspRateHeading}
          </Text>
          {/* <VitalParameterBar
                  leftRedValue={10}
                  leftRedValuePer={70}

                  leftOrangeValue={11}
                  leftOrangeValuePer={20}

                  leftYellowValue={12}
                  leftYellowValuePer={20}

                  centerGreenValue={20}
                  centerGreenValuePer={90}

                  rightYellowValue={22}
                  rightYellowValuePer={25}

                  rightOrangeValue={30}
                  rightOrangeValuePer={50}

                  rightRedValuePer={40}
                // 275
                /> */}

          {/* set for width issue fix in small device. */}
          {/* tried to set the width as per fixed width */}
          <VitalParameterBar
            leftRedValue={10}
            leftRedValuePer={'9%'}
            leftOrangeValue={11}
            leftOrangeValuePer={'10%'}
            leftYellowValue={12}
            leftYellowValuePer={'11%'}
            centerGreenValue={20}
            centerGreenValuePer={'18%'}
            rightYellowValue={22}
            rightYellowValuePer={'20%'}
            rightOrangeValue={30}
            rightOrangeValuePer={'23%'}
            rightRedValuePer={'9%'}
            // 275
          />
        </View>
      );

      bounds = withoutHeader ? (
        _sub
      ) : (
        <View style={styles.parameterBox}>
          <Text
            style={[GlobalStyle.heading, {...Fonts.h5, marginBottom: 0}]}
            accessibilityLabel="Respiration-Rate-title">
            {contentScreenObj.rspRate_bound}
          </Text>
          <Text
            style={[GlobalStyle.description, {marginBottom: 10, marginTop: 0}]}
            accessibilityLabel="Respiration-Rate-brpm">
            {contentScreenObj.rspRateUnit}
          </Text>
          <View style={styles.tabArea}>{_sub}</View>
        </View>
      );
      break;

    default:
      break;
  }

  return bounds;
}

function convertData(val, glucoseUnit) {
  if (glucoseUnit == GLUCOSE_UNIT.MMOL) {
    return convertToMmOl(val);
  }

  return val;
}

function convertToMmOl(val) {
  return Math.round((val / 18) * 10) / 10;
}
