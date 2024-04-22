import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  topArrow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:15,
    paddingVertical:20,
    borderBottomWidth:1,
    borderBottomColor:'#E2E3E6'
  },
  arrowIcon:{
    ...Fonts.medium,
    color:'#BDBDBD'
  },
  activeIcon:{
    color:Colors.black
  },
  dateText:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
});
