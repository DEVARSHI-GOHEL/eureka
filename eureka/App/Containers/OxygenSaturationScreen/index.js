import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {UIOxygenSatSvgIcon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UiMapper} from '../../constants/MeasureUIConstants';
import { Translate } from '../../Services/Translate';

export default function OxygenSaturationScreen({navigation}) {
  const {oxygenSaturationValue, oxygenSaturationColor} = useSelector(
    (state) => ({
      oxygenSaturationValue: state.home.oxygenSaturationValue,

      oxygenSaturationColor: state.home.oxygenSaturationColor,
    }),
  );

  //return <UICommingSoon/>
  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_OXY_SAT}
      navigation={navigation}
      headerAccessibilityLabel="OxygenSaturationScreenTitle"
      title={Translate('oxygenSaturationScreen.title')}
      headerIcon={
        <UIOxygenSatSvgIcon
          widthParam={25}
          heightParam={25}
          fill={
            UiMapper.measureColorMap[
              oxygenSaturationValue == 0 ? 0 : oxygenSaturationColor
            ]
          }
        />
      }
      disabledHeaderIcon={
        <UIOxygenSatSvgIcon
          widthParam={26}
          heightParam={26}
          fill={UiMapper.measureColorMap[0]}
        />
      }
    />
  );
}
