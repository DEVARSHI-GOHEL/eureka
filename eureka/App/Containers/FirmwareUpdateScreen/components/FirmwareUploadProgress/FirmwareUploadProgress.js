import {Platform, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import moment from "moment";
import {t} from 'i18n-js';

import {styles} from "../FirmwareUpdateContent.styles";
import CircleLoader from "../CircleLoader";
import {getFileSize, getUploadStart, selectFirmwareFlashingTime} from "../../redux/selectors";
import {dispatchFirmwareUpdateStopAction} from "../../redux/richActions";
import {useTranslation} from "../../../../Services/Translate";

// 8333 = 0.5 MB/min - for iOS
// 5333 = 0.32 MB/min - for Android
export const ESTIMATED_UPLOAD_SPEED_PER_SEC = Platform.OS === 'ios' ? 8333 : 5333;

const UploadTimeLeft = ({minutes}) => {

    const roundedMins = Math.ceil((minutes > 9) ? (minutes / 10) : 0) * 10;
    const [text, setText] = useState('');
    const [firstTime, setFirstTime] = useState(true);

    useEffect(() => {
        if (roundedMins < 10) {
            setText(t('uploadFW.less10Mins'));
            return;
        }
        if (firstTime) {
            setFirstTime(false);
            setText(t('uploadFW.firstTime',{roundedMins}));
            return;
        }
        setText(t('uploadFW.roundedEstimation',{roundedMins}));

    }, [roundedMins, setText])

    return (<Text style={[styles.subHeading, styles.centerText, {marginTop: 50}]}>
        {text}
    </Text>);
}

export const FirmwareUploadProgress = () => {
    const fileSize = useSelector(getFileSize);
    const uploadStartedAt = useSelector(getUploadStart);
    const {flashingFrom, flashingDurationSec} = useSelector(selectFirmwareFlashingTime);
    const [progressPercent, setProgressPercent] = useState(0);
    const [{minutesLeft, minutesInitalized}, setMinutesLeft] = useState({minutesLeft: 0, minutesInitalized: false});
    const trn = useTranslation('uploadFW');
    useEffect(() => {
        const interval = setInterval(() => {
            if (!fileSize) return;
            if (!uploadStartedAt && !flashingFrom) return;

            const now = moment();
            const uploadTimeSec = fileSize / ESTIMATED_UPLOAD_SPEED_PER_SEC;
            const totalTimeSec = uploadTimeSec + flashingDurationSec;
            let durationSec;

            if (!flashingFrom) {
                durationSec = moment.duration(now.diff(uploadStartedAt)).asSeconds();
            } else {
                // if flashingFrom is set, calculate from the flashing-start time
                durationSec = uploadTimeSec + moment.duration(now.diff(flashingFrom)).asSeconds();
            }

            const uploaded = durationSec / totalTimeSec;

            setMinutesLeft({
                minutesLeft: Math.round((totalTimeSec - durationSec) / 60),
                minutesInitalized: true,
            });

            let percentage = Math.floor(uploaded * 100);

            if (percentage > 100) {
                percentage = 100;
            }

            setProgressPercent(percentage);
        }, 1000);

        return () => clearInterval(interval);
    }, [fileSize, uploadStartedAt, flashingFrom]);

    useEffect(()=>{
        // This is prevention from screen stuck.
        // If progress reaches 100%, and FIRMWARE_UPDATE.FIRMWARE_UPDATE_COMPLETE is not received, it will end
        // the update flow and show "connect screen'
        if ( progressPercent===100){
            setTimeout(()=> {
                dispatchFirmwareUpdateStopAction()
            }, 1000);
        }
    },[progressPercent])

    return (
        <>
            <View style={{paddingTop: 30}}>
                <Text
                    style={[styles.createAccHeading, styles.centerText]}
                    accessibilityLabel="deviceMsn-heading">
                    {trn.title}
                </Text>
                <Text style={[styles.subHeading, styles.centerText]}>
                    {trn.subTitle}
                </Text>
            </View>
            <View style={styles.iconStyle}>
                <CircleLoader  {...{percent: progressPercent}}/>
                {minutesInitalized && <UploadTimeLeft minutes={minutesLeft}/>}
            </View>
        </>
    );
};
