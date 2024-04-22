import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';

export default StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  imageContent: {
    marginBottom: 50,
    alignItems: 'center',
  },
  signInImage: {
    resizeMode: 'cover',
  },

  welcomeHeading: {
    ...Fonts.fontBold,
    ...Fonts.h4,
    textAlign: 'center',
    paddingHorizontal: '20%',
    marginBottom: 10,
  },
  subHeading: {
    ...Fonts.medium,
    ...Fonts.fontMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  startBttnWrap: {
    width: '90%',
  },
  activeDot: {
    backgroundColor: 'black',
  },
  haveAccountContent: {
    flexDirection: 'row',
    marginTop: 20,
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    paddingRight: 2,
  },
  signInBttn: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ButtonColor,
    marginLeft: 4,
  },
  rightText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    color: Colors.ButtonColor,
  },
  iconImage: {
    width: 200,
    height: 200,
  },
});
