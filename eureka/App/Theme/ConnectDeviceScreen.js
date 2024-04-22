import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';

import { UIButton, UITextInput, UILoader, UIModal } from '../../Component/UI';
import { Label } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import styles from './style';
import GlobalStyle from '../../Theme/GlobalStyle';
import { API } from '../../Services/API';
import { Colors, Fonts } from '../../Theme';
import ConnectCommandHandler from './ConnectCommandHandler';
import { EVENT_MANAGER } from '../../Ble/NativeEventHandler';
import {
  PAIRING_STATE,
  PAIRING_STATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

const ConnectDeviceScreen = ({ navigation, route }) => {
  const [isLoader, setIsLoader] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [deviceNameState, setDeviceNameState] = useState('');
  useEffect(() => {
    DeviceInfo.getDeviceName().then((deviceName) => {
      setDeviceNameState(deviceName);
    });
  }, []);

  // let connectBtnDisabled;
  const [connectBtnDisabled, setConnectBtnDisabled] = useState(true);
  const [connectButtonText, setConnectButtonText] = useState('Connect');

  useEffect(() => {
    setIsLoader(false);
    setConnectBtnDisabled(false);
  }, [deviceNameState && route.params]);

  const { deviceActivationCode, operationState, failureCode } = useSelector(
    (state) => ({
      deviceActivationCode: state.connectDevicedeviceActivationCode,
      operationState: state.connectDevice.operationState,
      failureCode: state.connectDevice.failureCode,
    })
  );

  if (operationState == PAIRING_STATE.PAIR_CONNECT_FAILED) {
    navigation.navigate('ConnectionFailureScreen');
    ConnectCommandHandler.resetPairConnect();
    setConnectButtonText('Connect');
    setConnectBtnDisabled(false);
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT_SUCCESS) {
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'ConnectionSuccessScreen' }],
    // });
    navigation.navigate('ConnectionSuccessScreen', route.params);
    ConnectCommandHandler.resetPairConnect();
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT_STARTED) {
    if (connectButtonText == 'Connect' && connectBtnDisabled == true) {
      setConnectButtonText('Connecting...');
      setConnectBtnDisabled(true);
    }
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader />}
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        // behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
        enabled
      >
        <View style={styles.mainScrollView}>
          <ScrollView>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.3 }}
              colors={['#f1fbff', '#fff']}
              style={styles.gradientContainer}
            >
              <View style={styles.textArea}>
                <Text style={styles.createAccHeading}>Connect to watch</Text>
                {/* <Text style={styles.subHeading}>App will now connect to your registered watch using the watch manufacturing serial number (MSN). </Text> */}
                <Text style={styles.subHeading}>
                  Connect this App to the Watch. Verify that the watch is
                  displaying the MSN number below. If they are not the same,
                  please press{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    troubleshoot
                  </Text>
                  . Else press ‘Connect’ button below.{' '}
                </Text>
                {/* <Text style={styles.subHeading}>App will now try and connect to your watch.</Text> */}

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      ...Fonts.fontSemiBold,
                      ...Fonts.medium,
                      marginBottom: 10,
                    }}
                  >
                    Phone name :{' '}
                  </Text>
                  <Text
                    style={{
                      ...Fonts.fontMedium,
                      ...Fonts.h2,
                      marginBottom: 10,
                    }}
                  >
                    {deviceNameState}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      ...Fonts.fontSemiBold,
                      ...Fonts.medium,
                      marginBottom: 10,
                    }}
                  >
                    Watch MSN :{' '}
                  </Text>
                  <Text
                    style={{
                      ...Fonts.fontMedium,
                      ...Fonts.h2,
                      marginBottom: 10,
                    }}
                  >
                    {route.params}
                  </Text>
                </View>
              </View>

              <View style={{ height: 350 }}>
                <View style={styles.imageContent}>
                  <Image
                    style={styles.signInImage}
                    source={require('../../assets/images/watch_activation_code.png')}
                  />
                </View>
              </View>

              <View style={{ paddingHorizontal: 10 }}>
                <UIButton
                  style={
                    connectBtnDisabled === true
                      ? { backgroundColor: '#A4C8ED' }
                      : {}
                  }
                  mode="contained"
                  labelStyle={{ color: '#fff', textTransform: 'uppercase' }}
                  onPress={() => {
                    sendPairConnectRequest(route.params);
                  }}
                  disabled={connectBtnDisabled}
                >
                  {connectButtonText}
                </UIButton>
              </View>

              {/* <UIButton mode="contained" style={{ marginTop:10}} onPress={() => navigation.navigate('ConnectionFailScreen')}>Connection error</UIButton> */}
            </LinearGradient>
          </ScrollView>
        </View>
        <Modal animationType="fade" transparent={false} visible={modalVisible}>
          <UIModal
            modalClose={() => setModalVisible(!modalVisible)}
            title={
              <Text style={GlobalStyle.modalSubHeading}>Troubleshoot</Text>
            }
            content={
              <>
                <Text style={GlobalStyle.modalContent}>
                  Please press the back arrow on top left to edit your Personal
                  Information. Enter the MSN Code as displayed on the watch in
                  the MSN Code field. Press ‘Continue’ button to retry
                  connection
                </Text>
              </>
            }
          />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function sendPairConnectRequest(deviceMsn) {
  ConnectCommandHandler.startPairConnect(async () => {
    EVENT_MANAGER.SEND.connect(1, deviceMsn);
  });
}

export default ConnectDeviceScreen;
