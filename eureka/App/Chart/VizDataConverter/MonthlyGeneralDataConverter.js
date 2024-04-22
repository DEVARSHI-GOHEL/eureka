import moment from 'moment';
import {t} from 'i18n-js';
import {
  getDateString,
  getShortHour,
  addDateInfoToDataFragment,
  getDaysArray,
  getAbsoluteHourInAmPm,
} from '../AppUtility/DateTimeUtils';
import {
  VITAL_CONSTANTS,
  WARNING_RANGE,
  DATA_BOUNDS,
  MEASURE_TREND,
  getScaleData,
} from '../AppConstants/VitalDataConstants';
import {
  getLabelByDataType,
} from '../AppUtility/ChartAxisUtils';

import {toMMOL} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {
  getMonthlyDatesMap,
  getSortedDatesArray,
} from '../../Chart/AppUtility/DateTimeUtils';

export function convertMonthlyGeneralData(
  monthlyGeneralData,
  monthlyGeneralPreviousData,
  startTs,
  endTs,
  previousStartTs,
  previousEndTs,
  vital_type,
) {
  if (
    !monthlyGeneralData ||
    Object.keys(monthlyGeneralData).length == 0 ||
    monthlyGeneralData.vital_data.length == 0
  ) {
    return null;
  }

  let renderPreviousLine = true;
  if (
    !monthlyGeneralPreviousData ||
    Object.keys(monthlyGeneralPreviousData).length == 0 ||
    monthlyGeneralPreviousData.vital_data.length == 0
  ) {
    monthlyGeneralPreviousData = {};
    monthlyGeneralPreviousData.vital_data = [];
    renderPreviousLine = false;
  }

  let isBpData =
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW;
  var convertedDataViews = isBpData
    ? convertBpVitalData(
        startTs,
        endTs,
        previousStartTs,
        previousEndTs,
        monthlyGeneralData,
        monthlyGeneralPreviousData,
        vital_type,
      )
    : convertGeneralVitalData(
        startTs,
        endTs,
        previousStartTs,
        previousEndTs,
        monthlyGeneralData,
        monthlyGeneralPreviousData,
        vital_type,
        monthlyGeneralData.convertGlucoseData,
      );

  var scaleData = getMonthlyGeneralVisualizationScaleData(
    vital_type,
    convertedDataViews,
    monthlyGeneralData.convertGlucoseData,
  );

  var data = {
    startTs,
    endTs,
    ...scaleData,
    ...convertedDataViews,
    dualPlot: isBpData,
    renderPreviousLine,
  };

  return data;
}

