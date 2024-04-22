import i18n from 'i18n-js';
import memoize from 'lodash.memoize';
import {getNumberFormatSettings} from 'react-native-localize';

export const Translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);


/**
 * To keep all translations aligned, use script "mergeLanguage".
 * The primary file is english. So if you remove something from there, it will be
 * removed from other languages. If you add some new text into english, and it does not
 * have translation, it will be copied there from english language.
 */
export const TranslationGetters = {
  en: () => require('../assets/languages/en.json'),
  ja: () => require('../assets/languages/ja.json'),
  bn: () => require('../assets/languages/bn.json')
};

/**
 * Return localized error message.
 *
 * Return translated text. The key is from error messages in translations.
 * Eg. 'signup_title' represents errorMessages.signup_title text.
 *
 * @param key
 * @return {*}
 */
export const getErrorMessage = (key) => {
  const messages =  i18n.t('errorMessages') || {};
  return messages[key];
}

export const useTranslation = (screen) => {
  return Translate(screen);
}

export const translateError = (errorText= '') => {
  const [number, text] = errorText.split(":");
  const errors = Translate('errorCodes');

  if (number && errors[number]){
    return `${number}: ${errors[number]}`;
  }

  return errorText;
}
/**
 * Hook for returning localized error texts.
 *
 * @return {{}}
 */
export const useErrorMessages = () => useTranslation('errorMessages');

/**
 * added this function to this file because with raising the version and  i18n 
 * there will be a similar function for setting the separator
 * -- i18n.numberToDelimited
 * @param {string} value 
 * @returns 
 */
export function setNumberSeparatorByLocale(value) {
  if (!value) return value;

  const {decimalSeparator} = getNumberFormatSettings();

  if (decimalSeparator !== '.') {
    return value.replace('.', decimalSeparator); 
  }
  return value; 
};

export function replaceDecimalSeparatorToDot(value) {
  if (!value) return value;
  
  const {decimalSeparator} = getNumberFormatSettings();
  if (value.includes(decimalSeparator)) {
    return value.replace(decimalSeparator, '.'); 
  }
  return value; 
};
