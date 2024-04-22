import * as en from  '../../assets/languages/en.json';

export const Translate = (key) => {
    return en[key];
}

export const useTranslation = Translate;