function convertGeneralVitalData(
  startTs,
  endTs,
  previousStartTs,
  previousEndTs,
  dataCurrent,
  dataPrevious,
  vital_param_type,
  convertGlucoseData,
) {
  //change
  let vitalDataCurrent = dataCurrent.vital_data;
  let vitalDataPrevious = dataPrevious.vital_data;
  //bar
  var barChartData = [];

  //daily average
  var currentComparisonDailyLineData = [];
  var previousComparisonDailyLineData = [];
  var scatterPlotData = [];
  var minScatterData = [];
  var maxScatterData = [];
  var minmaxLineData = [];

  var currentComparisonHourlyLineData = [];
  var previousComparisonHourlyLineData = [];
  var currentComparisonHourlyScatterData = [];

  var bucketByHour = {
    current: [],
    previous: [],
  };

  let _hour = 0;
  while (_hour <= 23) {
    bucketByHour.current.push({total: 0, totalCount: 0, average: 0});
    bucketByHour.previous.push({total: 0, totalCount: 0, average: 0});
    _hour++;
  }

  let currentBucket = getMonthlyDatesMap(startTs, endTs);
  let previousBucket = getMonthlyDatesMap(previousStartTs, previousEndTs);

  let arrOfDates = getSortedDatesArray(currentBucket);
  let sortedDateArr = arrOfDates.dateKeysArr;
  let tsArr = arrOfDates.tsArr;

  console.log('Sorted Date Array', sortedDateArr);

  sortedDateArr.forEach((key, index) => {
    let dateFragment = addDateInfoToDataFragment({ts: tsArr[index]});

    currentBucket[key] = {
      total: 0,
      totalCount: 0,
      countInRange: 0,
      max: 1000,
      min: 0,
      ...dateFragment,
    };
  });

  let prevArrOfDates = getSortedDatesArray(previousBucket);
  let prevSortedDateArr = prevArrOfDates.dateKeysArr;
  let preTsArr = prevArrOfDates.tsArr;

  prevSortedDateArr.forEach((key, index) => {
    let previousDateFragment = addDateInfoToDataFragment({ts: preTsArr[index]});

    previousBucket[key] = {
      total: 0,
      totalCount: 0,
      countInRange: 0,
      ...previousDateFragment,
    };
  });

  let __bucket = {
    current: currentBucket,
    previous: previousBucket,
  };

  let __lastData = null;
  let hourlyLastData = null;

  //Loop through this weeks data if any and start calculating data
  vitalDataCurrent.forEach((data) => {
    //change
    data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;
    data = addDateInfoToDataFragment(data);

    let value = data[vital_param_type] * 1; //change

    __bucket.current[data.day].total = __bucket.current[data.day].total + value;
    __bucket.current[data.day].totalCount =
      __bucket.current[data.day].totalCount + 1;

    if (__bucket.current[data.day].min == 0) {
      __bucket.current[data.day].min = value;
    }

    if (__bucket.current[data.day].max == 1000) {
      __bucket.current[data.day].max = value;
    }

    if (value < __bucket.current[data.day].min) {
      __bucket.current[data.day].min = value;
    }

    if (value > __bucket.current[data.day].max) {
      __bucket.current[data.day].max = value;
    }

    if (
      value >= WARNING_RANGE[vital_param_type].min &&
      value <= WARNING_RANGE[vital_param_type].max
    ) {
      __bucket.current[data.day].countInRange =
        __bucket.current[data.day].countInRange + 1;
    }

    let _moment = moment(data.ts);

    let hour = _moment.hour();

    let timeInWords = getShortHour(data.ts);
    bucketByHour.current[hour].total = bucketByHour.current[hour].total + value;
    bucketByHour.current[hour].totalCount =
      bucketByHour.current[hour].totalCount + 1;
    bucketByHour.current[hour].timeInWords = timeInWords;
  });

  //Loop through previous month's data if any
  vitalDataPrevious.forEach((data) => {
    data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;
    data = addDateInfoToDataFragment(data);

    let value = data[vital_param_type] * 1; //change

    __bucket.previous[data.day].total =
      __bucket.previous[data.day].total + value;
    __bucket.previous[data.day].totalCount =
      __bucket.previous[data.day].totalCount + 1;

    if (
      value >= WARNING_RANGE[vital_param_type].min &&
      value <= WARNING_RANGE[vital_param_type].max
    ) {
      __bucket.previous[data.day].countInRange =
        __bucket.previous[data.day].countInRange + 1;
    }

    let _moment = moment(data.ts);

    let hour = _moment.hour();

    let timeInWords = getShortHour(data.ts);

    bucketByHour.previous[hour].total =
      bucketByHour.previous[hour].total + value;
    bucketByHour.previous[hour].totalCount =
      bucketByHour.previous[hour].totalCount + 1;
    bucketByHour.previous[hour].timeInWords = timeInWords;
  });

  //START DAY OF MONTH AVERAGE, MIN, MAX, CALCULATIONS

  let noOfDaysRangeImproved = 0;
  let noOfCurrentDaysAboveBenchmark = 0;
  let noOfPreviousDaysAboveBenchmark = 0;

  //Start bucketing weekly data and normalize
  sortedDateArr.forEach((dayInDigit, index) => {
    let currentTotalCount = __bucket.current[dayInDigit].totalCount;
    if (currentTotalCount == 0) currentTotalCount = 1;
    let currentCountInRange = __bucket.current[dayInDigit].countInRange;
    let currentTotal = __bucket.current[dayInDigit].total;

    let currentInRangePercent =
      Math.round((currentCountInRange / currentTotalCount) * 100 * 10) / 10;
    let currentAverage =
      Math.round((currentTotal / currentTotalCount) * 10) / 10;

    //if some date is missing from previous month then normalize it
    if (!__bucket.previous[dayInDigit]) {
      __bucket.previous[dayInDigit] = {
        total: 0,
        totalCount: 0,
        countInRange: 0,
      };
    }

    let previousTotalCount = __bucket.previous[dayInDigit].totalCount;
    if (previousTotalCount == 0) previousTotalCount = 1;
    let previousCountInRange = __bucket.previous[dayInDigit].countInRange;
    let previousTotal = __bucket.previous[dayInDigit].total;

    let previousInRangePercent =
      Math.round((previousCountInRange / previousTotalCount) * 100 * 10) / 10;
    let previousAverage =
      Math.round((previousTotal / previousTotalCount) * 10) / 10;

    //Check if this day of the current week had percentage value in range
    if (currentInRangePercent > 70) {
      noOfCurrentDaysAboveBenchmark += 1;
    }

    //Check if this day of the current week had percentage value in range
    if (previousInRangePercent > 70) {
      noOfPreviousDaysAboveBenchmark += 1;
    }

    let _DATA_RANGE = WARNING_RANGE[vital_param_type];

    let fallbackAverage = null;
    let previousFallbackAverage = null;

    let fallbackMax = null;
    let fallbackMin = null;

    //Normalize the values for daily comparison for week
    if (currentAverage < _DATA_RANGE.min) {
      fallbackAverage = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverage > _DATA_RANGE.max) {
      fallbackAverage = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverage < _DATA_RANGE.min) {
      previousFallbackAverage = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverage > _DATA_RANGE.max) {
      previousFallbackAverage = _DATA_RANGE.fallback.averageMax;
    }

    if (__bucket.current[dayInDigit].min < _DATA_RANGE.min) {
      fallbackMin = _DATA_RANGE.fallback.min;
    }

    if (__bucket.current[dayInDigit].min > _DATA_RANGE.max) {
      fallbackMin = _DATA_RANGE.fallback.max;
    }

    if (__bucket.current[dayInDigit].max < _DATA_RANGE.min) {
      fallbackMax = _DATA_RANGE.fallback.min;
    }

    if (__bucket.current[dayInDigit].max > _DATA_RANGE.max) {
      fallbackMax = _DATA_RANGE.fallback.max;
    }

    /*Extra conditions for rendering min max icons and circle icons*/
    if (
      currentAverage == 0 ||
      fallbackAverage == _DATA_RANGE.fallback.averageMin
    ) {
      fallbackMin = 0;
    }

    if (
      currentAverage == 0 ||
      fallbackAverage == _DATA_RANGE.fallback.averageMax
    ) {
      fallbackMax = 0;
    }

    if (fallbackMin == fallbackMax) {
      if (fallbackMin != null) fallbackMin = 0;

      if (fallbackMax != null) fallbackMax = 0;
    }

    //This is for when everything is normal and not out of bounds
    if (currentAverage == __bucket.current[dayInDigit].max) {
      __bucket.current[dayInDigit].skipMax = true; //Important
    }

    if (currentAverage == __bucket.current[dayInDigit].min) {
      __bucket.current[dayInDigit].skipMin = true; ///Important
    }
    /************************************************************************** */

    __bucket.current[dayInDigit].percentInRange = currentInRangePercent;
    __bucket.current[dayInDigit].average = currentAverage;

    __bucket.previous[dayInDigit].percentInRange = previousInRangePercent;
    __bucket.previous[dayInDigit].average = previousAverage;

    if (fallbackAverage != null) {
      __bucket.current[dayInDigit].fallbackAverage = fallbackAverage * 1;
    }

    if (fallbackMax != null) {
      __bucket.current[dayInDigit].fallbackMax = fallbackMax * 1;
    }

    if (fallbackMin != null) {
      __bucket.current[dayInDigit].fallbackMin = fallbackMin * 1;
    }

    if (previousFallbackAverage != null) {
      __bucket.previous[dayInDigit].fallbackAverage =
        previousFallbackAverage * 1;
    }

    let dayInWordsShort = __bucket.current[dayInDigit].dateInWordsShort;

    //Organize weekday bar chart and scatter plot data
    barChartData.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].percentInRange,
    });

    currentComparisonDailyLineData.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].average,
      fallback: __bucket.current[dayInDigit].fallbackAverage,
    });
    previousComparisonDailyLineData.push({
      x: dayInWordsShort,
      y: __bucket.previous[dayInDigit].average,
      fallback: __bucket.previous[dayInDigit].fallbackAverage,
    });

    let maindata = {
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].average,
      fallback: __bucket.current[dayInDigit].fallbackAverage,
    };
    maindata = computeMetaDataWeekday(
      maindata,
      __lastData,
      __bucket.current[dayInDigit],
      vital_param_type,
      convertGlucoseData,
    );

    //This has to be computed because max min has to be shown along with average
    maindata.max = __bucket.current[dayInDigit].max;
    maindata.min = __bucket.current[dayInDigit].min;
    maindata.measureColorMax = DATA_BOUNDS[vital_param_type](
      __bucket.current[dayInDigit].max,
    );
    maindata.measureColorMin = DATA_BOUNDS[vital_param_type](
      __bucket.current[dayInDigit].min,
    );

    scatterPlotData.push(maindata);

    minScatterData.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].min,
      fallback: __bucket.current[dayInDigit].fallbackMin,
      measureColor: DATA_BOUNDS[vital_param_type](
        __bucket.current[dayInDigit].min,
      ),
      skipMin: __bucket.current[dayInDigit].skipMin,
    });
    maxScatterData.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].max,
      fallback: __bucket.current[dayInDigit].fallbackMax,
      measureColor: DATA_BOUNDS[vital_param_type](
        __bucket.current[dayInDigit].max,
      ),
      skipMax: __bucket.current[dayInDigit].skipMax,
    });

    let minmaxFallback = __bucket.current[dayInDigit].fallbackAverage
      ? __bucket.current[dayInDigit].fallbackAverage
      : __bucket.current[dayInDigit].average;

    minmaxLineData.push({
      x1: dayInWordsShort,
      y1: __bucket.current[dayInDigit].max,
      x2: dayInWordsShort,
      y2: __bucket.current[dayInDigit].min,
      fallbacky1: __bucket.current[dayInDigit].fallbackMax,
      fallbacky2: __bucket.current[dayInDigit].fallbackMin,
      fallback: minmaxFallback,
    });

    if (__bucket.current[dayInDigit].average != 0) __lastData = maindata;
  });

  console.log('Barchar  Data', barChartData);

  //START HOURLY DATA AVERAGE CALCULATIONs
  var hoursArr = Object.keys(bucketByHour.current);

  hoursArr.forEach((hour) => {
    let currentTotalCount = bucketByHour.current[hour].totalCount;
    if (currentTotalCount == 0) currentTotalCount = 1;
    let currentTotal = bucketByHour.current[hour].total;

    let previousTotalCount = bucketByHour.previous[hour].totalCount;
    if (previousTotalCount == 0) previousTotalCount = 1;
    let previousTotal = bucketByHour.previous[hour].total;

    let currentAverage =
      Math.round((currentTotal / currentTotalCount) * 10) / 10;
    let previousAverage =
      Math.round((previousTotal / previousTotalCount) * 10) / 10;

    let fallbackAverage = null;
    let previousFallbackAverage = null;

    let _DATA_RANGE = WARNING_RANGE[vital_param_type];
    //Normalize the values for daily comparison for week
    if (currentAverage < _DATA_RANGE.min) {
      fallbackAverage = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverage > _DATA_RANGE.max) {
      fallbackAverage = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverage < _DATA_RANGE.min) {
      previousFallbackAverage = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverage > _DATA_RANGE.max) {
      previousFallbackAverage = _DATA_RANGE.fallback.averageMax;
    }

    bucketByHour.current[hour].average = currentAverage;
    bucketByHour.previous[hour].average = previousAverage;

    if (fallbackAverage) {
      bucketByHour.current[hour].fallbackAverage = fallbackAverage * 1;
    }

    if (previousFallbackAverage) {
      bucketByHour.previous[hour].fallbackAverage = previousFallbackAverage * 1;
    }

    currentComparisonHourlyLineData[hour] = {
      x: hour,
      y: bucketByHour.current[hour].average,
      fallback: bucketByHour.current[hour].fallbackAverage,
    };
    previousComparisonHourlyLineData[hour] = {
      x: hour,
      y: bucketByHour.previous[hour].average,
      fallback: bucketByHour.previous[hour].fallbackAverage,
    };

    let maindata = {
      x: hour,
      y: bucketByHour.current[hour].average,
      fallback: bucketByHour.current[hour].fallbackAverage,
    };
    maindata = computeMetaDataHourly(
      maindata,
      hourlyLastData,
      bucketByHour.current[hour],
      vital_param_type,
      convertGlucoseData,
    );

    currentComparisonHourlyScatterData[hour] = maindata;

    if (bucketByHour.current[hour].average != 0) hourlyLastData = maindata;
  });

  if (__lastData) {
    __lastData.convertGlucoseData = convertGlucoseData;
  }

  if (hourlyLastData) {
    hourlyLastData.convertGlucoseData = convertGlucoseData;
  }

  let bucketKeys = [];
  sortedDateArr.forEach((day) => {
    bucketKeys.push(__bucket.current[day].dateInWordsShort);
  });

  return {
    sortedDateArr,
    bucketKeys,
    hourBucketKeys: hoursArr,

    bucket: __bucket,
    hourBucket: bucketByHour,

    barChartData,

    linePathData: currentComparisonDailyLineData,
    previousLinePathData: previousComparisonDailyLineData,
    scatterPlotData,
    minScatterData,
    maxScatterData,
    minmaxLineData,

    hourLinePathData: currentComparisonHourlyLineData,
    previousHourLinePathData: previousComparisonHourlyLineData,
    hourScatterPlotData: currentComparisonHourlyScatterData,
    hourMinmaxLineData: [],

    summary: {
      noOfDaysRangeImproved:
        noOfCurrentDaysAboveBenchmark - noOfPreviousDaysAboveBenchmark,
      noOfCurrentDaysAboveBenchmark,
    },

    convertGlucoseData,

    lastDayData: __lastData,
    lastHourData: hourlyLastData, //TODO
  };
}

