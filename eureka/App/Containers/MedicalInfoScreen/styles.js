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
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding
  },
  diseaseHeading:{
    ...Fonts.fontBold,
    ...Fonts.h6,
    // marginTop:15,
  },
  diseaseText:{
    ...Fonts.fontMedium,
    ...Fonts.h3,
    ...Spacer.smallLeftMargin
    // marginLeft:10,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3
  },
  inputPicker:{
    ...Border.commonDropdownStyle,
    ...Platform.select({
      ios: {
        marginBottom: 12,
      },
      android: {
        ...Spacer.smallHorizontalPadding,
        marginBottom: 8,
      }
    })
  },
  chekboxColor:{
    borderColor:Colors.checkBoxBorderColor,
    ...Border.tinyRadious
  },
  chekboxRow:{
    borderBottomWidth:0,
    marginLeft:0,
    paddingBottom:0,
  },
  // inputPicker:{
  //   backgroundColor:'#fff',
  //   paddingVertical:2,
  //   marginTop:10,
  //   marginBottom:15,
  //   borderTopWidth:1, 
  //   borderLeftWidth:1, 
  //   borderRightWidth:1, 
  //   borderBottomWidth:1, 
  //   borderColor:'#c8c8c8',
  //   borderRadius:2,
  //   ...Platform.select({
  //     android: {
  //       paddingLeft:10
  //     }
  //   })
  // },
  medicalinputWrap:{
    ...Spacer.smallTopMargin,
    ...Spacer.largeLeftMargin
  },
  bttnWrap:{
    ...Border.buttonBorderWrap
  },
})