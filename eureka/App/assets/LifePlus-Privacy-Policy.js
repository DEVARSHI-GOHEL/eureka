import i18n from "i18n-js";
import {POLICY_HTML_JP} from "./LifePlus-Privacy-Policy.ja";
import {POLICY_HTML} from "./LifePlus-Privacy-Policy.en";


export const getPolicyHTML = () => {
    if (i18n.locale === 'ja' ){
        return POLICY_HTML_JP;
    }
    return POLICY_HTML;
};
