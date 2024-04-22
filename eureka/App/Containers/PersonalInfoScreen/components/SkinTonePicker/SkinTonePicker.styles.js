import {StyleSheet} from 'react-native';
import {Colors} from '../../../../Theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemContainer: {
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  itemColorContent: {
    width: 36,
    height: 36,
    borderWidth: 0,
    borderColor: Colors.selectedColor,
  },
  itemColorContentSelected: {
    borderWidth: 3,
  },
});
