import store, {dispatch} from "../../store/store";
import {
    resetUpdatedFirmwareVersion,
    saveWatchFirmwareVersion,
    setNewVersionsIsAvailable,
} from "./actions";
import {
    firmwareUpdateResultError,
    firmwareUpdateResultSuccess,
    firmwareUpdateWatchConnected,
} from "../../App/Containers/FirmwareUpdateScreen/redux/actions";
import {selectFirmwareUploadResult, selectUpdatedFirmwareVersion} from "./selectors";
import {deleteUpdateFolder} from "../../App/Components/FirmwareUpdateComponent/deleteUpdateFolder";
import {dispatchFirmwareUpdateStopAction} from "../../App/Containers/FirmwareUpdateScreen/redux/richActions";

export const setWatchVersion = (watchFirmwareRevision, postFirmwareUpdate) => {

    dispatch(saveWatchFirmwareVersion(watchFirmwareRevision));
    dispatch(firmwareUpdateWatchConnected());

    const updatedFirmwareVersion = selectUpdatedFirmwareVersion(store.getState());

    if (!updatedFirmwareVersion) {
        return;
    }

    if (updatedFirmwareVersion === watchFirmwareRevision) {
        const {message, status} = selectFirmwareUploadResult(store.getState());
        postFirmwareUpdate({message, status})

        dispatch(firmwareUpdateResultSuccess());
        dispatch(setNewVersionsIsAvailable(false));
    } else {
        dispatch(firmwareUpdateResultError('Wrong version', true))
    }
    dispatch(resetUpdatedFirmwareVersion());
}

export const stopUpdateProcess = () => {
    dispatchFirmwareUpdateStopAction();
    dispatch(resetUpdatedFirmwareVersion());
    deleteUpdateFolder();
}
