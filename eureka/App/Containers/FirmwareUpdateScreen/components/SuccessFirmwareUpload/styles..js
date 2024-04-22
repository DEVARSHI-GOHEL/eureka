import {StyleSheet} from 'react-native';
import {Fonts, Spacer} from '../../../../Theme';

export const styles =  StyleSheet.create({
    centerText: {
        width: '100%',
        textAlign: 'center',
    },
    createAccHeading: {
        ...Fonts.fontBold,
        ...Fonts.h4,
        ...Spacer.smallTopMargin,
        ...Spacer.tinyBottomMargin,
    },
    subHeading: {
        ...Fonts.h2,
        ...Fonts.fontMedium,
        ...Spacer.smallBottomMargin,
    },
    veryBold: {
        fontWeight: '700',
    },
    fontIcon: {
        fontSize: 200,
        width: '100%',
        textAlign: 'center',
    },
    iconStyle: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },

});
