import {SafeAreaView} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';

import {getFirmwareUpdateState, isDFUConnected,} from '../redux/selectors';
import {FirmwareUpdateState} from '../redux/constants';
import GradientBackground from "../../../Components/GradientBackground";
import {FirmwareDownload} from "./FirmwareDownloadContent";
import {FirmwareUploadProgress} from "./FirmwareUploadProgress/FirmwareUploadProgress";
import ConnectDfuScreen from "./UpdateScreensFlow/ConnectDfuScreen";

export const FirmwareUpdateContent = () => {
    const dfuConnected = useSelector(isDFUConnected);
    const updateState = useSelector(getFirmwareUpdateState);

    let ContentComponent = ConnectDfuScreen;

    if (dfuConnected) {
        ContentComponent = FirmwareUploadProgress
    }

    if (updateState === FirmwareUpdateState.START_SOON) {
        ContentComponent = FirmwareDownload;
    }

    return (
        <SafeAreaView style={{height: '100%'}}>
            <GradientBackground>
                <ContentComponent/>
            </GradientBackground>
        </SafeAreaView>
    );
};
