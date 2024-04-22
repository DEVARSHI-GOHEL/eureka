import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';

import {UIButton} from '../../../../Components/UI';
import {Fonts} from '../../../../Theme';
import {getReleaseDateToVersion} from '../../../../Services/updateChecker';
import {
    selectNewFirmwareExists,
    selectNewFirmwareVersion,
    selectWatchFirmwareVersion
} from '../../../../../reducers/firmwareVersionReducer/selectors';
import {continueFirmwareDownload} from '../../../../Components/FirmwareUpdateComponent/FirmwareUpdate';
import styles from './styles';
import NavigationService from "../../../../Navigators/NavigationService";
import {useTranslation} from "../../../../Services/Translate";

const BulletText = ({children, style}) => <Text style={style}>{'• '}{children}</Text>;

const FirmwareUpdatesPanel = () => {

    const [releaseDateFormatted, setReleaseDateFormatted] = useState('');
    const newVersion = useSelector(selectNewFirmwareVersion);
    const watchVersion = useSelector(selectWatchFirmwareVersion);
    const newVersionExists = useSelector(selectNewFirmwareExists);
    const trn = useTranslation("panelFWUpdate");

    const findFirmwareReleaseDate = async (version) => {
        const releaseDate = await getReleaseDateToVersion(version);
        if (releaseDate) {
            const formatted = moment(releaseDate).format('MMMM Do, YYYY');
            setReleaseDateFormatted(formatted);
        }
    }

    useEffect(() => {
        if (watchVersion) {
            findFirmwareReleaseDate(watchVersion);
        }
    }, [watchVersion]);

    return (<View>
        <Text
            style={styles.strongText}
            accessibilityLabel="firmware-update-title">
            {trn.title}
        </Text>

        <View style={styles.bulletsContainer}>
            {newVersionExists ? <Text
                    style={styles.settingsText}
                    accessibilityLabel="firmware-update-subtitle-available">
                    {trn.newVersionAvailable}
                </Text> :
                <Text
                    style={styles.settingsText}
                    accessibilityLabel="firmware-update-subtitle-up-to-date">
                    {trn.currentVersionUpToDate}
                </Text>
            }
            <BulletText>{trn.currentVersion}: {watchVersion}</BulletText>
            {releaseDateFormatted ? <BulletText>{trn.releaseDate}: {releaseDateFormatted}</BulletText> : null}
            {newVersionExists && <BulletText>{trn.newVersion}: {newVersion}</BulletText>}
        </View>
        {newVersionExists ?
            <UIButton
                style={styles.upgradeButton}
                mode="contained"
                accessibilityLabel="firmware-update-button"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={() => {
                    continueFirmwareDownload();
                }}>
                {trn.btnUpdateNow}
            </UIButton>
            : <Text
                style={styles.settingsLinkText}
                accessibilityLabel="firmware-update-link"
                onPress={() => {
                    NavigationService.navigate('UpdateScreensFlow', {updateMode: false});
                }}
            >
                {trn.linkOnLearn}
            </Text>
        }
    </View>)
}

export default FirmwareUpdatesPanel;
