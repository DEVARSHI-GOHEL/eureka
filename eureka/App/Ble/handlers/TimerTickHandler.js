import moment from "moment";
import {checkAndNotify} from "../../Services/updateChecker";
import {timerConfig} from "./TimerConfig";
import {
    getFirmwareUpdateState,
    isFirmwareUpdateResultModalVisible, isFirmwareUpdateVisible,
    selectFirmwareUpdateStarted,
    selectFirmwareWizardVisible
} from "../../Containers/FirmwareUpdateScreen/redux/selectors";
import store from "../../../store/store";
import {selectFirmwareUpdateFlagIsSet} from "../../../reducers/firmwareVersionReducer/selectors";
import {FirmwareUpdateState} from "../../Containers/FirmwareUpdateScreen/redux/constants";
import {selectIsWatchConnected} from "../../Containers/HomeScreen/homeSelectors";

export const CheckStateFirmwareUpdate = {
    lastCheckValue: null,
};

const firmwareUpdateInProgress = () => {
    return selectFirmwareUpdateInProgress(store.getState());
}

/**
 * Return true if firmware update is still in progress, even if result modal (success or fail) is shown
 *
 * @return {boolean}
 */
export const selectFirmwareUpdateInProgress = (state) => {

    // wizard visible -> don't check for update
    if (isFirmwareUpdateVisible(state)) {
        return true;
    }
    // downloading the files is in progress
    if (getFirmwareUpdateState(state) === FirmwareUpdateState.START_SOON) {
        return true;
    }
    // check update is started
    if (selectFirmwareUpdateStarted(state)) {
        return true;
    }

    // check if wizard is visible
    if (selectFirmwareWizardVisible(state)) {
        return true;
    }

    // wizard is not visible, but app is waiting for result from watch
    const firmwareUpdateFlowIsNotFinished = selectFirmwareUpdateFlagIsSet(state);

    if (firmwareUpdateFlowIsNotFinished) {
        return true;
    }

    // update is finished, but some success/fail modal is shown
    if (isFirmwareUpdateResultModalVisible(state)) {
        return true;
    }

    // update is not in progress
    return false
}
/**
 * Return true if it firmware update should be checked.
 * In production mode it should be 8 hours (see FIRMWARE_UPDATE_AMOUNT and FIRMWARE_UPDATE_UNIT in config file)
 *
 * @param lastTime
 * @return {boolean}
 */
export const shouldCheckUpdate = (lastTime) => {

    const watchIsConnected = selectIsWatchConnected(store.getState());
    if (!watchIsConnected){
        // no watch is connected -> no need to check
        return false;
    }

    if (firmwareUpdateInProgress()){
        return false;
    }

    // Check the interval
    if (!lastTime) {
        return true;
    }

    const thresholdTime = moment().subtract(timerConfig.firmwareUpdateAmount, timerConfig.firmwareUpdateUnit);

    // timeline: --- thresholdTime --- lastTme ---
    if (thresholdTime.isBefore(lastTime)) return false;
    // timeline: --- lastTme --- thresholdTime ---
    return true;
}

/**
 * Convert time (moment) to string
 * @param time
 * @return {*}
 */
export const timeToString = (time) => {
    return time?.format();
}

/**
 * Convert string to time (moment)
 * @param stringTime
 * @return {*}
 */
export const stringToTime = (stringTime) => {
    if (!stringTime) return null;
    return moment(stringTime)
}

/**
 * Handle timer tick. Function will check whether the firmware update check should be called.
 * @return {Promise<void>}
 */
export const timerTickHandler = async () => {
    
    if (!shouldCheckUpdate(stringToTime(CheckStateFirmwareUpdate.lastCheckValue))) {
        return;
    }

    if ((await checkAndNotify()) !== null) {
        CheckStateFirmwareUpdate.lastCheckValue = timeToString(moment()); 
    }
}
