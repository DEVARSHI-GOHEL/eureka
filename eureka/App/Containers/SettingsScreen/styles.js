import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  settingsWrap:{
    ...Alignment.fill,
    ...Spacer.verticalPadding
  },
  backgroundGradient: {
    ...Alignment.fill,
    ...Spacer.horizontalPadding,
    ...Border.smallRadious
  },
  navArea:{
    ...Alignment.fill,
    ...Spacer.horizontalMargin
  },
  listRow:{
    ...Spacer.spaceRemover,
    borderBottomColor:Colors.borderColor,
    ...Border.borderBottom
  },
  listRowTouch:{
    ...Alignment.fill, 
    ...Alignment.row
  },
  navIcon:{
    ...Fonts.h5
  },
  navText:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
  },
  settingsBottomrow:{
    ...Alignment.row,
    ...Spacer.horizontalPadding,
    ...Alignment.scrollSpaceBetween,
    ...Spacer.topMargin
  },
  settingsLinkText:{
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    color:Colors.blue,
    ...Border.textUnderline
  },
  bttnWrap:{
    ...Border.buttonBorderWrap
  },
  switchSizeAdjust: {
    ...Platform.select({
      ios: {
        transform: [{scaleX: 0.9}, {scaleY: 0.9}],
      },
      android: {
        transform: [{scaleX: 1.2}, {scaleY: 1.2}],
      },
    }),
  },
})