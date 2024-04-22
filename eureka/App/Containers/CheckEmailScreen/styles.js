import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainScrollView: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  createAccHeading: {
    ...Fonts.fontBold,
    ...Fonts.h4,
    marginTop: 10,
    marginBottom: 8,
  },
  subHeading: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    marginBottom: 30,
  },
  warnText: {
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color: Colors.red,
    marginBottom: 10,
  },
  iconContainer: {
    marginTop: 100,
    backgroundColor: '#d0e7ff',
    height: 220,
    width: 220,
    borderRadius: 220,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  icon: {
    width: '90%',
    height: '90%',
  },
});
