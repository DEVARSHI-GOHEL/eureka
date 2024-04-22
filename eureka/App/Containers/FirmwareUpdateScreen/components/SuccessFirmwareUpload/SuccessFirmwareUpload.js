import {Image, SafeAreaView, Text, View} from "react-native";
import React from "react";
import {styles} from "../FirmwareUpdateContent.styles";
import {UIButton} from "../../../../Components/UI";
import {Fonts} from "../../../../Theme";
import GradientBackground from "../../../../Components/GradientBackground";
import {isFirmwareUpdateSucceed} from "../../redux/selectors";
import {stopUpdateProcess} from "../../../../../reducers/firmwareVersionReducer/richActions";
import {useSelector} from "react-redux";
import {useTranslation} from "../../../../Services/Translate";

const image = require('../../../../assets/images/successfully_updated.png')
export const SuccessFirmwareUpload = () => {
    const visible  = useSelector(isFirmwareUpdateSucceed);
    const trn = useTranslation('screenFWUpdate');
    if (!visible) return null;

    return (
        <SafeAreaView style={{height: '100%'}}>
            <GradientBackground>
                <View style={{paddingTop: 60}}>
                    <Text
                        style={[styles.createAccHeading, styles.centerText]}
                        accessibilityLabel="deviceMsn-heading">
                        {trn.successUploadTitle}
                    </Text>
                </View>
                <View style={styles.iconStyle}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={image} width={200} height={300}/>
                    </View>
                    <View style={{ width: '100%'}}>
                        <UIButton
                            mode="contained"
                            accessibilityLabel="firmware-update-button"
                            labelStyle={{...Fonts.fontSemiBold}}
                            onPress={() => {stopUpdateProcess()}}>
                            {trn.btnOK}
                        </UIButton>
                    </View>
                </View>
            </GradientBackground>
        </SafeAreaView>
    );
};
