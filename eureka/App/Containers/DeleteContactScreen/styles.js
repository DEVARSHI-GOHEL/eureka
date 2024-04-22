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
  gradientContainer:{
    flex:1,
    paddingVertical:20,
    paddingHorizontal:15,
  },
  contactHeading:{
    ...Fonts.fontBold,
    ...Fonts.h5,
    marginTop:10,
    marginBottom:8,
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    marginBottom:5,
  },
  inputPicker:{
    ...Platform.select({
      ios: {
        backgroundColor:'#fff',
        paddingTop:1,
        marginBottom:15,
        borderTopWidth:1, 
        borderLeftWidth:1, 
        borderRightWidth:1, 
        borderBottomWidth:1, 
        borderColor:'#c8c8c8',
        borderRadius:2,
        height:46,
      },
      android: {
        backgroundColor:'#fff',
        paddingVertical:2,
        paddingHorizontal:10,
        marginBottom:15,
        borderTopWidth:1, 
        borderLeftWidth:1, 
        borderRightWidth:1, 
        borderBottomWidth:1, 
        borderColor:'#c8c8c8',
        borderRadius:2,
      }
    })
  },
  leftText: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    paddingRight: 2
  },
  bttnWrap:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6'
  },
  warnText:{
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color:Colors.red,
    flex: 1, 
    flexWrap: 'wrap',
    marginBottom:10,
  },
  deleteRow:{
    marginTop:25,
    flexDirection:'row',
    alignItems:'center'
  },
  deleteContactIcon:{
    fontSize: 26, 
    color:Colors.blue,
  },
  deleteContactText:{
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    marginRight: 8,
    color:Colors.blue,
  },
  bttnWrap:{
    borderTopWidth:1, 
    paddingVertical:10, 
    paddingHorizontal:10,
    borderTopColor:'#D2D3D6'
  },
})