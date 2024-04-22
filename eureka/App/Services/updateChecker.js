import notifee from '@notifee/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {postWithAuthorization} from "./graphqlApi";
import {Sign_In_Api} from "../Theme";
import {dispatch} from "../../store/store";
import {firmwareShowAskForStart} from "../Containers/FirmwareUpdateScreen/redux/actions";
import {saveNewFirmwareVersion, setNewVersionsIsAvailable} from "../../reducers/firmwareVersionReducer/actions";
import {channelId} from "../constants/NotifeeConstants"
import i18n from "i18n-js";

const updater = {
    notifications: {}, // store of notifications id by channel id
    isInBackground: false,
}

export const cancelDisplayedNotification = async () => {
    const channelId = await getChannelId();
    if (updater.notifications[channelId] && updater.isInBackground) {
        notifee.cancelDisplayedNotification(updater.notifications[channelId]);
    }
}

/**
 * This setter should be called when application switches to background mode.
 * @param isInBackground
 */
export const setAppIsInBackground = (isInBackground) => {
    updater.isInBackground = isInBackground;
}

/**
 * Id of channel for notifications
 */
let _channelId;

/**
 * Return id of channel for android notifications
 * @return {Promise<string|*>}
 */
const getChannelId = async () => {
    if (_channelId) return _channelId;

    _channelId = await notifee.createChannel(channelId);
    return _channelId;
}

/**
 * Create notification about new upgrade
 * @return {Promise<void>}
 */
export const notify = async (title, body, channelId) => {

    let useChannelId = channelId;
    if (!useChannelId) {
        useChannelId = await getChannelId();
    }

    if (updater.notifications[useChannelId]) {
        const cancelNotificationId = updater.notifications[useChannelId];
        updater.notifications[useChannelId] = null;
        await notifee.cancelDisplayedNotification(cancelNotificationId);
    }

    const notificationId = await notifee.displayNotification({
        title,
        body,
        android: {
            channelId: useChannelId,
            pressAction: {
                id: 'default',
            },
        }
    });

    updater.notifications[useChannelId] = notificationId;
}

const notifyAboutNewFirmware = () => {
    notify(i18n.t('notifications.firmwareUpdate_title'), i18n.t('notifications.firmwareUpdate_body'));
    setOpenFirmwareDialogFlag(true);
}

const OPEN_FIRMWARE_UPGRADE_FLAG = 'open_firmware_upgrade_flag';

const setOpenFirmwareDialogFlag = async (value) => {
    return AsyncStorage.setItem(OPEN_FIRMWARE_UPGRADE_FLAG, `${value}`);
}

const FIRMWARE_VERSION_DATE_MAP = 'firmware_version_date_map';

const putReleaseDate = async (version, releaseDate) => {
    if (!version || !releaseDate) {
        console.warn(`Trying to update version-release date map, but one of values is missing. version:"${version}", releaseDate:"${releaseDate}" `);
        return;
    }
    const currentMapString = await AsyncStorage.getItem(FIRMWARE_VERSION_DATE_MAP) || '{}';

    try {
        const currentMap = JSON.parse(currentMapString);
        // release date to this version is already defined -> no need to save it
        if (currentMap[version]) return;

        currentMap[version] = releaseDate;
        await AsyncStorage.setItem(FIRMWARE_VERSION_DATE_MAP, JSON.stringify(currentMap));
    } catch (e) {
        console.warn(e);
    }
}

export const getReleaseDateToVersion = async (version) => {

    const currentMapString = await AsyncStorage.getItem(FIRMWARE_VERSION_DATE_MAP) || '{}';

    try {
        const currentMap = JSON.parse(currentMapString);

        return currentMap[version];
    } catch (e) {
        console.warn(e);
    }
}

const NEW_FIRMWARE_DATA = 'new_firmware_data';

