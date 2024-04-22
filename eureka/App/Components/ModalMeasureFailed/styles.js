import {StyleSheet, Dimensions} from 'react-native';
import {Fonts, Colors} from '../../Theme';
const {height, width} = Dimensions.get('window');
const LITTLE_SCREEN = height < 700;

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
    marginTop: LITTLE_SCREEN ? 5 : 20,
    marginBottom: LITTLE_SCREEN ? 20 : 40
  },
  watchView: {
    width,
    paddingLeft: 30,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginVertical: 10,
    marginLeft: -15,
  },
  title: {
    ...Fonts.fontMedium,
    fontSize: 19,
    marginBottom: LITTLE_SCREEN ? 10 : 20
  },
  text: {
    ...Fonts.fontMedium,
    fontSize: LITTLE_SCREEN ? 17:19,
    marginBottom: LITTLE_SCREEN ? 10 : 20
  },
  textContainer: {
    flex: 1,
    justifyContent: LITTLE_SCREEN ? 'space-between' : 'flex-start',
    padding: 0,
    paddingBottom: 20,
  },
  bttnWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  bttn: {
    width: '47.7%'
  }
});
