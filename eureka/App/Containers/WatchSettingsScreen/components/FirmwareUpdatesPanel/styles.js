import {StyleSheet} from 'react-native';
import parentStyles from "../../styles";
import GlobalStyle from "../../../../Theme/GlobalStyle";

export default StyleSheet.create({
    bulletsContainer: {marginTop: 8},
    strongText:parentStyles.navText,
    settingsText:parentStyles.settingsText,
    settingsLinkText:parentStyles.settingsLinkText,
    upgradeButton: {
        ...GlobalStyle.WrapForSlinglebttn,
        marginTop: 13,
    }
});
