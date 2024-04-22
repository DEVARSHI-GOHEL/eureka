import {percent} from '../AppUtility/PercentFunctions';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {Translate} from "../../Services/Translate";

// values must match with "vitalDataBounds" in translations
export const _VITAL_CONSTANTS = {
  KEY_UID: 'uid',
  KEY_DEVICE_ID: 'device_id',

  KEY_BLOOD_GLUCOSE: 'glucose',
  KEY_OXY_SAT: 'o2',
  KEY_HEART_RATE: 'heart_rate',
  KEY_RESP_RATE: 'respiration',
  KEY_BLOOD_PRESSURE_HIGH: 'bpsys',
  KEY_BLOOD_PRESSURE_LOW: 'bpdia',

  KEY_STEPS: 'steps',

  KEY_TS: 'measure_time',
  KEY_OXY_SAT_BP_NORM: 95
};

// all values should reference to vitalUnits in translation
export const VITAL_UNITS = {
  [_VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE]: GLUCOSE_UNIT.MGDL,
  [_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]: 'mmHg',
  [_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]: 'mmHg',
  [_VITAL_CONSTANTS.KEY_HEART_RATE]: 'bpm',
  [_VITAL_CONSTANTS.KEY_RESP_RATE]: 'brpm',
  [_VITAL_CONSTANTS.KEY_OXY_SAT]: '%',
};

export function getVitalDataBoundsNameAndUnit(vitalType, glucose_unit) {
  const bounds = Translate('vitalDataBounds');
  const vitalUnits = Translate('vitalUnits')

  let unit = vitalUnits[VITAL_UNITS[vitalType]];

  if (vitalType == _VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE) {
    return {name: bounds.glucose, unit: vitalUnits[glucose_unit]};
  } else if (bounds[vitalType]) {
    return {name: bounds[vitalType], unit};
  } else {
    return {name: bounds.data, unit: 'n/a'};
  }
}

export const VITAL_CONSTANTS = _VITAL_CONSTANTS;

const _WARNING_RANGE = {};

_WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE] = {
  min: 70,
  max: 180,
  fallback: {
    max: 190,
    min: 60,
    averageMax: 185,
    averageMin: 65,
  },
};

_WARNING_RANGE[_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] = {
  min: 50,
  max: 180,
  fallback: {
    max: 190,
    min: 40,
    averageMax: 185,
    averageMin: 45,
  },
};

_WARNING_RANGE[_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] = {
  min: 50,
  max: 180,
  fallback: {
    max: 190,
    min: 40,
    averageMax: 185,
    averageMin: 45,
  },
};

_WARNING_RANGE[_VITAL_CONSTANTS.KEY_HEART_RATE] = {
  min: 40,
  max: 130,
  fallback: {
    max: 140,
    min: 30,
    averageMax: 135,
    averageMin: 35,
  },
};

_WARNING_RANGE[_VITAL_CONSTANTS.KEY_RESP_RATE] = {
  min: 10,
  max: 30,
  fallback: {
    max: 32,
    min: 8,
    averageMax: 31,
    averageMin: 9,
  },
};

_WARNING_RANGE[_VITAL_CONSTANTS.KEY_OXY_SAT] = {
  min: 85,
  max: 100,
  fallback: {
    max: 102,
    min: 84,
    averageMax: 101,
    averageMin: 83,
  },
};


let _DATA_DEVIATION = {};

