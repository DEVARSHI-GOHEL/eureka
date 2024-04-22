import React from 'react';
import _ from 'lodash';
import { Translate } from '../../Services/Translate';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {UIBLPressureSvgIcon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UiMapper} from '../../constants/MeasureUIConstants';

export default function BloodPressureScreen({navigation}) {
  const {
    bloodPressureSystolicValue,
    bloodPressureDiastolicValue,

    bloodPressureColor,
  } = useSelector((state) => ({
    bloodPressureSystolicValue: state.home.bloodPressureSystolicValue,
    bloodPressureDiastolicValue: state.home.bloodPressureDiastolicValue,
    bloodPressureColor: state.home.bloodPressureColor,
  }));

  //return <UICommingSoon/>
  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH}
      navigation={navigation}
      headerAccessibilityLabel="BloodPressureScreenTitle"
      title={Translate('bloodPressureScreen.title')}
      headerIcon={
        <UIBLPressureSvgIcon
          widthParam={30}
          heightParam={30}
          fill={
            UiMapper.measureColorMap[
              bloodPressureSystolicValue == 0 &&
              bloodPressureDiastolicValue == 0
                ? 0
                : bloodPressureColor
            ]
          }
        />
      }
      disabledHeaderIcon={
        <UIBLPressureSvgIcon
          widthParam={30}
          heightParam={30}
          fill={UiMapper.measureColorMap[0]}
        />
      }
    />
  );
}
