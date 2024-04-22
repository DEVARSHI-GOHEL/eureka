import React, {useState} from "react";
import {Modal, Text, View} from "react-native";
import {UIButton, UIModal} from "../UI";
import {Fonts, GlobalStyle} from "../../Theme";
import {useTranslation} from "../../Services/Translate";

export const useModal = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const hideModal = () => setModalVisible(false);
  const showModal = () => setModalVisible(true);
  return {
    isModalVisible,
    hideModal,
    showModal
  };
}


const ModalWithCancel = ({
                           modalHook,
                           onClose,
                           onOK,
                           onCancel,
                           text
                         }) => {
  const trn = useTranslation("ModalWithCancel");

  return (<Modal
    animationType="fade"
    transparent={false}
    visible={modalHook.isModalVisible}
  >
    <UIModal
      modalClose={() => {
        modalHook.hideModal();
        if (onClose) {
          onClose();
          return
        }
        if (onCancel) onCancel();

      }}
      title={
        <Text style={GlobalStyle.modalHeading}>
          {text}
        </Text>
      }
      buttons={
        <View style={GlobalStyle.bttnWrap}>
          <UIButton
            style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
            mode="outlined"
            labelStyle={{...Fonts.fontSemiBold}}
            onPress={() => {
              modalHook.hideModal();
              if (onOK) onOK();
            }}>
            {trn.ok}
          </UIButton>
          <UIButton
            style={GlobalStyle.bttnArea}
            mode="contained"
            labelStyle={{...Fonts.fontSemiBold}}
            onPress={() => {
              modalHook.hideModal();
              if (onCancel) onCancel();
            }}>
            {trn.cancel}
          </UIButton>
        </View>
      }
    />
  </Modal>);
}

export default ModalWithCancel;