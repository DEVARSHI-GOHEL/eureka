import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
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
import store from '../../../store/store';

import {
  INSTANT_MEASURE_STATE,
  INSTANT_MEASURE_FAILURE_CODE,
  INSTANT_CALIBRATE_STATE,
} from '../../constants/AppDataConstants';

import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import MeasureCommandHandler from './MeasureCommandHandler';
import {useTranslation} from "../../Services/Translate";

const TroubleComponent = ({onPress})=> {
  const trn = useTranslation("troubleComponent");
  return (
      <View style={[GlobalStyle.linkText, {marginTop: 20}]}>
        <Text style={GlobalStyle.leftText}>{trn.trouble}</Text>
        <TouchableOpacity
            onPress={onPress}
            accessible={false}
        >
          <Text style={GlobalStyle.rightText}>{trn.help}</Text>
        </TouchableOpacity>
      </View>
  )
}

/**
 * MeasureNowConnectionScreen -
 * @param {*} param0
 */
const MeasureNowConnectionScreen = ({navigation, ...props}) => {
  const {operationState, percentage, failureCode} = useSelector((state) => ({
    percentage: state.measure.percentage,
    operationState: state.measure.operationState,
    failureCode: state.measure.failureCode,
  }));
  const trn = useTranslation('screenMeasureNowConnection');

  /**
   * measureAgain again button press
   */
  const startMeasure = () => {
    if (
      store.getState().calibrate.operationState ==
      INSTANT_CALIBRATE_STATE.ONGOING
    ) {
      MeasureCommandHandler.calibrateInProgress();
      return;
    }

    MeasureCommandHandler.startMeasure(function () {
      EVENT_MANAGER.SEND.instantMeasure();
    });
  };

  /**
   * Bottom text UI and tint Color conditions
   */
  let tintColorConditon;
  let tintColorSecondaryCondition;
  let bottomText;

  if (
    operationState === INSTANT_MEASURE_STATE.ONGOING ||
    operationState === INSTANT_MEASURE_STATE.RESET
  ) {
    /**
     * in progress
     */

    tintColorConditon = '#1A74D3';
    tintColorSecondaryCondition = '#04D1F3';
  } else if (operationState === INSTANT_MEASURE_STATE.SUCCESS) {
    /**
     * success
     */

    tintColorConditon = '#2DE489';

    bottomText = (
      <View style={GlobalStyle.sliderbttomText}>
        <Text
          style={GlobalStyle.heading}
          accessibilityLabel="measurement-successfully-completed">
          {trn.bottomSuccess1}
        </Text>
        <Text
          style={GlobalStyle.description}
          accessibilityLabel="measurement-vital-successfully-completed">
          {trn.bottomSuccess2}
        </Text>
        <View style={styles.btnRow}>
          <UIButton
            style={GlobalStyle.calibrateBttn}
            mode="contained"
            accessibilityLabel="measurement-again-btn"
            onPress={startMeasure}>
            {trn.bottomMeasure}
          </UIButton>
          <UIButton
            style={[GlobalStyle.calibrateBttn, styles.leftMargin]}
            mode="contained"
            accessibilityLabel="measurement-ok-btn"
            onPress={() => navigation.goBack()}>
            {trn.bottomMeasureOK}
          </UIButton>
        </View>
      </View>
    );
  } else if (operationState === INSTANT_MEASURE_STATE.FAILED) {
    let failureBottomButtons = (
      <View
        style={[GlobalStyle.bttnWrap, {paddingHorizontal: 0, marginTop: 20}]}>
        <UIButton
          style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
          mode="outlined"
          labelStyle={{...Fonts.fontSemiBold}}
          onPress={() => navigation.goBack()}>
          {trn.bottomFailCancel}
        </UIButton>
        <UIButton
          style={GlobalStyle.bttnArea}
          mode="contained"
          labelStyle={{...Fonts.fontSemiBold}}
          onPress={startMeasure}>
          {trn.bottomFailTryAgain}
        </UIButton>
      </View>
    );

    if (failureCode === INSTANT_MEASURE_FAILURE_CODE.GENERAL_FAILURE) {
      tintColorConditon = '#FF6766';
      tintColorSecondaryCondition = '#F86362';

      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.bottomGeneralFailText1}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.bottomGeneralFailText2}
          </Text>
          <TroubleComponent onPress={() => navigation.navigate('MeasureHelpScreen')}/>
          {failureBottomButtons}
        </View>
      );
    } else if (
      failureCode === INSTANT_MEASURE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
    ) {
      /**
       * bluetooth error
       */

      tintColorConditon = '#FF6766';

      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.bottomBTNotAvailiableText1}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.bottomBTNotAvailiableText2}
          </Text>
          <TroubleComponent onPress={() => navigation.navigate('MeasureHelpScreen')}/>
          {failureBottomButtons}
        </View>
      );
    } else if (failureCode === INSTANT_MEASURE_FAILURE_CODE.BATTERY_LOW) {
      /**
       * watch battery error
       */

      tintColorConditon = '#FF6766';
      bottomText = (
        <View style={GlobalStyle.sliderbttomText}>
          <Text style={GlobalStyle.heading}>
            {trn.bottomLowBatteryText1}
          </Text>
          <Text style={GlobalStyle.description}>
            {trn.bottomLowBatteryText2}
          </Text>
          <TroubleComponent onPress={() => navigation.navigate('MeasureHelpScreen')}/>
          {failureBottomButtons}
        </View>
      );
    }
  }

  /**
   * Steps text UI conditions
   */
  let steps = null;

  if (
    operationState === INSTANT_MEASURE_STATE.ONGOING ||
    operationState === INSTANT_MEASURE_STATE.RESET
  ) {
    steps = (
      <View style={GlobalStyle.sliderbttomText}>
        <Text
          style={GlobalStyle.heading}
          accessibilityLabel="measurement-in-progress">
          {trn.measureInProgressText1}
        </Text>
        <Text
          style={GlobalStyle.description}
          accessibilityLabel="measurement-in-progress-shortly">
          {trn.measureInProgressText2}
        </Text>
      </View>
    );
  } else {
    steps = <></>;
  }

  /**
   * circle icons UI conditions
   */
  let circleIcons;
  let fillVar;

  if (
    operationState === INSTANT_MEASURE_STATE.ONGOING ||
    operationState === INSTANT_MEASURE_STATE.RESET
  ) {
    circleIcons = (
      <MuiIcon name="refresh" size={30} style={GlobalStyle.loaderRoate} />
    );
    fillVar = percentage;
  } else if (operationState === INSTANT_MEASURE_STATE.SUCCESS) {
    circleIcons = (
      <EnIcon name="check" size={22} style={{color: tintColorConditon}} />
    );
    fillVar = 100;
  } else if (operationState === INSTANT_MEASURE_STATE.FAILED) {
    if (failureCode === INSTANT_MEASURE_FAILURE_CODE.GENERAL_FAILURE) {
      circleIcons = (
        <EnIcon name="cross" size={25} style={{color: tintColorConditon}} />
      );
      fillVar = percentage;
    } else if (failureCode === INSTANT_MEASURE_FAILURE_CODE.BATTERY_LOW) {
      circleIcons = (
        <SimpleLineIcon
          name="energy"
          size={20}
          style={{color: tintColorConditon}}
        />
      );
      fillVar = 0;
    } else if (
      failureCode === INSTANT_MEASURE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
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

  /**
   * bottom ok button UI condition
   */
  let bottomOkButton = null;

  if (
    operationState === INSTANT_MEASURE_STATE.ONGOING ||
    operationState === INSTANT_MEASURE_STATE.RESET
  ) {
    bottomOkButton = (
      <View style={GlobalStyle.startBttnWrap}>
        <UIButton
          style={GlobalStyle.calibrateBttn}
          mode="contained"
          accessibilityLabel="measurement-ok-btn"
          onPress={() => navigation.goBack()}>
          {trn.OK}
        </UIButton>
      </View>
    );
  }

  const iconVarRender = (loaderValueParam) => {
    let iconVar;
    if (
      operationState === INSTANT_MEASURE_STATE.ONGOING ||
      operationState === INSTANT_MEASURE_STATE.RESET
    ) {
      iconVar = (
        <Text style={[GlobalStyle.loaderText]}>
          {Math.round(loaderValueParam)}%
        </Text>
      );
    } else if (operationState === INSTANT_MEASURE_STATE.SUCCESS) {
      iconVar = (
        <FontAwesomeIcon
          name="check"
          style={[
            GlobalStyle.loaderIcon,
            {color: tintColorConditon, fontSize: 64},
          ]}
        />
      );
    } else if (operationState === INSTANT_MEASURE_STATE.FAILED) {
      if (failureCode === INSTANT_MEASURE_FAILURE_CODE.GENERAL_FAILURE) {
        iconVar = (
          <EnIcon
            name="cross"
            style={[GlobalStyle.loaderIcon, {color: tintColorConditon}]}
          />
        );
      } else if (
        failureCode === INSTANT_MEASURE_FAILURE_CODE.BLUETOOTH_NOT_AVAILABLE
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
      } else if (failureCode === INSTANT_MEASURE_FAILURE_CODE.BATTERY_LOW) {
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

  useEffect(() => {
    //Do not start from scratch if measure is already ongoing
    if (operationState != INSTANT_MEASURE_STATE.ONGOING) {
      startMeasure();
    }
  }, []);

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
                fill={fillVar}
                prefill={percentage}
                duration={0}
                tintColor={tintColorConditon}
                tintColorSecondary={tintColorSecondaryCondition}
                // ref={circleRef}
                // onAnimationComplete={onLoaderComplete}
                style={GlobalStyle.loaderImage}>
                {(loaderValue) => {
                  //setProgressActionFun(loaderValue);
                  return <>{iconVarRender(loaderValue)}</>;
                }}
              </AnimatedCircularProgress>

              {/* circle -2 */}
              <AnimatedCircularProgress
                size={110}
                width={2}
                rotation={360}
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

export default MeasureNowConnectionScreen;
