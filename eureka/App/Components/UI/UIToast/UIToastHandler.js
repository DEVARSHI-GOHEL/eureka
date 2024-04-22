import {t} from 'i18n-js';

import store from '../../../../store/store';
import {showToastAction, hideToastAction} from './action';
import * as en from  '../../../assets/languages/en.json';

const commonMessagesEN = en.commonMessages;
/**
 * Prepare inverse translations, eg:
 * ```
 * {
 *   "No watch available.":"commonMessages.message_3",
 *   "Could not establish connection to watch. Try again later.":"commonMessages.message_4",
 * }
 * ```
 * This will used for translation.
 */
const enMessages = (()=>{
    let result = {};
    Object.keys(commonMessagesEN).forEach(key => {
        if (commonMessagesEN[key])
        result[commonMessagesEN[key]]=`commonMessages.${key}`;
    })
    return result;
})();

const translateCommonMessage = (message) => {
    if (enMessages[message]){
        return t(enMessages[message])
    }
    if (commonMessagesEN[message]){
        return t(message);
    }
    return message;
}

export function showSuccessToast(message) {
    // TODO: use keys of translations instead of messages
    store.dispatch(showToastAction(1, translateCommonMessage(message)));
    setTimeout(function () {
        store.dispatch(hideToastAction());
    }, 10000);
}

export function showErrorToast(message) {
    store.dispatch(showToastAction(0, translateCommonMessage(message)));
    setTimeout(function () {
        store.dispatch(hideToastAction());
    }, 10000);
}