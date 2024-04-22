import React from 'react';
import _ from 'lodash';
import { Translate } from '../../Services/Translate';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {UIRespirationSvgIcon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UiMapper} from '../../constants/MeasureUIConstants';

export default function RespirationRateScreen({navigation}) {
  const {respirationRateValue, respirationRateColor} = useSelector((state) => ({
    respirationRateValue: state.home.respirationRateValue,

    respirationRateColor: state.home.respirationRateColor,
  }));

  //return <UICommingSoon/>
  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_RESP_RATE}
      navigation={navigation}
      headerAccessibilityLabel="RespirationRateScreenTitle"
      title={Translate('RespirationRateScreen.title')}
      headerIcon={
        <UIRespirationSvgIcon
          widthParam={26}
          heightParam={26}
          fill={
            UiMapper.measureColorMap[
              respirationRateValue == 0 ? 0 : respirationRateColor
            ]
          }
        />
      }
      disabledHeaderIcon={
        <UIRespirationSvgIcon
          widthParam={26}
          heightParam={26}
          fill={UiMapper.measureColorMap[0]}
        />
      }
    />
  );
}
