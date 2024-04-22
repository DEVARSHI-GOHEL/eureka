import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';

export default StyleSheet.create({
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
