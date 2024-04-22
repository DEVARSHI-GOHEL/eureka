import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  timeRange:{
    borderWidth:2,
    borderColor:'#D9D9D9',
    borderRadius:5,
    paddingVertical:15,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginHorizontal:15,
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
