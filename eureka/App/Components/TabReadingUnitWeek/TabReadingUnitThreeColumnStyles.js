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
    marginTop:11,
    marginRight:10,
    borderTopWidth:1,
    borderColor:"#a5a5a5",
  },
  downIcon:{
    fontSize:20,
    color:'#FFA42C',
    marginTop:5,
    marginRight:10,
    borderBottomWidth:1,
    borderColor: "#a5a5a5",
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
  },
  bttn:{
    borderWidth:1,
    paddingVertical:3,
    borderColor:Colors.ButtonColor,
    color:Colors.ButtonColor,
    marginHorizontal:15,
    marginBottom:25
  },

  leftRightBorder : {
    borderLeftWidth:1,
    borderRightWidth:1,
    borderLeftColor:'#D9D9D9',
    borderRightColor:'#D9D9D9',
  },

});
