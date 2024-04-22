import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';

export function TabDateNav({
  title,
  onLeftPress,
  onRightPress,
  leftIconDisableState = true,
  rightIconDisableState = true
}) {
  return (
    <View style={styles.topArrow}>

      <TouchableOpacity
        onPress={leftIconDisableState == false? onLeftPress : null}
        accessible={false}
      >
        <AntIcon
          name='left'
          style={[styles.arrowIcon, leftIconDisableState == false?styles.activeIcon : {}]}
        />
      </TouchableOpacity>

      <Text style={styles.dateText}>{title}</Text>

      <TouchableOpacity
          onPress={rightIconDisableState == false ? onRightPress : null}
          accessible={false}
      >
        <AntIcon
          name='right'
          style={[styles.arrowIcon, rightIconDisableState == false ?styles.activeIcon : {}]}
          />
      </TouchableOpacity>
    </View>
  );
}
