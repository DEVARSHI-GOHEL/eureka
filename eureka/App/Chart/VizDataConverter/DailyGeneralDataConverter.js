import moment from 'moment';

import {
  getDateString,
  getShortHour,
  addDateInfoToDataFragment,
} from '../AppUtility/DateTimeUtils';
import {
  VITAL_CONSTANTS,
  WARNING_RANGE,
  DATA_BOUNDS,
  MEASURE_TREND,
  getScaleData,
} from '../AppConstants/VitalDataConstants';
import {getLabelByDataType, getLabelByUnits} from '../AppUtility/ChartAxisUtils';
import { percentageOf, percent, } from '../AppUtility/PercentFunctions';
import {toMMOL} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {Translate} from "../../Services/Translate";

export function convertDailyGeneralData(
  dailyGeneralData,
  startTs,
  endTs,
  vital_type,
) {
  if (
    !dailyGeneralData ||
    Object.keys(dailyGeneralData).length == 0 ||
    dailyGeneralData.vital_data.length == 0
  ) {
    return null;
  }

  var convertedDataViews = convertDailyGeneralVitalData(
    dailyGeneralData.vital_data,
    vital_type,
    dailyGeneralData.convertGlucoseData,
  );

  var convertedMealData = convertDailyMealData(dailyGeneralData.meal_data);
  var convertedStepsData = convertDailyActivityData(
    dailyGeneralData.steps_data,
  );
  var convertedFastingData = convertDailyFastingData(
    dailyGeneralData.fasting_data,
  );

  var scaleData = getDailyGeneralVisualizationScaleData(
    startTs,
    endTs,
    vital_type,
    convertedDataViews,
    dailyGeneralData.convertGlucoseData,
  );

  var data = {
    startTs,
    endTs,
    ...scaleData,
    ...convertedDataViews,
    mealData: convertedMealData,
    stepsData: convertedStepsData,
    fastingData: convertedFastingData,
    dualPlot:
      vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
      vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW,
  };

  return data;
}

//CHANGED
function convertDailyGeneralVitalData(
  vitalData,
  vital_type,
  convertGlucoseData,
) {
  const trn = Translate("convertDailyGeneralVitalData");
  //var dataMap = {};
  var plottableData = [];
  var warningDataHigh = [];
  var warningDataLow = [];

  var x_range_min = -1;
  var x_range_max = -1;

  var y_min = -1;
  var y_max = -1;

  var dataBefore = null;

  let lastData = null;

  let bpDataNotInBoundsCount = 0;

  let isBpData =
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW;

  /**************************************************************************************************************************************************** */
  vitalData.forEach((data) => {
    //data = addDateInfoToDataFragment(data);

    let thisData = getPlottableData(data, vital_type);

    thisData = computeMetaData(
      thisData,
      dataBefore,
      vital_type,
      convertGlucoseData,
    );
    thisData = addDateInfoToDataFragment(thisData);

    //WE CAN CHANGE THIS PORTION LATER
    if (!isBpData && thisData.y < WARNING_RANGE[vital_type].min) {
      warningDataLow.push(thisData);
    } else if (!isBpData && thisData.y > WARNING_RANGE[vital_type].max) {
      warningDataHigh.push(thisData);
    } else {
      plottableData.push(thisData);

      if (isBpData && thisData.notInBounds) {
        bpDataNotInBoundsCount += 1; //BP data plot is treated differently, so calculate not in bounds differently than others
      }
    }

    dataBefore = thisData;
    //dataMap["TS_"+data.ts] = data;

    if (x_range_min == -1) {
      x_range_min = data.ts;
    }

    //Last data in range depends on if this is the last greatest timestamp and value in range
    if (x_range_max == -1) {
      x_range_max = data.ts;

      if (isBpData) {
        lastData = thisData;
      } else {
        if (
          thisData.y >= WARNING_RANGE[vital_type].min &&
          thisData.y <= WARNING_RANGE[vital_type].max
        ) {
          lastData = thisData;
        }
      }
    }

    //Last data in range depends on if this is the last greatest timestamp and value in range
    if (x_range_max < data.ts) {
      x_range_max = data.ts;

      if (isBpData) {
        lastData = thisData;
      } else {
        if (
          thisData.y >= WARNING_RANGE[vital_type].min &&
          thisData.y <= WARNING_RANGE[vital_type].max
        ) {
          lastData = thisData;
        }
      }
    } else {
      if (
        !lastData &&
        thisData.y >= WARNING_RANGE[vital_type].min &&
        thisData.y <= WARNING_RANGE[vital_type].max
      ) {
        lastData = thisData;
      }
    }

    if (data.ts < x_range_min) {
      x_range_min = data.ts;
    }

    //This need not be done for BP
    if (!isBpData) {
      if (y_min == -1) {
        y_min = data[vital_type];
      }

      if (y_max == -1) {
        y_max = data[vital_type];
      }

      if (y_max < data[vital_type]) {
        y_max = data[vital_type];
      }

      if (data[vital_type] < y_min) {
        y_min = data[vital_type];
      }
    }
  });
  /**************************************************************************************************************************************************** */

  //let inRangePercent = isBpData ? Math.round(( (plottableData.length - bpDataNotInBoundsCount)/vitalData.length )*100) : Math.round((plottableData.length/vitalData.length)*100);

  let inRangePercent = isBpData
    ? percentageOf(
        plottableData.length - bpDataNotInBoundsCount,
        vitalData.length,
      )
    : percentageOf(plottableData.length, vitalData.length);

  if (lastData) {
    lastData.convertGlucoseData = convertGlucoseData;
  }

  return {
    //dataMap,
    plottableData,
    warningDataHigh,
    warningDataLow,
    x_range_min,
    x_range_max,
    y_min,
    y_max,
    inRange: {
      value: inRangePercent,
      text:
        vital_type == VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE
          ? trn.inRange
          : trn.inNormalRange,
    },
    lastData,
    convertGlucoseData,
  };
}

