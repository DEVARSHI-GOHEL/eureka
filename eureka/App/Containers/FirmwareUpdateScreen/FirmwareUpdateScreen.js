import React from 'react';
import {useSelector} from 'react-redux';
import {isFirmwareUpdateVisible,} from './redux/selectors';
import {FirmwareUpdateContent} from './components/FirmwareUpdateContent';
import {SuccessFirmwareUpload} from "./components/SuccessFirmwareUpload/SuccessFirmwareUpload";
import AskUpdateModal from "./components/AskUpdateModal";
import FailFirmwareUpload from "./components/FailFirmwareUpload";


const FirmwareUpdateScreen = () => {
    const showScreen = useSelector(isFirmwareUpdateVisible);

    return (
        <>
            {showScreen ? <FirmwareUpdateContent/> : null}
            <AskUpdateModal />
            <SuccessFirmwareUpload />
            <FailFirmwareUpload />
        </>
    );
}

export default FirmwareUpdateScreen;
