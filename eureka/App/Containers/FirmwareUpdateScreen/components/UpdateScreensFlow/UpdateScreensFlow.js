import React, {useCallback, useEffect, useState} from 'react';
import moment from "moment";
import {Image, SafeAreaView, Text, View} from 'react-native';
import {t} from 'i18n-js';

import GradientBackground from "../../../../Components/GradientBackground";
import Dots from "../Dots/Dots";
import {Fonts} from "../../../../Theme";
import NavigationService from "../../../../Navigators/NavigationService";
import {selectIsWatchCharging} from "../../../HomeScreen/watchSelectors";
import {useDispatch, useSelector} from "react-redux";
import {
    getUploadStart,
    isDFUConnected,
    isFirmwareUpdateFailed,
    isFirmwareUpdateSucceed,
    selectFirmwareUpdateStarted
} from "../../redux/selectors";
import {firmwareUpdateShowStatusScreen, setWizardIsVisible} from "../../redux/actions";
import {continueWithUploadingToWatch, startDfuMode} from "../../../../Ble/NativeEventHandler";
import {UIButton} from "../../../../Components/UI";
import {styles} from "./styles";
import {
    BUTTON_ACTION_CLOSE,
    BUTTON_INITIATE_DFU,
    BUTTON_STAR_UPDATE,
    STEPS,
    TRIGGER_20_SECONDS,
    TRIGGER_ON_CHARGE,
    TRIGGER_ON_DFU_CONNECT,
    TRIGGER_ON_UPDATE_STARTED, TRIGGER_ON_WATCH_DISCONNECT
} from "./config";
import {selectWatchConnected} from "../../../HomeScreen/homeSelectors";
import {useTranslation} from "../../../../Services/Translate";

const SHOW_SCREEN_MINIMAL_TIME = 3000; // show each screen at least for 3 seconds
const SHOW_SCREEN_20_SECONDS = 20000; // 20 seconds of delay, before automatically switch to next screen

/**
 * if time to show next screen is below this border, show next screen directly, don't wait.
 * @type {number}
 */
const SHOW_NEXT_STEP_TIME_THRESHOLD = 100;

/**
 * Return time in milliseconds, to wait to reach time (referenceTime + addMillisecondsToReference).
 * The time is compared to current time.
 * If function returns negative value, it means, that (referenceTime + addMillisecondsToReference) is in past,
 * so there is no need to wait.
 * @param referenceTime
 * @param addMillisecondsToReference
 */
const getTimeToWait = (referenceTime, addMillisecondsToReference = 0) => {
    const now = moment();
    const targetTime = (referenceTime ? referenceTime.clone() : now).add(addMillisecondsToReference, 'ms');

    return targetTime.diff(now);
}

const callButtonHandlerWithDelay = (waitTime, buttonHandler, setTimer) => {
    if (waitTime > SHOW_NEXT_STEP_TIME_THRESHOLD) {
        const timerRef = setTimeout(() => {
            buttonHandler();
        }, waitTime);
        setTimer(timerRef);
    } else {
        buttonHandler();
    }
}