function convertBpVitalData(
  startTs,
  endTs,
  previousStartTs,
  previousEndTs,
  dataCurrent,
  dataPrevious,
  vital_param_type,
) {
  let vitalDataCurrent = dataCurrent.vital_data;
  let vitalDataPrevious = dataPrevious.vital_data;

  //bar
  var barChartDataSys = [];
  var barChartDataDia = [];

  //daily average
  var currentComparisonDailyLineData = [];
  var previousComparisonDailyLineData = [];
  var scatterPlotData = [];
  var minScatterData = [];
  var maxScatterData = [];
  var minmaxLineData = [];
  var minmaxLineHourlyData = [];

  var currentComparisonHourlyLineData = [];
  var previousComparisonHourlyLineData = [];
  var currentComparisonHourlyScatterData = [];

  var bucketByHour = {
    current: [],
    previous: [],
  };

  let _hour = 0;
  while (_hour <= 23) {
    bucketByHour.current.push({
      totalSys: 0,
      totalCountSys: 0,
      averageSys: 0,
      totalDia: 0,
      totalCountDia: 0,
      averageDia: 0,
    });
    bucketByHour.previous.push({
      totalSys: 0,
      totalCountSys: 0,
      averageSys: 0,
      totalDia: 0,
      totalCountDia: 0,
      averageDia: 0,
    });
    _hour++;
  }

  let currentBucket = getMonthlyDatesMap(startTs, endTs);
  let previousBucket = getMonthlyDatesMap(previousStartTs, previousEndTs);

  let arrOfDates = getSortedDatesArray(currentBucket);
  let sortedDateArr = arrOfDates.dateKeysArr;
  let tsArr = arrOfDates.tsArr;

  let prevArrOfDates = getSortedDatesArray(previousBucket);
  let prevSortedDateArr = prevArrOfDates.dateKeysArr;
  let preTsArr = prevArrOfDates.tsArr;

  sortedDateArr.forEach((key, index) => {
    let dateFragment = addDateInfoToDataFragment({ts: tsArr[index]});

    currentBucket[key] = {
      totalSys: 0,
      totalCountSys: 0,
      countInRangeSys: 0,
      maxSys: 1000,
      minSys: 0,
      totalDia: 0,
      totalCountDia: 0,
      countInRangeDia: 0,
      maxDia: 1000,
      minDia: 0,
      ...dateFragment,
    };
  });

  prevSortedDateArr.forEach((key, index) => {
    let previousDateFragment = addDateInfoToDataFragment({ts: preTsArr[index]});

    previousBucket[key] = {
      totalSys: 0,
      totalCountSys: 0,
      countInRangeSys: 0,
      maxSys: 1000,
      minSys: 0,
      totalDia: 0,
      totalCountDia: 0,
      countInRangeDia: 0,
      ...previousDateFragment,
    };
  });

  let __bucket = {
    current: currentBucket,
    previous: previousBucket,
  };

  let __lastData = null;
  let hourlyLastData = null;

  //Loop through current WEEK data and calculate weekday and hourly bucket for current week
  vitalDataCurrent.forEach((data) => {
    data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;
    data = addDateInfoToDataFragment(data);

    let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] * 1;
    let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] * 1;
    //Sys
    __bucket.current[data.day].totalSys =
      __bucket.current[data.day].totalSys + valueSys;
    __bucket.current[data.day].totalCountSys =
      __bucket.current[data.day].totalCountSys + 1;

    //Dia
    __bucket.current[data.day].totalDia =
      __bucket.current[data.day].totalDia + valueDia;
    __bucket.current[data.day].totalCountDia =
      __bucket.current[data.day].totalCountDia + 1;

    //Compute value in range - Sys
    if (
      valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min &&
      valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max
    ) {
      __bucket.current[data.day].countInRangeSys =
        __bucket.current[data.day].countInRangeSys + 1;
    }

    //Compute value in range - Dia
    if (
      valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min &&
      valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max
    ) {
      __bucket.current[data.day].countInRangeDia =
        __bucket.current[data.day].countInRangeDia + 1;
    }

    let _moment = moment(data.ts);

    let hour = _moment.hour();

    let timeInWords = getShortHour(data.ts);

    //Hourly bucket - Sys
    bucketByHour.current[hour].totalSys =
      bucketByHour.current[hour].totalSys + valueSys;
    bucketByHour.current[hour].totalCountSys =
      bucketByHour.current[hour].totalCountSys + 1;

    //Hourly bucket - Dia
    bucketByHour.current[hour].totalDia =
      bucketByHour.current[hour].totalDia + valueDia;
    bucketByHour.current[hour].totalCountDia =
      bucketByHour.current[hour].totalCountDia + 1;

    bucketByHour.current[hour].timeInWords = timeInWords;
  });

  //Loop through previous month data and calculate daily and hourly bucket for current month, if at all any
  vitalDataPrevious.forEach((data) => {
    data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;
    data = addDateInfoToDataFragment(data);

    let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] * 1;
    let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] * 1;

    __bucket.previous[data.day].totalSys =
      __bucket.previous[data.day].totalSys + valueSys;
    __bucket.previous[data.day].totalCountSys =
      __bucket.previous[data.day].totalCountSys + 1;

    __bucket.previous[data.day].totalDia =
      __bucket.previous[data.day].totalDia + valueDia;
    __bucket.previous[data.day].totalCountDia =
      __bucket.previous[data.day].totalCountDia + 1;

    if (
      valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min &&
      valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max
    ) {
      __bucket.previous[data.day].countInRangeSys =
        __bucket.previous[data.day].countInRangeSys + 1;
    }

    if (
      valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min &&
      valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max
    ) {
      __bucket.previous[data.day].countInRangeDia =
        __bucket.previous[data.day].countInRangeDia + 1;
    }

    let _moment = moment(data.ts);

    let hour = _moment.hour();

    bucketByHour.previous[hour].totalSys =
      bucketByHour.previous[hour].totalSys + valueSys;
    bucketByHour.previous[hour].totalCountSys =
      bucketByHour.previous[hour].totalCountSys + 1;

    bucketByHour.previous[hour].totalDia =
      bucketByHour.previous[hour].totalDia + valueDia;
    bucketByHour.previous[hour].totalCountDia =
      bucketByHour.previous[hour].totalCountDia + 1;
  });

  //START AVERAGE, MIN, MAX, CALCULATIONS

  let noOfDaysRangeImprovedSys = 0;
  let noOfPreviousDaysAboveBenchmarkSys = 0;
  let noOfCurrentDaysAboveBenchmarkSys = 0;

  let noOfDaysRangeImprovedDia = 0;
  let noOfPreviousDaysAboveBenchmarkDia = 0;
  let noOfCurrentDaysAboveBenchmarkDia = 0;

  //Start bucketing weekly data and normalize
  sortedDateArr.forEach((dayInDigit) => {
    //====================================== FOR SYSTOLIC =================================================
    let currentTotalCountSys = __bucket.current[dayInDigit].totalCountSys;
    if (currentTotalCountSys == 0) currentTotalCountSys = 1;
    let currentCountInRangeSys = __bucket.current[dayInDigit].countInRangeSys;
    let currentTotalSys = __bucket.current[dayInDigit].totalSys;

    let currentInRangePercentSys =
      Math.round((currentCountInRangeSys / currentTotalCountSys) * 100 * 10) /
      10;
    let currentAverageSys =
      Math.round((currentTotalSys / currentTotalCountSys) * 10) / 10;

    if (!__bucket.previous[dayInDigit]) {
      __bucket.previous[dayInDigit] = {
        totalSys: 0,
        totalCountSys: 0,
        countInRangeSys: 0,
        maxSys: 1000,
        minSys: 0,
        totalDia: 0,
        totalCountDia: 0,
        countInRangeDia: 0,
      };
    }

    let previousTotalCountSys = __bucket.previous[dayInDigit].totalCountSys;
    if (previousTotalCountSys == 0) previousTotalCountSys = 1;
    let previousCountInRangeSys = __bucket.previous[dayInDigit].countInRangeSys;
    let previousTotalSys = __bucket.previous[dayInDigit].totalSys;

    let previousInRangePercentSys =
      Math.round((previousCountInRangeSys / previousTotalCountSys) * 100 * 10) /
      10;
    let previousAverageSys =
      Math.round((previousTotalSys / previousTotalCountSys) * 10) / 10;

    //Check if this day of the current week had percentage value in range
    if (currentInRangePercentSys > 70) {
      noOfCurrentDaysAboveBenchmarkSys += 1;
    }

    //Check if this day of the previous week had percentage value in range
    if (currentInRangePercentSys > 70) {
      noOfPreviousDaysAboveBenchmarkSys += 1;
    }

    let _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH];

    let fallbackAverageSys = null;
    let previousFallbackAverageSys = null;

    //Normalize the values for daily comparison for week
    if (currentAverageSys < _DATA_RANGE.min) {
      fallbackAverageSys = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverageSys > _DATA_RANGE.max) {
      fallbackAverageSys = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverageSys < _DATA_RANGE.min) {
      previousFallbackAverageSys = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverageSys > _DATA_RANGE.max) {
      previousFallbackAverageSys = _DATA_RANGE.fallback.averageMax;
    }

    __bucket.current[dayInDigit].percentInRangeSys = currentInRangePercentSys;
    __bucket.current[dayInDigit].averageSys = currentAverageSys;

    __bucket.previous[dayInDigit].percentInRangeSys = previousInRangePercentSys;
    __bucket.previous[dayInDigit].averageSys = previousAverageSys;

    if (fallbackAverageSys != null) {
      __bucket.current[dayInDigit].fallbackAverageSys = fallbackAverageSys * 1;
    }

    if (previousFallbackAverageSys != null) {
      __bucket.previous[dayInDigit].fallbackAverageSys =
        previousFallbackAverageSys * 1;
    }

    // ========================================= FOR DIASTOLIC =============================================================
    let currentTotalCountDia = __bucket.current[dayInDigit].totalCountDia;
    if (currentTotalCountDia == 0) currentTotalCountDia = 1;
    let currentCountInRangeDia = __bucket.current[dayInDigit].countInRangeDia;
    let currentTotalDia = __bucket.current[dayInDigit].totalDia;

    let currentInRangePercentDia =
      Math.round((currentCountInRangeDia / currentTotalCountDia) * 100 * 10) /
      10;
    let currentAverageDia =
      Math.round((currentTotalDia / currentTotalCountDia) * 10) / 10;

    let previousTotalCountDia = __bucket.previous[dayInDigit].totalCountDia;
    if (previousTotalCountDia == 0) previousTotalCountDia = 1;
    let previousCountInRangeDia = __bucket.previous[dayInDigit].countInRangeDia;
    let previousTotalDia = __bucket.previous[dayInDigit].totalDia;

    let previousInRangePercentDia =
      Math.round((previousCountInRangeDia / previousTotalCountDia) * 100 * 10) /
      10;
    let previousAverageDia =
      Math.round((previousTotalDia / previousTotalCountDia) * 10) / 10;

    //Check if this day of the current week had percentage value in range
    if (currentInRangePercentDia > 70) {
      noOfCurrentDaysAboveBenchmarkDia += 1;
    }

    //Check if this day of the previous week had percentage value in range
    if (currentInRangePercentDia > 70) {
      noOfPreviousDaysAboveBenchmarkDia += 1;
    }

    _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW];

    let fallbackAverageDia = null;
    let previousFallbackAverageDia = null;

    //Normalize the values for daily comparison for week
    if (currentAverageDia < _DATA_RANGE.min) {
      fallbackAverageDia = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverageDia > _DATA_RANGE.max) {
      fallbackAverageDia = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverageDia < _DATA_RANGE.min) {
      previousFallbackAverageDia = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverageDia > _DATA_RANGE.max) {
      previousFallbackAverageDia = _DATA_RANGE.fallback.averageMax;
    }

    __bucket.current[dayInDigit].percentInRangeDia = currentInRangePercentDia;
    __bucket.current[dayInDigit].averageDia = currentAverageDia;

    __bucket.previous[dayInDigit].percentInRangeDia = previousInRangePercentDia;
    __bucket.previous[dayInDigit].averageDia = previousAverageDia;

    if (fallbackAverageDia != null) {
      __bucket.current[dayInDigit].fallbackAverageDia = fallbackAverageDia * 1;
    }

    if (previousFallbackAverageDia != null) {
      __bucket.previous[dayInDigit].fallbackAverageDia =
        previousFallbackAverageDia * 1;
    }

    // SYS stays on top - y1 | DIA stays at bottom - y2 *****
    let dayInWordsShort = __bucket.current[dayInDigit].dateInWordsShort;
    //Organize weekday bar chart and scatter plot data
    barChartDataSys.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].percentInRangeSys,
    });
    barChartDataDia.push({
      x: dayInWordsShort,
      y: __bucket.current[dayInDigit].percentInRangeDia,
    });

    let maindata = {
      x: dayInWordsShort,
      x1: dayInWordsShort,
      x2: dayInWordsShort,
      y1: __bucket.current[dayInDigit].averageSys,
      y2: __bucket.current[dayInDigit].averageDia,
      fallbacky1: __bucket.current[dayInDigit].fallbackAverageSys,
      fallbacky2: __bucket.current[dayInDigit].fallbackAverageDia,
    };

    maindata = computeMetaDataWeekday(
      maindata,
      __lastData,
      __bucket.current[dayInDigit],
      vital_param_type,
    );

    currentComparisonDailyLineData.push(maindata);

    previousComparisonDailyLineData.push({
      x: dayInWordsShort,
      y1: __bucket.previous[dayInDigit].averageSys,
      y2: __bucket.previous[dayInDigit].averageDia,
      fallbacky1: __bucket.previous[dayInDigit].fallbackAverageSys,
      fallbacky2: __bucket.previous[dayInDigit].fallbackAverageDia,
    });

    scatterPlotData.push(maindata);

    minmaxLineData.push(maindata);

    if (
      __bucket.previous[dayInDigit].averageSys > 0 &&
      __bucket.previous[dayInDigit].averageDia > 0
    )
      __lastData = maindata;
  });

  //START HOURLY DATA AVERAGE CALCULATIONs
  var hoursArr = Object.keys(bucketByHour.current);

  hoursArr.forEach((hour) => {
    //====================================== FOR SYSTOLIC =================================================
    let currentTotalCountSys = bucketByHour.current[hour].totalCountSys;
    if (currentTotalCountSys == 0) currentTotalCountSys = 1;
    let currentTotalSys = bucketByHour.current[hour].totalSys;

    let previousTotalCountSys = bucketByHour.previous[hour].totalCountSys;
    if (previousTotalCountSys == 0) previousTotalCountSys = 1;
    let previousTotalSys = bucketByHour.previous[hour].totalSys;

    let currentAverageSys =
      Math.round((currentTotalSys / currentTotalCountSys) * 10) / 10;
    let previousAverageSys =
      Math.round((previousTotalSys / previousTotalCountSys) * 10) / 10;

    let fallbackAverageSys = null;
    let previousFallbackAverageSys = null;

    let _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH];

    //Normalize the values for daily comparison for week
    if (currentAverageSys < _DATA_RANGE.min) {
      fallbackAverageSys = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverageSys > _DATA_RANGE.max) {
      fallbackAverageSys = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverageSys < _DATA_RANGE.min) {
      previousFallbackAverageSys = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverageSys > _DATA_RANGE.max) {
      previousFallbackAverageSys = _DATA_RANGE.fallback.averageMax;
    }

    bucketByHour.current[hour].averageSys = currentAverageSys;
    bucketByHour.previous[hour].averageSys = previousAverageSys;

    if (fallbackAverageSys) {
      bucketByHour.current[hour].fallbackAverageSys = fallbackAverageSys * 1;
    }

    if (previousFallbackAverageSys) {
      bucketByHour.previous[hour].fallbackAverageSys =
        previousFallbackAverageSys * 1;
    }

    //====================================== FOR DIASTOLIC =================================================

    let currentTotalCountDia = bucketByHour.current[hour].totalCountDia;
    if (currentTotalCountDia == 0) currentTotalCountDia = 1;
    let currentTotalDia = bucketByHour.current[hour].totalDia;

    let previousTotalCountDia = bucketByHour.previous[hour].totalCountDia;
    if (previousTotalCountDia == 0) previousTotalCountDia = 1;
    let previousTotalDia = bucketByHour.previous[hour].totalDia;

    let currentAverageDia =
      Math.round((currentTotalDia / currentTotalCountDia) * 10) / 10;
    let previousAverageDia =
      Math.round((previousTotalDia / previousTotalCountDia) * 10) / 10;

    let fallbackAverageDia = null;
    let previousFallbackAverageDia = null;

    _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW];

    //Normalize the values for daily comparison for week
    if (currentAverageDia < _DATA_RANGE.min) {
      fallbackAverageDia = _DATA_RANGE.fallback.averageMin;
    } else if (currentAverageDia > _DATA_RANGE.max) {
      fallbackAverageDia = _DATA_RANGE.fallback.averageMax;
    }

    if (previousAverageDia < _DATA_RANGE.min) {
      previousFallbackAverageDia = _DATA_RANGE.fallback.averageMin;
    } else if (previousAverageDia > _DATA_RANGE.max) {
      previousFallbackAverageDia = _DATA_RANGE.fallback.averageMax;
    }

    bucketByHour.current[hour].averageDia = currentAverageDia;
    bucketByHour.previous[hour].averageDia = previousAverageDia;

    if (fallbackAverageDia) {
      bucketByHour.current[hour].fallbackAverageDia = fallbackAverageDia * 1;
    }

    if (previousFallbackAverageDia) {
      bucketByHour.previous[hour].fallbackAverageDia =
        previousFallbackAverageDia * 1;
    }

    let maindata = {
      x: hour,
      x1: hour,
      x2: hour,
      y1: bucketByHour.current[hour].averageSys,
      y2: bucketByHour.current[hour].averageDia,
      fallbacky1: bucketByHour.current[hour].fallbackAverageSys,
      fallbacky2: bucketByHour.current[hour].fallbackAverageDia,
      dualPlot: true,
    };

    maindata = computeMetaDataHourly(
      maindata,
      hourlyLastData,
      bucketByHour.current[hour],
      vital_param_type,
    );

    currentComparisonHourlyLineData[hour] = maindata;
    previousComparisonHourlyLineData[hour] = {
      x: hour,
      x1: hour,
      x2: hour,
      y1: bucketByHour.previous[hour].averageSys,
      y2: bucketByHour.previous[hour].averageDia,
      fallbacky1: bucketByHour.previous[hour].fallbackAverageSys,
      fallbacky2: bucketByHour.previous[hour].fallbackAverageDia,
    };

    currentComparisonHourlyScatterData[hour] = maindata;

    minmaxLineHourlyData[hour] = maindata;

    hourlyLastData = maindata;
  });

  let bucketKeys = [];
  sortedDateArr.forEach((day) => {
    bucketKeys.push(__bucket.current[day].dateInWordsShort);
  });

  return {
    sortedDateArr,
    bucketKeys,
    hourBucketKeys: hoursArr,

    bucket: __bucket,
    hourBucket: bucketByHour,

    barChartData: {
      [VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]: barChartDataSys,
      [VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]: barChartDataDia,
    },

    linePathData: currentComparisonDailyLineData,
    previousLinePathData: previousComparisonDailyLineData,
    scatterPlotData,

    minScatterData,
    maxScatterData,

    minmaxLineData,

    hourLinePathData: currentComparisonHourlyLineData,
    previousHourLinePathData: previousComparisonHourlyLineData,
    hourScatterPlotData: currentComparisonHourlyScatterData,

    hourMinmaxLineData: minmaxLineHourlyData,

    summary: {
      noOfDaysRangeImprovedSys:
        noOfCurrentDaysAboveBenchmarkSys - noOfPreviousDaysAboveBenchmarkSys,
      noOfCurrentDaysAboveBenchmarkSys,
      noOfDaysRangeImprovedDia:
        noOfCurrentDaysAboveBenchmarkDia - noOfPreviousDaysAboveBenchmarkDia,
      noOfCurrentDaysAboveBenchmarkDia,
    },

    lastDayData: __lastData,
    lastHourData: hourlyLastData, //TODO
  };
}

