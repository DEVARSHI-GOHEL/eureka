import React from 'react';
import {
  View,
  Text
} from 'react-native';
import styles from './style';
import OctIcon from 'react-native-vector-icons/Octicons';
import AntIcon from 'react-native-vector-icons/AntDesign';
// import {getMeasureColor, getMeasureTrendIcon} from '../../utils/MeasureVizUtils';

export function TabReadingUnitWeek({
  time,
  unitValue,
  unit
}) {

  return (
    <View style={styles.readingArea}>
      <View style={styles.leftArea}>
      <View style={styles.readingBorder}>
        <OctIcon name="primitive-dot" style={[styles.circleIcon]} />
      </View>
        <View>
          <Text style={styles.reading}>Average at</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      <View>
        <View style={styles.rightArea}>
          {unitValue > 200 ?
            <AntIcon name='caretup' style={[styles.upIcon, { color: 'red' }]} /> :

            <AntIcon name='caretdown' style={styles.upIcon} />

          }

          <View>
            <Text style={styles.measureVal}>{unitValue}</Text>
            <Text style={styles.measureUnit}>{unit}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
