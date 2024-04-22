import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';

const {
  ButtonColor,
  graphArrowIcon,
  graphBorder,
  graphArrowBottomBorder,
  black,
  blue,
  borderColor,
  white,
} = Colors;

export default StyleSheet.create({
  topArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: graphArrowBottomBorder,
  },
  arrowIcon: {
    ...Fonts.medium,
    color: graphArrowIcon,
  },
  activeIcon: {
    color: black,
  },
  dateText: {
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
  graphArea: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: graphBorder,
    borderBottomColor: graphBorder,
    marginTop: 25,
    marginHorizontal: 15,
  },

  infoIconColor: {
    fontSize: 30,
    color: blue,
    marginLeft: 12,
  },

  bttn: {
    borderWidth: 1,
    paddingVertical: 3,
    borderColor: ButtonColor,
    color: ButtonColor,
    marginHorizontal: 15,
  },
  iconStyle: {
    ...Fonts.fontSemiBold,
    ...Fonts.large,
  },
  separator: {
    borderBottomWidth: 2,
  },
  headingWrap: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: graphBorder,
  },
  bttnWrap: {
    backgroundColor: white,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 7,
    borderTopColor: borderColor,
  },
  bttnArea: {
    marginHorizontal: 6,
    flex: 1,
  },
  headerTextStyle: {
    ...Fonts.fontBold,
    fontSize: 20,
    marginLeft: 5,
  },
  headerTileWrap: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
  },
});
