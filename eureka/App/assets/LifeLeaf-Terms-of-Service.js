import i18n from "i18n-js";
import {TERMS_HTML_JP} from "./LifeLeaf-Terms-of-Service.ja";
import {TERMS_HTML} from "./LifeLeaf-Terms-of-Service.en";

export const getTermsHTML = (preferredLang) => {
    const localization = preferredLang || i18n.locale;
    switch (localization){
        case "ja":
            return TERMS_HTML_JP;
        default:
            return TERMS_HTML;
    }

};
