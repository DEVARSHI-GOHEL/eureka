import {StyleSheet, Dimensions} from 'react-native';
import {Fonts} from '../../Theme';
const window = Dimensions.get("window");
const imageSize = window.width / 1.3; 

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  gradientContainer: {
    justifyContent: 'space-between',
  },
  text: {
    ...Fonts.fontMedium,
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 10,
  },
  watchView: {
    alignSelf: 'center',
    marginTop: 100,
    width: imageSize,
    height: imageSize,
  },
  watch: {
    top: 0,
    left: 0,
    position: 'absolute',
    width: imageSize,
    height: imageSize,
  }
});
