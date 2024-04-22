import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  mainScrollView:{
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  gradientContainer:{
    ...Alignment.fill,
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding
  },
  calibrateTopText:{
    ...Spacer.smallHorizontalPadding,
    ...Alignment.row,
    ...Border.commonBorder,
    borderColor:Colors.secondLightGray,
    ...Spacer.smallVerticalPadding,
    ...Border.smallRadious,
    backgroundColor:Colors.white,
    ...Spacer.mediumBottomMargin
  },
  subHeading:{
    ...Alignment.fill,
    ...Fonts.h3,
    ...Fonts.fontSemiBold,
    ...Spacer.smallLeftMargin
  },
  infoIcon:{
    ...Alignment.fill,
    ...Fonts.h3,
  },
  inputText:{
    color:Colors.lightGray,
    ...Fonts.sub,
    ...Fonts.fontSemiBold,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.tinyBottomMargin
  },
  lastUpdateText:{
    ...Fonts.fontMedium,
    ...Fonts.sub,
    color:Colors.lightGray
  },
  bttnWrap:{
    ...Border.buttonBorderWrap
  },
  warnText:{
    ...Alignment.fill,
    ...Fonts.sub,
    ...Fonts.fontMedium,
    // color:Colors.red,
    color:Colors.gray,
    marginTop:-8,
    ...Spacer.smallBottomMargin,
    ...Alignment.flexWrap
  }
})