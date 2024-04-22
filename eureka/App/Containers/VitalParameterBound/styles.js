import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor:'#fff'
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
  parameterBox:{
    backgroundColor:Colors.white,
    borderWidth:1,
    marginHorizontal:15,
    borderColor:'#E1EAED',
    paddingTop:30,
    borderRadius:5,
    marginBottom:20,
  },
  navText:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
  },
  parameterBoxInner:{
    justifyContent:'center',
    borderBottomWidth:1,
    marginHorizontal:30,
    borderColor:'#E1EAED',
    paddingBottom:20,
  }
})