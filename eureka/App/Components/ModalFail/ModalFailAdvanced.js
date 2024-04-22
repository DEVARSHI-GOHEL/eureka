import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {UIButton, UIModal} from "../UI";
import GlobalStyle from "../../Theme/GlobalStyle";
import {Fonts} from "../../Theme";
import Colors from "../../Theme/Colors";
import AntIcon from "react-native-vector-icons/AntDesign";


export const styles = StyleSheet.create({
    button: {
        ...GlobalStyle.WrapForSlinglebttn,
        ...GlobalStyle.bttnArea
    },
    secondaryButton: {
        ...GlobalStyle.bttnArea,
        ...GlobalStyle.borderColor,
    }
});

const ICON_SIZE = 40;
const ICON_CROSS_SIZE = ICON_SIZE * 0.6;

const FailIcon = () => {
    return <View style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        backgroundColor: 'black',
        borderRadius: ICON_SIZE/2,
        justifyContent:'center',
        alignItems: 'center'
    }}>
        <AntIcon name='close' style={{
            fontSize: ICON_CROSS_SIZE ,
            color:Colors.redAlert,
        }} />
    </View>
}

const ModalFailAdvanced = (
    {
        modalVisible,
        title,
        content,
        onClose,
        primaryButtonText = 'OK',
        secondaryButtonText,
        onPrimaryButtonPress = null,
        onSecondaryButtonPress= null,
    }
) => {

    return (
        <Modal animationType="fade" transparent={false} visible={modalVisible}>
            <UIModal
                Icon={<FailIcon />}
                modalClose={() => onClose?.()}
                title={
                    <Text
                        style={GlobalStyle.modalHeading}
                        accessibilityLabel="firmware-fail-update-title">
                        {title}
                    </Text>
                }
                content={
                    <Text
                        style={GlobalStyle.modalSubHeading}
                        accessibilityLabel="firmware-fail-update-text">
                        {content}
                    </Text>

                }
                buttons={
                    <View style={GlobalStyle.bttnWrap}>
                        {secondaryButtonText &&
                            <UIButton
                                style={styles.secondaryButton}
                                mode="outlined"
                                accessibilityLabel="firmware-fail-update-button"
                                labelStyle={{...Fonts.fontSemiBold }}
                                onPress={() => onSecondaryButtonPress?.()}>
                                {secondaryButtonText}
                            </UIButton>
                    }

                        <UIButton
                            style={styles.button}
                            mode="contained"
                            accessibilityLabel="firmware-fail-update-button"
                            labelStyle={{...Fonts.fontSemiBold}}
                            onPress={() => onPrimaryButtonPress?.()}>
                            {primaryButtonText}
                        </UIButton>
                    </View>
                }
            />
        </Modal>

    )
}


export default ModalFailAdvanced;
