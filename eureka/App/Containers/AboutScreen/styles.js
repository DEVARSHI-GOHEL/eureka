import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor:Colors.white
  },
  settingsWrap:{
    flex:1,
    paddingVertical:20,
  },
  
  backgroundGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  navArea:{
    flex:1,
    marginHorizontal:15,
  },
  listRow:{
    marginLeft:0,
    marginRight:0,
    paddingRight:0,
    paddingLeft:0,
    borderBottomColor:'#d9dadd',
    borderBottomWidth:1,
    //backgroundColor:'red'
  },
  listRowTouch:{flex:1, flexDirection:'row'},
  navText:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
  },
  aboutRightInfo:{
    ...Fonts.fontMedium,
    ...Fonts.h2,
    width:100,
    textAlign:'right'
  },
  bttnWrap:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6'
  },
})