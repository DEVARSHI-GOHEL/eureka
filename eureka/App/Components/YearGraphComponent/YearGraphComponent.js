import React, {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
import {View, Text, Modal, TouchableOpacity} from 'react-native';
import styles from './style';
import {
  UIHandwithWatchIcon,
  UIButton,
  UIDecreasingTrendIcon,
  UIModal,
  UIVitalBoundModal,
  UITimeRangeModal,
} from '../../Components/UI';
import {RadioButton} from 'react-native-paper';
import {TabDateNav} from '../TabDateNav';
import {TabReading} from '../TabReading';
import {TabTimeRange} from '../TabTimeRange';
import {
  TabReadingDate,
  TabReadingUnitThreeColumn,
  TabReadingMonth,
} from '../TabReadingUnitWeek';
import {TabReadingUnit} from '../TabReadingUnit';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Fonts} from '../../Theme';
import GlobalStyle from '../../Theme/GlobalStyle';
import { Translate } from '../../Services/Translate';

import {MonthBrowser, YearBrowser} from '../../Chart/AppUtility/DateTimeUtils';
import {getDailyGeneralData} from '../../Chart/VizApi/DailyGeneralVitalDataService';
import {convertMonthlyGeneralData} from '../../Chart/VizDataConverter/MonthlyGeneralDataConverter';
import {
  VITAL_CONSTANTS,

} from '../../Chart/AppConstants/VitalDataConstants';

import BarChart from '../../Chart/GraphComponents/BarChart';
import {
  MinMaxScatterPlot,
  MinMaxScatterPlotLegend,
} from '../../Chart/GraphComponents/MinMaxScatterPlot';

import {UIGenericPlaceholder} from '../UI/UIGenericPlaceholder';

import store from '../../../store/store';

import MeasureCommandHandler from '../../Containers/MeasureNowConnectionScreen/MeasureCommandHandler';
import {VitalDataListType} from '../HealthDetailComponent/utils';
import HealthDetailComponent from '../HealthDetailComponent/HealthDetailComponent';
import {convertYearlyGeneralData} from '../../Chart/VizDataConverter/YearlyGeneralDataConverter';
import {
  INSTANT_CALIBRATE_STATE,
  INSTANT_MEASURE_STATE,
  WATCH_CONNECTION_STATE,
  WATCH_BATTERY_STATE,
  WATCH_CHARGER_STATE,
  WATCH_WRIST_STATE,
} from '../../constants/AppDataConstants';
import startMeasure from '../../utils/startMeasure';
import {useSelector} from 'react-redux';
import {getVitalDataBoundsNameAndUnit} from "../../Chart/AppConstants/VitalDataTool";
import {t} from "i18n-js";

let _tempDateBrowser = new YearBrowser();
let temp1 = _tempDateBrowser.next();
let temp2 = _tempDateBrowser.previous();

const initState = {
  dataLoading: true,
  dataFetchError: false,
  data: null,
  previousData: null,
};

