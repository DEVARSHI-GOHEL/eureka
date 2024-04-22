import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
  headerIconWrap: {
    marginRight: 18,
  },
  seetingIcon: {
    fontSize: 26,
  },
  headerMenuIcon: {
    fontSize: 30,
  },
  watchWrap: {
    position: 'relative',
  },
  watchNotification: {
    width: 16,
    height: 16,
    borderRadius: 20 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  iconDarkBackground: {
    backgroundColor: '#2b2a2a',
  },
  iconBlueBackground: {
    backgroundColor: Colors.iconColor,
  },
  checkIcon: {
    fontSize: 10,
  },
});
