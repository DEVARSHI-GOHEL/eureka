import {StyleSheet} from 'react-native';
import {Alignment, Spacer} from '../../Theme';

export const styles = StyleSheet.create({
  gradientContainer: {
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding,
    ...Alignment.fill,
  },
});
