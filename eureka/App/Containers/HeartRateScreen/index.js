import React from 'react';
import _ from 'lodash';
import { Translate } from '../../Services/Translate';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {UIHeartSvgIcon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UiMapper} from '../../constants/MeasureUIConstants';

export default function HeartRateScreen({navigation}) {
  //return <UICommingSoon/>

  const {heartRateValue, heartRateColor} = useSelector((state) => ({
    heartRateValue: state.home.heartRateValue,
    heartRateColor: state.home.heartRateColor,
  }));

  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_HEART_RATE}
      navigation={navigation}
      headerAccessibilityLabel="HeartRateScreenTitle"
      title={Translate('heartRateScreen.title')}
      headerIcon={
        <UIHeartSvgIcon
          widthParam={26}
          heightParam={26}
          fill={
            UiMapper.measureColorMap[heartRateValue == 0 ? 0 : heartRateColor]
          }
        />
      }
      disabledHeaderIcon={
        <UIHeartSvgIcon
          widthParam={26}
          heightParam={26}
          fill={UiMapper.measureColorMap[0]}
        />
      }
    />
  );
}
