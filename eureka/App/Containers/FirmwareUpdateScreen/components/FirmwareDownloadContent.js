import {Text, View} from "react-native";
import React from "react";
import {styles} from "./FirmwareUpdateContent.styles";
import CircleLoader from "./CircleLoader";
import {useSelector} from "react-redux";
import {getDownloadPercentage} from "../redux/selectors";
import {useTranslation} from "../../../Services/Translate";

export const FirmwareDownload = () => {
    const percentDownloaded = useSelector(getDownloadPercentage);
    const trn = useTranslation('screenFWUpdate');
    return (
        <>
            <View style={{paddingTop: 30}}>
                <Text
                    style={[styles.createAccHeading, styles.centerText]}
                    accessibilityLabel="deviceMsn-heading">
                    {trn.downloadText1}
                </Text>
                <Text style={[styles.subHeading, styles.centerText]}>
                    {trn.downloadText2}
                </Text>
            </View>
            <View style={styles.iconStyle}>
                <CircleLoader  {...{percent: percentDownloaded}}/>
            </View>
        </>
    );
};