export function YearGraphComponent({vitalType, navigation}) {
  const [containerState, setContainerState] = useState({
    ...initState,
    dateFragment: temp1,
    previousDateFragment: temp2,
  });
  const [dateBrowser, setDateBrowser] = useState(new YearBrowser());

  const [measureBtnDisabled, setmeasureBtnDisabled] = useState(true);

  const {
    measureState,
    percentage,
    isWatchConnected,
    watchBatteryValue,
    watchWristValue,
  } = useSelector((state) => ({
    measureState: state.measure.operationState,
    percentage: state.measure.percentage,
    isWatchConnected: state.home.isWatchConnected,
    watchBatteryValue: state.watch.watchBatteryValue,
    // watchChargerValue: state.watch.watchChargerValue,
    watchWristValue: state.watch.watchWristValue,
  }));

  useEffect(() => {
    let measureBtnDisabled =
      WATCH_CONNECTION_STATE.CONNECTED != isWatchConnected ||
      watchBatteryValue == WATCH_BATTERY_STATE.LOW ||
      // watchChargerValue == WATCH_CHARGER_STATE.CONNECTED ||
      watchWristValue == WATCH_WRIST_STATE.NOT_ON_WRIST;
    setmeasureBtnDisabled(measureBtnDisabled);
  }, [
    isWatchConnected,
    watchBatteryValue,
    watchWristValue,
  ]);

  useEffect(() => {
    changeDateAndRenderData(true, vitalType);
  }, []);

  //Method to change the date and act as a wrapper for data fetch and load
  function changeDateAndRenderData(isNext, vitalType) {
    let fragment = null;
    let previousFragment = null;
    if (isNext) {
      fragment = dateBrowser.next();
    } else {
      fragment = dateBrowser.previous();
    }

    previousFragment = dateBrowser.previous();
    dateBrowser.next();

    fetchDataAndSetState(fragment, previousFragment, vitalType);
  }

  /** Method to fetch data and set graph and associated components rendering states*/
  async function fetchDataAndSetState(
    dateFragment,
    previousDateFragment,
    vital_type,
  ) {
    setContainerState({
      ...initState,
      dataLoading: true,
      dateFragment: dateFragment,
      previousDateFragment: previousDateFragment,
    });

    let startTs = dateFragment.start.ts;
    let endTs = dateFragment.end.ts;

    let startPreviousTs = previousDateFragment.start.ts;
    let endPreviousTs = previousDateFragment.end.ts;

    try {
      let generalData = await getDailyGeneralData(
        startTs,
        endTs,
        vital_type,
        false,
      );
      let generalPreviousWeekData = await getDailyGeneralData(
        startPreviousTs,
        endPreviousTs,
        vital_type,
        false,
      );
      //let convertedData = convertWeeklyGeneralData(weeklyGeneralData, weeklyGeneralPreviousWeekData, _startPreviousTs, _endPreviousTs, vital_type);

      if (
        !generalData ||
        Object.keys(generalData).length == 0 ||
        generalData.vital_data.length == 0
      ) {
        setContainerState({
          ...initState,
          dataLoading: false,
          dataFetchError: true,
          dateFragment: dateFragment,
          previousDateFragment: previousDateFragment,
        });
        return;
      }

      //do stuff with data
      setContainerState({
        ...containerState,
        dataLoading: false,
        dataFetchError: false,
        data: generalData,
        previousData: generalPreviousWeekData,
        dateFragment: dateFragment,
        previousDateFragment: previousDateFragment,
      });
    } catch (e) {
      console.log(e);
      setContainerState({
        ...initState,
        dataLoading: false,
        dataFetchError: true,
        dateFragment: dateFragment,
        previousDateFragment: previousDateFragment,
      });
    }
  }

  // function startMeasure() {
  //   if (
  //     store.getState().calibrate.operationState ==
  //     INSTANT_CALIBRATE_STATE.ONGOING
  //   ) {
  //     MeasureCommandHandler.calibrateInProgress();
  //     return;
  //   }

  //   navigation.navigate('MeasureNowConnectionScreen');
  // }

  let viz_container = null;
  let dateInWordsEnd = containerState.dateFragment.end.dateInWords;
  let dateInWordsStart = containerState.dateFragment.start.dateInWords;

  let dateInWords = dateInWordsStart + ' - ' + dateInWordsEnd;
  let isCurrent = containerState.dateFragment.isCurrent;

  let _startTs = containerState.dateFragment.start.ts;
  let _endTs = containerState.dateFragment.end.ts;

  let _previousStartTs = containerState.previousDateFragment.start.ts;
  let _previousEndTs = containerState.previousDateFragment.end.ts;

  if (containerState.dataLoading) {
    viz_container = (
      <UIGenericPlaceholder
        loadingIcon={true}
        visiblity={true}
        message={Translate('commonHomeDetails.loading')}
      />
    );
  } else if (containerState.dataFetchError) {
    viz_container = (
      <UIGenericPlaceholder
        noDataIcon={true}
        visiblity={true}
        message={Translate('commonHomeDetails.noData')}
      />
    );
  } else {
    viz_container = (
      <>
        <YearGraphContainer
          startTs={_startTs}
          endTs={_endTs}
          previousStartTs={_previousStartTs}
          previousEndTs={_previousEndTs}
          vitalType={vitalType}
          vitalData={containerState.data}
          previousVitalData={containerState.previousData}
        />
      </>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* date component */}
      <TabDateNav
        title={dateInWords}
        onLeftPress={() => {
          changeDateAndRenderData(false, vitalType);
        }}
        onRightPress={() => {
          if (isCurrent) return;

          changeDateAndRenderData(true, vitalType);
        }}
        leftIconDisableState={false}
        rightIconDisableState={isCurrent}
      />
      {viz_container}
      <View style={styles.bttnWrap}>
        <UIButton
          style={
            measureBtnDisabled
              ? {backgroundColor: '#A4C8ED', ...styles.bttnArea}
              : styles.bttnArea
          }
          mode="contained"
          accessibilityLabel="measurement-now-overview-btn"
          labelStyle={{...Fonts.fontSemiBold, color: '#fff'}}
          disabled={measureBtnDisabled}
          onPress={() => startMeasure(navigation)}>
          {measureState == INSTANT_MEASURE_STATE.ONGOING
            ? Translate('commonHomeDetails.measuring_ButtonText', {percentage})
            : Translate('commonHomeDetails.measure_ButtonText')}
        </UIButton>
      </View>
    </View>
  );
}

