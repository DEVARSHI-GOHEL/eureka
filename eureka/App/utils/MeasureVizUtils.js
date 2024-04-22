import {UiMapper} from '../constants/MeasureUIConstants';
import {
  VITAL_CONSTANTS,
  DATA_BOUNDS,
  MEASURE_TREND, DATA_DEVIATION,
} from '../Chart/AppConstants/VitalDataConstants';

export function getMeasureColor(param) {
  return UiMapper.measureColorMap[param];
}

export function getMeasureTrendIcon(param) {
  return UiMapper.measureTrendMap[param];
}

const getNumber = (value) => (isNaN(value) ? 0 : value * 1);

const getTrend = (key, mainData, previousMainData) => {
  const diff = mainData[key] - previousMainData[key];
  if (diff == 0) return MEASURE_TREND.none;
  if (diff > 0) return MEASURE_TREND.up;
  return MEASURE_TREND.down
}

const VITAL_PROPS = [
  {key: VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_HEART_RATE, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_OXY_SAT, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_RESP_RATE, checkTrend: true},
  {key: VITAL_CONSTANTS.KEY_STEPS, checkTrend: false},
  {key: VITAL_CONSTANTS.KEY_TS, checkTrend: false},
]

export function convertMeasureInfoFromDb(currentData, previousData) {

  let mainData = {};
  let previousMainData = {};
  let colorData = {};
  let trendData = {};
  let deviationData = {};

  VITAL_PROPS.forEach(({key, checkTrend}) => {
    mainData[key] = getNumber(currentData?.[key]);
    previousMainData[key] = getNumber(previousData?.[key]);
    if (checkTrend) {
      colorData[key] = DATA_BOUNDS[key](mainData[key]);
      trendData[key] = getTrend(key, mainData, previousMainData);
      deviationData[key] = DATA_DEVIATION[key](mainData[key]);

    }
  })

  return {
    mainData,
    trendData,
    colorData,
    deviationData,
  };
}

export function toMMOL(val) {
  return Math.round(((val * 1) / 18) * 10) / 10;
}
