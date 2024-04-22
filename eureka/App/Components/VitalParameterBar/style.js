import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  vitalBarWrap:{
    // borderWidth:1,
    flexDirection:'row',
    alignSelf:'center',
    // width:320,
    height:30,
    // padding:20
  },
  vitalBarItem:{
    
    // backgroundColor:'lightblue',
    height:10,
    width:'10%',
    marginHorizontal:1,
    borderWidth:0.5
  },
  vitalBarItemInner:{
    
    // flexDirection:'row',
    // justifyContent:'space-around',
    marginTop:10
  },
  vitalBarLabelTxt:{
    fontSize:10,
    position:'absolute',
  },
  leftLabel:{
    left:0
  },
  rightLabel:{
    right:0  
  },
  redBlockFirst:{
    backgroundColor:'#F86362',
    borderTopLeftRadius:5,
    borderBottomLeftRadius:5,
    borderColor:'#BD4645'
  },
  redBlockLast:{
    backgroundColor:'#F86362',
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    borderColor:'#BD4645'
  },
  orangeBlock:{
    backgroundColor:'#FFA42C',
    borderColor:'#C66F00'
  },
  yellowBlock:{
    backgroundColor:'#FFF572',
    borderColor:'#998E03'
  },
  greenBlock:{
    backgroundColor:'#2DE489',
    borderColor:'#0F8C4E'
  },
  greenFirstBlock:{
    backgroundColor:'#2DE489',
    borderColor:'#0F8C4E',
    borderTopLeftRadius:5,
    borderBottomLeftRadius:5,
  }
});
