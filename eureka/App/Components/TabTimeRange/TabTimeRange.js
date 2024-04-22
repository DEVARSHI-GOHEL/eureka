import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import styles from './style';


export function TabTimeRange({
  iconLeft,
  iconRight,
  range,
  text,
  rangeSummaryText
}) {

  return (
    <View style={styles.timeRange}>
      {iconLeft}
      <Text style={styles.timeRangeInfoPercent}>{range}</Text>
      <Text style={styles.timeRangeInfo}>{text}</Text>
      {rangeSummaryText}
      {iconRight}
      
    </View>
  );
}
