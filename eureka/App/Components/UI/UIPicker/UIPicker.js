import React from 'react';
import {Picker} from 'native-base';
import {t} from "i18n-js";

import styles from './styles';

export const UIPicker = ({style, textStyle, value, defaultValue, ...restParams}) => {
  const pickedValueStyle = (defaultValue && value!==defaultValue) ? styles.textStyle:{}
  return (<Picker
    iosHeader={t('UIPicker.selectOne')}
    headerBackButtonText={t('UIPicker.back')}
    headerTitleStyle={{minWidth: 200}}

    style={{...styles.componentStyle, ...style}}
    textStyle={{...styles.textStyleDefaultValue, ...pickedValueStyle, ...textStyle}}

  {...restParams}

  />);
}

UIPicker.Item = Picker.Item;