function getMonthlyGeneralVisualizationScaleData(
  vital_type,
  convertedDataViews,
  convertGlucoseData,
) {
  var barChartScales = {};
  var scatterScale = {};
  var scatterScaleHour = {};

  barChartScales.axisX = getMonthlyBarChartXScaleData(convertedDataViews);
  barChartScales.axisY = getMonthlyBarChartYScaleData();

  scatterScale.axisX = getMonthlyAverageByDayXScaleData(convertedDataViews);
  scatterScale.axisY = getYScaleData(
    vital_type,
    WARNING_RANGE[vital_type].min,
    WARNING_RANGE[vital_type].max,
    convertGlucoseData,
  );

  scatterScaleHour.axisX =
    getMonthlyAverageByHourXScaleData(convertedDataViews);
  scatterScaleHour.axisY = getYScaleData(
    vital_type,
    WARNING_RANGE[vital_type].min,
    WARNING_RANGE[vital_type].max,
    convertGlucoseData,
  );

  return {barChartScales, scatterScale, scatterScaleHour};
}

function getMonthlyBarChartXScaleData(convertedDataViews) {
  let barChartXScaleData = [];

  convertedDataViews.bucketKeys.forEach((_data, i) => {
    let _label = '';

    if (i % 7 == 0) {
      let arr = _data.split(' ');
      let tempLabel = arr[0].substr(0, 3) + ' ' + arr[1];
      _label = tempLabel;
    }

    barChartXScaleData.push({label: _label, value: _data});
  });

  console.log('barChartXScaleData', barChartXScaleData);
  return barChartXScaleData;
}

