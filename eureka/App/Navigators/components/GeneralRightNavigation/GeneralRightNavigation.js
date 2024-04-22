import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {View} from "react-native";

import {getWatchStore} from "../../../Containers/HomeScreen/watchSelectors";
import {styles} from "../../AppNavigator.styles";
import {WatchWornStatus} from "../../../Components/WatchWornStatus";
import {watchConnectPopupAction, watchSyncAction, watchWornPopupAction} from "../../../Containers/HomeScreen/action";
import {WatchConnectionStatus} from "../../../Components/WatchConnectionStatus";
import {OFFLINE_SYNC_STATE} from "../../../constants/AppDataConstants";

export const GeneralRightNavigation = ({navigation, hideWatchWorn = false}) => {
  const dispatch = useDispatch();

  const {offlineSyncData} = useSelector(getWatchStore);

  return (<View style={styles.navRightIcon}>
    {hideWatchWorn ? null : <WatchWornStatus
      onIconPress={() => dispatch(watchWornPopupAction(true))}
    />}
    <WatchConnectionStatus
      onSuccessIconPress={() =>
        navigation.navigate('WatchSettingsScreen')
      }
      onIconPress={() => {
        if (offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START) {
          dispatch(watchSyncAction(true));
          return;
        }
        dispatch(watchConnectPopupAction(true));
      }}
    />
  </View>);
}