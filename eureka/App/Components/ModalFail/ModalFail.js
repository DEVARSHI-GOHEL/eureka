import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {UIButton, UIModal, UIWatchNotWorn} from "../UI";
import FeatherFont from "react-native-vector-icons/Feather";
import GlobalStyle from "../../Theme/GlobalStyle";
import {Fonts, Spacer} from "../../Theme";
import Colors from "../../Theme/Colors";
import ModalFailAdvanced from "./ModalFailAdvanced";


export const styles =  StyleSheet.create({
    button: {
        ...GlobalStyle.WrapForSlinglebttn,
        ...GlobalStyle.bttnArea
    },
    secondaryButton: {
        ...GlobalStyle.bttnArea,
        ...GlobalStyle.borderColor,
    }
});

const ModalFail = ({
    modalVisible,
    onClose,
    title,
    content,
    buttonOKText = 'OK'
}) => {
  return (
    <ModalFailAdvanced
        {...{ modalVisible,
            onClose,
            onPrimaryButtonPress: onClose,
            title,
            content,
            primaryButtonText: buttonOKText,
        }}
    />

  )
}


export default ModalFail;
