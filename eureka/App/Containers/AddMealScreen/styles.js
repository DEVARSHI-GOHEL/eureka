import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  // topArrow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   paddingHorizontal: 15,
  //   paddingVertical: 12,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#E2E3E6'
  // },
  // arrowIcon: {
  //   ...Fonts.medium,
  //   color: '#BDBDBD'
  // },
  // activeIcon: {
  //   color: Colors.black
  // },
  // dateText: {
  //   ...Fonts.fontSemiBold,
  //   ...Fonts.h3,
  // },
  // mealRow: {
  //   flex: 1,
  // },
  // mealBox: {
  //   marginBottom: 10
  // },
  // topRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom:10
  // },
  // deletemealIcon: {
  //   fontSize: 24,
  //   color: Colors.blue,
  // },
  timeField:{
    backgroundColor: Colors.white,
    ...Border.commonBorder,
    ...Border.tinyRadious,
    borderColor:Colors.checkBoxBorderColor,
    ...Spacer.smallBottomMargin,
    ...Spacer.smallHorizontalPadding,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        ...Spacer.verticalPadding
      }
    })
  },
  timeText:{
    ...Fonts.fontMedium,
    ...Fonts.h3,
  },
  bttnWrap: {
    ...Border.buttonBorderWrap
  },

  // dropdownWrap: {
  //   borderWidth: 1,
  //   // padding:10
  // },
  // modalDropdownStyle: {
  //   width: '92%',
  //   // borderWidth:1
  //   borderWidth: 1,
  //   borderRadius: 2,
  //   borderColor: '#dddddd',
  //   borderBottomWidth: 0,
  //   shadowColor: '#777777',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.8,
  //   shadowRadius: 2,
  //   elevation: 1,
  //   marginLeft:-10,
  //   // top:0,
  //   // position:'absolute'
  // },
  // modalDropdownTxtStyle: {
  //   color: '#000000',
  //   fontSize: 14
  // },
  // selectedModalItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingVertical:10,
  //   // borderWidth: 1,
  //   // height: 50
  // },
  // modalItem: {
  //   backgroundColor:'white',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal:10,
  //   paddingVertical:5,
  //   // borderTopWidth: 1,
  //   // height: 50
  // },
  // iconStyle:{
  //   justifyContent:'center',
  //   alignItems:'center',
  //   height:20,
  //   marginTop:10,
  //   // borderWidth:1
  // },
  // selectedArrowWrap:{
  //   // borderWidth:1,
  //   flex:1,
  //   justifyContent:'flex-end',
  //   alignItems:'flex-end',
  // },
  // selectedTxt:{
  //   ...Fonts.fontBold,
  //   fontSize:16
  // },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.tinyBottomMargin
  },
  mealTextfield:{
    ...Spacer.smallVerticalPadding,
    ...Spacer.fixedHeight
  },
  radioArea:{
    ...Alignment.row,
    ...Alignment.crossCenter
  },
  align:{
    ...Spacer.tinyTopMargin,
    ...Spacer.tinyHorizontalMargin
  },
  radioAreaWrap:{
    ...Spacer.mediumVerticalMargin
  },
  checkIcon:{
    position:'absolute',
    top:-20,
    // marginTop:-30
  },
  mealCheckBox:{
    // backgroundColor: Colors.white,
    ...Border.commonBorder,
    ...Border.tinyRadious,
    borderColor:Colors.checkBoxBorderColor,
    // ...Spacer.smallBottomMargin,
    // ...Spacer.smallHorizontalPadding,
    ...Spacer.smallRightMargin,
    paddingLeft:0,
    paddingVertical:0,
    paddingHorizontal:0,
    // backgroundColor:'yellow',

    // ...Platform.select({
    //   ios: {
    //     paddingVertical: 0,
    //   },
    //   android: {
    //     ...Spacer.verticalPadding
    //   }
    // })
  },
  didntHaveMealText:{
  fontSize:17,
  ...Fonts.fontSemiBold, 
  ...Spacer.smallLeftMargin,
  flex:1, 
  flexWrap: 'wrap',
  lineHeight:18
  },
  chekboxColor:{
    borderColor:Colors.checkBoxBorderColor,
    ...Border.tinyRadious
  },
  chekboxRow:{
    borderBottomWidth:0,
    marginLeft:0,
    paddingBottom:0,
  }
});
