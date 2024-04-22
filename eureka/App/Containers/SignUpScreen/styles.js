import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment } from '../../Theme';

export default StyleSheet.create({
  mainContainer:{
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  mainScrollView:{
    ...Alignment.fill,
  },
  inputIcon:{
    ...Fonts.iconFont,
    color:Colors.iconColor
  },
  wranWrap:{
    ...Alignment.fillRow,
    ...Spacer.tinyHorizontalMargin,
    ...Spacer.smallBottomMargin,
    ...Spacer.minusTinyTopMargin
  }
})