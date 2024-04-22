import {getNumberFormatSettings} from 'react-native-localize';

export function toFixedLocale(value) {
  // NaN can be in input value - this happend in case, when feet and inches are not defined.
  // in this case return empty string. If number will be returned, it will be validated as number not from (0-3]m interval
  if (value === 'NaN') return '';

  const {decimalSeparator} = getNumberFormatSettings();
  if (decimalSeparator === ',') {
    return `${value}`.replace('.', ',');
  }

  return `${value}`; // Locale matches
}

export const metersToImperial = (meters) => {
  let length = (100 * meters) / 2.54;
  let resultFeet = Math.floor(Number(meters) * 3.28);
  let resultInches = Math.floor(length - 12 * resultFeet);
  return [resultFeet, resultInches];
};

export const formatInches = (inches) => `${inches > 9 ? '' : '0'}${inches}`;

export const feetToMeters = (feet=0, inches=0) => {
  let v = Number(feet) * 12 * 0.0254 + Number(inches) * 0.0254;
  return v.toFixed(2);
};