function getMonthlyBarChartYScaleData(vital_type) {
  //let isB
  return {
    start: {label: '0', value: 0},
    mid: {label: 70, value: 70},
    end: {label: 100, value: 100},
    scale_label: {label: t('barChartYScaleData.label'), value: 65},
  };
}

function getMonthlyAverageByDayXScaleData(convertedDataViews) {
  let scaleData = {};

  convertedDataViews.bucketKeys.forEach((item, index) => {
    let _label = '';

    if (index == 0 || index == convertedDataViews.bucketKeys.length - 1) {
      let arr = item.split(' ');
      _label = arr[0].substr(0, 3) + ' ' + arr[1];
    }

    scaleData[item] = {
      label: _label,
      value: item,
    };
  });

  return scaleData;
}

function getMonthlyAverageByHourXScaleData(convertedDataViews) {
  let scaleData = {24: {label: '', value: 24}};

  let hoursArr = convertedDataViews.hourBucketKeys;

  hoursArr.forEach((item) => {
    scaleData[item] = {
      label:
        [0, 12, 23].indexOf(item * 1) > -1
          ? item * 1 == 23
            ? '<12pm'
            : getAbsoluteHourInAmPm(item * 1)
          : '',
      value: item,
    };
  });

  return scaleData;

  // return {
  //     "start" : {"label" : "12 am", value : 0},
  //     "end" : {"label" : "12 am", value : 24}
  // }
}

