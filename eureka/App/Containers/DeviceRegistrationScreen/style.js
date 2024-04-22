import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Fonts, Spacer, Alignment, Border} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor: Colors.white,
  },
  mainScrollView: {
    ...Alignment.fill,
  },
  gradientContainer: {
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding,
    ...Alignment.fill,
  },
  createAccHeading: {
    ...Fonts.fontBold,
    ...Fonts.h4,
    ...Spacer.smallTopMargin,
    ...Spacer.tinyBottomMargin,
  },
  subHeading: {
    ...Fonts.h2,
    ...Fonts.fontMedium,
    ...Spacer.smallBottomMargin,
  },
  inputLabel: {
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    ...Spacer.bottomMargin,
  },
  imageContent: {
    ...Spacer.mediumVerticalMargin,
    ...Alignment.crossCenter,
  },
  signInImage: {
    ...Alignment.resizeImageMode,
    ...Spacer.percentHeight,
    ...Spacer.percentWidth,
  },

  inputIcon: {
    color: Colors.iconColor,
    ...Fonts.iconFont,
    ...Platform.select({
      ios: {
        bottom: 0,
      },
      android: {
        bottom: 3,
      },
    }),
    fontSize: 22,
    marginHorizontal: 10,
    marginTop: 15,
  },
  focusCell: {
    borderColor: Colors.blue,
  },
  wranWrap: {
    ...Spacer.minusTinyTopMargin,
    ...Alignment.row,
    ...Spacer.rightMargin,
    ...Spacer.smallBottomMargin,
  },
  warnText: {
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color: Colors.red,
    ...Spacer.smallBottomMargin,
  },
  btnRow: {
    ...Alignment.fillRowCenter,
  },
  inputWrapper: {flexDirection: 'row', alignItems: 'center'},
});
