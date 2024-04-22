import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';
import {UIButton, UITextInput, UILoader, UIModal} from '../../Components/UI';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Fonts, StepsGoal_Api} from '../../Theme';
import {useFocusEffect} from '@react-navigation/native';
import IconFont from 'react-native-vector-icons/FontAwesome';
import EnIcon from 'react-native-vector-icons/Entypo';
import GlobalStyle from '../../Theme/GlobalStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DB_STORE} from '../../storage/DbStorage';
import store from '../../../store/store';
import {useTranslation} from '../../Services/Translate';
import {watchConnectionAction, shouldResetHome} from '../HomeScreen/action';
import {WATCH_CONNECTION_STATE} from '../../constants/AppDataConstants';
import {useSelector} from 'react-redux';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {PAIRING_STATE} from '../../constants/AppDataConstants';
import ConnectCommandHandler from '../ConnectWatchScreen/ConnectCommandHandler';
import {useNetInfo} from '@react-native-community/netinfo';
import {refreshTokenApi} from '../../Services/AuthService';
import {postWithAuthorization} from '../../Services/graphqlApi';
import {selectFirmwareUpdateFlagIsSet} from '../../../reducers/firmwareVersionReducer/selectors';
import MaterialCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import {useModal} from "../../Components/ModalWithCancel/ModalWithCancel";
import BarCodeScanModal from "./components/BarCodeScanModal/BarCodeScanModal";
import styles from './style';

const _DISPATCH = store.dispatch;

