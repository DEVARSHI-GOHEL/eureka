import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import EnIcon from 'react-native-vector-icons/Entypo';
import FatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useSelector} from 'react-redux';
import {UIWatchConnectionIcon} from '../UI';
import {
    WATCH_CONNECTION_STATE,
    OFFLINE_SYNC_STATE,
} from '../../constants/AppDataConstants';
import {
    selectNewFirmwareExists,
    selectNewFirmwareVersion,
    selectWatchFirmwareVersion
} from "../../../reducers/firmwareVersionReducer/selectors";
import {selectWatchConnected} from "../../Containers/HomeScreen/homeSelectors";

const ICON_REFRESH = 'ICON_REFRESH';
const ICON_CHECK = 'ICON_CHECK';
const ICON_CLOSE = 'ICON_CLOSE';
const ICON_UPLOAD = 'ICON_UPLOAD';

const ICONS_MAP = {
    [ICON_REFRESH]: {
        backgroundColorStyle: styles.iconDarkBackground,
        iconComponent: (<FatherIcon
            name="refresh-cw"
            color="#3CD4F3"
            style={styles.checkIcon}
            accessibilityLabel="sync-watchIcon"
        />)
    },
    [ICON_CHECK]: {
        backgroundColorStyle: styles.iconDarkBackground,
        iconComponent: (<EnIcon
            name="check"
            color="#22e258"
            style={styles.checkIcon}
            accessibilityLabel="connected-watchIcon"
        />)
    },
    [ICON_CLOSE]: {
        backgroundColorStyle: styles.iconDarkBackground,
        iconComponent: (<AntIcon
            name="close"
            color="#FA6969"
            style={styles.checkIcon}
            accessibilityLabel="disconnected-watchIcon"
        />)
    },
    [ICON_UPLOAD]: {
        backgroundColorStyle: styles.iconBlueBackground,
        iconComponent: (<FontAwesome5
            name="arrow-down"
            color="#FFF"
            style={styles.checkIcon}
            accessibilityLabel="new-firmware"
        />)
    },



}

export function WatchConnectionStatus({onIconPress, onSuccessIconPress}) {
    const hasNewVersion = useSelector(selectNewFirmwareExists);

    const {isWatchConnected, offlineSyncData} = useSelector((state) => ({
        isWatchConnected: selectWatchConnected(state),
        offlineSyncData: state.watch.offlineSyncData,
    }));

    let icon = ICON_CLOSE; // default icon

    if (isWatchConnected === WATCH_CONNECTION_STATE.SYNCING || offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START) {
        icon = ICON_REFRESH;
    } else if (isWatchConnected === WATCH_CONNECTION_STATE.CONNECTED) {
        if (hasNewVersion) {
            icon = ICON_UPLOAD;
        } else {
            icon = ICON_CHECK;
        }
    }

    const {iconComponent, backgroundColorStyle} = ICONS_MAP[icon];

    return (
        <View style={styles.headerIconWrap}>
            <TouchableOpacity
                onPress={
                    isWatchConnected == WATCH_CONNECTION_STATE.NOT_CONNECTED ||
                    isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
                    offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START
                        ? onIconPress
                        : onSuccessIconPress
                }
                style={styles.watchWrap}
                accessibilityLabel="header-watchIcon"
                accessible={false}
            >
                <UIWatchConnectionIcon/>
                <View
                    style={[styles.watchNotification, backgroundColorStyle]}
                    accessibilityLabel="subheader-watchIcon">
                    {iconComponent}
                </View>

            </TouchableOpacity>
        </View>
    );
}
