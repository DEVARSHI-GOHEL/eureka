import {Platform} from "react-native";

export const BUTTON_ACTION_CLOSE = 'BUTTON_ACTION_CLOSE';
export const BUTTON_INITIATE_DFU = 'BUTTON_INITIATE_DFU';
export const BUTTON_STAR_UPDATE = 'BUTTON_STAR_UPDATE';
export const TRIGGER_20_SECONDS = 'TRIGGER_20_SECONDS';
export const TRIGGER_ON_CHARGE = 'TRIGGER_ON_CHARGE';
export const TRIGGER_ON_WATCH_DISCONNECT = 'TRIGGER_ON_WATCH_DISCONNECT';
export const TRIGGER_ON_DFU_CONNECT = 'TRIGGER_ON_DFU_CONNECT';
export const TRIGGER_ON_UPDATE_STARTED = 'TRIGGER_ON_UPDATE_STARTED';

export const STEPS = [
    {
        key: '1',
        descriptionKey: "step1Text",
        image: require('../../../../assets/images/step_stop_using.png'),
        buttonTextKey: "buttonNext",
        trigger: TRIGGER_20_SECONDS,
    },
    {
        key: '2',
        descriptionKey: 'step2Text',
        image: require('../../../../assets/images/step_charge.png'),
        buttonTextKey: "buttonNext",
        trigger: TRIGGER_ON_CHARGE,
        buttonAction: BUTTON_INITIATE_DFU,
    },
    {
        key: '3',
        descriptionKey:
            Platform.OS === 'ios' ?
                'step3TextiOS' :
                'step3TextAndroid',
        image: require('../../../../assets/images/step_disconnect.png'),
        buttonTextKey: "buttonNext",
        trigger: Platform.OS === 'ios' ? undefined : TRIGGER_ON_WATCH_DISCONNECT,
        buttonAction: BUTTON_STAR_UPDATE,
    },
    {
        key: '4',
        descriptionKey: 'step4Text',
        image: require('../../../../assets/images/step_dfu_connect.png'),
        buttonTextKey: "buttonNext",
        trigger: TRIGGER_ON_DFU_CONNECT,
    },
    {
        key: '5',
        descriptionKey: 'step5Text',
        image: require('../../../../assets/images/step_upload.png'),
        buttonTextKey: "buttonDone",
        buttonAction: BUTTON_ACTION_CLOSE,
        trigger: TRIGGER_ON_UPDATE_STARTED,

    },
];

export const CONNECT_DFU_STEP = STEPS[3];
