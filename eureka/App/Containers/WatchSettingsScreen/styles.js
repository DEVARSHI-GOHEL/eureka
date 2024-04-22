import {StyleSheet} from 'react-native';
import {Colors, Fonts, Spacer, Alignment, Border} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor: Colors.white,
  },
  settingsWrap: {
    ...Alignment.fill,
    ...Spacer.verticalPadding,
  },
  backgroundGradient: {
    ...Alignment.fill,
    ...Spacer.horizontalPadding,
    ...Border.smallRadious,
  },
  navArea: {
    ...Alignment.fill,
    ...Spacer.horizontalMargin,
  },
  listRow: {
    ...Spacer.spaceRemover,
    borderBottomColor: Colors.borderColor,
    ...Border.borderBottom,
    ...Spacer.verticalPadding,
  },
  listRowTouch: {
    ...Alignment.fill,
    ...Alignment.row,
    ...Alignment.scrollSpaceBetween,
  },
  navIcon: {
    ...Fonts.h5,
  },
  navText: {
    ...Fonts.fontBold,
    ...Fonts.h2,
  },
  firmTitle: {
    ...Spacer.tinyBottomMargin,
  },
  settingsText: {
    ...Fonts.fontMedium,
    ...Fonts.h2,
    lineHeight: 24,
    marginRight: '10%',
  },
  settingsBottomrow: {
    ...Alignment.row,
    ...Spacer.horizontalPadding,
    ...Alignment.scrollSpaceBetween,
    borderBottomColor: Colors.white,
    // ...Spacer.topMargin
  },
  settingsLinkText: {
    ...Fonts.h2,
    ...Fonts.fontSemiBold,
    color: Colors.blue,
    ...Border.textUnderline,
  },
  bttnWrap: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: '#D2D3D6',
  },
  inputPicker: {
    ...Border.commonDropdownStyle,
    ...Platform.select({
      ios: {
        marginBottom: 12,
      },
      android: {
        ...Spacer.smallHorizontalPadding,
        marginBottom: 2,
      },
    }),
  },
  switchSizeAdjust: {
    ...Platform.select({
      ios: {
        transform: [{scaleX: 0.9}, {scaleY: 0.9}],
      },
      android: {
        transform: [{scaleX: 1.2}, {scaleY: 1.2}],
      },
    }),
  },
  iconRow: {
    marginTop: 10,
  },
  watchIdText: {
    ...Fonts.small,
    ...Fonts.fontLight,
  },
  watchDescRow: {
    justifyContent: 'flex-start',
  },
  watchStatusText: {
    ...Fonts.fontMedium,
    ...Fonts.h2,
  },
});
