import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';
import {lineHeight, size} from "../../Theme/Fonts";

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.homeBackground
  },
  mainScrollView:{
    ...Alignment.fill,
    backgroundColor:Colors.homeBackground
  },
  healthOverviewWrap:{
    ...Alignment.fill,
    paddingHorizontal:13,
    ...Spacer.smallVerticalPadding
  },
  rightSpace:{
    marginRight:4
  },
  leftSpace:{
    ...Spacer.tinyLeftMargin
  },
  healthOverviewBox:{
    paddingLeft:0,
    marginLeft:0,
    overflow:'hidden',
    ...Border.smallRadious,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
    position:'relative'
  },
  iconHeader:{
    ...Spacer.smallLeftPadding,
    ...Spacer.smallRightPadding,
    paddingTop:7,
    marginLeft:0,
    position:'relative',
    paddingBottom:0,
  },
  bellArea:{
    position:'absolute',
    top:-15,
    right:-15,
    zIndex:99999,
    height:70,
    width:70,
  },
  addYellowColor:{
    backgroundColor:Colors.yellowAlert,
    borderColor:Colors.yellowAlertBorder,
    ...Alignment.fill,
    ...Border.alertBorder,
    ...Border.alertRadious,
    ...Spacer.alertPadding
  },
  addOrangeColor:{
    backgroundColor:Colors.orangeAlert,
    borderColor:Colors.orangeAlertBorder,
    ...Alignment.fill,
    ...Border.alertBorder,
    ...Border.alertRadious,
    ...Spacer.alertPadding
  },
  addRedColor:{
    backgroundColor:Colors.redAlert,
    borderColor:Colors.redAlertBorder,
    ...Alignment.fill,
    ...Border.alertBorder,
    ...Border.alertRadious,
    ...Spacer.alertPadding
  },
  textWrap:{
    ...Spacer.smallLeftPadding
  },
  rateParam:{
    ...Fonts.fontMedium,
    ...Fonts.sub,
  },
  rateText:{
    ...Fonts.fontBold,
    ...Fonts.h1,
    lineHeight: size.h1,
    height:28,
    marginTop:3,
    marginRight:5,
  },
  infoWrap:{
    ...Alignment.row,
    ...Alignment.crossEnd
  },
  healthKey:{
    ...Fonts.fontMedium,
    ...Fonts.sub,
    textTransform:'uppercase',
  },
  lastUpdateText:{
    ...Fonts.fontMedium,
    ...Fonts.sub,
    color:Colors.lightGray,
    ...Spacer.smallBottomMargin,
    marginTop:7,
  },
  infoText:{
    ...Fonts.sub,
    color:Colors.lightGray,
    ...Spacer.smallBottomMargin,
    marginTop:7,
    ...Fonts.small,
  },
  mealBox:{
    minHeight:90,
  },
  rightMealSpace:{
    marginRight:7
  },
  leftMealSpace:{
    marginLeft:5
  },
  imageStyle:{
    height: '100%', 
    width: '100%',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
    //flex: 1,
    resizeMode: "cover",
    //resizeMode: 'stretch',
  },
  navWrap:{
    ...Alignment.fill,
    ...Alignment.row,
    ...Alignment.crossEnd,
    ...Spacer.smallLeftPadding,
    ...Spacer.smallVerticalPadding
  },
  navArrow:{
    ...Fonts.h3,
    marginBottom:2,
  },
  mealText:{
    ...Fonts.fontSemiBold,
    ...Fonts.h2,
    ...Spacer.tinyrightMargin,
    textTransform:'capitalize',
  },
  bttnWrap:{
    backgroundColor:Colors.white,
    flexDirection:'row', 
    borderTopWidth:1, 
    // marginTop:10,
    paddingVertical:15, 
    paddingHorizontal:7,
    borderTopColor:'#D2D3D6'
  },
  buttonText: {
    ...Fonts.fontSemiBold,
    color: '#fff',
    // hack with negative margin:
    // without this, text is wrapper with ellipsis even when it should not
    // 0 margin, 0 padding in parent button component didn't help
    marginLeft: -5,
    marginRight: -5,
  },
  bttnArea:{
    flex: 1,
    marginHorizontal: 6,
    paddingLeft: 0,
    paddingRight: 0,
    ...Alignment.fill,
  },
  cancelBttn:{
    borderWidth:1,
    borderColor:Colors.blue,
    color:Colors.blue,
  },
  progressBarWrap:{ 
    width:5, 
    height:'100%', 
    position:'absolute', 
    right:15, 
    bottom:0, 
  },
  progressBar:{ 
    ...Alignment.fill, 
    marginTop:7, 
    marginBottom:12, 
    backgroundColor:'#E1E9E5', 
    justifyContent:'flex-end', 
    borderRadius:5, 
    overflow:'hidden'
  }
  
})