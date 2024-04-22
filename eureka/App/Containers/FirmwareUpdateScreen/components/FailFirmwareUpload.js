import React from 'react';
import ModalFail from "../../../Components/ModalFail/ModalFail";
import ModalFailAdvanced from "../../../Components/ModalFail/ModalFailAdvanced";
import {continueFirmwareDownload} from "../../../Components/FirmwareUpdateComponent/FirmwareUpdate";
import {useSelector} from "react-redux";
import {
    getFirmwareUpdateErrorInstallAgain,
    getFirmwareUpdateErrorMessage,
    isFirmwareUpdateFailed
} from "../redux/selectors";
import {useTranslation} from "../../../Services/Translate";
import {stopUpdateProcess} from "../../../../reducers/firmwareVersionReducer/richActions";

const FailFirmwareUpload = () => {
    const errorModalVisible = useSelector(isFirmwareUpdateFailed);
    const trn = useTranslation('firmwareUpdateScreen');
    const errorMessage = useSelector(getFirmwareUpdateErrorMessage) || 'Error during firmware update';
    const installAgain = useSelector(getFirmwareUpdateErrorInstallAgain);

    if (!errorModalVisible) return null;

    return (<>
        {installAgain ? (
            <ModalFailAdvanced
                {...{
                    modalVisible: errorModalVisible,
                    onClose: () => {
                        stopUpdateProcess();
                    },
                    onSecondaryButtonPress: () => {
                        stopUpdateProcess();
                    },
                    onPrimaryButtonPress: () => {
                        continueFirmwareDownload();
                    },
                    title: trn.failAdvanceditle,
                    content: trn.content,
                    primaryButtonText: trn.primaryButtonText,
                    secondaryButtonText: trn.secondaryButtonText,
                }}
            />
        ) : (
            <ModalFail
                modalVisible={errorModalVisible}
                title={trn.failTitle}
                content={errorMessage}
                onClose={() => {
                    stopUpdateProcess();
                }}
            />
        )}


    </>)
}

export default FailFirmwareUpload;
