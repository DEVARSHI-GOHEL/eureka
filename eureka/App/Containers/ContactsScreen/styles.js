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
  // mainContainer:{
  //   flex:1,
  //   backgroundColor:'#fff'
  // },
  // contactWrap:{
  //   paddingVertical:15,
  // },
  // contactHeagingWrap:{
  //   paddingHorizontal:15,
  // },
  contactHeading:{
    ...Fonts.fontBold,
    ...Fonts.h5,
    ...Spacer.smallTopMargin,
    ...Spacer.smallBottomMargin
  },
  contactSubHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Spacer.smallBottomMargin
  },
  contactList:{
    paddingHorizontal:15
  },
  listRow:{
    borderTopColor:'#E1EAEE',
    borderTopWidth:1,
    borderLeftColor:'#E1EAEE',
    borderLeftWidth:1,
    borderRightColor:'#E1EAEE',
    borderRightWidth:1,
    borderBottomColor:'#E1EAEE',
    borderBottomWidth:1,
    marginLeft:0,
    ...Spacer.tinyVerticalPadding,
    ...Spacer.smallHorizontalPadding,
    ...Spacer.bottomMargin,
    borderRadius:5,
  },
  userIcon:{
    marginTop:-8,
    height:'100%',
  },
  nameWrap:{
    marginLeft:10,
    paddingTop:8,
    borderBottomWidth:0,
  },
  contactName:{
    ...Fonts.fontBold,
    ...Fonts.h2,
  },
  contactRelation:{
    ...Fonts.fontMedium,
  },
  editIcon:{
    fontSize:20,
    color:'#1A74D4'
  },
  chekboxColor:{
    borderColor:'#c8c8c8',
    borderRadius:3,
  },
  chkBoxborder:{
    marginRight:15,
  },
  settingsText:{
    ...Fonts.fontMedium,
    ...Fonts.h2,
    lineHeight:24,
    marginRight:'14%'
  },
  settingsBottomrow:{
    flexDirection:'row',
    paddingHorizontal:15,
    justifyContent:'space-between',
    marginTop:0,
  },
  settingsLinkText:{
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    color:Colors.blue,
    textDecorationLine:'underline',
  },
  nextBttn:{
    borderWidth:1,
    borderColor:Colors.blue,
    color:Colors.blue,
  },
  bttnWrapContact:{
    backgroundColor:Colors.white,
    borderTopWidth:1, 
    marginTop:10,
    paddingVertical:15, 
    paddingHorizontal:7.5,
    borderTopColor:'#D2D3D6'
  },
  bttnWrap:{
    backgroundColor:Colors.white,
    flexDirection:'row', 
    borderTopWidth:1, 
    marginTop:10,
    paddingVertical:15, 
    paddingHorizontal:7.5,
    borderTopColor:'#D2D3D6'
  },
  bttnArea:{
    marginHorizontal:6,
    flex:1,
  },
  // bttnWrap:{
  //   ...Border.buttonBorderWrap
  // },
  emptyContent:{
    color:Colors.gray,
    ...Fonts.fontBold,
    fontSize:30,
    flex:1,
    // backgroundColor:'red',
    // alignSelf:'center',
    // marginHorizontal:15
  },
  chekboxColor:{
    borderColor:'#c8c8c8',
    borderRadius:3,
    margin:10
  },
  chekboxRow:{
    borderBottomWidth:0,
    marginLeft:0,
    paddingBottom:0,
  },
})