export const storeNewFirmwareData = async (body) => {
    return AsyncStorage.setItem(NEW_FIRMWARE_DATA, JSON.stringify(body));
}

export const getNewFirmwareData = async () => {
    const dataString = await AsyncStorage.getItem(NEW_FIRMWARE_DATA) || '{}';

    try {
        return JSON.parse(dataString);
    } catch (e) {
        console.warn(e);
        return {}
    }
}

/**
 * Function is used to check, whether the "firmware update" dialog should be opened or not.
 * Flag OPEN_FIRMWARE_UPGRADE_FLAG is set when app is in the background.
 * @return {Promise<void>}
 */
export const checkFirmwareUpgradeDialog = async () => {
    const shouldOpen = await AsyncStorage.getItem(OPEN_FIRMWARE_UPGRADE_FLAG);

    if (shouldOpen === 'true') {
        setOpenFirmwareDialogFlag(false);
        dispatch(firmwareShowAskForStart());
    }
}


/**
 * Call backend to check, it there is a new firmware. If it is so, return true. Otherwise false.
 * @return {Promise<boolean>}
 */
export const checkFirmwareUpdate = async () => {
    setOpenFirmwareDialogFlag(false);

    let device_msn = (await AsyncStorage.getItem('device_msn')).toString();
    let userId = await AsyncStorage.getItem('user_id');
    let getFirmwareDetails = `query GetNewFirmware($deviceMSN: String!, $lastInstalledVersion: String, $userId: Int!){ getNewFirmware(deviceMSN: $deviceMSN, lastInstalledVersion: $lastInstalledVersion, userId: $userId){ statusCode body { success message version releaseDate files { url hash } } } }`;

    try {
        let res = await postWithAuthorization(Sign_In_Api, {
            query: getFirmwareDetails,
            variables: {
                userId: Number(userId),
                deviceMSN: device_msn,
            },
            operationName: 'GetNewFirmware',
        });

        if (!res) {
            console.warn(
                'checkFirmwareUpdate: ',
                `Query "GetNewFirmware" (from ${Sign_In_Api}) returns empty response`,
            );
            return {newFirmware: false};
        }

        const {statusCode, body} = res.data?.data?.getNewFirmware || {};
        if (!statusCode || !body) {
            console.warn('res.data.data are empty, see res.data: ', res.data);

            throw new Error('Sever returns empty data');
        }

        if (statusCode === 502){
            // invalid or unsupported MSN -> no new version
            console.log('(502) Unsupported device ');
            dispatch(setNewVersionsIsAvailable(false));
            return { newFirmware: false };
        }

        const {files, message, version, releaseDate} = body;

        if (statusCode === 200 && version === null) {
            // no new version
            console.log(`checkFirmwareUpdate (status code ${statusCode}): `, message);
            dispatch(setNewVersionsIsAvailable(false));
            return {newFirmware: false};
        }

        if (statusCode !== 200 || version === null) {
            console.warn(`checkFirmwareUpdate (status code ${statusCode}): `, message);
            return {newFirmware: false};
        }

        await putReleaseDate(version, releaseDate);

        if (files) {
            await storeNewFirmwareData(body);
            dispatch(saveNewFirmwareVersion(version, true));

            // there exists a files to download
            return {newFirmware: true};
        }

    } catch (err) {
        console.warn('checkFirmwareUpdate (catch): ', err.message);
    }
    return {newFirmware: null};
}

/**
 * Check whether there exist a new firmware.
 * If it so, then:
 *  - if app is in background, show notification
 *  - if app is in foreground, show "firmware update" fullscreen modal.
 * @return {Promise<void>}
 */
export const checkAndNotify = async () => {
  const {newFirmware} = await checkFirmwareUpdate();

  if (!newFirmware) {
    return newFirmware;
  }

  if (updater.isInBackground) {
    notifyAboutNewFirmware();
  } else {
    dispatch(firmwareShowAskForStart());
  }

  return true;
};
