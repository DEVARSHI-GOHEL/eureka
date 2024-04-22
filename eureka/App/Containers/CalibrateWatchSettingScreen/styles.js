import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor:'#fff',
  },
  mainScrollView:{
    flex:1
  },
  gradientContainer:{
    flex:1,
    paddingTop:30,
    paddingBottom:20,
    paddingHorizontal:15,
  },
  paginationDots: {
    // flex:1,
    height: 10,
    marginTop:20,
    marginBottom:10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor:'red',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  imageContent:{
    marginVertical:25,
  },
  getStartedView: {
    flex:1,
    alignItems: 'center',
  },
  imageItemDimensions: {
    resizeMode: 'contain',
    height:280,
    width:'100%',
  },
  heading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    textAlign:'center',
  },
  subHeading:{
    ...Fonts.fontBold,
    fontSize:22,
    textAlign:'center',
    marginBottom:10,
  },
  description:{
    fontSize:17,
    ...Fonts.fontMedium,
    textAlign:'center',
  },
  startBttnWrap:{
    width:'90%',
    marginBottom:20,
  },
  activeDot: {
    backgroundColor: 'black'
  },
})