import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';

export function TabReading({
  title,
  leftIcon,
  rightIcon,
  topTitle,
  subTitle
}) {

  return (
    <View style={styles.headingWrap}>
      {leftIcon}
      <View>
        { topTitle &&
          <Text style={styles.topHeading}>{topTitle}</Text>
        }

        { title &&
          <Text style={styles.heading}>{title}</Text>
        }
        
        { subTitle &&
          <Text style={styles.subHeading}>{subTitle}</Text>
        }
      </View>
      {rightIcon}
    </View>
    
  );
}
