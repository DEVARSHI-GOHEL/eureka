import React from 'react';
import _ from 'lodash';
import { Translate } from '../../Services/Translate';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UIGlucoseSvgIcon} from '../../Components/UI';
import {UiMapper} from '../../constants/MeasureUIConstants';

export default function BloodGlucoseScreen({navigation}) {
  const {bloodGlucoseValue, bloodGlucoseColor} = useSelector((state) => ({
    bloodGlucoseValue: state.home.bloodGlucoseValue,
    bloodGlucoseColor: state.home.bloodGlucoseColor,
  }));

  //return <UICommingSoon/>
  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE}
      navigation={navigation}
      headerAccessibilityLabel="BloodGlucoseScreenTitle"
      title={Translate('bloodGlucoseScreen.title')}
      headerIcon={
        <UIGlucoseSvgIcon
          widthParam={23}
          heightParam={23}
          fill={
            UiMapper.measureColorMap[
              bloodGlucoseValue == 0 ? 0 : bloodGlucoseColor
            ]
          }
        />
      }
      disabledHeaderIcon={
        <UIGlucoseSvgIcon
          widthParam={23}
          heightParam={23}
          fill={UiMapper.measureColorMap[0]}
        />
      }
    />
  );
}