function getPlottableData(dataFragment, vital_type) {
  dataFragment.ts = dataFragment[VITAL_CONSTANTS.KEY_TS] * 1;
  let data = {
    x: moment(dataFragment.ts).toDate(),
    //y : dataFragment[vital_type],
    ts: dataFragment.ts,
  };

  if (
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW
  ) {
    data.y1 = dataFragment[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]; //sys
    data.y2 = dataFragment[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]; //dys

    data.fallback_y1 = 0;
    data.fallback_y2 = 0;

    if (data.y1 > WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
      data.fallback_y1 = data.y1 + 2;
      data.notInBounds = true;
    } else if (
      data.y1 < WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min
    ) {
      data.fallback_y1 = data.y1 - 2;
      data.notInBounds = true;
    }

    if (data.y2 > WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
      data.fallback_y2 = data.y2 + 2;
      data.notInBounds = true;
    } else if (
      data.y2 < WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min
    ) {
      data.fallback_y2 = data.y2 - 2;
      data.notInBounds = true;
    }
  } else {
    data.y = dataFragment[vital_type];
  }

  return data;
}

function computeMetaData(thisData, dataBefore, vital_type, convertGlucoseData) {
  if (
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH ||
    vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW
  ) {
    return computeBpMetaData(thisData, dataBefore, vital_type);
  } else {
    return computeGeneralMetaData(
      thisData,
      dataBefore,
      vital_type,
      convertGlucoseData,
    );
  }
}