const DeviceRegistrationScreen = ({navigation}) => {
  const [deviceMsn, setDeviceMsn] = useState('');
  const [deviceMsnWarning, setDeviceMsnWarning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [errorMsgState, setErrorMsgState] = useState('');
  const {operationState} = useSelector((state) => ({
    operationState: state.connectWatch.operationState,
  }));
  const scanCodeModal = useModal();
  const netInfo = useNetInfo();
  /** ############# Language Related codes ############### */
  const trn = useTranslation('deviceRegistrationScreen');

  const [connectBtnDisabled, setConnectBtnDisabled] = useState(false);

  const firmwareUpdateFlowIsNotFinished = useSelector(selectFirmwareUpdateFlagIsSet);

  useEffect(() => {
    getAndSetDeviceMSN();
  }, []);

  if (operationState == PAIRING_STATE.PAIR_CONNECT_FAILED) {
    if (!firmwareUpdateFlowIsNotFinished){
      navigation.navigate('ConnectionFailScreen');
    }
    ConnectCommandHandler.resetPairConnect();
    setConnectBtnDisabled(false);
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT_SUCCESS) {
    navigation.reset({
      routes: [{name: 'HomeTab'}],
    });

    ConnectCommandHandler.handlePairConnectSuccess(deviceMsn);
  } else if (operationState == PAIRING_STATE.PAIR_CONNECT) {
    if (connectBtnDisabled === true) {
      setConnectBtnDisabled(true);
    }
  }

  /** ############################ */

  /**
   * Disable back button during api call
   */
  const [isBackEnable, setIsBackEnable] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isBackEnable) {
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isBackEnable, setIsBackEnable]),
  );

  /**
   * connect button disable and device msn Reg
   */
  let continueBtnDisableState;
  let deviceMsn_reg = /^[a-zA-Z0-9]{6}$|^[a-zA-Z0-9]{8}$/;

  if (deviceMsn.trim() !== '' && deviceMsn_reg.test(deviceMsn) !== false) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }
  let deviceMsnWarningTxt;
  if (deviceMsnWarning) {
    deviceMsnWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text
          style={Fonts.fontWarning}
          accessibilityLabel="deviceMsn-errorText">
          {errorMsgState}
        </Text>
      </View>
    );
  }


  /**
   * api call for register watch
   */
  const onRegisterDeviceMsn = async () => {
    Keyboard.dismiss();
    setConnectBtnDisabled(true);
    const userId = await AsyncStorage.getItem('user_id');

    const deviceMsnQuery = `mutation MyMutation($userId:Int,$deviceMSN:String) {updateDeviceMSN(deviceMSN:$deviceMSN,userId:$userId) {body statusCode}}`;

    console.log('deviceMsnQuery', deviceMsnQuery);

    if (netInfo.isConnected == true) {
      postWithAuthorization(
        StepsGoal_Api,
        {
          query: deviceMsnQuery,
          variables: {
            userId: userId,
            deviceMSN: `${deviceMsn}`,
          },
        }
      )
        .then(async (response) => {
          console.log('response', response);

          if (
            response.data.data &&
            response.data.data.updateDeviceMSN.statusCode === 200
          ) {
            let deviceInfo = await setDeviceToLocalStorage(deviceMsn);
            if (!deviceInfo) {
              throw new Exception('Device MSN could not be set to local db');
            }
            sendPairConnectRequest(deviceMsn);
            setDeviceMsnWarning(false);
            setErrorMsgState('');
            await AsyncStorage.setItem('to_pair_device_msn', deviceMsn);
          } else if (
            response.data.data &&
            response.data.data.updateDeviceMSN.statusCode === 504
          ) {
            setDeviceMsnWarning(false);
            setErrorMsgState('');
            setConnectBtnDisabled(false);
            Alert.alert(
              trn.errorMsg_6,
              trn.errorMsg_8,
              [{text: trn.OK_ButtonText}],
            );
          } else if (
            response.data.data &&
            response.data.data.updateDeviceMSN.statusCode === 500
          ) {
            setDeviceMsnWarning(false);
            setErrorMsgState('');
            setConnectBtnDisabled(false);
            Alert.alert(
              trn.errorMsg_6,
              trn.errorMsg_7,
              [{text: trn.OK_ButtonText}],
            );
          } else if (
            response.data.data.updateDeviceMSN.statusCode === 303 ||
            response.data.data.updateDeviceMSN.statusCode === 302
          ) {
            // invalid auth token + expired auth token
            // missing 302 and expired 303

            await refreshTokenApi(navigation, onRegisterDeviceMsn);

            // call relevant api if needed
          } else {
            let errorMsg =
              response.data.data && response.data.data.updateDeviceMSN.body;
            let errorMsgParse = JSON.parse(errorMsg);

            let finalMsg = '';
            if (response.data.data.updateDeviceMSN.statusCode == 501) {
              finalMsg = trn.errorMsg_3;
            } else if (response.data.data.updateDeviceMSN.statusCode == 502) {
              finalMsg = trn.errorMsg_4;
            } else if (response.data.data.updateDeviceMSN.statusCode == 503) {
              finalMsg = trn.errorMsg_5;
            } else {
              finalMsg = errorMsgParse.message;
            }
            setConnectBtnDisabled(false);
            setDeviceMsnWarning(true);
            setErrorMsgState(finalMsg);
          }
        })
        .catch(function (error) {
          console.log('error', error);
          setConnectBtnDisabled(false);
          setDeviceMsnWarning(false);
          setErrorMsgState('');
          Alert.alert(
            trn.errorMsg_6,
            trn.errorMsg_8,
            [{text: trn.OK_ButtonText}],
          );
        });
    } else {
      sendPairConnectRequest(deviceMsn);
      setDeviceMsnWarning(false);
      setErrorMsgState('');
    }
  };

  async function getAndSetDeviceMSN() {
    let device_msn = await AsyncStorage.getItem('to_pair_device_msn');
    setDeviceMsn(device_msn ? device_msn : '');
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader />}
      <KeyboardAvoidingView
        style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
        enabled>
        <View style={styles.mainScrollView}>
          <ScrollView>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 0, y: 0.3}}
              colors={['#f1fbff', '#fff']}
              style={styles.gradientContainer}>
              <Text
                style={styles.createAccHeading}
                accessibilityLabel="deviceMsn-heading">
                {trn.title}
              </Text>
              <Text style={styles.subHeading}>
                {trn.description}
              </Text>

              <View>
                <View style={styles.inputWrapper}>
                  <UITextInput
                    containerStyle={{flex:1}}
                    labelText={trn.watchMSN_InputText}
                    placeholder={trn.watchMSN_InputText}
                    value={deviceMsn}
                    error={deviceMsnWarning}
                    onChangeText={(text) => {
                      setDeviceMsn(text.replace(/[^\w-]/gi, ''));
                    }}
                    accessibilityLabel="deviceMSN-field"
                    iconsRight={
                      <MaterialCIcon
                        name='barcode-scan'
                        color={Colors.blue}
                        size={25}
                        style={{marginLeft: 10}}
                        onPress={() => {
                          scanCodeModal.showModal()
                        }}/>
                    }
                  />
                  <EnIcon
                    onPress={() => setModalVisible(!modalVisible)}
                    name="info-with-circle"
                    style={styles.inputIcon}
                  />

                </View>

                {deviceMsnWarningTxt}
              </View>

              <View style={{height: 350}}>
                <View style={styles.imageContent}>
                  <Image
                    style={styles.signInImage}
                    source={require('../../assets/images/signin_watch.jpg')}
                  />
                </View>
              </View>

              <View style={styles.btnRow}>
                <UIButton
                  style={
                    continueBtnDisableState === true || connectBtnDisabled
                      ? {backgroundColor: '#A4C8ED', flex: 1}
                      : {flex: 1}
                  }
                  mode="contained"
                  labelStyle={{color: '#fff'}}
                  accessibilityLabel="deviceMSN-continue-button"
                  onPress={onRegisterDeviceMsn}
                  disabled={continueBtnDisableState || connectBtnDisabled}>
                  {connectBtnDisabled ? trn.connecting : trn.connect}
                </UIButton>
                <UIButton
                  style={{flex: 1, marginLeft: 10}}
                  mode="contained"
                  labelStyle={{color: '#fff'}}
                  accessibilityLabel="deviceMSN-skip-button"
                  onPress={() => {
                    _DISPATCH(shouldResetHome(false));
                    _DISPATCH(
                      watchConnectionAction(
                        WATCH_CONNECTION_STATE.NOT_CONNECTED,
                      ),
                    );
                    navigation.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'HomeTab',
                        },
                      ],
                    });
                  }}>
                  {trn.skip_ButtonText}
                </UIButton>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <UIModal
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text style={GlobalStyle.modalSubHeading}>
              {trn.watchMSN_PopUpHeading}
            </Text>
          }
          content={
            <>
              <Text style={GlobalStyle.modalContent}>
                {trn.watchMSN_PopUpSubHeading}
              </Text>
              <Text style={GlobalStyle.modalContent}>
                {trn.watchMSN_PopUpDescription}
              </Text>
            </>
          }
        />
      </Modal>
      <BarCodeScanModal modalHandler={scanCodeModal} onBarcodeRead={setDeviceMsn}/>
    </SafeAreaView>
  );
};

