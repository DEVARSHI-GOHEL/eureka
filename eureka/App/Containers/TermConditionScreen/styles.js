import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Fonts } from '../../Theme';
import DeviceInfo from "react-native-device-info";

const windowWidth = Dimensions.get('window').width;
export const isIphoneX = DeviceInfo.hasNotch();

export default StyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor: Colors.white,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  container:{
    paddingVertical:20,
    paddingHorizontal:15,
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    marginTop:10,
    marginBottom:8,
  },
  subHeading:{
    ...Fonts.h3,
    ...Fonts.fontMedium,
    marginBottom:20,
  },
  scrollingContent:{
    flex:1,
  },
  bttnWrap:{
    height: 73,
    flexDirection:'row',
    borderTopWidth:1,
    paddingVertical:10,
    paddingHorizontal:5,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.white,
    width: '100%',
  },
  bttnWrapOn: {
    marginBottom: 0
  },
  bttnArea:{
    marginHorizontal:5,
    flex:1,
  },
  cancelBttn:{
    borderWidth:1,
    borderColor:Colors.ButtonColor,
    color:Colors.ButtonColor,
  },
  web: {
    overflow: 'visible',
    width: windowWidth - 10,
    marginLeft: -10
  }
})
