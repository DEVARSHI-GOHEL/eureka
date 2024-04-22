/**
 * LifePlus Eureka - React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {StatusBar, View, AppState} from 'react-native';

import * as RNLocalize from 'react-native-localize';
import AppNavigator from './Navigators/AppNavigator';
import UIToastWrapper from './Containers/UIToastWrapper';
import i18n from 'i18n-js';
import {Root} from 'native-base';
import {useSelector} from 'react-redux';

import ApplicationOverlay from './Components/ApplicationOverlay/ApplicationOverlay';
import {Translate, TranslationGetters} from '../App/Services/Translate';
import {
  checkFirmwareUpgradeDialog,
  setAppIsInBackground,
} from './Services/updateChecker';
import {
  getDataNotification,
  requestUserPermission,
} from './Services/NotificationService';
import {styles} from './App.styles';
import {switcherIsInBackground} from './Services/backgroundNotifee';
import moment from "moment";

// this is imported because build may s
import JaLocale from 'moment/locale/ja';
import BnLocale from 'moment/locale/bn';

const setI18nConfig = () => {
  const fallback = {languageTag: 'en'};
  const {languageTag} =
    RNLocalize.findBestAvailableLanguage(Object.keys(TranslationGetters)) ||
    fallback;

  Translate.cache.clear();

  i18n.translations = {[languageTag]: TranslationGetters[languageTag]()};

  i18n.locale = languageTag;
  switch (languageTag){
    case "ja":
      moment.locale(languageTag, JaLocale);
      break;
    case "bn":
      moment.locale(languageTag, BnLocale);
      break;
    default:
      moment.locale(languageTag);
  }
};

const CustomStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, {backgroundColor}]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

const handleLocalizationChange = () => {
  setI18nConfig();
};

const App = () => {
  const {userId} = useSelector((state) => ({
    userId: state.auth.userId,
  }));

  useEffect(() => {
    setI18nConfig();
    requestUserPermission();
    getDataNotification();
    checkFirmwareUpgradeDialog();

    const unsubscribeAppState = AppState.addEventListener(
      'change',
      (nextAppState) => {
        const isInBackground = nextAppState !== 'active';

        setAppIsInBackground(isInBackground);
        switcherIsInBackground(isInBackground);

        if (nextAppState === 'active') {
          checkFirmwareUpgradeDialog();
        }
      },
    );

    const unsubscribe = RNLocalize.addEventListener(
      'change',
      handleLocalizationChange,
    );

    return () => {
      unsubscribe?.();
      unsubscribeAppState?.remove?.();
    };
  }, []);

  return (
    <Root>
      <CustomStatusBar backgroundColor="#fff" barStyle="dark-content" />
      {userId && <UIToastWrapper accessibilityLabel="toast-access-label" />}
      <AppNavigator />
      <ApplicationOverlay />
    </Root>
  );
};

export default App;
