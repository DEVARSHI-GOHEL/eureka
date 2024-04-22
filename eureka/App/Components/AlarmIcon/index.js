import {DATA_BOUNDS_TYPE} from "../../Chart/AppConstants/VitalDataConstants";
import {View} from "react-native";
import styles from "../../Containers/AlertDetailScreen/styles";
import {UIBellSvgIcon, UIOrangeBellSvgIcon, UIRedBellSvgIcon} from "../UI";
import React from "react";

const AlarmIcon = ({alarmType}) => {
  if (
    !alarmType ||
    alarmType == DATA_BOUNDS_TYPE.none ||
    alarmType == DATA_BOUNDS_TYPE.normal
  ) {
    return <></>;
  } else if (alarmType == DATA_BOUNDS_TYPE.yellow) {
    return (
      <View style={styles.addYellowColor}>
        <UIBellSvgIcon fill={'transparent'} />
      </View>
    );
  } else if (alarmType == DATA_BOUNDS_TYPE.orange) {
    return (
      <View style={styles.addOrangeColor}>
        <UIOrangeBellSvgIcon fill={'transparent'} />
      </View>
    );
  } else if (alarmType == DATA_BOUNDS_TYPE.red) {
    return (
      <View style={styles.addRedColor}>
        <UIRedBellSvgIcon fill={'red'} />
      </View>
    );
  } else {
    return <></>;
  }
}

export default AlarmIcon;