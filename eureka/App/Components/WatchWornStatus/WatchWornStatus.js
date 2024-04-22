import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import EnIcon from 'react-native-vector-icons/Entypo';
import FatherIcon from 'react-native-vector-icons/Feather';
import {useSelector, useDispatch} from 'react-redux';
import {UIWatchNotWornIcon} from '../UI';
import {WATCH_WORN_STATE} from '../../constants/AppDataConstants';

export function WatchWornStatus({onIconPress}) {
  const {isWatchWornProperly} = useSelector((state) => ({
    isWatchWornProperly: state.watchStatus.isWatchWornProperly,
  }));

  if (isWatchWornProperly == WATCH_WORN_STATE.WORN) {
    return <></>;
  }

  return (
    <View style={styles.headerIconWrap}>
      <TouchableOpacity
        onPress={
          isWatchWornProperly == WATCH_WORN_STATE.NOT_WORN
            ? onIconPress
            : () => {}
        }
        style={styles.watchWrap}
        accessible={false}
      >
        <UIWatchNotWornIcon />
        <View style={styles.watchNotification}>
          {isWatchWornProperly == WATCH_WORN_STATE.WORN ? (
            <EnIcon name="check" color="#22e258" style={styles.checkIcon} />
          ) : (
            <AntIcon name="close" color="#FA6969" style={styles.checkIcon} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
