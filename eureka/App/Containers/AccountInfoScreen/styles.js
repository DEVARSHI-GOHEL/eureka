import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  mainScrollView:{
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  gradientContainer:{
    ...Alignment.fill,
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding
  },
  inputIcon:{
    ...Fonts.h5,
    color:Colors.iconColor
  },
  cancelBttn:{
    borderWidth:1,
    borderColor:Colors.ButtonColor,
    color:Colors.ButtonColor,
  },
  wranWrap:{
    ...Spacer.minusTinyTopMargin,
    ...Alignment.row,
    ...Spacer.rightMargin,
    ...Spacer.smallBottomMargin
    //flexWrap:'wrap'
  },
  warnText:{
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color:Colors.red,
    ...Spacer.smallBottomMargin
  }
})