import React, {useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Text} from 'react-native';

import ModalAsk from "../../../Components/ModalAsk/ModalAsk";
import {isAskModalVisible} from "../redux/selectors";
import {useTranslation} from "../../../Services/Translate";
import {firmwareHideAskForStart} from "../redux/actions";
import {continueFirmwareDownload} from "../../../Components/FirmwareUpdateComponent/FirmwareUpdate";
import {
    selectNewFirmwareVersion,
    selectWatchFirmwareVersion
} from "../../../../reducers/firmwareVersionReducer/selectors";
import Colors from "../../../Theme/Colors";
import {selectIsWatchConnected} from "../../HomeScreen/homeSelectors";

const UpdateInfoComponent = ({oldVersion, newVersion}) => {
    const trn = useTranslation('firmwareUpdateScreen');

    return (
        <Text>
            <Text>{`${trn.askTextBefore}\n\n`}</Text>
            <Text>{`${trn.currentVersion}: ${oldVersion}\n`}</Text>
            <Text style={{color: Colors.blue}}>{`${trn.newVersion}: ${newVersion}`}</Text>
            <Text>{`\n\n${trn.askTextAfter}`}</Text>
        </Text>)
}


const AskUpdateModal = () => {
    const dispatch = useDispatch();
    const askModalVisible = useSelector(isAskModalVisible);
    const isWatchConnected = useSelector(selectIsWatchConnected);
    const trn = useTranslation('firmwareUpdateScreen');
    const newVersion = useSelector(selectNewFirmwareVersion);
    const watchVersion = useSelector(selectWatchFirmwareVersion);

    const onCloseAskModal = useCallback(() => {
        dispatch(firmwareHideAskForStart());
    }, [dispatch])

    const continueFirmwareUpdate = useCallback(async () => {
        dispatch(firmwareHideAskForStart());
        continueFirmwareDownload();
    }, [dispatch])


    return (
        <ModalAsk
            modalVisible={askModalVisible && isWatchConnected}
            iconName="arrow-up-circle"
            title={trn.title}
            buttonOKText={trn.askOK}
            buttonCancelText={trn.askCancel}
            content={<UpdateInfoComponent oldVersion={watchVersion} newVersion={newVersion}/>}
            onClose={onCloseAskModal}
            onCancel={onCloseAskModal}
            onOk={continueFirmwareUpdate}
        />)
}

export default AskUpdateModal;
