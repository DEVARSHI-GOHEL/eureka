import React, {memo} from 'react';
import {View, Text} from 'react-native';
import {t} from 'i18n-js';

import BarChart from '../../Chart/GraphComponents/BarChart';
import LinearGradient from 'react-native-linear-gradient';

import {TabReading} from '../TabReading';
import {TabTimeRange} from '../TabTimeRange';
import {UIHandwithWatchIcon, UIDecreasingTrendIcon} from '../UI';
import {
  VITAL_CONSTANTS,
  PERIOD_NAME,
} from '../../Chart/AppConstants/VitalDataConstants';
import {constGetStepGoal} from '../../Chart/VizApi/StepsDataService';

import {convertMonthlyStepsData} from '../../Chart/VizDataConverter/MonthlyStepsDataConverter';
import {convertWeeklyStepsData} from '../../Chart/VizDataConverter/WeeklyStepsDataConverter';
import {convertYearlyStepsData} from '../../Chart/VizDataConverter/YearlyStepsDataConverter';

import {Colors} from '../../Theme';
import styles from './style';

export default memo(({startTs, endTs, vitalData: _data}) => {
  const vitalData = JSON.parse(JSON.stringify(_data));
  const vizData = convertToViewData(startTs, endTs, vitalData);

  if (!vizData) {
    return (
      <Text>
        {t('noDataRendered')}
      </Text>
    );
  }

  const barHeadingData = getBarHeadingData(vizData);
  const barComparisonData = getBarComparisonData(vizData);

  return (
    <View style={[styles.tabContent, {paddingBottom: 20}]}>
      <View style={styles.tabGraphAreaWrap}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={Colors.linearGradient}
          style={styles.gradientContainer}>
          <TabReading
            topTitle={barHeadingData.topText}
            subTitle={barHeadingData.bottomText}
          />
          <View style={[styles.graphArea, {marginBottom: 25}]}>
            <BarChart data={vizData} vitalType={VITAL_CONSTANTS.KEY_STEPS} />
          </View>
          <TabTimeRange
            iconLeft={barComparisonData.icon}
            rangeSummaryText={<Text>{barComparisonData.text}</Text>}
          />
        </LinearGradient>
      </View>
    </View>
  );
});

function convertStepsData(key) {
  switch (key) {
    case PERIOD_NAME.week:
      return convertWeeklyStepsData;
    case PERIOD_NAME.month:
      return convertMonthlyStepsData;
    case PERIOD_NAME.year:
      return convertYearlyStepsData;
    default:
      () => null;
  }
}

function convertToViewData(startTs, endTs, currentData) {
  if (
    !currentData ||
    Object.keys(currentData).length == 0 ||
    !currentData.steps_data ||
    currentData.steps_data.length == 0
  ) {
    return null;
  }

  try {
    return {
      ...convertStepsData(currentData.key)(
        currentData,
        constGetStepGoal(),
        startTs,
        endTs,
      ),
      key: currentData.key,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function getBarComparisonData(vizData) {
  let period = PERIOD_NAME[vizData.key] || 'none';

  return {
    icon:
      vizData.stepGoalReachedCount > 0 ? (
        <UIHandwithWatchIcon />
      ) : (
        <UIDecreasingTrendIcon />
      ),
    text:
      vizData.stepGoalReachedCount > 0
        ? t('StepsGraphWrapperContainer.goals.more',{stepGoal:vizData.stepGoal,count:vizData.stepGoalReachedCount, period })
        : t('StepsGraphWrapperContainer.goals.less',{ period })
  };
}

function getBarHeadingData(vizData) {
  return {
    topText: vizData.averageStepsPerDay + '',
    bottomText: t('StepsGraphWrapperContainer.average'),
  };
}