/**
 * Graph and its associated functional component. We wrap this in the higher order YearGraphComponent functional component.
 */
function YearGraphContainer({
  startTs,
  endTs,
  previousStartTs,
  previousEndTs,
  vitalType,
  vitalData,
  previousVitalData,
}) {
  let __data = vitalData;
  let __previousData = previousVitalData;

  let _vitalData = JSON.parse(JSON.stringify(__data));
  let _previousVitalData = JSON.parse(JSON.stringify(__previousData));

  let _vizData = convertToViewData(
    startTs,
    endTs,
    previousStartTs,
    previousEndTs,
    _vitalData,
    _previousVitalData,
    vitalType,
  );

  console.log('Viz data Loaded', _vizData);

  //console.log(JSON.stringify(_vizData));

  if (!_vizData) {
    return (
      <UIGenericPlaceholder
        errorIcon={true}
        visiblity={true}
        message={t('dayGraphContainer.dataPlaceholder')}
      />
    );
  }

  let isBp =
    vitalType == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vitalType == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW;

  let listJsx = (
    <HealthDetailComponent
      data={_vitalData}
      vitalType={vitalType}
      type={VitalDataListType.YEARLY}
    />
  );
  let graphJsx = isBp ? (
    <BpMonthGraphSubContainer vizData={_vizData} vitalType={vitalType} />
  ) : (
    <MonthGraphSubContainer vizData={_vizData} vitalType={vitalType} />
  );

  return (
    <>
      {graphJsx}
      {listJsx}
    </>
  );
}

