import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import MuiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EnIcon from 'react-native-vector-icons/Entypo';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import {UIButton} from '../../Components/UI';
import {Fonts} from '../../Theme';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {
  INSTANT_CALIBRATE_STATE,
  INSTANT_CALIBRATE_FAILURE_CODE,
  AUTO_MEASURE_STATE,
} from '../../constants/AppDataConstants';
import CalibrateCommandHandler from '../CalibrateControlWrapper/CalibrateCommandHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showErrorToast} from '../../Components/UI/UIToast/UIToastHandler';
import {useTranslation} from "../../Services/Translate";

/**
 * CalibrateConnectionScreen -
 * @param {*} param0
 */
const CalibrateConnectionScreen = ({navigation, ...props}) => {
  const [topTextVisibility, setTopTextVisibility] = useState(true);
  const [topProgressTextVisibility, setTopProgressTextVisibility] =
    useState(false);
  const trn = useTranslation('CalibrateConnectionScreen');
  const {
    operationState,
    percentage,
    failureCode,
    currentStep,
    autoMeasureState,
  } = useSelector((state) => ({
    percentage: state.calibrate.percentage,
    operationState: state.calibrate.operationState,
    failureCode: state.calibrate.failureCode,
    currentStep: state.calibrate.step,
    autoMeasureState: state.measure.autoMeasureState,
  }));

  /**
   * startCalibrate again button press
   */
  const startCalibrate = () => {
    if (autoMeasureState == AUTO_MEASURE_STATE.STARTED) {
      showErrorToast(trn.waitForResult);
      return;
    }
    startCalibration();
    CalibrateCommandHandler.calibrateStepOne();
  };

  const cancelCalibrate = () => {
    CalibrateCommandHandler.resetCalibrate();
  };

  /**
   * Top & Bottom text UI and tint Color conditions
   */
  let tintColorConditon;
  let tintColorSecondaryCondition;
  let bottomText;
  let topText;

  if (operationState === INSTANT_CALIBRATE_STATE.ONGOING) {
    /**
     * in progress
     */

    tintColorConditon = '#1A74D3';
    tintColorSecondaryCondition = '#04D1F3';

    topText = (
      <Text style={GlobalStyle.heading}>{trn.screenTitle}</Text>
    );
  } else if (operationState === INSTANT_CALIBRATE_STATE.SUCCESS) {
    /**
     * success
     */

    tintColorConditon = '#2DE489';
    topText = null;

    bottomText = (
      <View style={GlobalStyle.sliderbttomText}>
        <Text style={GlobalStyle.heading}>
          {trn.successTitle}
        </Text>
        <Text style={GlobalStyle.description}>
          {trn.successDesription}
        </Text>
        <View style={styles.btnRow}>
          <UIButton
            style={GlobalStyle.calibrateBttn}
            mode="contained"
            onPress={cancelCalibrate}
            accessibilityLabel="calibrate-again">
            {trn.recalibrate}
          </UIButton>
          <UIButton
            style={[GlobalStyle.calibrateBttn, styles.leftMargin]}
            mode="contained"
            accessibilityLabel="measurement-ok-btn"
            onPress={() => navigation.goBack()}>
            {trn.ok}
          </UIButton>
        </View>
      </View>
    );
  } else if (operationState === INSTANT_CALIBRATE_STATE.FAILED) {
    if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.GENERAL_FAILURE) {
      /**
       * error
       */

      tintColorConditon = '#FF6766';
      tintColorSecondaryCondition = '#F86362';

      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.failTitle}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.failDesription}
          </Text>
          <View style={[GlobalStyle.linkText, {marginTop: 20}]}>
            <Text style={GlobalStyle.leftText}>{trn.troubleText}</Text>
            {/* onPress={() => navigation.navigate('CalibrateWatchSettingScreen')} */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CalibrateWatchSettingScreen', {
                  routeFrom: 'CalibrateConnectionScreen',
                })
              }
              accessible={false}
            >
              <Text style={GlobalStyle.rightText}>{trn.getHelp}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              GlobalStyle.bttnWrap,
              {paddingHorizontal: 0, marginTop: 20},
            ]}>
            <UIButton
              style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
              mode="outlined"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => {
                cancelCalibrate();
              }}>
              {trn.cancel}
            </UIButton>
            <UIButton
              style={GlobalStyle.bttnArea}
              mode="contained"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => {
                startCalibrate();
              }}>
              {trn.tryAgain}
            </UIButton>
          </View>
        </View>
      );
    } else if (
      failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
    ) {
      /**
       * bluetooth error
       */

      tintColorConditon = '#FF6766';

      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.failBTTitle}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.failBTDesription}
          </Text>
          <View style={[GlobalStyle.linkText, {marginTop: 20}]}>
            <Text style={GlobalStyle.leftText}>{trn.troubleText}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CalibrateWatchSettingScreen')
              }
              accessible={false}
            >
              <Text style={GlobalStyle.rightText}>{trn.getHelp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BATTERY_LOW) {
      /**
       * watch battery error
       */

      tintColorConditon = '#FF6766';
      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.failBateryTitle}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.failBTDesription}
          </Text>
          <View
            style={[
              GlobalStyle.bttnWrap,
              {paddingHorizontal: 0, marginTop: 20},
            ]}>
            <UIButton
              style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
              mode="outlined"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => navigation.goBack()}>
              {trn.cancel}
            </UIButton>
            <UIButton
              style={GlobalStyle.bttnArea}
              mode="contained"
              labelStyle={{...Fonts.fontSemiBold}}
              onPress={() => alert('ok')}>
              {trn.ok}
            </UIButton>
          </View>
        </View>
      );
    }
  }

  /**
   * Steps text UI conditions
   */
  let steps = null;

  if (operationState === INSTANT_CALIBRATE_STATE.ONGOING) {
    if (currentStep === INSTANT_CALIBRATE_STATE.STEP_ONE) {
      steps = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.subHeading}>{trn.step1Step}</Text>
          <Text style={GlobalStyle.subHeading}>{trn.step1Title}</Text>
          <Text style={GlobalStyle.description}>{trn.step1Descirption}</Text>
        </View>
      );
    } else if (currentStep === INSTANT_CALIBRATE_STATE.STEP_TWO) {
      steps = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.subHeading}>{trn.step2Step}</Text>
          <Text style={GlobalStyle.subHeading}>{trn.step2Title}</Text>
          <Text style={GlobalStyle.description}>{trn.step2Descirption}</Text>
        </View>
      );
    } else if (currentStep === INSTANT_CALIBRATE_STATE.STEP_THREE) {
      steps = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.subHeading}>{trn.step3Step}</Text>
          <Text style={GlobalStyle.subHeading}>{trn.step3Title}</Text>
          <Text style={GlobalStyle.description}>{trn.step3Descirption}</Text>
        </View>
      );
    }
  }

  let circleIcons;
  let fillVar;

  if (operationState === INSTANT_CALIBRATE_STATE.ONGOING) {
    circleIcons = (
      <MuiIcon name="refresh" size={30} style={GlobalStyle.loaderRoate} />
    );
    fillVar = percentage;
  } else if (operationState === INSTANT_CALIBRATE_STATE.SUCCESS) {
    circleIcons = (
      <EnIcon name="check" size={22} style={{color: tintColorConditon}} />
    );
    fillVar = 100;
  } else if (operationState === INSTANT_CALIBRATE_STATE.FAILED) {
    if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.GENERAL_FAILURE) {
      circleIcons = (
        <EnIcon name="cross" size={25} style={{color: tintColorConditon}} />
      );
      fillVar = percentage;
    } else if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BATTERY_LOW) {
      circleIcons = (
        <SimpleLineIcon
          name="energy"
          size={20}
          style={{color: tintColorConditon}}
        />
      );
      fillVar = 0;
    } else if (
      failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
    ) {
      circleIcons = (
        <MuiIcon
          name="bluetooth-off"
          size={22}
          style={{color: tintColorConditon}}
        />
      );
      fillVar = 0;
    }
  }

  let bottomOkButton = <></>;

  const iconVarRender = (loaderValueParam) => {
    let iconVar;
    if (
      operationState === INSTANT_CALIBRATE_STATE.ONGOING ||
      operationState === INSTANT_CALIBRATE_STATE.RESET
    ) {
      iconVar = (
        <Text style={[GlobalStyle.loaderText]}>
          {Math.round(loaderValueParam)}%
        </Text>
      );
    } else if (operationState === INSTANT_CALIBRATE_STATE.SUCCESS) {
      iconVar = (
        <FontAwesomeIcon
          name="check"
          style={[
            GlobalStyle.loaderIcon,
            {color: tintColorConditon, fontSize: 64},
          ]}
        />
      );
    } else if (operationState === INSTANT_CALIBRATE_STATE.FAILED) {
      if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.GENERAL_FAILURE) {
        iconVar = (
          <EnIcon
            name="cross"
            style={[GlobalStyle.loaderIcon, {color: tintColorConditon}]}
          />
        );
      } else if (
        failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
      ) {
        iconVar = (
          <MuiIcon
            name="bluetooth-off"
            style={[
              GlobalStyle.loaderIcon,
              {color: tintColorConditon, fontSize: 64},
            ]}
          />
        );
      } else if (failureCode === INSTANT_CALIBRATE_FAILURE_CODE.BATTERY_LOW) {
        iconVar = (
          <FontistoIcon
            name="battery-quarter"
            style={[
              GlobalStyle.loaderIcon,
              {color: tintColorConditon, fontSize: 70},
            ]}
          />
        );
      }
    }
    return <>{iconVar}</>;
  };

  return (
    <SafeAreaView
      style={GlobalStyle.mainContainer}
      contentInsetAdjustmentBehavior="automatic">
      <ScrollView style={GlobalStyle.mainScrollView}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.3}}
          colors={['#f1fbff', '#fff']}
          style={styles.gradientContainer}>
          <View style={GlobalStyle.watchContent}>
            {/* top */}
            {topText}

            {/* middle */}
            <View style={GlobalStyle.imageArea}>
              <View style={GlobalStyle.watchBackgroundImage} />
              <View style={GlobalStyle.sideLoaderOne}>{circleIcons}</View>
              <View style={GlobalStyle.sideLoaderTwo}>{circleIcons}</View>
              <View style={GlobalStyle.sideLoaderThree}>{circleIcons}</View>

              {/* watch image */}
              <Image
                source={require('../../assets/images/watch_image.png')}
                style={GlobalStyle.imageResize}
              />

              {/* circle -1 */}
              <AnimatedCircularProgress
                size={126}
                width={3}
                rotation={360}
                // fill={isConnected === null ? percentage : isConnected ? 100 : percentage}
                fill={fillVar}
                prefill={percentage}
                duration={0}
                tintColor={tintColorConditon}
                tintColorSecondary={tintColorSecondaryCondition}
                // ref={circleRef}
                // onAnimationComplete={onLoaderComplete}
                accessibilityLabel="calibration-progress-text"
                style={GlobalStyle.loaderImage}>
                {(loaderValue) => {
                  return <>{iconVarRender(loaderValue)}</>;
                }}
              </AnimatedCircularProgress>

              {/* circle -2 */}
              <AnimatedCircularProgress
                size={110}
                width={2}
                rotation={360}
                // fill={isConnected === null ? percentage : isConnected ? 100 : percentage}
                fill={fillVar}
                prefill={percentage}
                duration={0}
                tintColor={tintColorConditon}
                tintColorSecondary={tintColorConditon}
                // onAnimationComplete={onLoaderComplete}
                style={GlobalStyle.loaderImagetwo}
              />
            </View>

            {bottomText}

            {/* steps text 1,2,3 */}
            {steps}

            {bottomOkButton}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalibrateConnectionScreen;

async function startCalibration() {
  let data = await AsyncStorage.getItem('calibrateData');
  let userId = await AsyncStorage.getItem('user_id');
  let deviceMsn = await AsyncStorage.getItem('device_msn');
  data = JSON.parse(data);
  console.log(data);
  CalibrateCommandHandler.startCalibrate(() => {
    EVENT_MANAGER.SEND.calibrate(JSON.stringify({...data, userId, deviceMsn}));
  });
}
