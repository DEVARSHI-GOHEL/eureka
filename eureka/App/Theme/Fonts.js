import {StyleSheet, Platform} from 'react-native';
import i18n from "i18n-js";

export const size = {
    h1: 36,
    h2: 16,
    h3: 18,
    h4: 40,
    h5: 30,
    h6: 28,
    sub: 15,
    large: 23,
    medium: 21,
    iconFont: 26,
    small: 13,
    extraLarge: 60,
    // input: 18,
    // large: 18,
    // regular: 17,
    // medium: 14,
    // small: 12
};

export const lineHeight = {
    h1: size.h1+5,
};

const FontWeight = {
    DEFAULT: 'DEFAULT',
    REGULAR: 'REGULAR',
    MEDIUM: 'MEDIUM',
    BOLD: 'BOLD',
    SEMI_BOLD: 'SEMI_BOLD',
    LIGHT: 'LIGHT',
};

const FontVariation = {
    JA: 'ja',
    DEFAULT: 'default',
};

const FontFamilyMap = {
    [FontVariation.DEFAULT]: {
        [FontWeight.REGULAR]: 'Rajdhani-Regular',
        [FontWeight.MEDIUM]: 'Rajdhani-Medium',
        [FontWeight.BOLD]: 'Rajdhani-Bold',
        [FontWeight.SEMI_BOLD]: 'Rajdhani-SemiBold',
        [FontWeight.LIGHT]: 'Rajdhani-Light',
    },
    [FontVariation.JA]: {
        [FontWeight.REGULAR]: 'NotoSansJP-Regular',
        [FontWeight.MEDIUM]: 'NotoSansJP-Medium',
        [FontWeight.BOLD]: 'NotoSansJP-Bold',
        [FontWeight.SEMI_BOLD]: 'NotoSansJP-SemiBold',
        [FontWeight.LIGHT]: 'NotoSansJP-Light',
    },

}

const getFont = (fontWright) => {
    let variation = FontVariation.DEFAULT;
    if (i18n.locale === 'ja') {
        variation = FontVariation.JA;
    }
    const fontGroup = FontFamilyMap[variation];

    return fontGroup[fontWright] || fontWright[FontWeight.REGULAR];
};


export default StyleSheet.create({
    h1: {
        fontSize: size.h1,
        lineHeight: lineHeight.h1,
    },
    h2: {
        fontSize: size.h2
    },
    h3: {
        fontSize: size.h3,
    },
    h4: {
        fontSize: size.h4,
        lineHeight: size.h4 + 5
    },
    h5: {
        fontSize: size.h5,
        lineHeight: size.h5 + 5
    },
    h6: {
        fontSize: size.h6,
        lineHeight: size.h6 + 1
    },
    large: {
        fontSize: size.large,
    },
    extraLarge: {
        fontSize: size.extraLarge,
    },
    medium: {
        fontSize: size.medium,
    },
    iconFont: {
        fontSize: size.iconFont
    },
    sub: {
        fontSize: size.sub
    },
    small: {
        fontSize: size.small
    },
    fontRegular: {
        fontFamily: getFont(FontWeight.REGULAR),
    },
    fontMedium: {
        fontFamily: getFont(FontWeight.MEDIUM),
    },
    fontBold: {
        fontFamily: getFont(FontWeight.BOLD),
    },
    fontSemiBold: {
        fontFamily:getFont(FontWeight.SEMI_BOLD),
    },
    fontLight: {
        fontFamily: getFont(FontWeight.LIGHT),
    },
    fontWarning: {
        color: 'red',
        fontSize: size.h2, marginRight: 8,
        fontFamily: getFont(FontWeight.MEDIUM),
    }
});
