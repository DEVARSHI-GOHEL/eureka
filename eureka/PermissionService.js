import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

export const IOSPermissionHandler = {
  ACCESS_LOCATION: async function () {
    Geolocation.requestAuthorization();
  },
};

/**
 * android permissions
 * ACCESS_FINE_LOCATION | RECEIVE_SMS | READ_PHONE_STATE
 */
export const AndroidPermissionHandler = {
  ACCESS_FINE_LOCATION: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the ACCESS_FINE_LOCATION');
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then((data) => {
            console.log('data', data);
            // The user has accepted to enable the location services
            // data can be :
            //  - "already-enabled" if the location services has been already enabled
            //  - "enabled" if user has clicked on OK button in the popup

            /**
             * ############################
             * import Geolocation from '@react-native-community/geolocation';
             * this commented code is for getting geolocation coords it's already installed
             * #############################
             */
            // if (data === 'enabled' || data === 'already-enabled') {
            //   Geolocation.getCurrentPosition(info => {
            //     console.log(info);
            //   },
            //     error => {
            //       if (error.code === 1) {
            //         alert(error.message);
            //       } else if (error.code === 2) {
            //         alert(error.message);
            //       } else if (error.code === 3) {
            //         alert(error.message);
            //       }
            //     },
            //     {
            //       enableHighAccuracy: false,
            //       timeout: 50000,
            //       maximumAge: 100000,
            //       distanceFilter: 0,
            //       forceRequestLocation: true,
            //       showLocationDialog: true
            //     }
            //   )
            // }
          })
          .catch((err) => {
            // The user has not accepted to enable the location services or something went wrong during the process
            // "err" : { "code" : "ERR00|ERR01|ERR02", "message" : "message"}
            // codes :
            //  - ERR00 : The user has clicked on Cancel button in the popup
            //  - ERR01 : If the Settings change are unavailable
            //  - ERR02 : If the popup has failed to open
            if (err.code === 'ERR00') {
              alert(err.message);
            } else if (err.code === 'ERR01') {
              alert(err.message);
            } else if (err.code === 'ERR02') {
              alert(err.message);
            }
          });
      } else {
        console.log('ACCESS_FINE_LOCATION permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  RECEIVE_SMS: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the RECEIVE_SMS');
      } else {
        console.log('RECEIVE_SMS permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_PHONE_STATE: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the READ_PHONE_STATE');
      } else {
        console.log('READ_PHONE_STATE permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_STORAGE_PERMISSION: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        // PermissionsAndroid.PERMISSIONS['WRITE_EXTERNAL_STORAGE'],
        PermissionsAndroid.PERMISSIONS['READ_EXTERNAL_STORAGE'],
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the STORAGE');
      } else {
        console.log('STORAGE permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  WRITE_STORAGE_PERMISSION: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['WRITE_EXTERNAL_STORAGE'],
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the Write STORAGE');
      } else {
        console.log('STORAGE write permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_CALL_LOG: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['READ_CALL_LOG'],
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the read call log');
      } else {
        console.log('read call log write permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_CALENDAR: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['READ_CALENDAR'],
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the read calendar');
      } else {
        console.log('read calendar write permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  BLUETOOTH_SCAN: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
          "android.permission.BLUETOOTH_SCAN",
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('BLUETOOTH_SCAN permission granted');
      } else {
        console.log('BLUETOOTH_SCAN permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  BLUETOOTH_CONNECT: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
          "android.permission.BLUETOOTH_CONNECT",
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('BLUETOOTH_CONNECT permission granted');
      } else {
        console.log('BLUETOOTH_CONNECT permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_MEDIA_IMAGES: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
          "android.permission.READ_MEDIA_IMAGES",
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('READ_MEDIA_IMAGES permission granted');
      } else {
        console.log('READ_MEDIA_IMAGES permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  READ_CONTACTS: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
          "android.permission.READ_CONTACTS",
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('READ_CONTACTS permission granted');
      } else {
        console.log('READ_CONTACTS permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  },
  /**
   * Check notifications permission - primarily for notifee library.
   */
  NOTIFICATIONS_PERMISSION: async function () {
    if (Platform.OS == 'ios') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
          "android.permission.POST_NOTIFICATIONS",
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('POST_NOTIFICATIONS permission granted');
      } else {
        console.log('POST_NOTIFICATIONS permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  }

};

export const PermissionServiceHandler = {
  AndroidPermissionHandler,
  IOSPermissionHandler,
};