function getYScaleData(vital_type, y_min, y_max, convertGlucoseData) {
  let _DATA_RANGE = getScaleData(vital_type, y_min, y_max, true);
  let yAxisLabel = convertGlucoseData
    ? GLUCOSE_UNIT.MMOL
    : getLabelByDataType(vital_type);
  return {
    start: {
      label: '',
      value: _DATA_RANGE.MIN,
    },
    actual_start: {
      label: convertGlucoseData
        ? toMMOL(_DATA_RANGE.RANGE_BOTTOM)
        : _DATA_RANGE.RANGE_BOTTOM,
      value: _DATA_RANGE.RANGE_BOTTOM,
      warning: _DATA_RANGE.RANGE_BOTTOM == WARNING_RANGE[vital_type].min,
    },

    mid: {
      label: convertGlucoseData
        ? toMMOL(_DATA_RANGE.RANGE_MID)
        : _DATA_RANGE.RANGE_MID,
      value: _DATA_RANGE.RANGE_MID,
    },

    scale_label: {
      label: yAxisLabel,
      value: _DATA_RANGE.RANGE_MID,
    },

    end: {label: '', value: _DATA_RANGE.MAX},

    actual_end: {
      label: convertGlucoseData
        ? toMMOL(_DATA_RANGE.RANGE_TOP)
        : _DATA_RANGE.RANGE_TOP,
      value: _DATA_RANGE.RANGE_TOP,
      warning: _DATA_RANGE.RANGE_TOP == WARNING_RANGE[vital_type].max,
    },
  };
}

