/**
 * @format
 */

import React, {useEffect} from 'react';
import {AppRegistry, Platform, LogBox} from 'react-native';
import 'react-native-gesture-handler';
import notifee, {EventType} from '@notifee/react-native';
import {Provider} from 'react-redux';

import EurekaApp from './App/App';
import store, {dispatch} from './store/store';
import * as Actions from './reducers/modalControlReducer/actions';

import {PermissionServiceHandler} from './PermissionService';
import {name as appName} from './app.json';
import {callModalAction, isModalAction} from "./reducers/modalControlReducer/actions";

notifee.onBackgroundEvent(async ({detail, type}) => {
  if (Platform.OS !== 'android') return;

  const {notification: {data = {}, id = null}} = detail;

  if (type === EventType.DISMISSED
    && data?.actionClose
    && isModalAction(data.actionClose)
  ) {
    dispatch(callModalAction(data.actionClose));
  }

  if (id && type !== EventType.DELIVERED) {
    await notifee.cancelDisplayedNotification(id);
  }
});

LogBox.ignoreLogs([
  'Each child in a list should have a unique',
  'Possible Unhandled Promise Rejection',
  'Remote debugger is in a background tab',
  'Require cycle',
  'Setting a timer for a long period of time',
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'currentlyFocusedField',
  'this.requestAnimationFrame',
  'Error \'detachEvents\' Not in an emitting cycle',
]);

function Root() {
  return (
    <Provider store={store}>
      <EurekaApp accessible={false}/>
    </Provider>
  );
}


function Eureka() {
  /**
   * Prompt user async at app load to provide necessary permissions
   * The api for permissions can be used throughout the app lifetime.
   * This is applicable through all states of app load
   */
  useEffect(() => {
    if (Platform.OS === 'android') {
      const requestPermission = async () => {
        if (PermissionServiceHandler.AndroidPermissionHandler) {
          await PermissionServiceHandler.AndroidPermissionHandler.RECEIVE_SMS();
          await PermissionServiceHandler.AndroidPermissionHandler.READ_PHONE_STATE();
          await PermissionServiceHandler.AndroidPermissionHandler.ACCESS_FINE_LOCATION();
          await PermissionServiceHandler.AndroidPermissionHandler.READ_CALL_LOG();
          await PermissionServiceHandler.AndroidPermissionHandler.READ_CALENDAR();
          await PermissionServiceHandler.AndroidPermissionHandler.READ_CONTACTS();
          if (Platform.constants['Version'] >= 31) {
            await PermissionServiceHandler.AndroidPermissionHandler.BLUETOOTH_SCAN();
            await PermissionServiceHandler.AndroidPermissionHandler.BLUETOOTH_CONNECT();
          }
          if (Platform.constants['Version'] >= 33) {
            await PermissionServiceHandler.AndroidPermissionHandler.READ_MEDIA_IMAGES();
            await PermissionServiceHandler.AndroidPermissionHandler.NOTIFICATIONS_PERMISSION();
          } else {
            await PermissionServiceHandler.AndroidPermissionHandler.READ_STORAGE_PERMISSION();
            await PermissionServiceHandler.AndroidPermissionHandler.WRITE_STORAGE_PERMISSION();
          }
        }
      };

      requestPermission();
    } else if (Platform.OS == 'ios') {
      const requestPermission = async () => {
        if (PermissionServiceHandler.IOSPermissionHandler) {
          await PermissionServiceHandler.IOSPermissionHandler.ACCESS_LOCATION();
        }
      };
      requestPermission();
    }
  }, []);

  return <Root/>;
}

AppRegistry.registerComponent(appName, () => Eureka);
