import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';
import GlobalStyle from "../../Theme/GlobalStyle";
import {lowerDimension, lowerDimension80Percent} from "../../constants/Dimensions";

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
  },
  mainScrollView:{
    ...Alignment.fill,
  },
  header: {
    ...GlobalStyle.heading,
    flex:0,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  imageContainer: {
    ...GlobalStyle.imageArea,
    width: lowerDimension,
    height: lowerDimension80Percent,
  },
  image: {
    ...GlobalStyle.imageResize,
    width: lowerDimension,
    height: lowerDimension80Percent,
  },
  bttnWrap:{
    ...Spacer.horizontalPadding,
    ...Spacer.verticalPadding
  },
})