function computeMetaDataWeekday(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
  convertGlucoseData,
) {
  if (
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW
  ) {
    return computeBpMetaDataWeekday(
      thisData,
      dataBefore,
      bucketData,
      vital_type,
    );
  } else {
    return computeGeneralMetaDataWeekday(
      thisData,
      dataBefore,
      bucketData,
      vital_type,
      convertGlucoseData,
    );
  }
}

function computeMetaDataHourly(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
  convertGlucoseData,
) {
  if (
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW
  ) {
    return computeBpMetaDataHourly(
      thisData,
      dataBefore,
      bucketData,
      vital_type,
    );
  } else {
    return computeGeneralMetaDataHourly(
      thisData,
      dataBefore,
      bucketData,
      vital_type,
      convertGlucoseData,
    );
  }
}

function computeGeneralMetaDataWeekday(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
  convertGlucoseData,
) {
  let tempData = computeGeneralMetaData(
    thisData,
    dataBefore,
    bucketData,
    vital_type,
    convertGlucoseData,
  );
  tempData = addDateSignatureMeta(tempData, bucketData);
  tempData.readingText = 'Average for';
  return tempData;
}

function computeBpMetaDataWeekday(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
) {
  let tempData = computeBpMetaData(
    thisData,
    dataBefore,
    bucketData,
    vital_type,
  );
  tempData = addDateSignatureMeta(tempData, bucketData);
  tempData.readingText = 'Average for';
  return tempData;
}