function computeGeneralMetaData(
  thisData,
  dataBefore,
  vital_type,
  convertGlucoseData,
) {
  let measureColor = DATA_BOUNDS[vital_type](thisData.y);
  let measureTrend = 0;

  if (!dataBefore) {
    measureTrend = MEASURE_TREND.up;
  } else {
    if (thisData.y > dataBefore.y) {
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

function computeBpMetaData(thisData, dataBefore, vital_type) {
  let measureColorSys = DATA_BOUNDS[vital_type](thisData.y1);
  let measureColorDia = DATA_BOUNDS['bpdia'](thisData.y2);

  let measureTrendSys = 0;
  let measureTrendDia = 0;

  if (!dataBefore) {
    measureTrendSys = MEASURE_TREND.up;
    measureTrendDia = MEASURE_TREND.up;
  } else {
    if (thisData.y1 > dataBefore.y1) {
      measureTrendSys = MEASURE_TREND.up;
    } else {
      measureTrendSys = MEASURE_TREND.down;
    }

    if (thisData.y2 > dataBefore.y2) {
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
  console.log(thisData);
  return thisData;
}

function convertDailyMealData(mealData) {
  var data = [];

  if (!mealData || mealData.length == 0) return data;

  //check for meal Data
  mealData.forEach((_data) => {
    data.push({
      ..._data,
      mealType: Number(_data.mealtype),
      x: new Date(Number(_data.time)),
    });
  });
  return data;
}

function convertDailyFastingData(fastingData) {
  var data = [];

  if (!fastingData || fastingData.length == 0) return data;

  fastingData.forEach((_data) => {
    data.push({
      ..._data,
      x1: moment(_data.fastingStartTs).toDate(),
      x2: moment(_data.fastingEndTs).toDate(),
    });
  });

  return data;
}

function convertDailyActivityData(stepsData) {
  var data = [];

  if (!stepsData || stepsData.length == 0) return data;

  stepsData.forEach((_data) => {
    let midVal = Math.round((_data.activityStartTs + _data.activityEndTs) / 2);

    data.push({
      ..._data,
      x: moment(midVal).toDate(),
      x1: moment(_data.activityStartTs).toDate(),
      x2: moment(_data.activityEndTs).toDate(),
    });
  });

  return data;
}

function getDailyGeneralVisualizationScaleData(
  startTs,
  endTs,
  vital_type,
  {y_min, y_max},
  convertGlucoseData,
) {
  var date_scale = getDailyGeneralDataDateScaleValues(startTs, endTs);
  var vital_scale = getDailyGeneralDataVitalScaleValues(
    vital_type,
    y_min,
    y_max,
    convertGlucoseData,
  );

  return {date_scale, vital_scale};
}

function getDailyGeneralDataDateScaleValues(startTs, endTs) {
  let today = getDateString(endTs);
  let timeArr = [];
  let currentStartHour = moment(startTs).hour();
  let currentEndHour = moment(endTs).hour();
  let currentTimeStrs = [];

  for (let i = currentStartHour; i <= currentEndHour; i++) {
    let item = moment(startTs).set('hour', i);
    timeArr.push(item);
    if (moment(item).hour() < 10) {
      currentTimeStrs.push('T0' + moment(item).hour() + ':00:00');
    } else {
      currentTimeStrs.push('T' + moment(item).hour() + ':00:00');
    }
  }

  let ts_scales = {};
  for (let index = 0; index < currentTimeStrs.length; index++) {
    const element = currentTimeStrs[index];

    let v = today + element;
    let c = moment(v);
    ts_scales = {
      ...ts_scales,
      [getShortHour(c.toDate().getTime())]: {
        label: getShortHour(c.toDate().getTime()),
        val: c.toDate().getTime(),
        date: c.toDate(),
      },
    };
  }

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
    currentEndHour += 1;
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

  if (endLabel == '11pm') {
    endLabel = '<12 am';
  }

  return {
    ts_scale_start: {
      label: startLabel,
      val: _startMoment.toDate().getTime(),
      date: _startMoment.toDate(),
    },
    ...ts_scales,
    ts_scale_end: {
      label: endLabel,
      val: _endMoment.toDate().getTime(),
      date: _endMoment.toDate(),
    },
  };
}

function getDailyGeneralDataVitalScaleValues(
  vital_type,
  y_min,
  y_max,
  convertGlucoseData,
) {
  const trn = Translate('getDailyGeneralDataVitalScaleValues');
  let _DATA_RANGE = getScaleData(vital_type, y_min, y_max);
  let yAxisLabel = convertGlucoseData
    ? getLabelByUnits(GLUCOSE_UNIT.MMOL)
    : getLabelByDataType(vital_type);

  let diff = _DATA_RANGE.RANGE_TOP - _DATA_RANGE.RANGE_BOTTOM;
  let low = _DATA_RANGE.RANGE_BOTTOM;
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

    vital_scale_label: {
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

    meals: {
      label: trn.meals,
      value: low - percent(51.82, diff),
      line: low - percent(50, diff),
    },

    fasting: {
      label: trn.fasting,
      value_lower: low - percent(48.18, diff),
      value_upper: low - percent(42.73, diff),
      line: low - percent(40.91, diff),
    },

    activity: {
      label: trn.activity,
      value: low - percent(30.5, diff),
      line: low - percent(27.27, diff),
      value_upper: low - percent(28.18, diff),
      value_lower: low - percent(39.1, diff),
    },

    warningDataOffset: percent(1.8, diff),
  };
}
