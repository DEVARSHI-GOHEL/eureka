import {firmwareHideAskForStart, firmwareUpdateStop} from "./actions";
import store, {dispatch} from "../../../../store/store";
import NavigationService from "../../../Navigators/NavigationService";
import {selectWatchConnected} from "../../HomeScreen/homeSelectors";
import {cancelDisplayedNotification} from "../../../Services/updateChecker";

/**
 * This function dispatch action for hiding the firmware update wizard.
 * If watch is disconnected it will redirect to screen for connecting the watch.
 */
export const dispatchFirmwareUpdateStopAction = () => {
    // DFU is connected
    const isWatchConnected = selectWatchConnected(store.getState());

    dispatch(firmwareUpdateStop());
    if (!isWatchConnected) {

        // watch is not connected -> navigate to screen for watch connecting
        NavigationService.reset({
            routes: [{name: 'DeviceRegistrationScreen'}],
        });
    }
}

export const dispatchStopFirmwareUpdateChecking = async () => {
    store.dispatch(firmwareHideAskForStart());
    cancelDisplayedNotification();
}