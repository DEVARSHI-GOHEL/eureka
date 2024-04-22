import moment from 'moment';
import {t} from 'i18n-js';

import {getAbsoluteHourInAmPm, getDateString, getShortHour, isToday,} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS} from '../AppConstants/VitalDataConstants';
import {getRoundedCeil} from "./tools";

const HOUR_AS_MILLISECONDS = 3600000;

export function convertDailyStepsData(
  currentStepsData,
  previousStepsData,
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

  if (
    !previousStepsData ||
    !previousStepsData.steps_data ||
    previousStepsData.steps_data.length == 0
  ) {
    previousStepsData = {};
    previousStepsData.steps_data = [];
  }

  let convertedStepsData = convertStepsData(
    currentStepsData.steps_data,
    previousStepsData.steps_data,
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

const addMissingHours = (incomingArray) => {
  if (incomingArray.length < 2) return incomingArray;

  let resultingArray = [...incomingArray];
  let nextHour;
  let tempData;
  let isFinishedCycle = false;

  while (!isFinishedCycle) {
    resultingArray.forEach((itemData, index) => {
      const hour = moment(itemData[VITAL_CONSTANTS.KEY_TS]).hour();

      if (nextHour && nextHour < hour) {
        const obj = { ...tempData };
        obj[VITAL_CONSTANTS.KEY_TS] = obj[VITAL_CONSTANTS.KEY_TS] + HOUR_AS_MILLISECONDS;
        obj[VITAL_CONSTANTS.KEY_STEPS] = 0;
        resultingArray.splice(index, 0, obj);
      }
      tempData = itemData;
      nextHour = hour == 23 ? 0 : hour + 1;
      isFinishedCycle = index === resultingArray.length - 1;
    });
  };
  return resultingArray;
}

function convertStepsData(
    rawStepsData,
    previousStepsData = [],
    stepGoal = 1000,
) {
  const currentStepsData = addMissingHours(rawStepsData);

  let linePlotData = [];
  let hourBarPlotData = [];

  let time_min = -1;
  let time_max = -1;

  let currentTotalStepCount = 0;
  let previousTotalStepCount = 0;

  let hour_max_data = 0;
  let hour_max_label = '';

  let lastSteps = 0;

  currentStepsData.forEach((data) => {
    data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;
    if (time_min == -1) {
      time_min = data.ts;
    }

    if (time_max == -1) {
      time_max = data.ts;
    }

    if (data.ts > time_max) {
      time_max = data.ts;
    }

    if (data.ts < time_min) {
      time_min = data.ts;
    }

    //Do hourly bucketing
    const hour = moment(data.ts).hour();
    const nextHour = hour == 23 ? 0 : hour + 1;

    const hourInAmPm = getAbsoluteHourInAmPm(hour);
    const nextHourInAmPm = getAbsoluteHourInAmPm(nextHour);
    const hourLabel = hourInAmPm + ' - ' + nextHourInAmPm;

    const hourSteps = data[VITAL_CONSTANTS.KEY_STEPS]
      ? data[VITAL_CONSTANTS.KEY_STEPS] - lastSteps : 0;

    if (data[VITAL_CONSTANTS.KEY_STEPS]) lastSteps = data[VITAL_CONSTANTS.KEY_STEPS];
    
    if (!hourBarPlotData[hour]) {
      hourBarPlotData[hour] = {
        x: hour,
        y: hourSteps,
        label: hourLabel,
      };

    } else {
      hourBarPlotData[hour].y += data[VITAL_CONSTANTS.KEY_STEPS];
    }

    if (hourBarPlotData[hour].y > hour_max_data) {
      hour_max_data = hourBarPlotData[hour].y;
      hour_max_label = hourLabel;
    }

    currentTotalStepCount += hourSteps;

    linePlotData.push({
      x: moment(data.ts).toDate(),
      y: currentTotalStepCount,
    });
  });

  previousStepsData.forEach((_data) => {
    if (previousTotalStepCount < _data[VITAL_CONSTANTS.KEY_STEPS]) {
      previousTotalStepCount = _data[VITAL_CONSTANTS.KEY_STEPS];
    }
  });

  let diff = currentTotalStepCount - previousTotalStepCount;
  let previousDayTextIdentifier = isToday(time_max)
      ? 'yesterday'
      : 'the previous day';
  const diffAbs = diff >= 0 ? diff : -1 * diff;
  const comparisonLabel = t(diff > 0 ? 'DayStepsGraphComponent.takenSteps.more' : 'DayStepsGraphComponent.takenSteps.less', {
    diff,
    prev: previousDayTextIdentifier
  })

  const maxYLine = getRoundedCeil(hour_max_data, 100);
  const recordsCount = Object.keys(hourBarPlotData).length || 1;
  const averageHourlySteps = Math.round(currentTotalStepCount / recordsCount);

  return {
    time_min,
    time_max,
    bar_max_y: maxYLine,

    barChartData: hourBarPlotData,
    bucket: hourBarPlotData,
    bucketKeys: Object.keys(hourBarPlotData),

    linePlotData,

    comparisonLabel,
    stepComparisonValue: diff,
    stepGoal,
    totalSteps: currentStepsData[currentStepsData.length - 1].steps,
    averageHourlySteps,
    previousTotalStepCount,

    maxByHour: {
      steps: hour_max_data,
      label: hour_max_label,
    },

    barPadding: 0.3,
  };
}

function getStepsScaleData(convertedData) {
  return {
    lineChartScales: getLinePlotScales(convertedData),
    barChartScales: getBarChartScales(convertedData),
  };
}

function getLinePlotScales(convertedData) {
  return {
    axisX: getLineChartScaleX(convertedData),
    axisY: getLineChartScaleY(convertedData),
  };
}

function getBarChartScales(convertedData) {
  return {
    axisX: getBarChartScaleX(convertedData),
    axisY: getBarChartScaleY(convertedData),
  };
}

function getLineChartScaleX(convertedDataViews) {
  const startTs = convertedDataViews.time_min;
  const endTs = convertedDataViews.time_max;

  const extraTime = (
    convertedDataViews.bucketKeys?.length === 1
    || endTs % HOUR_AS_MILLISECONDS !== 0
  ) ? 1 : 0;


  const today = getDateString(endTs);

  const currentStartHour = moment(startTs).hour();
  const currentEndHour = moment(endTs).hour() + extraTime;
  
  let currentStartTimeStr = '';
  let currentEndTimeStr = '';

  let startLabel = '';
  let endLabel = '';

  if (currentStartHour < 10) {
    currentStartTimeStr = 'T0' + currentStartHour + ':00:00';
  } else {
    currentStartTimeStr = 'T' + currentStartHour + ':00:00';
  }

  if (currentEndHour < 23) {
    if (currentEndHour < 10) {
      currentEndTimeStr = 'T0' + currentEndHour + ':00:00';
    } else {
      currentEndTimeStr = 'T' + currentEndHour + ':00:00';
    }
  } else {
    currentEndTimeStr = 'T23:59:59';
  }

  let start_date_str = today + currentStartTimeStr;
  let end_date_str = today + currentEndTimeStr;
  
  let _startMoment = moment(start_date_str);
  let _endMoment = moment(end_date_str);

  startLabel = getShortHour(_startMoment.toDate().getTime());
  endLabel = getShortHour(_endMoment.toDate().getTime());

  if (endLabel == '11 pm') {
    endLabel = '<12 am';
  }

  return {
    ts_scale_start: {
      label: startLabel,
      val: _startMoment.toDate().getTime(),
      date: _startMoment.toDate(),
    },
    ts_scale_end: {
      label: endLabel,
      val: _endMoment.toDate().getTime(),
      date: _endMoment.toDate(),
    },
  };
}

function getLineChartScaleY(convertedDataViews) {
  const setStepGoalAsMax =
    convertedDataViews.stepGoal > convertedDataViews.totalSteps + 100;
  const max = setStepGoalAsMax
    ? convertedDataViews.stepGoal
    : convertedDataViews.totalSteps + 100;
  const mid = Math.round(max / 2);
  return {
    start: {label: '0', value: 0},
    mid: {label: mid, value: mid},
    end: {label: max, value: max},
    scale_label: {label: '', value: 0},
  };
}

function getBarChartScaleX(convertedDataViews) {
  const scaleData = {};

  const hoursArr = convertedDataViews.bucketKeys;

  hoursArr.forEach((item) => {
    item = item * 1;
    let _label = '';

    if (item == 0) {
      _label = '12am';
    } else if (item == 23) {
      _label = '<12am';
    } else if (item == hoursArr.length - 1) {
      _label = '<' + getAbsoluteHourInAmPm(item + 1);
    }

    scaleData[item] = {
      label: _label,
      value: item,
    };
  });

  return scaleData;
}

function getBarChartScaleY(convertedDataViews) {
  const _mid = Math.round(convertedDataViews.bar_max_y / 2);
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