const UpdateScreensFlow = (props) => {
    const dispatch = useDispatch();
    const charging = useSelector(selectIsWatchCharging);
    const dfuConnected = useSelector(isDFUConnected);
    const uploadFirmwareStartedAt = useSelector(getUploadStart);
    const firmwareUpdateStarted = useSelector(selectFirmwareUpdateStarted);
    const errorModalVisible = useSelector(isFirmwareUpdateFailed);
    const successModalVisible = useSelector(isFirmwareUpdateSucceed);
    const watchConnected = useSelector(selectWatchConnected);
    const trn = useTranslation('screenFWUpdate');
    const {updateMode} = props?.route?.params || {};

    const [{index, screenShownTime, timer}, setScreenAndTime] = useState({
        index: 0,
        screenShownTime: null,
        timer: null
    });

    const {descriptionKey, image, buttonTextKey = '', buttonAction, trigger} = STEPS[index] || {};
    const description = trn[descriptionKey];
    const buttonText = trn[buttonTextKey];
    const goNextScreen = useCallback(() => {

        setScreenAndTime(({index, timer}) => {

            if (timer) {
                clearTimeout(timer);
            }

            return {
                index: (index + 1) % STEPS.length,
                screenShownTime: moment(),
                timer: null,
            }
        });

    }, [setScreenAndTime])

    const setTimer = useCallback((newTimer) => {
        setScreenAndTime(({...stateParams}) => ({...stateParams, timer: newTimer}));
    }, [setScreenAndTime]);

    useEffect(() => {
        dispatch(setWizardIsVisible(true));
        return () => {
            // on component closing, call action to show upload status screen
            // it will open the screen only when the upgrade process is running,
            // and this screen is not shown.
            // In other cases (upload process didn't start or screen is already shown)
            // it has no effect on redux state
            dispatch(firmwareUpdateShowStatusScreen());
            dispatch(setWizardIsVisible(false));

        }
    }, []);

    const closeScreen = useCallback(() => {
        // don't forget to reset timer - otherwise the close screen may be called 2x in some cases
        if (timer) {
            clearTimeout(timer);
        };

        NavigationService.goBack();
    },[timer]);

    useEffect(() => {
        // this should handle case, when update is done (success or fail dialog is shown),
        // but wizard is still opened
        if (errorModalVisible || successModalVisible) {
            closeScreen();
        }
    }, [errorModalVisible,successModalVisible, closeScreen]);

    const buttonHandler = useCallback(() => {

        switch (buttonAction) {
            case BUTTON_ACTION_CLOSE:
                if (updateMode && !dfuConnected) {
                    dispatch(firmwareUpdateShowStatusScreen(true));
                }

                closeScreen();
                break;
            case BUTTON_INITIATE_DFU:
                if (updateMode) {
                    startDfuMode();
                }
                goNextScreen();
                break;
            case BUTTON_STAR_UPDATE:
                if (updateMode) {
                    // IMPORTANT !!! :
                    // continueWithUploadingToWatch should be called from here
                    // otherwise the update will not start
                    continueWithUploadingToWatch();
                }
                goNextScreen();
                break;
            default:
                goNextScreen();
                break;
        }

    }, [index, goNextScreen, dispatch, updateMode, dfuConnected, closeScreen]);

    // handle triggers
    useEffect(() => {
        if (!updateMode) {
            return;
        }

        if (timer) {
            // handler is already fired, just wait for timer which will call the handler
            return;
        }

        switch (trigger) {
            case TRIGGER_20_SECONDS:
                callButtonHandlerWithDelay(SHOW_SCREEN_20_SECONDS, buttonHandler, setTimer);
                break;
            case TRIGGER_ON_CHARGE:
                if (charging) {
                    const waitTime = getTimeToWait(screenShownTime, SHOW_SCREEN_MINIMAL_TIME);
                    callButtonHandlerWithDelay(waitTime, buttonHandler, setTimer);
                }
                break;
            case TRIGGER_ON_WATCH_DISCONNECT:
                if (!watchConnected) {
                    const waitTime = getTimeToWait(screenShownTime, SHOW_SCREEN_MINIMAL_TIME);
                    callButtonHandlerWithDelay(waitTime, buttonHandler, setTimer);
                }
                break;
            case TRIGGER_ON_DFU_CONNECT:
                // dfuConnected === true means that event FIRMWARE_UPDATE_START was received
                if (dfuConnected) {
                    const waitTime = getTimeToWait(screenShownTime, SHOW_SCREEN_MINIMAL_TIME);
                    callButtonHandlerWithDelay(waitTime, buttonHandler, setTimer);
                }
                break;
            case TRIGGER_ON_UPDATE_STARTED:
                if (firmwareUpdateStarted) {
                    const waitTime = getTimeToWait(uploadFirmwareStartedAt || screenShownTime, SHOW_SCREEN_20_SECONDS);
                    callButtonHandlerWithDelay(waitTime, buttonHandler, setTimer);
                }
                break;
        }
    }, [updateMode, trigger, timer, setTimer, charging, dfuConnected, firmwareUpdateStarted, uploadFirmwareStartedAt, watchConnected]);

    const onDotPress = (index) => {
        if (updateMode) return;

        setScreenAndTime(
            {
                index,
                screenShownTime: null,
                timer: null,
            }
        );
    }

    return (<SafeAreaView style={{height: '100%'}}>
            <GradientBackground style={{paddingHorizontal: 0}}>
                <View style={[styles.container, {flex: 1}]}>
                    <Text style={styles.header}>{t("screenFWUpdate.steps",{currentStep: index + 1, totalCount:STEPS.length})}</Text>
                    <Text style={styles.description}>{description}</Text>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={image} width={200} height={300}/>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.dotContainer}>
                        <Dots size={STEPS.length} activeIndex={index} enabled={!updateMode} onDotPress={(index)=>{onDotPress(index)}}/>
                    </View>
                    <UIButton
                        mode="contained"
                        accessibilityLabel="firmware-update-button"
                        labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                        onPress={() => buttonHandler()}>
                        {buttonText}
                    </UIButton>
                </View>
            </GradientBackground>
        </SafeAreaView>
    )
}

export default UpdateScreensFlow;
