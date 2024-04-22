import React, {useState, useEffect} from 'react';
import {} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {DB_STORE} from '../../storage/DbStorage';
import {
  INSTANT_CALIBRATE_STATE,
  INSTANT_CALIBRATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

import CalibrateScreen from '../CalibrateScreen';
import CalibrateConnectionScreen from '../CalibrateConnectionScreen';
import CalibrateIntroScreen from "../CalibrateIntroScreen";
import {watchResetAction} from "./action";

const CalibrateControlWrapper = ({navigation, ...props}) => {
  const dispatch = useDispatch();
  const [wasInitialized, setWasInitialized] = useState(false);
  const {operationState} = useSelector((state) => ({
    operationState: state.calibrate.operationState,
  }));

  useEffect(()=>{
    if(!wasInitialized) {
      if(operationState == INSTANT_CALIBRATE_STATE.INITIAL) {
        dispatch(watchResetAction());
      }
      setWasInitialized(true)
    }
  },[wasInitialized,operationState])

  switch (operationState) {
    case INSTANT_CALIBRATE_STATE.RESET:
      return  <CalibrateIntroScreen />;
    case INSTANT_CALIBRATE_STATE.INITIAL:
      return wasInitialized ? <CalibrateScreen navigation={navigation} {...props} /> : null;
    default:
      return <CalibrateConnectionScreen navigation={navigation} {...props} />;
  }

};

export default CalibrateControlWrapper;
