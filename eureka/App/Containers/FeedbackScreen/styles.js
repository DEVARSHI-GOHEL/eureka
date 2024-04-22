import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor:'#fff'
  },
  mainScrollView:{
    flex:1,
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h5,
    marginTop:5,
    marginBottom:8,
  },
  gradientContainer:{
    flex:1,
    paddingVertical:20,
    paddingHorizontal:15,
  },
  inputWrap:{
    flex:1,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    marginBottom:5,
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    marginBottom:20,
  },
  bttnWrap:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:15,
    borderTopColor:'#D2D3D6',
  },
  feedbackTextfield:{
    paddingVertical:10,
    height:200,
  },
  bttnWrap2:{
    width:'100%',
    height:35
    // height:50,
    // borderTopWidth:1, 
    // paddingVertical:10, 
    // paddingHorizontal:10,
    // borderTopColor:'#D2D3D6',
  },
})