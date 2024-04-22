import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';

import {UIButton, UITextInput, UILoader, UIModal} from '../../Components/UI';
import {Label} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {API} from '../../Services/API';
import {Colors, Fonts} from '../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ConnectCommandHandler from './ConnectCommandHandler';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {
  PAIRING_STATE,
  PAIRING_STATE_FAILURE_CODE,
} from '../../constants/AppDataConstants';

const ConnectWatchScreen = ({navigation}) => {
  const [isLoader, setIsLoader] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  //For watch activation code
  const [toPairDeviceMSN, setToPairDeviceMSN] = useState('');
  useEffect(() => {
    getAndSetToPairDeviceMSN();
  }, []);

  async function getAndSetToPairDeviceMSN() {
    let deviceMSN = await AsyncStorage.getItem('to_pair_device_msn');
    setToPairDeviceMSN(deviceMSN);
  }

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
  }, [toPairDeviceMSN && deviceNameState]);

  const {
    watchActivationCode,

    operationState,
    failureCode,
  } = useSelector((state) => ({
    watchActivationCode: state.connectWatch.watchActivationCode,
    operationState: state.connectWatch.operationState,
    failureCode: state.connectWatch.failureCode,
  }));

  if (operationState == PAIRING_STATE.PAIR_CONNECT_FAILED) {
    navigation.navigate('ConnectionFailScreen');
    ConnectCommandHandler.resetPairConnect();
    setConnectButtonText('Connect');
    setConnectBtnDisabled(false);
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT_SUCCESS) {
    navigation.reset({
      routes: [{name: 'HomeTab'}],
    });

    ConnectCommandHandler.handlePairConnectSuccess(toPairDeviceMSN);
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT) {
    if (connectButtonText == 'Connect' && connectBtnDisabled == true) {
      setConnectButtonText('Connecting...');
      setConnectBtnDisabled(true);
    }
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader />}
      <KeyboardAvoidingView
        style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
        // behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
        enabled>
        <View style={styles.mainScrollView}>
          <ScrollView>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.3}}
              colors={['#f1fbff', '#fff']}
              style={styles.gradientContainer}>
              <View style={styles.textArea}>
                <Text
                  style={styles.createAccHeading}
                  accessibilityLabel="connectWatch-heading">
                  Connect to watch
                </Text>

                <Text style={styles.subHeading}>
                  Connect this App to the Watch. Verify that the watch is
                  displaying the MSN number below. If they are not the same,
                  please press{' '}
                  <Text
                    style={styles.linkText}
                    accessibilityLabel="connect-watch-troubleshoot"
                    onPress={() => setModalVisible(!modalVisible)}>
                    troubleshoot
                  </Text>
                  . Else press ‘Connect’ button below. In the watch screen, you
                  should see your phone name. Verify the phone name from below.
                </Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    accessibilityLabel="connectWatch-phoneName"
                    style={{
                      ...Fonts.fontSemiBold,
                      ...Fonts.medium,
                      marginBottom: 10,
                    }}>
                    Phone name :{' '}
                  </Text>
                  <Text
                    style={{
                      ...Fonts.fontMedium,
                      ...Fonts.h2,
                      marginBottom: 10,
                    }}>
                    {deviceNameState}
                  </Text>
                </View>
                {/* {deviceNameState}  */}
                <View
                  accessibilityLabel="connectWatch-watchMsn"
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      ...Fonts.fontSemiBold,
                      ...Fonts.medium,
                      marginBottom: 10,
                    }}>
                    Watch MSN :{' '}
                  </Text>
                  <Text
                    style={{
                      ...Fonts.fontMedium,
                      ...Fonts.h2,
                      marginBottom: 10,
                    }}>
                    {toPairDeviceMSN}
                  </Text>
                </View>
              </View>

              <View style={{height: 350}}>
                <View style={styles.imageContent}>
                  <Image
                    style={styles.activationCodeWatchImage}
                    source={require('../../assets/images/watch_activation_code.png')}
                  />
                </View>
              </View>

              <View style={{paddingHorizontal: 15}}>
                <UIButton
                  style={
                    connectBtnDisabled === true
                      ? {backgroundColor: '#A4C8ED'}
                      : {}
                  }
                  mode="contained"
                  labelStyle={{color: '#fff'}}
                  onPress={() => {
                    setConnectButtonText('Connecting...');
                    setConnectBtnDisabled(true);
                    sendPairConnectRequest();
                  }}
                  disabled={connectBtnDisabled}
                  accessibilityLabel="connect-watch-button">
                  {connectButtonText}
                </UIButton>
              </View>
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
                  Please press the back arrow on top left to edit your
                  registered Watch MSN. Enter the MSN Code as displayed on the
                  watch in the Watch MSN Code field. Press ‘Continue’ button to
                  retry connection.
                </Text>
              </>
            }
          />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function sendPairConnectRequest() {
  ConnectCommandHandler.startPairConnect(async () => {
    let userId = await AsyncStorage.getItem('user_id');
    let deviceMsn = await AsyncStorage.getItem('to_pair_device_msn');

    EVENT_MANAGER.SEND.connect(userId, deviceMsn);
  });
}

export default ConnectWatchScreen;
