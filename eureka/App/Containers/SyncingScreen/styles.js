import {
  StyleSheet,
} from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1, 
    justifyContent:'center',
    alignContent:'center',
    backgroundColor:Colors.white,

  },
  paginationDots: {
    height: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  imageContent:{
    flex:1.6,
    // paddingBottom:10,
    // backgroundColor:'red'
  },
  getStartedView: {
    flex: 1,
    alignItems: 'center',
  },
  imageItemDimensions: {
    resizeMode: 'contain',
    height:'100%',
    width:'100%',
  },
  welcomeHeading:{
    ...Fonts.fontBold,
    ...Fonts.h1,
    textAlign:'center',
  },
  subHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
    textAlign:'center',
    marginBottom:20,
  },
  startBttnWrap:{
    width:'90%',
  },
  activeDot: {
    backgroundColor: 'black'
  },
  haveAccountContent: {
    flexDirection: 'row',
    marginTop:20,
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    paddingRight: 2
  },
  signInBttn:{
    borderBottomWidth:1,
    borderBottomColor:Colors.ButtonColor,
    marginLeft:4,
  },
  rightText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    color:Colors.ButtonColor,
  },
});
