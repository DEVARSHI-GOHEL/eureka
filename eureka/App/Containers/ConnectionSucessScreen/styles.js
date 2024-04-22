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
    ...Spacer.mediumVerticalPadding,
    ...Spacer.horizontalPadding
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    ...Spacer.smallTopMargin,
    ...Spacer.mediumBottomMargin,
    ...Alignment.textCenter
  },
  subHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Spacer.largeBottomMargin
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.tinyBottomMargin
  },
  // actFieldCode:{
  //   ...Fonts.fontSemiBold,
  //   textAlign:'center', 
  //   fontSize:24, 
  //   lineHeight:32,
  //   color:'#000'
  // },
  imageContent:{
    ...Spacer.mediumVerticalMargin,
    ...Alignment.crossCenter,
    height:300
  },
  connectSucessImage:{
    ...Alignment.resizeImageMode,
    ...Spacer.percentHeight,
    ...Spacer.percentWidth
  }
})