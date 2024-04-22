import {Platform, StyleSheet} from "react-native";
import Fonts from "../../../../Theme/Fonts";

export default StyleSheet.create({
  qrcodeWrapper: {width: '100%', height: 300},
  camera: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: '100%',
    width: '100%',
  },
  platformCameraStyle: Platform.OS === 'ios' ? {} : {
    marginTop: "20%",
  },
  missingPermissionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingPermissionsText: {
    textAlign: 'center',
    ...Fonts.h3,
  }
});
