import {StyleSheet} from 'react-native';
import {Fonts} from '../../../../Theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  wristView: {
    flexDirection: 'row',
    flex: 1,
  },
  textView: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  textTitleStyle: {
    ...Fonts.fontBold,
    marginBottom: 10,
    fontSize: 20,
  },
  textStyle: {
    ...Fonts.fontRegular,
  },
});
