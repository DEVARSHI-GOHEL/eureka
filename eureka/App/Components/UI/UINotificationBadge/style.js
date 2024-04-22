import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../Theme';

export default StyleSheet.create({
  textInputWrap:{
    position:'relative',
    marginBottom:15,
  },
  inputFields: {
    ...Fonts.fontMedium,
    backgroundColor: '#fff',
    borderWidth:1,
    borderColor:'#c8c8c8',
    borderRadius:2,
    paddingHorizontal:10,
    height:44,
    fontSize:16,
  },
  inputIconWrap:{
    width:40, 
    position: 'absolute', 
    right: 0, 
    bottom: 6,
  },
  inputTextWrap:{
    width:30, 
    position: 'absolute', 
    right: -5, 
    bottom: 13
  },
  inputLabelWrap:{
    marginBottom:5,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
});
