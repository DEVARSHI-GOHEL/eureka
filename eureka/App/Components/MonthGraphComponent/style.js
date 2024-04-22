import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';
const {ButtonColor, graphBorder, blue, borderColor, white} = Colors;

export default StyleSheet.create({
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
    borderColor:ButtonColor,
    color: ButtonColor,
    marginHorizontal: 15,
  },
  iconStyle: {
    ...Fonts.fontSemiBold,
    ...Fonts.large,
  },
  seperator: {
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
});
