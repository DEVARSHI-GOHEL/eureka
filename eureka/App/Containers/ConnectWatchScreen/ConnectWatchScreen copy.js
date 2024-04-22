import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
} from 'react-native';

import {UIButton, UITextInput, UILoader} from '../../Components/UI';
import {Label} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import styles from './styles';
import {Colors, Fonts} from '../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector, useDispatch} from 'react-redux';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {
  setWatchActivationCodeAction,
  removeWatchActivationCodeAction,
} from './action';
const CELL_COUNT = 6;
const ConnectWatchScreen = ({navigation}) => {
  const [isLoader, setIsLoader] = useState(true);
  // const [activationIndexOne, setActivationIndexOne] = useState('');
  // const [activationIndexTwo, setActivationIndexTwo] = useState('');
  // const [activationIndexThree, setActivationIndexThree] = useState('');
  // const [activationIndexFour, setActivationIndexFour] = useState('');
  // const [activationIndexFive, setActivationIndexFive] = useState('');
  // const [activationIndexSix, setActivationIndexSix] = useState('');
  const [warningMessageVisibility, setWarningMessageVisibility] = useState(
    false,
  );
  // const inputOne = useRef(null);
  // const inputOne = React.createRef()
  // const inputTwo = useRef(null);
  // const inputThree = useRef(null);
  // const inputFour = useRef(null);
  // const inputFive = useRef(null);
  // const inputSix = useRef(null);

  //ASMIT CHANGE
  //MUST GET MSN EITHER FROM ASYNC STORAGE OR DIRECTLY FROM DB - not decided

  //ASMIT CHANGE
  //ADD PAIRED AND CONNECTED STATES
  const {watchActivationCode} = useSelector(state => ({
    watchActivationCode: state.connectWatch.watchActivationCode,
  }));

  //For watch activation code
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const dispatch = useDispatch();

  //ASMIT CHANGE
  //THIS IS THE PAIRING PART - ACTIVATION CODE
  const pairWatchApiFun = async () => {
    let getActivateCode = null;
    setTimeout(() => {
      getActivateCode = '123456'; // Math.floor(100000 + Math.random() * 900000);
      dispatch(setWatchActivationCodeAction(getActivateCode));

      setIsLoader(false);
    }, 3000);
  };

  const [mergeActivationCode, setMergeActivationCode] = useState('');

  const saveWatchActivationcodeFun = async () => {
    console.log('value', value);

    await AsyncStorage.setItem('activation_code', value);
    navigation.navigate('ConnectionSucessScreen');
  };

  // setWarningMessageVisibility(true)

  useEffect(() => {
    pairWatchApiFun();
    // dispatch(removeWatchActivationCodeAction(''));
  }, []);

  // let connectBtnVisibility;
  const [connectBtnVisibility, setConnectBtnVisibility] = useState(true);

  const lastDigitInput = textParam => {
    console.log(textParam);
    // setActivationIndexSix(textParam);
    // console.log(activationIndexOne, activationIndexTwo, activationIndexThree, activationIndexFour, activationIndexFive, activationIndexSix, 300);

    let mergeActivationCodeValue;
    // if (activationIndexOne !== '' &&
    //   activationIndexTwo !== '' &&
    //   activationIndexThree !== '' &&
    //   activationIndexFour !== '' &&
    //   activationIndexFive !== '' &&
    //   activationIndexSix !== ''
    // // ){
    // mergeActivationCodeValue = `${activationIndexOne}${activationIndexTwo}${activationIndexThree}${activationIndexFour}${activationIndexFive}${activationIndexSix}`;

    // console.log('mergeActivationCodeValue', mergeActivationCodeValue, 400);
    // if()

    // }

    if (textParam !== undefined && textParam !== '' && textParam.length === 6) {
      // setMergeActivationCode(mergeActivationCodeValue);
      //ASMIT MODIFIED
      //WATCH ACTIVATION CODE NEED TO BE A NUMBER
      if (Number(watchActivationCode) === Number(textParam)) {
        console.log(
          'watchActivationCode === Number(mergeActivationCode)',
          watchActivationCode === textParam,
        );

        setWarningMessageVisibility(false);
        setConnectBtnVisibility(false);
        // connectBtnVisibility = false
      } else {
        // setMergeActivationCode('');
        // setMergeActivationCode(mergeActivationCodeValue);
        console.log('else');
        console.log(
          'watchActivationCode === Number(mergeActivationCode)',
          watchActivationCode === textParam,
        );

        setWarningMessageVisibility(true);
        setConnectBtnVisibility(true);
        // connectBtnVisibility = true
      }
    } else {
      setConnectBtnVisibility(true);
    }
  };

  const [deviceNameState, setDeviceNameState] = useState('');
  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      console.log('deviceName', deviceName);
      setDeviceNameState(deviceName);
      // iOS: "Becca's iPhone 6"
      // Android: ?
      // Windows: ?
    });
  }, []);

  //ASMIT CHANGE
  //SHOW PAIRING LOADER WHILE NOT PAIRED

  //ASMIT CHANGE
  //DISABLE CONNECTING BUTTON AND SHOW CONNECTING TEXT
  //ON ERROR OR SUCCESS RESTORE BUTTON TO NORMAL STATE
  //B
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
                <Text style={styles.createAccHeading}>Check your watch</Text>
                <Text style={styles.subHeading}>
                  Entering the activation code below as displayed on the watch
                  helps you extablish a secure end-to-end Bluetooth connection
                  between your watch and the App.
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
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
                <Label style={styles.inputLabel}>Activation code</Label>

                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={setValue}
                  onBlur={() => lastDigitInput(value)}
                  onFocus={() => lastDigitInput(value)}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({index, symbol, isFocused}) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />

                {warningMessageVisibility && (
                  <Text style={{color: Colors.blue}}>
                    Please provide valid activation code
                  </Text>
                )}
              </View>

              <View style={{height: 350}}>
                <View style={styles.imageContent}>
                  <Image
                    style={styles.signInImage}
                    source={require('../../assets/images/watch_activation_code.png')}
                  />
                </View>
              </View>

              <View style={{paddingHorizontal: 10}}>
                <UIButton
                  style={
                    connectBtnVisibility === true
                      ? {backgroundColor: '#A4C8ED'}
                      : {}
                  }
                  mode="contained"
                  labelStyle={{color: '#fff'}}
                  onPress={saveWatchActivationcodeFun}
                  disabled={connectBtnVisibility}>
                  Connect
                </UIButton>
              </View>

              {/* <UIButton mode="contained" style={{ marginTop:10}} onPress={() => navigation.navigate('ConnectionFailScreen')}>Connection error</UIButton> */}
            </LinearGradient>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConnectWatchScreen;
