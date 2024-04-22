import { StyleSheet } from 'react-native';
import Fonts from '../Theme/Fonts';
import Colors from '../Theme/Colors';

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor:'#fff'
  },
  mainScrollView:{
    flex:1,
  },
  gradientContainer:{
    flex:1,
    paddingVertical:20,
    paddingHorizontal:15,
  },
  tabContainerCusStyle:{
    backgroundColor: '#EEEFF4',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 2,
    height: 42,
    marginHorizontal: 15,
  },
  tabBarUnderlineCusStyle:{
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    width: 0
  },
  activeTabCusStyle:{
    borderRadius: 4,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  tabCusStyle:{
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  textCusStyle:{
    color: Colors.black,
    ...Fonts.fontMedium,
    fontSize: 19,
  },
  activeTextCusStyle:{
    color: Colors.black,
    ...Fonts.fontSemiBold,
    fontSize: 19,
  },
  singleBttnWrap:{
    backgroundColor:Colors.white,
    paddingHorizontal:15,
    marginBottom:15,
  },
  bttnWrap:{
    backgroundColor:Colors.white,
    flexDirection:'row', 
    paddingHorizontal:15,
    marginBottom:15,
    justifyContent:'center',
    //width:'100%'
  },
  withBorder:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6',
    marginBottom:0
  },
  bttnArea:{
    marginHorizontal:6,
    flex:1,
  },
  borderColor:{
    borderWidth:1,
    borderColor:Colors.blue,
  },
  modalHeading: {
    ...Fonts.fontBold,
    ...Fonts.h5,
    textAlign:'center',
    paddingHorizontal:20,
    marginVertical:15,
  },
  modalSubHeading:{
    ...Fonts.fontSemiBold,
      ...Fonts.medium,
      textAlign:'center',
      marginHorizontal:20,
      paddingVertical:15,
      borderBottomWidth:1,
      marginBottom:20,
      borderBottomColor:'#E1E3E6',
  },
  modalVitalHeading:{
    ...Fonts.fontSemiBold,
      ...Fonts.medium,
      textAlign:'center',
      marginHorizontal:20,
  },
  modalVitalSubHeading: {
    ...Fonts.fontMedium,
    ...Fonts.h3,
    paddingTop:5,
    paddingBottom:15,
    marginHorizontal:20,
    textAlign:'center',
  },
  vitalBoundSeperator:{
    borderTopWidth:1,
    marginHorizontal:18,
    paddingVertical:20,
    borderTopColor:'#E1E3E6',
  },
  modalVitalContent: {
    ...Fonts.fontMedium,
    ...Fonts.h3,
    paddingHorizontal:20,
    marginBottom:15,
    textAlign:'center',
  },
  modalContent: {
    ...Fonts.fontMedium,
    ...Fonts.h3,
    paddingHorizontal:20,
    marginBottom:15,
    textAlign:'justify',
  },
  modalContentCenter: {
    ...Fonts.fontMedium,
    ...Fonts.h3,
    paddingHorizontal:20,
  },
  linkText:{
    flexDirection:'row',
    justifyContent:'center',
    marginTop:10,
  },
  leftText: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    paddingRight: 2
  },
  WrapForSlinglebttn:{
    flex:.5,
    paddingVertical:0,
  },
  iconStyle:{
    fontSize:40,
  },
  watchContent:{
    flex:1,
  },
  watchBackgroundImage:{
    backgroundColor:'#D0E7FF',
    position:'absolute',
    borderRadius:260/2,
    width:'94%',
    height:'94%',
  },
  imageArea:{
    position:'relative',
    height:280,
    width:280,
    alignSelf:'center',
    alignItems:'center',
    marginBottom:15,
  },
  imageResize:{
    height:265,
    width:265,
    position:'absolute',
    top:15,
    resizeMode: 'contain',
  },
  imageResizeSync:{
    height:300,
    width:300,
    marginBottom:15,
  },
  sideLoaderOne:{
    backgroundColor:Colors.white,
    position:'absolute',
    top:15,
    right:38,
    width:34,
    height:34,
    borderRadius:36/2,
    borderWidth:1.5,
    alignItems:'center',
    justifyContent:'center',
  },
  sideLoaderTwo:{
    backgroundColor:Colors.white,
    position:'absolute',
    bottom:75,
    left:3,
    width:34,
    height:34,
    borderRadius:36/2,
    borderWidth:1.5,
    alignItems:'center',
    justifyContent:'center',
  },
  sideLoaderThree:{
    backgroundColor:Colors.white,
    position:'absolute',
    bottom:43,
    right:28,
    width:34,
    height:34,
    borderRadius:36/2,
    borderWidth:1.5,
    alignItems:'center',
    justifyContent:'center',
  },
  loaderRoate:{
    transform: [{ rotate: '180deg'}]
  },
  loaderImage:{
    position:'absolute',
    left:77,
    top:84,
  },
  loaderImagetwo:{
    position:'absolute',
    left:85,
    top:92,
  },
  loaderText:{
    ...Fonts.fontBold,
    ...Fonts.h1,
    textAlign:'center',
    marginTop:15,
    color:'#C1F0FF',
  },
  loaderIcon:{
    ...Fonts.fontBold,
    fontSize:80,
    textAlign:'center',
    //marginTop:15,
  },
  heading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    textAlign:'center',
    marginBottom:15,
    flex:1,
  },
  sliderbttomText:{
    //backgroundColor:'green',
   
  },
  subHeading:{
    ...Fonts.fontBold,
    fontSize:22,
    textAlign:'center',
    marginBottom:10,
  },
  description:{
    ...Fonts.h3,
    ...Fonts.fontMedium,
    textAlign:'center',
    paddingHorizontal:'11%'
  },
  startBttnWrap:{
    width:'100%',
    marginTop:20,
    // alignItems: 'center',
  },
  calibrateBttn:{
    flex:1,
  },
  linkTextStyle: {
    flexDirection: 'row', 
    flex: 1 ,
    justifyContent:'center'
  },
  rightText: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    color:Colors.ButtonColor,
    marginLeft:5,
    textDecorationLine: "underline",
    textDecorationColor: Colors.ButtonColor
  },
/**
 * Global style for heading, form etc style 
 */
  globalAppHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    marginTop:10,
  },
  globalFormWrap:{
    marginTop:20,
  },
  globalGradientContainer:{
    flex:1,
    paddingVertical:20,
    paddingHorizontal:15,
  },
  globalBottomBttnWrapWithBorder:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6'
  },
  globalBottomBttnWrapWithBorder:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6'
  },
});
