import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  readingArea:{
    marginTop:15,
    marginBottom:20,
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:15,
    alignItems:'center'
  },
  leftArea:{
    flexDirection:'row',
    marginLeft:-9,
    //alignContent:'flex-start'
  },
  reading:{
    ...Fonts.h3,
    marginTop:5,
  },
  time:{
    ...Fonts.large,
    ...Fonts.fontSemiBold, 
  },
  rightArea:{
    flexDirection:'row',
  },
  upIcon:{
    fontSize:20,
    color:'#FFA42C',
    alignSelf:'center',
    marginTop:8,
    marginRight:10,
  },
  measureVal:{
    fontSize:48,
    ...Fonts.fontBold, 
  },
  measureUnit:{
    ...Fonts.h2,
    marginTop:-15,
    alignSelf:'center'
  },
  readingBorder:{
    marginTop:4,
    marginHorizontal : 10,
    borderWidth:2,
    borderColor:Colors.blue,
    alignContent:'center',
    height:22,
    width:22,
    borderRadius:22/2,
    //alignItems:'center'
  },
  circleIcon:{
    fontSize:26,
    lineHeight:22,
    alignSelf:'center',
    color:'#2DE489'
    // marginRight : 5,
    // marginLeft : 5,
    //marginTop: 8
  }
});
