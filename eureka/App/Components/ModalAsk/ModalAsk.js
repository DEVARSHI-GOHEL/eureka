import React from 'react';
import {Modal, Text, View} from 'react-native';
import {UIButton, UIModal, UIWatchNotWorn} from "../UI";
import FeatherFont from "react-native-vector-icons/Feather";
import GlobalStyle from "../../Theme/GlobalStyle";
import {Fonts} from "../../Theme";
import Colors from "../../Theme/Colors";

const ModalAsk = ({
    modalVisible,
    title,
    iconName= 'help-circle',
    content,
    buttonOKText = 'OK',
    buttonCancelText = 'Cancel',
    onOk,
    onCancel,
    onClose,
}) => {
  return (
    <Modal animationType="fade" transparent={false} visible={modalVisible}>
      <UIModal
        Icon={
          <FeatherFont
            name={iconName}
            style={GlobalStyle.iconStyle}
            color={Colors.blue}
          />
        }
        modalClose={() => onClose?.()}
        title={
          <Text
            style={GlobalStyle.modalHeading}
            accessibilityLabel="modal-ask-title">
            {title}
          </Text>
        }
        content={
          <Text
            style={GlobalStyle.modalSubHeading}
            accessibilityLabel="modal-ask-text">
            {content}
          </Text>
        }
        buttons={
          <View style={GlobalStyle.bttnWrap}>
            <UIButton
              style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
              mode="outlined"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => onCancel?.() }>
              {buttonCancelText}
            </UIButton>
            <UIButton
              style={GlobalStyle.bttnArea}
              mode="contained"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => onOk?.() }>
              {buttonOKText}
            </UIButton>
          </View>
        }
      />
    </Modal>
  );
}

export default ModalAsk;