async function setDeviceToLocalStorage(deviceMSN) {
  let deviceInfo = await setDeviceInfoToLocalDb(deviceMSN);

  if (!deviceInfo) {
    return null;
  }

  await AsyncStorage.multiSet([
    ['device_local_db_id', deviceInfo.device_local_db_id + ''],
    ['device_msn', ''],
    ['to_pair_device_msn', deviceInfo.deviceMSN + ''],
  ]);

  return deviceInfo;
}

/**
 * Path tested on android
 * @param {*} deviceMsn
 */
async function setDeviceInfoToLocalDb(deviceMsn) {
  let device_local_db_id = 0;

  if (!deviceMsn) {
    console.log('Watch msn is null or empty in watch registration screen');
    return {
      deviceDbId: 0,
      deviceMSN: '',
    };
  }

  try {
    let deviceResult = await DB_STORE.GET.device(deviceMsn);
    let deviceDetails = deviceResult.rows[0];
    if (deviceDetails) {
      console.log('GOT DEVICE IN DB');
      device_local_db_id = deviceDetails.id;
    }

    if (!device_local_db_id || device_local_db_id + '' == '0') {
      let dmlResult = await DB_STORE.PUT.device(deviceMsn);
      if (!dmlResult) {
        console.log('DEVICE COULD NOT BE INSERTED');
        return null;
      }

      deviceResult = await DB_STORE.GET.device(deviceMsn);
      deviceDetails = deviceResult.rows[0];

      if (!deviceDetails) {
        console.log('DEVICE COULD NOT BE FETCHED AFTER INSERTION');
        return null;
      }

      device_local_db_id = deviceDetails.id;

      if (!device_local_db_id || device_local_db_id + '' == '0') {
        console.log('DEVICE ID COULD NOT BE FETCHED AFTER INSERTION');
        return null;
      }

      console.log('GOT DEVICE IN DB AFTER INSERTION');
    }

    return {
      deviceDbId: device_local_db_id * 1,
      deviceMSN: deviceMsn,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}
function sendPairConnectRequest(msn) {
  ConnectCommandHandler.startPairConnect(async () => {
    let userId = await AsyncStorage.getItem('user_id');
    // let deviceMsn = await AsyncStorage.getItem('to_pair_device_msn');

    EVENT_MANAGER.SEND.connect(userId, msn);
  });
}
export default DeviceRegistrationScreen;