function computeGeneralMetaDataHourly(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
  convertGlucoseData,
) {
  let tempData = computeGeneralMetaData(
    thisData,
    dataBefore,
    bucketData,
    vital_type,
    convertGlucoseData,
  );
  tempData = addTimeSignature(tempData, bucketData);
  tempData.readingText = 'averageAt';
  return tempData;
}

function computeBpMetaDataHourly(thisData, dataBefore, bucketData, vital_type) {
  let tempData = computeBpMetaData(
    thisData,
    dataBefore,
    bucketData,
    vital_type,
  );
  tempData = addTimeSignature(tempData, bucketData);
  tempData.readingText = 'averageAt';
  return tempData;
}

function computeGeneralMetaData(
  thisData,
  dataBefore,
  bucketData,
  vital_type,
  convertGlucoseData,
) {
  let measureColor = DATA_BOUNDS[vital_type](thisData.y * 1);
  let measureTrend = 0;

  if (!dataBefore) {
    measureTrend = MEASURE_TREND.up;
  } else {
    if (thisData.y * 1 > dataBefore.y * 1) {
      measureTrend = MEASURE_TREND.up;
    } else {
      measureTrend = MEASURE_TREND.down;
    }
  }

  thisData.measureColor = measureColor;
  thisData.measureTrend = measureTrend;
  thisData.unit = convertGlucoseData
    ? GLUCOSE_UNIT.MMOL
    : getLabelByDataType(vital_type);

  return thisData;
}

function computeBpMetaData(thisData, dataBefore, bucketData, vital_type) {
  let measureColorSys = DATA_BOUNDS[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH](
    thisData.y1 * 1,
  );
  let measureColorDia = DATA_BOUNDS[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW](
    thisData.y2 * 1,
  );

  let measureTrendSys = 0;
  let measureTrendDia = 0;

  if (!dataBefore) {
    measureTrendSys = MEASURE_TREND.up;
    measureTrendDia = MEASURE_TREND.up;
  } else {
    if (thisData.y1 * 1 > dataBefore.y1 * 1) {
      measureTrendSys = MEASURE_TREND.up;
    } else {
      measureTrendSys = MEASURE_TREND.down;
    }

    if (thisData.y2 * 1 > dataBefore.y2 * 1) {
      measureTrendDia = MEASURE_TREND.up;
    } else {
      measureTrendDia = MEASURE_TREND.down;
    }
  }

  thisData.measureColorSys = measureColorSys;
  thisData.measureTrendSys = measureTrendSys;
  thisData.measureColorDia = measureColorDia;
  thisData.measureTrendDia = measureTrendDia;

  thisData.unit = getLabelByDataType(vital_type);

  return thisData;
}

function addDateSignatureMeta(thisData, bucketData) {
  thisData.dateInWords = bucketData.dateInWords;
  thisData.dateInWordsShort = bucketData.dateInWordsShort;
  thisData.dayOfWeekInWords = bucketData.dayOfWeekInWords;
  thisData.dayOfTheWeekInWordsShort = bucketData.dayOfTheWeekInWordsShort;
  return thisData;
}

function addTimeSignature(thisData, bucketData) {
  thisData.timeInWords = bucketData.timeInWords;
  return thisData;
}
