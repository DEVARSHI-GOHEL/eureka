import React from 'react';
import _ from 'lodash';
import { Translate } from '../../Services/Translate';
import GraphContainerWrapper from '../GraphContainerWrapper';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {UICommingSoon} from '../../Components/UI';
import {UIStepsWalkSvgIcon} from '../../Components/UI';
import {useSelector} from 'react-redux';
import {UiMapper} from '../../constants/MeasureUIConstants';

export default function StepsWalkedScreen({navigation}) {
  // return <UICommingSoon/>
  const {
    stepsWalkValue,

    stepGoalPercent,
  } = useSelector((state) => ({
    stepsWalkValue: state.home.stepsWalkValue,

    stepGoalPercent: state.home.stepGoalPercent,
  }));

  return (
    <GraphContainerWrapper
      vitalType={VITAL_CONSTANTS.KEY_STEPS}
      navigation={navigation}
      headerAccessibilityLabel="StepsWalkedScreenTitle"
      title={Translate('StepsWalkedScreen.title')}
      headerIcon={
        <UIStepsWalkSvgIcon
          widthParam={32}
          heightParam={32}
          fill={stepsWalkValue == 0 ? '#999' : '#D0E7FF'}
        />
      }
      disabledHeaderIcon={
        <UIStepsWalkSvgIcon widthParam={32} heightParam={32} fill={'#999'} />
      }
    />
  );
}
