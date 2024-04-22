import { StyleSheet, Dimensions } from 'react-native';
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
    ...Spacer.mediumVerticalPadding
  },
  textArea:{
    ...Spacer.horizontalPadding
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    ...Spacer.smallTopMargin,
    ...Spacer.tinyBottomMargin
  },
  subHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Spacer.smallBottomMargin
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.tinyBottomMargin
  },
  // actFieldCode:{
  //   ...Fonts.fontSemiBold,
  //   textAlign:'center', 
  //   paddingVertical:0,
  //   fontSize:24, 
  //   //lineHeight:32,
  //   color:'#000'
  // },
  imageContent:{
    ...Spacer.mediumVerticalMargin,
    ...Alignment.crossCenter
  },
  activationCodeWatchImage:{
    ...Alignment.resizeImageMode,
    ...Spacer.percentHeight,
    ...Spacer.percentWidth
  },
  // codeFieldRoot: {
	// 	// width: Dimensions.get('window').width,
  //   // flexDirection:'row', 
    
  //   // alignItems:'center', 
  //   marginLeft:-15,
  //   marginBottom:10
	// },
	// cell: {
	// 	marginLeft:15,
  //   borderRadius:2,
  //   textAlign: 'center',
  //   borderWidth:1, 
  //   borderColor:'#c8c8c8', 
  //   // fontSize:30,
  //   height:52,
  //   textAlignVertical:'center',
  //   ...Fonts.fontSemiBold,
  //   ...Fonts.h5,
  //   paddingVertical:15,
  //   flex:1,
  // },
  // root: {flex: 1, padding: 20},
  // title: {textAlign: 'center', fontSize: 30},
  // codeFieldRoot: {marginTop: 20},
  // cell: {
  //   width: 40,
  //   height: 40,
  //   lineHeight: 38,
  //   fontSize: 24,
  //   borderWidth: 2,
  //   borderColor: '#00000030',
  //   textAlign: 'center',
  // },
  // focusCell: {
  //   borderColor: Colors.blue,
  // },
  linkText:{
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    color:Colors.ButtonColor,
    borderBottomWidth:1,
    borderBottomColor:Colors.ButtonColor,
    textDecorationLine:'underline',
  }
})