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
    marginBottom: 5,
    textAlign: 'center',
  },
  subHeading: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    marginBottom: 30,
    textAlign: 'center',
  },
  haveAccountContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  leftText: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    paddingRight: 2,
  },
  signInBttn: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ButtonColor,
    marginLeft: 4,
  },
  rightText: {
    ...Fonts.h3,
    ...Fonts.fontSemiBold,
    color: Colors.ButtonColor,
  },
  imageContent: {
    marginVertical: 20,
    alignItems: 'center',
  },
  signInImage: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%',
  },
  crossIcon: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',

    borderWidth: 1,
  },
  topCross: {
    top: 15,
    left: 20,
  },
  bottomCross: {
    bottom: 10,
    left: 20,
  },
  rightCross: {
    top: 80,
    right: -13,
  },
  errorWatchImage: {
    resizeMode: 'contain',
    height: '70%',
    width: '70%',
  },
});
