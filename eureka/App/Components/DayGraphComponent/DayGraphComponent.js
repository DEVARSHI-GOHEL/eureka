import React, {useEffect, useState, useRef} from 'react';
import _ from 'lodash';
import {View, TouchableOpacity} from 'react-native';
import styles from './style';
import {
  UIHandwithWatchIcon,
  UIDecreasingTrendIcon,
  UIButton,
  UIVitalBoundModal,
  UITimeRangeModal,
} from '../../Components/UI';
import {TabDateNav} from '../TabDateNav';
import {TabReading} from '../TabReading';
import {TabTimeRange} from '../TabTimeRange';
import {TabReadingUnit} from '../TabReadingUnit';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts} from '../../Theme';
import {getDailyGeneralData} from '../../Chart/VizApi/DailyGeneralVitalDataService';
import {convertDailyGeneralData} from '../../Chart/VizDataConverter/DailyGeneralDataConverter';
import moment from 'moment';
import DailyScatterPlot from '../../Chart/GraphComponents/DailyScatterPlot';
import {
  DayBrowser,
  isToday,
  getDateTimeInfo,
} from '../../Chart/AppUtility/DateTimeUtils';
import {
  VITAL_CONSTANTS,
} from '../../Chart/AppConstants/VitalDataConstants';
import {UIGenericPlaceholder} from '../UI/UIGenericPlaceholder';
import {Translate, useTranslation} from '../../Services/Translate';
import HealthDetailComponent from '../HealthDetailComponent/HealthDetailComponent';
import {VitalDataListType} from '../HealthDetailComponent/utils';
import {
  INSTANT_MEASURE_STATE,
  WATCH_BATTERY_STATE,
  WATCH_WRIST_STATE,
} from '../../constants/AppDataConstants';
import startMeasure from '../../utils/startMeasure';
import {useSelector} from 'react-redux';
import {getVitalDataBoundsNameAndUnit} from "../../Chart/AppConstants/VitalDataTool";
import {MEASURE_TYPE} from "../../constants/MeasureUIConstants";

const DayGraphComponentInitialState = {
  dataLoading: true,
  dataFetchError: false,
  data: null,
};

export function DayGraphComponent({vitalType, navigation}) {
  const [containerState, setContainerState] = useState({
    ...DayGraphComponentInitialState,
    dateFragment: new DayBrowser().next(),
  });
  const [dateBrowser, setDateBrowser] = useState(new DayBrowser());
  const [measureBtnDisabled, setmeasureBtnDisabled] = useState(true);
  const [scrollCalled, setscrollCalled] = useState(true);

  const {
    measureState,
    percentage,
    watchBatteryValue,
    watchWristValue,
  } = useSelector((state) => ({
    measureState: state.measure.operationState,
    percentage: state.measure.percentage,
    watchBatteryValue: state.watch.watchBatteryValue,
    watchWristValue: state.watch.watchWristValue,
  }));

  useEffect(() => {
    let measureBtnDisabled =
      watchBatteryValue == WATCH_BATTERY_STATE.LOW ||
      watchWristValue == WATCH_WRIST_STATE.NOT_ON_WRIST;
    setmeasureBtnDisabled(measureBtnDisabled);
  }, [watchBatteryValue, watchWristValue]);

  useEffect(() => {
    changeDateAndRenderData(true, vitalType);
    setTimeout(() => {
      setscrollCalled(false);
    }, 2500);
  }, []);

  //Method to change the date and act as a wrapper for data fetch and load
  function changeDateAndRenderData(isNext, vitalType) {
    let fragment = null;
    if (isNext) {
      fragment = dateBrowser.next();
    } else {
      fragment = dateBrowser.previous();
      setscrollCalled(true);
      setTimeout(() => setscrollCalled(false), 2000);
    }

    fetchDataAndSetState(fragment, vitalType);
  }

  /** Method to fetch data and set graph and associated components rendering states*/
  function fetchDataAndSetState(dateFragment, vital_type) {
    setContainerState({
      ...DayGraphComponentInitialState,
      dataLoading: true,
      dateFragment: dateFragment,
    });

    let startTs = dateFragment.start.ts;
    let endTs = dateFragment.end.ts;

    getDailyGeneralData(startTs, endTs, vital_type, false)
      .then((data) => {
        if (
          !data ||
          data.length == 0 ||
          !data.vital_data ||
          data.vital_data.length == 0
        ) {
          setContainerState({
            ...DayGraphComponentInitialState,
            dataLoading: false,
            dataFetchError: true,
            dateFragment: dateFragment,
          });
          return;
        }
        //do stuff with data
        setContainerState({
          ...containerState,
          dataLoading: false,
          dataFetchError: false,
          data: data,
          dateFragment: dateFragment,
        });
      })
      .catch((e) => {
        //An error was faced
        setContainerState({
          ...DayGraphComponentInitialState,
          dataLoading: false,
          dataFetchError: true,
          dateFragment: dateFragment,
        });
      });
  }

  let viz_container = null;

  let dateTime = '';

  let dateTimeObj = getDateTimeInfo(containerState.dateFragment.end.ts);

  let date = isToday(containerState.dateFragment.end.ts)
    ? Translate('commonHomeDetails.todayHeading')
    : dateTimeObj.dateInWords;

  dateTime = date;

  let isCurrent = containerState.dateFragment.isCurrent;
  let _startTs = containerState.dateFragment.start.ts;
  // if (isToday(containerState.dateFragment.end.ts)) {
  //   _startTs = moment(containerState.dateFragment.end.ts).subtract(3, 'hours');
  // }
  let _endTs = containerState.dateFragment.end.ts;

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
      <DayGraphContainer
        startTs={_startTs}
        endTs={_endTs}
        vitalType={vitalType}
        vitalData={containerState.data}
        changeDateAndRenderData={changeDateAndRenderData}
        isToday={isToday}
        scrollCalled={scrollCalled}
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* date component */}
      <TabDateNav
        title={dateTime}
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
 * Graph and its associated functional component. We wrap this in the higher order DayGraphComponent functional component.
 */
