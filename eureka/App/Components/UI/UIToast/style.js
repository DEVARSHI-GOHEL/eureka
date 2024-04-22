import { StyleSheet } from 'react-native';
import { Fonts } from '../../../Theme';

export default StyleSheet.create({
  textInputWrap:{
    position:'relative',
    marginBottom:15,
  },
  inputFields: {
    ...Platform.select({
      ios: {
        ...Fonts.fontMedium,
        backgroundColor: '#fff',
        borderWidth:1,
        borderColor:'#c8c8c8',
        borderRadius:2,
        paddingHorizontal:10,
        height:44,
        fontSize:16,
      },
      android: {
        ...Fonts.fontMedium,
        backgroundColor: '#fff',
        paddingVertical:2,
        borderWidth:1,
        borderColor:'#c8c8c8',
        borderRadius:2,
        paddingHorizontal:10,
        height:48,
        fontSize:16,
      }
    })
  },
  inputIconWrap:{
    width:40, 
    position: 'absolute', 
    right: 0, 
    bottom: 4,
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
