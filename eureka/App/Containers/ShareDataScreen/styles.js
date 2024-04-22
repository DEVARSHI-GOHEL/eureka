import { StyleSheet, Platform } from 'react-native';
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
  diseaseHeading:{
    ...Fonts.fontBold,
    ...Fonts.h6,
    marginTop:15,
  },
  diseaseText:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    //marginLeft:10,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.tinyBottomMargin
  },
  radioBttnRow:{
    ...Alignment.row,
    ...Alignment.crossCenter,
    marginLeft: -8,
  },
  chekboxRow:{
    borderBottomWidth:0,
    marginLeft:0,
    paddingBottom:0,
    marginBottom:0,
    paddingBottom:0
  },
  inputPicker:{
    backgroundColor:Colors.white,
    paddingVertical:2,
    marginTop:10,
    //marginBottom:15,
    borderTopWidth:1, 
    borderLeftWidth:1, 
    borderRightWidth:1, 
    borderBottomWidth:1, 
    borderColor:'#c8c8c8',
    borderRadius:2,
    ...Platform.select({
      android: {
        paddingLeft:10
      }
    })
  },
  medicalinputWrap:{
    ...Spacer.topMargin
  },
  nextBttn:{
    ...Border.commonBorder,
    borderColor:Colors.blue,
    color:Colors.blue,
  },
  bttnWrap:{
    ...Border.doubleButtonWrap
  },
  bttnArea:{
    marginHorizontal:6,
    flex:1,
  },
  sharedataTextfield:{
    paddingVertical:10,
    height:160,
  },
  sortItemRow: {
    // ...Helpers.rowCross,
    // ...Metrics.mediumBottomMargin
  }
})