function DayGraphContainer({
  startTs,
  endTs,
  vitalType,
  vitalData,
  changeDateAndRenderData,
  scrollCalled,
}) {
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState(false);
  const [vitalBoundModalVisible, setVitalBoundModalVisible] = useState(false);
  const trn = useTranslation("dayGraphContainer");

  let __data = vitalData;
  let _vitalData = JSON.parse(JSON.stringify(__data));
  let _vizData = convertToViewData(startTs, endTs, _vitalData, vitalType);

  const TabReadingUnitRef = useRef();

  function setReading(data) {
    TabReadingUnitRef.current.setReading(data);
  }

  if (!_vizData) {
    if (_vitalData?.vital_data){
      return (
        <UIGenericPlaceholder
          noDataIcon={true}
          visiblity={true}
          message={Translate('commonHomeDetails.noData')}
        />
      );

    }
    return (<UIGenericPlaceholder
        errorIcon={true}
        visiblity={true}
        message={trn.dataPlaceholder}
      />
    )

  }

  let vitalTypeButton = (
    <UIButton
      style={[styles.bttn, {marginBottom: 20}]}
      mode="outlined"
      onPress={() => setVitalBoundModalVisible(true)}>
      {getVitalDataBoundsNameAndUnit(vitalType).name }
    </UIButton>
  );

  return (
    <>
      <View style={styles.tabGraphAreaWrap}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={['#F6FCFF', '#fff']}
          style={styles.gradientContainer}>
          {/* reading component */}
          <TabReading title={trn.tabReading} />
          {/* time range component */}
          <TabTimeRange
            iconLeft={
              _vizData.inRange.value > 70 ? (
                <UIHandwithWatchIcon />
              ) : (
                <UIDecreasingTrendIcon />
              )
            }
            range={_vizData.inRange.value + '%'}
            text={_vizData.inRange.text}
            iconRight={
              vitalType != VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE ? (
                <></>
              ) : (
                <TouchableOpacity
                  onPress={() => setTimeRangeModalVisible(true)}
                  accessible={false}>
                  <FeatherIcon name="info" style={styles.infoIconColor} />
                </TouchableOpacity>
              )
            }
          />

          {/* graph area */}
          <View style={styles.graphArea}>
            <DailyScatterPlot
              data={_vizData}
              startTs={startTs}
              endTs={endTs}
              vitalData={_vitalData}
              vitalType={vitalType}
              onInteract={setReading}
              changeDateAndRenderData={changeDateAndRenderData}
              scrollCalled={scrollCalled}
            />
          </View>
        </LinearGradient>

        {/* reading mg/dl */}
        <TabReadingUnit
          ref={TabReadingUnitRef}
          initData={{
            meta: _vizData.lastData,
            convertGlucoseData: _vizData.convertGlucoseData,
          }}
        />

        {/* button for blood glucose bounds */}
        {vitalTypeButton}

        <UITimeRangeModal
          timeRangeModalCloseFun={() => setTimeRangeModalVisible(false)}
          visiblity={timeRangeModalVisible}
        />

        <UIVitalBoundModal
          vitalTypeProp={vitalType}
          vitalBoundModalCloseFun={() => setVitalBoundModalVisible(false)}
          visiblity={vitalBoundModalVisible}
        />
      </View>

      <HealthDetailComponent
        data={_vitalData}
        vitalType={vitalType}
        type={VitalDataListType.DAILY}
      />
    </>
  );
}

function convertToViewData(startTs, endTs, dailyVitalData, vital_type) {
  if (
    !dailyVitalData ||
    Object.keys(dailyVitalData).length == 0 ||
    !dailyVitalData.vital_data ||
    dailyVitalData.vital_data.length == 0
  ) {
    return null;
  }

  // filter vital_data from unsuccesfull measurements
  const filterdVitalData = dailyVitalData.vital_data.filter((vitalRecord) => {
    return !( vitalRecord.type == MEASURE_TYPE.U);
  });
  const filteredDailyVital = {...dailyVitalData, vital_data: filterdVitalData};

  let now;

  if (isToday(endTs)) {
    now = moment().valueOf();
  } else {
    now = moment(endTs);
    now = now.endOf('day').valueOf();
  }

  try {
    let result = convertDailyGeneralData(
      filteredDailyVital,
      startTs,
      now,
      vital_type,
    );
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}
