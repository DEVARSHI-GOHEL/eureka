import {StyleSheet, Platform, Dimensions} from 'react-native';
import {Colors, Fonts} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainScrollView: {
    flex: 1,
  },
  tabArea: {
    paddingTop: 20,
    flex: 1,
  },
  tabGraphAreaWrap: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  headerTextStyle: {
    ...Fonts.fontBold,
    fontSize: 20,
    marginLeft: 5,
    // marginTop:2
  },
  headerTileWrap: {
    flex: 1,
    flexDirection: 'row',
    marginTop:10
  },
});
