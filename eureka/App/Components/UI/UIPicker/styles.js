import {Platform, StyleSheet} from 'react-native';
import {Fonts} from '../../../Theme';

export default StyleSheet.create({
  componentStyle: {
    height: Platform.select({ios: 44, android: 48,})
  },
  textStyleDefaultValue:{
    ...Fonts.fontMedium,
    color: '#B3B3B3',
    paddingLeft: 10,
  },
  textStyle: {
    color:'#000',
  }


});
