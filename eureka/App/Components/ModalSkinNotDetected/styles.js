import {StyleSheet, Dimensions} from 'react-native';
import {Fonts} from '../../Theme';
const window = Dimensions.get("window");
const imageSize = window.width; 
const LITTLE_SCREEN = window.height < 700;

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  gradientContainer: {
    justifyContent: 'space-between',
  },
  header: {
    ...Fonts.fontBold,
    fontSize: 28,
    textAlign: 'center',
    marginTop: LITTLE_SCREEN ? 5 : 10,
  },
  watchView: {
    alignSelf: 'center',
    width: imageSize,
    height: imageSize,
    marginTop: LITTLE_SCREEN ? -20 : 0,
    marginBottom: LITTLE_SCREEN ? -20 : 0
  },
  watch: {
    top: 0,
    left: 0,
    position: 'absolute',
    width: imageSize,
    height: imageSize, 
  },
  row: {
    flexDirection: 'row',
    marginBottom: LITTLE_SCREEN ? 10 : 20,
  },
  marker: {
    ...Fonts.fontMedium,
    fontSize: LITTLE_SCREEN ? 15: 17,
  },
  text: {
    marginLeft: 20,
    ...Fonts.fontMedium,
    fontSize: LITTLE_SCREEN ? 17:19,
  },
});
