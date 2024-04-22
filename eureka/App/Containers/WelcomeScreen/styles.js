import {
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';
import {lineHeight} from "../../Theme/Fonts";

export default StyleSheet.create({
  logoArea:{
    ...Spacer.topMargin,
    ...Spacer.mediumBottomMargin,
    ...Alignment.rowMain,
    ...Alignment.crossCenter,
    flex:.3
  },
  logoText:{
    ...Fonts.fontSemiBold,
    ...Fonts.iconFont,
    ...Spacer.tinyTopMargin,
  },
  mainContainer: {
    ...Alignment.fill,
    // justifyContent:'center',
    // alignContent:'center',
    backgroundColor:Colors.white,
  },
  innerContainer:{
    ...Alignment.fill,
  },
  imageContent:{
    ...Alignment.fill,
    maxHeight:300,
    ...Spacer.smallBottomMargin
  },
  getStartedView: {
    ...Spacer.topMargin,
    ...Alignment.fill,
    ...Alignment.crossCenter
  },
  signInImage: {
    ...Alignment.resizeImageMode,
    ...Spacer.percentHeight,
    ...Spacer.percentWidth
  },
  welcomeHeading:{
    ...Fonts.fontBold,
    ...Fonts.h1,
    ...Alignment.textCenter,
  },
  subHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Alignment.textCenter,
    ...Spacer.mediumBottomMargin,
    paddingHorizontal: 10,
  },
  additionalText:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Alignment.textCenter,
    ...Spacer.smallVerticalMargin,
    paddingHorizontal: 10,
  },
  startBttnWrap:{
    ...Spacer.percentWidth,
    ...Spacer.horizontalPadding
  },
  haveAccountContent: {
    ...Alignment.rowCenter,
    ...Spacer.topMargin
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
  },
  signInBttn:{
    ...Border.borderBottom,
    borderBottomColor:Colors.ButtonColor,
    ...Spacer.tinyLeftMargin
  },
  rightText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    color:Colors.ButtonColor,
  },
});
