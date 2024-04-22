import { StyleSheet } from 'react-native';
import { Fonts } from '../../../Theme';

export default StyleSheet.create({
  textInputWrap:{
    marginBottom:15,
  },
  textInputIconWrap:{
    backgroundColor: '#fff',
    flexDirection:'row', 
    borderWidth:1, 
    borderColor:'#c8c8c8', 
    alignItems:'center', 
    paddingHorizontal:10,
    borderRadius:2,
    paddingHorizontal:10,
  },
  inputFields: {
    ...Platform.select({
      ios: {
        ...Fonts.fontMedium,
        height:44,
        fontSize:16,
        flex:1,
      },
      android: {
        ...Fonts.fontMedium,
        height:48,
        fontSize:16,
        flex:1,
      }
    })
  },
  inputTextWrap:{
    color:'#7f7e7e'
  },
  inputLabelWrap:{
    marginBottom:5,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
});
