import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  heading:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
    marginVertical:20,
    marginHorizontal:5,
    alignSelf:'center',
  },
  topHeading:{
    ...Fonts.h1,
    ...Fonts.fontSemiBold,
    alignSelf:'center',
    marginTop:20
  },
  subHeading:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
    alignSelf:'center',
  },
  headingWrap:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
  },
  timeRangeInfoPercent:{
    ...Fonts.medium,
    ...Fonts.fontBold,
    marginLeft:10,
  },
  timeRangeInfo:{
    ...Fonts.h3,
    marginLeft:5,
  },
});
