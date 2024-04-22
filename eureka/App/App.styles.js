import {Platform, StatusBar, StyleSheet} from "react-native";
import DeviceInfo from "react-native-device-info";

let isIphoneX = DeviceInfo.hasNotch();

const getStatusBarHeight = () => {
  let resultHeight;

  if (Platform.OS === 'ios') {
    if (isIphoneX) {
      resultHeight = 40;
    } else {
      resultHeight = 22;
    }
  } else {
    resultHeight = StatusBar.currentHeight;
  }
  return resultHeight;

}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: getStatusBarHeight(),
  },
  appBar: {},
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
});