function MonthGraphSubContainer({startTs, endTs, vitalType, vizData}) {
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState(false);
  const [vitalBoundModalVisible, setVitalBoundModalVisible] = useState(false);

  const HourTabReadingUnitRef = useRef();
  const TabReadingUnitRef = useRef();
  const TabReadingDateRef = useRef();

  const months = {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December',
  };
  function setReadingWeekday(data) {
    // console.log("data",data);
    // const arr = data.meta.dateInWords.split(' ')

    TabReadingUnitRef.current.setReading(data);
    TabReadingDateRef.current.setReading(normalizeLastDayData(data.meta));
  }

  function normalizeLastDayData(data) {
    // console.log("data",data);
    // const bucketKeys = vizData.bucketKeys
    // const arr = data.dateInWords.split(',')
    // console.log("Data",bucketKeys,bucketKeys.length-1,months[bucketKeys[bucketKeys.length-1]],arr[1]);
    // return months[bucketKeys[bucketKeys.length-1]]+arr[1];
    console.log('data', data);
    if (!data) return '';

    const arr = data.dateInWords.split(' ');
    return arr[0] + ' ' + arr[2];
  }

  function setReadingHourly(data) {
    HourTabReadingUnitRef.current.setReading(data);
  }

  let lastHourData = vizData.lastHourData;
  let lastDayData = vizData.lastDayData;
  let lastMonthData = normalizeLastDayData(lastDayData);

  let tabReadingData = getTabReadingInfo(vizData.summary);

  let convertGlucoseData = vizData.convertGlucoseData;

  let vitalTypeButton = (
    <UIButton
      style={[styles.bttn, {marginBottom: 20}]}
      mode="outlined"
      onPress={() => setVitalBoundModalVisible(true)}>
      {getVitalDataBoundsNameAndUnit(vitalType).name}
    </UIButton>
  );

  let jsx = (
    <>
      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading
              leftIcon={<Text style={styles.iconStyle}>%</Text>}
              title={
                vitalType == VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE
                  ? t('graphLabels.timeInRange')
                  : t('graphLabels.timeInNormalRange')
              }
              rightIcon={
                vitalType != VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE ? (
                  <></>
                ) : (
                  <TouchableOpacity
                    onPress={() => setTimeRangeModalVisible(true)}
                    accessible={false}
                  >
                    <FeatherIcon
                      name="info"
                      style={[
                        styles.infoIconColor,
                        {marginLeft: 5, fontSize: 26},
                      ]}
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* time range component */}
            <TabTimeRange
              iconLeft={tabReadingData.icon}
              rangeSummaryText={tabReadingData.jsx}
            />

            {/* Bar graph area */}
            <View style={[styles.graphArea, {marginBottom: 25}]}>
              {/* <Text>Graph will go here</Text> */}
              <BarChart data={vizData} vitalType={vitalType} />
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading title={t("graphComponents.comparationMonthAverages")} />

            <View style={{height: 30}}>
              <MinMaxScatterPlotLegend />
            </View>

            {/* graph area */}
            {/* <Text>Graph will go here</Text> */}

            <View style={[styles.graphArea, {marginBottom: 0}]}>
              <MinMaxScatterPlot
                data={vizData}
                hourly={false}
                vitalType={vitalType}
                onInteract={(selected_data) => {
                  setReadingWeekday(selected_data);
                }}
              />
            </View>

            <View style={styles.headingWrap}>
              <TabReadingMonth
                ref={TabReadingDateRef}
                initData={lastMonthData}
              />
            </View>
          </LinearGradient>

          {/* reading mg/dl */}
          <TabReadingUnitThreeColumn
            ref={TabReadingUnitRef}
            initData={{meta: lastDayData, convertGlucoseData}}
          />

          {vitalTypeButton}
        </View>
      </View>

      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading title={t("graphComponents.dailyAverages")} />

            <View style={{height: 60}}>
              <MinMaxScatterPlotLegend />
            </View>

            {/* graph area */}
            <View style={[styles.graphArea, {marginTop: 0}]}>
              {/* <Text>Graph will go here</Text> */}
              <MinMaxScatterPlot
                data={vizData}
                hourly={true}
                vitalType={vitalType}
                onInteract={(selected_data) => {
                  setReadingHourly(selected_data);
                }}
              />
            </View>
          </LinearGradient>

          {/* reading mg/dl */}
          <TabReadingUnit
            ref={HourTabReadingUnitRef}
            initData={{meta: lastHourData, convertGlucoseData}}
          />
        </View>
      </View>

      <UITimeRangeModal
        timeRangeModalCloseFun={() => setTimeRangeModalVisible(false)}
        visiblity={timeRangeModalVisible}
      />

      <UIVitalBoundModal
        vitalTypeProp={vitalType}
        vitalBoundModalCloseFun={() => setVitalBoundModalVisible(false)}
        visiblity={vitalBoundModalVisible}
      />
    </>
  );

  return jsx;
}

function BpMonthGraphSubContainer({startTs, endTs, vitalType, vizData}) {
  const [vitalBoundModalVisible, setVitalBoundModalVisible] = useState(false);

  const HourTabReadingUnitRef = useRef();
  const TabReadingUnitRef = useRef();

  const months = {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December',
  };
  function setReadingWeekday(data) {
    console.log('data', data);
    const arr = data.meta.dateInWords.split(',');
    console.log(data.key, vizData.bucketKeys[data.key]);
    TabReadingUnitRef.current.setReading(data, true);
    // TabReadingDateRef.current.setReading(months[vizData.bucketKeys[data.key]]+arr[1]);
  }

  // function setLastDayData(data) {
  //   console.log("data",data);
  //   const bucketKeys = vizData.bucketKeys
  //   const arr = data.dateInWords.split(',')
  //   console.log("Data",bucketKeys,bucketKeys.length-1,months[bucketKeys[bucketKeys.length-1]],arr[1]);
  //   return months[bucketKeys[bucketKeys.length-1]]+arr[1];
  // }

  function setReadingHourly(data) {
    HourTabReadingUnitRef.current.setReading(data);
  }

  let lastHourData = vizData.lastHourData;
  let lastDayData = vizData.lastDayData;

  let tabReadingData = getBpTabReadingInfo(vizData.summary);

  let vitalTypeButton = (
    <UIButton
      style={[styles.bttn, {marginBottom: 20}]}
      mode="outlined"
      onPress={() => setVitalBoundModalVisible(true)}>
      {getVitalDataBoundsNameAndUnit(vitalType).name}
    </UIButton>
  );

  let jsx = (
    <>
      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading
              leftIcon={<Text style={styles.iconStyle}>%</Text>}
              title={t('graphLabels.timeInNormalRange')}
              //rightIcon={<FeatherIcon name='info' style={[styles.infoIconColor, { marginLeft: 5, fontSize: 26 }]} />}
            />
            <Text
              style={{...Fonts.sub, ...Fonts.fontBold, alignSelf: 'center'}}>
              Systolic
            </Text>
            {/* time range component */}
            <TabTimeRange
              iconLeft={tabReadingData.sys.icon}
              rangeSummaryText={tabReadingData.sys.jsx}
            />

            {/* Bar graph area */}
            <View style={[styles.graphArea, {marginBottom: 25}]}>
              {/* <Text>Graph will go here</Text> */}
              <BarChart
                data={vizData}
                vitalType={VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            <Text
              style={{...Fonts.sub, ...Fonts.fontBold, alignSelf: 'center'}}>
              {Translate('bloodPressureScreen.DIA')}
            </Text>
            {/* time range component */}
            <TabTimeRange
              iconLeft={tabReadingData.dia.icon}
              rangeSummaryText={tabReadingData.sys.jsx}
            />

            {/* Bar graph area */}
            <View style={[styles.graphArea, {marginBottom: 25}]}>
              {/* <Text>Graph will go here</Text> */}
              <BarChart
                data={vizData}
                vitalType={VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW}
              />
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading title={t("graphComponents.comparationMonthAverages")} />
            <View style={{height: 30}}>
              <MinMaxScatterPlotLegend />
            </View>
            {/* graph area */}
            <View style={[styles.graphArea, {marginBottom: 0}]}>
              {/* <Text>Graph will go here</Text> */}
              <MinMaxScatterPlot
                data={vizData}
                hourly={false}
                vitalType={vitalType}
                onInteract={(selected_data) => {
                  setReadingWeekday(selected_data);
                }}
              />
            </View>
          </LinearGradient>

          {/* reading */}
          <TabReadingUnit
            ref={TabReadingUnitRef}
            initData={{meta: lastDayData}}
            smallerFont={true}
            yearly={true}
          />

          <View style={{paddingBottom: 20}}>
            {/* button for bounds */}
            {vitalTypeButton}
          </View>
        </View>
      </View>

      <View style={[styles.tabContent, styles.seperator]}>
        <View style={styles.tabGraphAreaWrap}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
            style={styles.gradientContainer}>
            {/* reading component */}
            <TabReading title={t("graphComponents.dailyAverages")} />
            <View style={{height: 60}}>
              <MinMaxScatterPlotLegend />
            </View>

            {/* graph area */}
            <View style={[styles.graphArea, {marginTop: 0}]}>
              {/* <Text>Graph will go here</Text> */}
              <MinMaxScatterPlot
                data={vizData}
                hourly={true}
                vitalType={vitalType}
                onInteract={(selected_data) => {
                  setReadingHourly(selected_data);
                }}
              />
            </View>
          </LinearGradient>

          {/* reading */}
          <TabReadingUnit
            ref={HourTabReadingUnitRef}
            initData={{meta: lastHourData}}
            smallerFont={true}
          />
        </View>
      </View>

      <UIVitalBoundModal
        vitalTypeProp={vitalType}
        vitalBoundModalCloseFun={() => setVitalBoundModalVisible(false)}
        visiblity={vitalBoundModalVisible}
      />
    </>
  );

  return jsx;
}

function convertToViewData(
  startTs,
  endTs,
  previousStartTs,
  previousEndTs,
  dailyVitalData,
  previousDailyVitalData,
  vital_type,
) {
  if (
    !dailyVitalData ||
    Object.keys(dailyVitalData).length == 0 ||
    !dailyVitalData.vital_data ||
    dailyVitalData.vital_data.length == 0
  ) {
    return null;
  }

  try {
    return convertYearlyGeneralData(
      dailyVitalData,
      previousDailyVitalData,
      startTs,
      endTs,
      previousStartTs,
      previousEndTs,
      vital_type,
    );
  } catch (e) {
    console.log(e);
    return null;
  }
}

function getBpTabReadingInfo(summary) {
  let tabReadingData = {
    sys: {
      icon: '',
      jsx: <></>,
    },
    dia: {
      icon: '',
      jsx: <></>,
    },
  };

  if (!summary) {
    return tabReadingData;
  }

  tabReadingData.sys = getTabReadingInfo({
    noOfDaysRangeImproved: summary.noOfDaysRangeImprovedSys,
    noOfCurrentDaysAboveBenchmark: summary.noOfCurrentDaysAboveBenchmarkSys,
  });
  tabReadingData.dia = getTabReadingInfo({
    noOfDaysRangeImproved: summary.noOfDaysRangeImprovedDia,
    noOfCurrentDaysAboveBenchmark: summary.noOfCurrentDaysAboveBenchmarkDia,
  });

  return tabReadingData;
}

function getTabReadingInfo(summary) {
  let tabReadingData = {
    icon: '',
    jsx: <></>,
  };

  if (!summary) {
    return tabReadingData;
  }

  let noOfDaysRangeImproved = summary.noOfDaysRangeImproved;
  let noOfCurrentDaysAboveBenchmark = summary.noOfCurrentDaysAboveBenchmark;

  noOfDaysRangeImproved = isNaN(noOfDaysRangeImproved)
    ? 0
    : noOfDaysRangeImproved * 1;
  noOfCurrentDaysAboveBenchmark = isNaN(noOfCurrentDaysAboveBenchmark)
    ? 0
    : noOfCurrentDaysAboveBenchmark * 1;

  let isDecreasingTrend = noOfDaysRangeImproved * 1 < 0;

  tabReadingData.icon = isDecreasingTrend ? (
    <UIDecreasingTrendIcon />
  ) : (
    <UIHandwithWatchIcon />
  );

  let trendText =
    noOfDaysRangeImproved == 0
        ? t('trends.year.same')
        : noOfDaysRangeImproved < 0
        ? t('trends.year.less',{value:-1 * noOfDaysRangeImproved })
        : t('trends.year.more',{value:1 * noOfDaysRangeImproved });
  tabReadingData.jsx = (
    <>
      <Text style={{...Fonts.h3, ...Fonts.fontMedium}}>
        <Text style={{...Fonts.fontBold}}>
          { t('trends.months',{count:noOfCurrentDaysAboveBenchmark, ordinal: true })}
        </Text>{` ${t('trends.benchmark')} \n ${trendText}`}
      </Text>
    </>
  );

  return tabReadingData;
}
