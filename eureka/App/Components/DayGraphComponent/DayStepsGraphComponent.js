import React, {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
import {View, Text} from 'react-native';
import styles from '../WeekGraphComponent/style';
import {
  UIHandwithWatchIcon,
  UIDecreasingTrendIcon,
  UIGenericPlaceholder,
} from '../../Components/UI';
import {TabDateNav} from '../TabDateNav';
import {TabReading} from '../TabReading';
import {TabTimeRange} from '../TabTimeRange';
import LinearGradient from 'react-native-linear-gradient';
import {Translate} from '../../Services/Translate';
import {DayBrowser} from '../../Chart/AppUtility/DateTimeUtils';
import {
  getStepsDataForDay,
  constGetStepGoal,
} from '../../Chart/VizApi/StepsDataService';
import {convertDailyStepsData} from '../../Chart/VizDataConverter/DailyStepsDataConverter';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import LineChart from '../../Chart/GraphComponents/LineChart';
import BarChart from '../../Chart/GraphComponents/BarChart';
import {t} from 'i18n-js';

let _tempDateBrowser = new DayBrowser();
let temp1 = _tempDateBrowser.next();
let temp2 = _tempDateBrowser.previous();

const initState = {
  dataLoading: true,
  dataFetchError: false,
  data: null,
  previousData: null,
};

export function DayStepsGraphComponent() {
  const [containerState, setContainerState] = useState({
    ...initState,
    dateFragment: temp1,
    previousDateFragment: temp2,
  });
  const [dateBrowser, setDateBrowser] = useState(new DayBrowser());

  useEffect(() => {
    changeDateAndRenderData(true);
  }, []);

  //Method to change the date and act as a wrapper for data fetch and load
  function changeDateAndRenderData(isNext) {
    let fragment = null;
    let previousFragment = null;
    if (isNext) {
      fragment = dateBrowser.next();
    } else {
      fragment = dateBrowser.previous();
    }

    previousFragment = dateBrowser.previous();
    dateBrowser.next();

    fetchDataAndSetState(fragment, previousFragment);
  }

  /** Method to fetch data and set graph and associated components rendering states*/
  async function fetchDataAndSetState(dateFragment, previousDateFragment) {
    setContainerState({
      ...initState,
      dataLoading: true,
      dateFragment: dateFragment,
      previousDateFragment: previousDateFragment,
    });

    try {
      let currentData = await getStepsDataForDay(dateFragment.start);
      let previousData = await getStepsDataForDay(previousDateFragment.start);
      console.log('current steps data', currentData);
      if (
        !currentData ||
        Object.keys(currentData).length == 0 ||
        currentData.steps_data.length == 0
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
        data: currentData,
        previousData: previousData,
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

  let viz_container = null;
  let dateInWordsEnd = containerState.dateFragment.end.dateInWords;
  let dateInWordsStart = containerState.dateFragment.start.dateInWords;

  let dateInWords = dateInWordsStart + ' - ' + dateInWordsEnd;
  let isCurrent = containerState.dateFragment.isCurrent;

  let _startTs = containerState.dateFragment.start.ts;
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
        message={Translate('StepsWalkedScreen.noData')}
      />
    );
  } else {
    viz_container = (
      <DailyStepsGraphWrapperContainer
        startTs={_startTs}
        endTs={_endTs}
        vitalData={containerState.data}
        previousVitalData={containerState.previousData}
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* date component */}
      <TabDateNav
        title={dateInWords}
        onLeftPress={() => {
          changeDateAndRenderData(false);
        }}
        onRightPress={() => {
          if (isCurrent) return;

          changeDateAndRenderData(true);
        }}
        leftIconDisableState={false}
        rightIconDisableState={isCurrent}
      />
      {viz_container}
    </View>
  );
}

/**
 * Graph and its associated functional component. We wrap this in the higher order WeekGraphComponent functional component.
 */
function DailyStepsGraphWrapperContainer({
  startTs,
  endTs,
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
    _vitalData,
    _previousVitalData,
  );

  if (!_vizData) {
    return (
      <Text>
        {t('noDataRendered')}
      </Text>
    );
  }
  return <DailyStepsGraphSubContainer vizData={_vizData} />;
}

function DailyStepsGraphSubContainer({vizData}) {
  let comparisonData = getComparisonData(vizData);

  let headingData = getTopLabel(vizData);

  let barHeadingData = getBarHeadingData(vizData);
  let barComparisonData = getBarComparisonData(vizData);

  let jsx = (
    <>
      <View style={[styles.seperator, {paddingBottom: 20}]}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
          >
            {/* reading component */}

            <TabReading
              topTitle={headingData.topText}
              subTitle={headingData.bottomText}
            />

            {/* Bar graph area */}
            <View style={[styles.graphArea, {marginBottom: 25}]}>
              <LineChart data={vizData} />
            </View>

            {/* time range component */}
            <TabTimeRange
              iconLeft={comparisonData.icon}
              rangeSummaryText={<Text>{comparisonData.text}</Text>}
            />
          </LinearGradient>
      </View>

      <View style={[ {paddingBottom: 20}]}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['#F6FCFF', '#fff']}
          >
            {/* reading component */}

            <TabReading
              topTitle={barHeadingData.topText}
              subTitle={barHeadingData.bottomText}
            />

            {/* graph area */}
            <View style={[styles.graphArea, {marginBottom: 25}]}>
              <BarChart data={vizData} vitalType={VITAL_CONSTANTS.KEY_STEPS} />
            </View>

            {/* time range component */}
            <TabTimeRange
              iconLeft={barComparisonData.icon}
              rangeSummaryText={<Text>{barComparisonData.text}</Text>}
            />
          </LinearGradient>
      </View>
    </>
  );

  return jsx;
}

function convertToViewData(startTs, endTs, currentData, previousData) {
  if (
    !currentData ||
    Object.keys(currentData).length == 0 ||
    !currentData.steps_data ||
    currentData.steps_data.length == 0
  ) {
    return null;
  }

  if (
    !previousData ||
    Object.keys(previousData).length == 0 ||
    !previousData.steps_data ||
    previousData.steps_data.length == 0
  ) {
    previousData = {};
    previousData.steps_data = [];
  }

  try {
    return convertDailyStepsData(
      currentData,
      previousData,
      constGetStepGoal(),
      startTs,
      endTs,
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function getComparisonData(vizData) {
  return {
    icon:
      vizData.stepComparisonValue > 0 ? (
        <UIHandwithWatchIcon />
      ) : (
        <UIDecreasingTrendIcon />
      ),
    text: vizData.comparisonLabel,
  };
}

function getTopLabel(vizData) {
  return {
    topText: vizData.totalSteps + '',
    bottomText:
      vizData.totalSteps < vizData.stepGoal
        ?  t('DayStepsGraphComponent.stepsGoal.less',{stepGoal:vizData.stepGoal})
        : t('DayStepsGraphComponent.stepsGoal.more',{stepGoal:vizData.stepGoal}),
  };
}

function getBarComparisonData(vizData) {
  return {
    icon:
      vizData.stepComparisonValue > 0 ? (
        <UIHandwithWatchIcon />
      ) : (
        <UIDecreasingTrendIcon />
      ),
    text:
      vizData.maxByHour.steps == 0
        ? t('DayStepsGraphComponent.barComparsion.none')
        : t('DayStepsGraphComponent.barComparsion.more',{steps:vizData.maxByHour.steps, between:vizData.maxByHour.label})
  };
}

function getBarHeadingData(vizData) {
  return {
    topText: vizData.averageHourlySteps + '',
    bottomText: t('DayStepsGraphComponent.average'),
  };
}
