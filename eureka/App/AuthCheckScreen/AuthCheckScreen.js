import React, {useEffect, useState} from 'react';
import {StatusBar, View, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UILoader} from '../Components/UI';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../Containers/SignInScreen/action';
import {USER_REGISTRATION_STATE} from '../constants/AppDataConstants';

import ConnectCommandHandler from '../Containers/ConnectWatchScreen/ConnectCommandHandler';
import {EVENT_MANAGER} from '../Ble/NativeEventHandler';
import {fetchStepsGoal} from "../Containers/ProfileScreen/tools";

function AuthCheckScreen({navigation}) {
  const dispatch = useDispatch();


  const getUserStateApiFromLocal = async () => {
    const userId = await AsyncStorage.getItem('user_id'); //LATER SHIFT TO LOCAL DB
    const userState = await AsyncStorage.getItem('user_state'); //READ IT FROM LOCAL CACHE - LATER SHIFT THIS TO LOCAL DB
    const fullName = await AsyncStorage.getItem('user_name');
    const deviceMSN = await AsyncStorage.getItem('device_msn'); //READ IT FROM LOCAL CACHE - LATER SHIFT THIS TO LOCAL DB

    const alreadyLaunched = await AsyncStorage.getItem('already_launched');

    //Either previous user has logged out or no user details is present or app cache data has been cleared.
    if (!userId) {
      if (alreadyLaunched) {
        navigation.reset({
          index: 0,
          routes: [{name: 'SignInScreen'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'WelcomeScreen'}],
        });
      }

      return;
    }

    dispatch(loginSuccess(true, userId, fullName));
    const userStateNum = parseInt(userState, 10);

    switch (userStateNum) {
      case USER_REGISTRATION_STATE.HAS_NOT_FILLED_TC:
        navigation.reset({
          index: 0,
          routes: [{name: 'TermConditionScreen'}],
        })
        return;
      case USER_REGISTRATION_STATE.HAS_NOT_FILLED_PERSONAL_INFO:
        //Not filled Personal Account info
        navigation.reset({
          index: 0,
          routes: [{name: 'PersonalInfoScreen'}],
        });
        return;
      case USER_REGISTRATION_STATE.HAS_PASSTHROUGH:
        await fetchStepsGoal();

        if (deviceMSN) {
          sendPairConnectRequest();
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeTab'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'DeviceRegistrationScreen'}],
          });
        }
        break;
    }
  };

  useEffect(() => {
    getUserStateApiFromLocal();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <StatusBar barStyle="default" />
      <UILoader />
    </View>
  );
}

export default AuthCheckScreen;

function sendPairConnectRequest() {
  ConnectCommandHandler.startPairConnect(async () => {
    let userId = await AsyncStorage.getItem('user_id');
    let deviceMsn = await AsyncStorage.getItem('to_pair_device_msn');

    EVENT_MANAGER.SEND.connect(userId, deviceMsn);
  });
}
