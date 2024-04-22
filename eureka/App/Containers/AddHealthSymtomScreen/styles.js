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
  inputWrap:{
    ...Spacer.tinyBottomMargin,
  },
  timeField:{
    backgroundColor: Colors.white,
    ...Border.commonBorder,
    ...Border.tinyRadious,
    borderColor:Colors.checkBoxBorderColor,
    ...Spacer.smallBottomMargin,
    ...Spacer.smallHorizontalPadding,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        ...Spacer.verticalPadding
      }
    })
  },
  timeText:{
    ...Fonts.fontMedium,
    ...Fonts.h3,
  },
  inputPicker: {
    ...Border.commonDropdownStyle,
    ...Platform.select({
      ios: {
        marginBottom: 12,
      },
      android: {
        ...Spacer.smallHorizontalPadding,
        marginBottom: 8,
      }
    })
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    // ...Spacer.tinyBottomMargin
  },
  symptomTextfield:{
    ...Spacer.smallVerticalPadding,
    ...Spacer.fixedHeight
  },
  bttnWrap: {
    ...Border.buttonBorderWrap
  }
});
