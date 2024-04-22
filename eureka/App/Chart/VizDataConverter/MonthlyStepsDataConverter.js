import {addDateInfoToDataFragment, getMonthlyDatesMap, getSortedDatesArray,} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS,} from '../AppConstants/VitalDataConstants';
import {aggregateDays, getRoundedCeil} from "./tools";

export function convertMonthlyStepsData(
  currentStepsData,
  stepGoal,
  startTs,
  endTs,
) {
  if (
    !currentStepsData ||
    !currentStepsData.steps_data ||
    currentStepsData.steps_data.length == 0
  ) {
    return null;
  }

  let convertedStepsData = convertStepsData(
    currentStepsData.steps_data,
    stepGoal,
    startTs,
    endTs,
  );

  let scales = getStepsScaleData(convertedStepsData);

  return {
    ...convertedStepsData,
    ...scales,
  };
}

function convertStepsData(currentStepsData, stepGoal = 1000, startTs, endTs) {
  //Find the week day name orders
  let currentBucket = getMonthlyDatesMap(startTs, endTs);

  let arrOfDates = getSortedDatesArray(currentBucket);
  let sortedDateArr = arrOfDates.dateKeysArr;
  // let daysOfMonthArr = getDaysArray(moment(endTs).day());
  let daysOfMonthArr = sortedDateArr;
  let bucket = {};

  console.log('sortedDateArr', sortedDateArr);
  daysOfMonthArr.forEach((day_name) => {
    bucket[day_name] = {
      total: 0,
      label: day_name,
    };
  });

  let totalSteps = 0;
  let averageStepsPerDay = 0;

  let dailyMaxTotalSteps = stepGoal;

  const aggregatedDays = aggregateDays(currentStepsData);
  aggregatedDays.forEach((stepsData) => {
    stepsData.ts = stepsData[VITAL_CONSTANTS.KEY_TS] * 1;

    const data = addDateInfoToDataFragment(stepsData);


    let value = data[VITAL_CONSTANTS.KEY_STEPS] * 1;
    totalSteps += value;

    bucket[data.day].total = value;
    bucket[data.day].label = data.dateInWordsShort;
    bucket[data.day].dateInWordsShort = data.dateInWordsShort;

    if (bucket[data.day].total > dailyMaxTotalSteps) {
      dailyMaxTotalSteps = bucket[data.day].total;
    }
  });


  const daysCount = Object.keys(bucket).length;

  averageStepsPerDay = Math.round(totalSteps / daysCount);
  const bar_max_y = getRoundedCeil(dailyMaxTotalSteps);

  let barChartData = [];

  let stepGoalReachedCount = 0;

  //create bar chart bucket
  daysOfMonthArr.forEach((day_name) => {
    if (bucket[day_name].total >= stepGoal) {
      stepGoalReachedCount += 1;
    }

    barChartData.push({
      x: day_name,
      y: bucket[day_name].total,
      label: bucket[day_name].label,
      stepGoalMet: bucket[day_name].total >= stepGoal,
    });
  });

  let bucketKeys = [];
  daysOfMonthArr.forEach((day) => {
    bucketKeys.push(bucket[day].dateInWordsShort);
  });

  return {
    bar_max_y,
    stepGoal,

    barChartData,
    bucket,
    bucketKeys: daysOfMonthArr,
    bucketK: bucketKeys,

    averageStepsPerDay,
    stepGoalReachedCount,
  };
}

function getStepsScaleData(convertedData) {
  return {
    barChartScales: getBarChartScales(convertedData),
  };
}

function getBarChartScales(convertedData) {
  return {
    axisX: getBarChartScaleX(convertedData),
    axisY: getBarChartScaleY(convertedData),
  };
}

function getBarChartScaleX(convertedDataViews) {
  let scaleData = {};

  let arr = convertedDataViews.bucketK;

  let i = 0;
  for (let item of arr) {
    if (item) {
      let _label = '';
      let _value = '';
      let arr = item.split(' ');

      if (i % 7 == 0) {
        let tempLabel = arr[0].substr(0, 3) + ' ' + arr[1];
        _label = tempLabel;
      }
      _value = arr[1];

      scaleData[item] = {
        label: _label,
        value: _value,
      };
      i++;
    }
  }

  return scaleData;
}

function getBarChartScaleY(convertedDataViews) {
  let _mid = Math.round(convertedDataViews.bar_max_y / 2);
  return {
    start: {label: '0', value: 0},
    mid: {label: _mid, value: _mid},
    end: {
      label: convertedDataViews.bar_max_y,
      value: convertedDataViews.bar_max_y,
    },
    scale_label: {label: '', value: 0},
  };
}
