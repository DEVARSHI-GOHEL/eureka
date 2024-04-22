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
    paddingVertical:20,
    paddingHorizontal:15,
  },
  paginationDots: {
    height: 10,
    marginTop:20,
    marginBottom:10,
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
    marginVertical:25,
  },
  getStartedView: {
    alignItems: 'center',
  },
  imageItemDimensions: {
    resizeMode: 'contain',
    height:280,
    width:'100%',
  },
  heading:{
    ...Fonts.fontBold,
    ...Fonts.h1,
    textAlign:'center',
  },
  subHeading:{
    ...Fonts.fontSemiBold,
    fontSize:22,
    textAlign:'center',
    marginBottom:10,
  },
  description:{
    ...Fonts.h3,
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