const _DATA_BOUNDS_TYPE = {
  none: 0,
  normal: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

export const DEVIATION_OK = 1; // normal
export const DEVIATION_LOW = 2; // yellow
export const DEVIATION_HIGHER = 3; // orange
export const DEVIATION_HIGH = 4; // red
export const DEVIATION_UNDEFINED = 0;

// this threshold is used for comparing if value (deviation) is low
export const DEVIATION_LOW_THRESHOLD = -DEVIATION_OK;

const getBoundColor = (deviation) => {
  switch (Math.abs(deviation)) {
    case DEVIATION_OK:
      return _DATA_BOUNDS_TYPE.normal;
    case DEVIATION_LOW:
      return _DATA_BOUNDS_TYPE.yellow;
    case DEVIATION_HIGHER:
      return _DATA_BOUNDS_TYPE.orange;
    case DEVIATION_HIGH:
      return _DATA_BOUNDS_TYPE.red;
    default:
      return _DATA_BOUNDS_TYPE.none
  }
}

_DATA_DEVIATION[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE] = function (val) {

  // kept unrefactored, for better PR
  if (val > 180 || val < 70) {
    if (val > 180) return DEVIATION_HIGH;
    return -DEVIATION_HIGH;
  } else if (val >= 80 && val <= 100) {
    return DEVIATION_OK;
  } else if ((val >= 75 && val < 80) || (val > 100 && val <= 150)) {
    if (val > 100 ) return DEVIATION_LOW;
    return -DEVIATION_LOW;
  } else if ((val >= 70 && val < 75) || (val > 150 && val <= 180)) {
    if (val > 150) return DEVIATION_HIGHER;
    return -DEVIATION_HIGHER;
  } else {
    return DEVIATION_UNDEFINED;
  }

}

//Sys and Dys combo val should range from 50 to 180
//systolic
_DATA_DEVIATION[_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] = function (val) {
  // kept unrefactored, for better PR
  if (val > 180 || val < 80) {
    if (val < 80) return -DEVIATION_HIGH
    return DEVIATION_HIGH;
  } else if (val >= 91 && val <= 130) {
    return DEVIATION_OK;
  } else if ((val >= 86 && val < 91) || (val > 130 && val <= 140)) {
    if (val < 91) return -DEVIATION_LOW;
    return DEVIATION_LOW;
  } else if ((val >= 80 && val < 86) || (val >= 140 && val <= 180)) {
    if (val < 86) return -DEVIATION_HIGHER;
    return DEVIATION_HIGHER;
  } else {
    return _DATA_BOUNDS_TYPE.none;
  }
};

//diastolic
_DATA_DEVIATION[_VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] = function (val) {
  if (val > 110 || val < 50) {
    if (val > 110) return DEVIATION_HIGH;
    return -DEVIATION_HIGH;
  } else if (val >= 61 && val <= 90) {
    return DEVIATION_OK;
  } else if ((val >= 56 && val < 61) || (val > 90 && val <= 100)) {
    if (val > 90 ) return DEVIATION_LOW;
    return -DEVIATION_LOW;
  } else if ((val >= 50 && val < 56) || (val > 100 && val <= 110)) {
    if (val > 100) return DEVIATION_HIGHER;
    return -DEVIATION_HIGHER;
  } else {
    return DEVIATION_UNDEFINED;
  }
};

_DATA_DEVIATION[_VITAL_CONSTANTS.KEY_HEART_RATE] = function (val) {
  if (val > 130 || val < 40) {
    if (val > 130) return DEVIATION_HIGH;
    return -DEVIATION_HIGH;
  } else if (val >= 60 && val <= 100) {
    return DEVIATION_OK;
  } else if ((val >= 50 && val < 60) || (val > 100 && val <= 109)) {
    if (val > 100 ) return DEVIATION_LOW;
    return -DEVIATION_LOW;
  } else if ((val >= 40 && val < 50) || (val > 109 && val <= 130)) {
    if (val > 109) return DEVIATION_HIGHER;
    return -DEVIATION_HIGHER;
  } else {
    return DEVIATION_UNDEFINED;
  }
};

_DATA_DEVIATION[_VITAL_CONSTANTS.KEY_RESP_RATE] = function (val) {
  if (val > 30 || val <= 10) {
    if (val > 30) return DEVIATION_HIGH;
    return -DEVIATION_HIGH;
  } else if (val > 12 && val <= 20) {
    return DEVIATION_OK;
  } else if ((val > 11 && val <= 12) || (val > 20 && val <= 22)) {
    if (val > 20 ) return DEVIATION_LOW;
    return -DEVIATION_LOW;
  } else if ((val > 10 && val < 12) || (val > 20 && val <= 30)) {
    if (val > 20) return DEVIATION_HIGHER;
    return -DEVIATION_HIGHER;
  } else {
    return DEVIATION_UNDEFINED;
  }
};

_DATA_DEVIATION[_VITAL_CONSTANTS.KEY_OXY_SAT] = function (val) {

  if (val >= 95 && val <= 100) {
    return DEVIATION_OK;
  }

  if (val >= 90 && val < 95) {
    return -DEVIATION_LOW;
  }

  if (val >= 85 && val < 90) {
    return -DEVIATION_HIGHER;
  }

  if (val < 85) {
    return -DEVIATION_HIGH;
  }

  return DEVIATION_UNDEFINED;
};

export const MEASURE_TREND = {
  none: 0,
  down: 1,
  up: 2,
};

export const getScaleData = function (
  vital_type,
  _mindata,
  _maxdata,
  isCompressedBounds,
) {
  let maxdata = 0;
  let mindata = 0;

  maxdata = _WARNING_RANGE[vital_type].max;
  mindata = _WARNING_RANGE[vital_type].min;
  //this can only happen if max data has gone below the lower line (all data are below low range)
  //OR min data has gone below the higher line (all data are above high range)
  if (maxdata < _WARNING_RANGE[vital_type].min) {
    maxdata = _WARNING_RANGE[vital_type].min + 5;
  }

  if (mindata > _WARNING_RANGE[vital_type].max) {
    mindata = _WARNING_RANGE[vital_type].max - 5;
  }

  //TODO

  let diff = maxdata - mindata;

  let upperBoundsPercent = 0;
  let lowerBoundsPercent = 0;

  if (isCompressedBounds) {
    upperBoundsPercent = 14;
    lowerBoundsPercent = 20;
  } else {
    upperBoundsPercent = 27.27;
    lowerBoundsPercent = 59.09;
  }

  let range = {
    MIN: mindata - percent(lowerBoundsPercent, diff),
    MAX: maxdata + percent(upperBoundsPercent, diff),
    RANGE_BOTTOM: mindata,
    RANGE_TOP: maxdata,
    RANGE_MID: Math.round((mindata + maxdata) / 2),
  };

  return range;
};

function normalizeMinData(val, compareVal) {
  let remainder = val % 5;
  let result = remainder == 0 ? val - 5 : val - remainder;

  if (result < compareVal) {
    result = compareVal;
  }

  return result;
}

function normalizeMaxData(val, compareVal) {
  let remainder = val % 5;
  let result = remainder == 0 ? val + 5 : val - remainder + 5;

  if (result > compareVal) {
    result = compareVal;
  }

  return result;
}


const createDataBound = () => {
  let result = {};
  Object.keys(VITAL_UNITS).forEach((key) => {
    result[key] = (value) => {
      return getBoundColor(_DATA_DEVIATION[key](value));
    };
  })
  return result;
}

const _DATA_BOUNDS = createDataBound();

export const WARNING_RANGE = _WARNING_RANGE;
export const DATA_BOUNDS = _DATA_BOUNDS;
export const DATA_DEVIATION = _DATA_DEVIATION;
export const DATA_BOUNDS_TYPE = _DATA_BOUNDS_TYPE;
export const PERIOD_NAME = {
  day: 'Day',
  week: 'week',
  month: 'Month',
  year: 'Year',
};