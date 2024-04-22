import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../Theme';

export default StyleSheet.create({
  topArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E3E6',
  },
  arrowIcon: {
    ...Fonts.medium,
    color: '#BDBDBD',
  },
  activeIcon: {
    color: Colors.black,
  },
  dateText: {
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
  graphArea: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#D9D9D9',
    borderBottomColor: '#D9D9D9',
    marginTop: 5,
  },
  infoIconColor: {
    fontSize: 30,
    color: Colors.blue,
    marginLeft: 12,
  },

  bttn: {
    borderWidth: 1,
    paddingVertical: 3,
    borderColor: Colors.ButtonColor,
    color: Colors.ButtonColor,
    marginHorizontal: 15,
  },
  bttnWrap: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 7,
    borderTopColor: '#D2D3D6',
  },
  bttnArea: {
    marginHorizontal: 6,
    flex: 1,
  },
});
