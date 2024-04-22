import React from "react";
import { Modal, Text, View} from "react-native";
import {UIModal} from "../../../../Components/UI";
import GlobalStyle from "../../../../Theme/GlobalStyle";
import styles from './styles';
import {RNCamera as Camera} from "react-native-camera";
import {useTranslation} from "../../../../Services/Translate";

const BarCodeScanModal = ({modalHandler: scanCodeModal, onBarcodeRead}) => {
  const trn = useTranslation('BarCodeScanModal');

  return (<Modal animationType="fade" transparent={false} visible={scanCodeModal.isModalVisible}>
    <UIModal
      modalClose={() => {
        scanCodeModal.hideModal()
      }}
      title={
        <Text style={GlobalStyle.modalSubHeading}>
          {trn.title}
        </Text>
      }
      content={
        <View style={styles.qrcodeWrapper}>
          <Camera
            barCodeTypes={[Camera.Constants.BarCodeType.code128]}
            androidCameraPermissionOptions={{
              title: trn.permissionsTitle,
              message: trn.permissionsMessage,
              buttonPositive: trn.permissionOK,
            }}
            style={
              [styles.camera, styles.platformCameraStyle]
            }
            onBarCodeRead={(e) => {
              scanCodeModal.hideModal();
              if (onBarcodeRead) {
                onBarcodeRead(e.data);
              }
            }}
            fadeIn={false}
            type={'back'}
            flashMode={Camera.Constants.FlashMode.auto}
            captureAudio={false}
            notAuthorizedView={(
              <View style={styles.missingPermissionsContainer}>
                <Text style={styles.missingPermissionsText}>{trn.missingCameraPermission}</Text>
              </View>)}
          />
        </View>
      }
    />
  </Modal>);
}
export default BarCodeScanModal;
