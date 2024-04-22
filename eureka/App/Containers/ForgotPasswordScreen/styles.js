import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  mainScrollView: {
    ...Alignment.fill,
  },
  gradientContainer:{
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding,
    ...Alignment.fill
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    ...Spacer.smallTopMargin,
    ...Spacer.tinyBottomMargin
  },
  warnText:{
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color:Colors.red,
    ...Spacer.smallBottomMargin
  },
  bttnWrap:{
    ...Border.buttonBorderWrap
  }
})