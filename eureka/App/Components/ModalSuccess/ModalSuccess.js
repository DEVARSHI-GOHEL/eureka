import React from 'react';
import {Modal, Text, View} from 'react-native';
import {UIButton, UIModal} from "../UI";
import FeatherFont from "react-native-vector-icons/Feather";
import GlobalStyle from "../../Theme/GlobalStyle";
import {Fonts} from "../../Theme";

const ModalSuccess = ({
    modalVisible,
    onClose,
    title,
    text,
    buttonOKText = 'OK'
}) => {

  return (
    <Modal animationType="fade" transparent={false} visible={modalVisible}>
      <UIModal
        Icon={
          <FeatherFont
            name="check-circle"
            style={GlobalStyle.iconStyle}
            color="green"
          />
        }
        modalClose={() => onClose?.()}
        title={
          <Text
            style={GlobalStyle.modalHeading}
            accessibilityLabel="firmware-success-update-title">
            {title}
          </Text>
        }
        subTitle={!text?null:(
          <Text
            style={GlobalStyle.modalSubHeading}
            accessibilityLabel="firmware-success-update-subtitle">
            {text}
          </Text>
        )}
        buttons={
          <View style={GlobalStyle.bttnWrap}>
            <UIButton
              style={[GlobalStyle.WrapForSlinglebttn]}
              mode="contained"
              accessibilityLabel="update-acc-info-ok"
              labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
              onPress={() => onClose?.()}>
              {buttonOKText}
            </UIButton>
          </View>
        }
      />
    </Modal>

  )
}

export default ModalSuccess;
