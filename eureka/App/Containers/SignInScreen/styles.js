import {
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
    // flex: 1, 
    // justifyContent:'center',
    // alignContent:'center',
    // backgroundColor:Colors.white,
  },
  logoArea:{
    ...Spacer.mediumVerticalMargin,
    ...Spacer.tinyBottomMargin,
    ...Alignment.fillRowNoFlexCenter,
    ...Alignment.crossEnd
    // marginTop:20,
    // marginBottom:5,
    // justifyContent:'center',
    // flexDirection:'row',
    // alignItems:'flex-end'
  },
  logoText:{
    ...Fonts.fontBold,
    ...Fonts.large
  },
  signInImage:{
    resizeMode: 'contain',
    height:'90%',
    width:'100%',
  },
  getStartedView: {
    // backgroundColor:'red',
    ...Spacer.topMargin
  },
  gradientContainer:{
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding
    // paddingHorizontal:15,
  },
  inputIcon:{
    ...Fonts.iconFont,
    color:Colors.iconColor,
    ...Platform.select({
      ios: {
        bottom:0,
      },
      android: {
        bottom:3,
      }
    })
  },
  haveAccountContent: {
    ...Spacer.topMargin,
    ...Alignment.rowMain,
    // flexDirection: 'row',
    // marginTop:20,
    // justifyContent:'center'
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Spacer.tinyHorizontalPadding,
  },
  signInBttn:{
    ...Border.borderBottom,
    borderBottomColor:Colors.ButtonColor,
  },
  forgrtPassword:{
    ...Spacer.bottomMargin,
    ...Alignment.row
  },
  forgotText:{
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    ...Border.borderBottom,
    color:Colors.ButtonColor,
    borderBottomColor:Colors.ButtonColor,
  },
  rightText: {
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    color:Colors.ButtonColor,
  },
  warnText:{
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color:Colors.red,
    ...Spacer.smallBottomMargin
  },
  versionWrap:{
    ...Alignment.fillColCenter,
    ...Spacer.topMargin
  },
  versionWrapTxt:{
    color:Colors.lightGray, 
    ...Fonts.small
  }
});
