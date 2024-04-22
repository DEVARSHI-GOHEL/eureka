import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {Image, Modal, Platform, Text, TouchableOpacity, View} from 'react-native';

//Icon Url
import AntIcon from 'react-native-vector-icons/AntDesign';
import FatherIcon from 'react-native-vector-icons/Feather';

//Svg Icon
import {
  UIAlertSvgIcon,
  UIButton,
  UICalibrateSvgIcon,
  UIHomeSvgIcon,
  UIModal,
  UIProfileSvgIcon,
  UIWatchCanntDetect,
  UIWatchNotWorn,
} from '../Components/UI';

//Navigation
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

//Screens
import AuthCheckScreen from '../AuthCheckScreen';
import WelcomeScreen from '../Containers/WelcomeScreen';
import SignUpScreen from '../Containers/SignUpScreen';
import SignInScreen from '../Containers/SignInScreen';
import TermConditionScreen from '../Containers/TermConditionScreen';
import AccountInfoScreen from '../Containers/AccountInfoScreen';
import PersonalInfoScreen from '../Containers/PersonalInfoScreen';
import MedicalInfoScreen from '../Containers/MedicalInfoScreen';
import ContactsScreen from '../Containers/ContactsScreen';
import AddContactScreen from '../Containers/AddContactScreen';
import DeleteContactScreen from '../Containers/DeleteContactScreen';
import ConnectWatchScreen from '../Containers/ConnectWatchScreen';
import ConnectionSucessScreen from '../Containers/ConnectionSucessScreen';
import ConnectionFailScreen from '../Containers/ConnectionFailScreen';
import GetHelpScreen from '../Containers/GetHelpScreen';
import ForgotPasswordScreen from '../Containers/ForgotPasswordScreen';
import CheckEmailScreen from '../Containers/CheckEmailScreen';
import HomeScreen from '../Containers/HomeScreen';
import WatchSettingsScreen from '../Containers/WatchSettingsScreen';
import BloodGlucoseScreen from '../Containers/BloodGlucoseScreen';
import BloodPressureScreen from '../Containers/BloodPressureScreen';
import HeartRateScreen from '../Containers/HeartRateScreen';
import RespirationRateScreen from '../Containers/RespirationRateScreen';
import OxygenSaturationScreen from '../Containers/OxygenSaturationScreen';
import StepsWalkedScreen from '../Containers/StepsWalkedScreen';
import MealScreen from '../Containers/MealScreen';
import HealthSymptomScreen from '../Containers/HealthSymptomScreen';
import CalibrateControlWrapper from '../Containers/CalibrateControlWrapper';
import CalibrateCommandHandler from '../Containers/CalibrateControlWrapper/CalibrateCommandHandler';
import CalibrateWatchSettingScreen from '../Containers/CalibrateWatchSettingScreen';
import CalibrateConnectionScreen from '../Containers/CalibrateConnectionScreen';
import ProfileScreen from '../Containers/ProfileScreen';
import SettingsScreen from '../Containers/SettingsScreen';
import AboutScreen from '../Containers/AboutScreen';
import FeedbackScreen from '../Containers/FeedbackScreen';
import ShareDataScreen from '../Containers/ShareDataScreen';
import MeasureNowConnectionScreen from '../Containers/MeasureNowConnectionScreen';
import MeasureHelpScreen from '../Containers/MeasureHelpScreen';
import VitalParameterBound from '../Containers/VitalParameterBound';
import AddMealScreen from '../Containers/AddMealScreen';
import AddHealthSymtomScreen from '../Containers/AddHealthSymtomScreen';
import PrivacyPolicyScreen from '../Containers/PrivacyPolicyScreen';
import TermsServiceScreen from '../Containers/TermsServiceScreen';
import DeviceRegistrationScreen from '../Containers/DeviceRegistrationScreen';
import {Translate, useTranslation} from '../Services/Translate';
import {WatchSyncComponent} from '../Components/WatchSyncComponent';
import {WatchChargerComponent} from '../Components/WatchChargerComponent';
import {useDispatch, useSelector} from 'react-redux';
import {INSTANT_CALIBRATE_STATE, OFFLINE_SYNC_STATE, WATCH_CONNECTION_STATE,} from '../constants/AppDataConstants';

import {watchConnectPopupAction, watchSyncAction, watchWornPopupAction,} from '../Containers/HomeScreen/action';

//Common Style
import {Colors, Fonts} from '../Theme';
import GlobalStyle from '../Theme/GlobalStyle';

import store from '../../store/store';

import AlertStackScreen from "./components/AlertStackScreen/AlertStackScreen";
import {styles} from "./AppNavigator.styles";
import UpdateScreensFlow from "../Containers/FirmwareUpdateScreen/components/UpdateScreensFlow/UpdateScreensFlow";
import {navigationRef} from "./NavigationService";
import AccountRemoveScreen from "../Containers/AccountRemoveScreen/AccountRemoveScreen";
import AccountRemoveProgressScreen from "../Containers/AccountRemoveProgressScreen/AccountRemoveProgressScreen";
import {selectIsShowAlertBadge} from '../Containers/AlertScreen';
import {GeneralRightNavigation} from "./components/GeneralRightNavigation/GeneralRightNavigation";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const HomeStackScreen = (props) => {

  /** ############# Language Related codes ############### */
  const [homeScreenObj, setHomeScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('homeScreen'))) {
      const homeScreenContentObject = Translate('homeScreen');
      setHomeScreenObj(homeScreenContentObject);
    }
  });
  /** ############################ */

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        testID="Health-Overview"
        accessible={true}
        accessibilityLabel={'Main-app-header'}
        options={({navigation}) => ({
          headerTitle: homeScreenObj.title,

          headerTitleStyle: {
            ...Fonts.fontBold,
            alignSelf: 'center',
          },

          headerLeft: () => (
            <View style={styles.headerIconWrap}>
              <FatherIcon
                name="settings"
                onPress={() => navigation.navigate('SettingsScreen')}
                accessibilityLabel="setting-icon"
                style={[
                  styles.headerMenuIcon,
                  styles.seetingIcon,
                  {color: Colors.black},
                ]}
              />
            </View>
          ),
          headerRight: () => (<GeneralRightNavigation {...{navigation}}/>),
        })}
      />
    </HomeStack.Navigator>
  );
};


const CalibrateStack = createStackNavigator();
const CalibrateStackScreen = ({navigation}) => {
  /** ############# Language Related codes ############### */
  const [calibrateScreenObj, setCalibrateeScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('calibrateScreen'))) {
      const calibrateScreenContentObject = Translate('calibrateScreen');
      setCalibrateeScreenObj(calibrateScreenContentObject);
    }
  });
  /** ############################ */
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      let opState = store.getState().calibrate.operationState;

      if (
        opState == INSTANT_CALIBRATE_STATE.FAILED ||
        opState == INSTANT_CALIBRATE_STATE.SUCCESS
      ) {
        CalibrateCommandHandler.resetCalibrate();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <CalibrateStack.Navigator>
      <CalibrateStack.Screen
        name="Calibrate"
        component={CalibrateControlWrapper}
        options={({navigation}) => ({
          headerTitle: calibrateScreenObj.title,
          keyboardHidesTabBar: true,
          headerTitleStyle: {
            ...Fonts.fontBold,
          },
          headerLeft: () => (
            <View style={styles.headerIconWrap}>
              <AntIcon
                name="questioncircleo"
                onPress={() =>
                  navigation.navigate('CalibrateWatchSettingScreen')
                }
                style={[
                  styles.headerMenuIcon,
                  styles.seetingIcon,
                  {color: Colors.black, fontSize: 22},
                ]}
              />
            </View>
          ),
        })}
      />
    </CalibrateStack.Navigator>
  );
};

const ProfileStack = createStackNavigator();
const ProfileStackScreen = () => {

  /** ############# Language Related codes ############### */
  const [profileScreenObj, setProfileScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('profileScreen'))) {
      const profileScreenContentObject = Translate('profileScreen');
      setProfileScreenObj(profileScreenContentObject);
    }
  });
  /** ############################ */

  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({navigation}) => ({
          headerTitle: profileScreenObj.title,
          headerTitleStyle: {
            ...Fonts.fontBold,
            alignSelf: 'center',
          },
          headerLeft: () => (
            <View style={styles.headerIconWrap}>
              <FatherIcon
                name="settings"
                onPress={() => navigation.navigate('SettingsScreen')}
                style={[
                  styles.headerMenuIcon,
                  styles.seetingIcon,
                  {color: Colors.black},
                ]}
              />
            </View>
          ),
          headerRight: () => (<GeneralRightNavigation {...{navigation}} />),
        })}
      />
    </ProfileStack.Navigator>
  );
};

const HomeTab = (props) => {
  /** ############# Language Related codes ############### */
  const [watchScreenObj, setWatchScreenObj] = useState({});
  const tabNames = Translate('screenNavigation');

  useEffect(() => {
    if (!_.isEmpty(Translate('watchConnectPopup'))) {
      const watchScreenContentObject = Translate('watchConnectPopup');
      setWatchScreenObj(watchScreenContentObject);
    }
  });
  /** ############################ */
  const {
    watchWornPopupVisibility,
    watchConnectedPopupVisibility,
    watchSyncVisibility,
    isWatchConnected,
    offlineSyncData,
    watchChargerVisibility,
  } = useSelector((state) => ({
    watchWornPopupVisibility: state.watchStatus.watchWornPopupVisibility,
    watchConnectedPopupVisibility:
      state.watchStatus.watchConnectedPopupVisibility,
    watchSyncVisibility: state.watchStatus.watchSyncVisibility,
    isWatchConnected: state.watchStatus.isWatchConnected,
    offlineSyncData: state.watch.offlineSyncData,
    watchChargerVisibility: state.watchStatus.watchChargerVisibility,
  }));
  const alertBadge = useSelector(selectIsShowAlertBadge);
  const dispatch = useDispatch();
  const modalCloseFun = () => {
    dispatch(watchConnectPopupAction(false));
    props.navigation.navigate('GetHelpScreen');
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={false}
        visible={watchChargerVisibility}>
        <WatchChargerComponent />
      </Modal>
      <Modal
        animationType="fade"
        transparent={false}
        visible={watchConnectedPopupVisibility}>
        <UIModal
          Icon={
            isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
            offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START ? (
              <Image
                resizeMode="contain"
                style={styles.syncImage}
                source={require('../assets/images/watch_sync.png')}
              />
            ) : (
              <UIWatchCanntDetect />
            )
          }
          modalClose={() => dispatch(watchConnectPopupAction(false))}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
              isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
              offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START
                ? watchScreenObj.syncData_heading
                : watchScreenObj.heading1}
            </Text>
          }
          content={
            <Text style={[GlobalStyle.modalContent, {textAlign: 'center'}]}>
              {isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
              offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START
                ? watchScreenObj.heading2
                : watchScreenObj.description}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={() => {
                  dispatch(watchConnectPopupAction(false));
                  if (
                    isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
                    offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START
                  ) {
                    return;
                  }
                  if (
                    isWatchConnected == WATCH_CONNECTION_STATE.NOT_CONNECTED
                  ) {
                    props.navigation.reset({
                      index: 0,
                      routes: [{name: 'DeviceRegistrationScreen'}],
                    });
                  }
                }}>
                {watchScreenObj.OK_PopUpButtonText}
              </UIButton>
            </View>
          }
          bottomText={
            <View style={[GlobalStyle.linkText,{ flexWrap: 'wrap'}]}>
              <Text style={GlobalStyle.leftText}>
                {watchScreenObj.troubleText}{' '}
              </Text>
              <TouchableOpacity
                onPress={(e) => modalCloseFun(e)}
                accessible={false}>
                <Text style={GlobalStyle.rightText}>
                  {watchScreenObj.get_ButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Modal>
      <Modal
        animationType="fade"
        transparent={false}
        visible={watchWornPopupVisibility}>
        <UIModal
          Icon={<UIWatchNotWorn fill={Colors.iconRed} />}
          modalClose={() => dispatch(watchWornPopupAction(false))}
          title={
            <Text style={GlobalStyle.modalHeading}>
              Watch not worn {'\n'}properly
            </Text>
          }
          content={
            <Text style={[GlobalStyle.modalContent, {textAlign: 'center'}]}>
              Make sure the back{'\n'}is touching your wrist firmly.
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={(val) => dispatch(watchWornPopupAction(false))}>
                OK
              </UIButton>
            </View>
          }
        />
      </Modal>
      <Modal
        animationType="fade"
        transparent={false}
        visible={watchSyncVisibility}>
        <WatchSyncComponent />
      </Modal>

      <Tab.Navigator
        tabBarOptions={{
          inactiveTintColor: Colors.inactiveTintColor,
          activeTintColor:  Colors.activeTintColor,
          safeAreaInset: {bottom: 'never', top: 'never'},
          style: {
            paddingVertical: 10,
          },

          labelStyle: {
            ...Fonts.fontMedium,
            fontSize: 12,
            paddingTop: 3,
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarLabel: tabNames.home,
            tabBarColor: Colors.white,
            tabBarIcon: ({focused}) =>
              <UIHomeSvgIcon fill={focused ? Colors.focusedBlue : Colors.white} />
          }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertStackScreen}
          options={{
            tabBarLabel: tabNames.alerts,
            tabBarColor: Colors.white,
            tabBarIcon: ({focused}) =>
                <View style={{position: 'relative'}}>
                  <UIAlertSvgIcon fill={focused ? Colors.focusedBlue : Colors.white} />
                  {alertBadge && <View style={styles.redBadge} name="home" />}
                </View>
          }}
        />
        <Tab.Screen
          name="Calibrate"
          component={CalibrateStackScreen}
          options={{
            tabBarLabel: tabNames.calibrate,
            tabBarColor: Colors.white,
            tabBarIcon: ({focused}) =>
              focused ? (
                <UICalibrateSvgIcon
                  onPress={() => alert('')}
                  fill={Colors.focusedBlue}
                />
              ) : (
                <UICalibrateSvgIcon onPress={() => alert('')} fill={Colors.white} />
              ),
            unmountOnBlur: true,
          }}
          listeners={() => ({
            blur: () => {
              let opState = store.getState().calibrate.operationState;
              if (
                opState == INSTANT_CALIBRATE_STATE.FAILED ||
                opState == INSTANT_CALIBRATE_STATE.SUCCESS
              ) {
                CalibrateCommandHandler.resetCalibrate();
              }
            },
            tabPress: (e) => {
              if (offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START) {
                dispatch(watchSyncAction(true));
                e.preventDefault();
                return;
              }
            },
          })}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStackScreen}
          options={{
            tabBarLabel: tabNames.profile,
            tabBarColor: Colors.white,
            tabBarIcon: ({focused}) =>
              <UIProfileSvgIcon fill={focused ? Colors.focusedBlue : Colors.white} />
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const GENERAL_SCREEN_PROPS = {
  headerTintColor: Colors.black,
  gestureEnabled: false,
  headerBackTitleVisible: false,
}

const AppNavigator = () => {

  /** ############# Language Related codes ############### */
  const screenTitleObj = useTranslation('allScreenTitle');
  /** ############################ */

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="AuthCheckScreen">
        <Stack.Screen
          name="AuthCheckScreen"
          component={AuthCheckScreen}
          options={() => ({
            headerShown: false,
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={() => ({
            headerShown: false,
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="TermConditionScreen"
          component={TermConditionScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            headerShown: false,
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="CheckEmailScreen"
          component={CheckEmailScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            headerShown: false,
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ProfileStackScreen"
          component={ProfileStackScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="AccountInfoScreen"
          component={AccountInfoScreen}
          options={() => ({
            title: screenTitleObj.accInfo_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="PersonalInfoScreen"
          component={PersonalInfoScreen}
          options={() => ({
            title: screenTitleObj.personalInfo_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="MedicalInfoScreen"
          component={MedicalInfoScreen}
          options={() => ({
            title: screenTitleObj.medicalInfo_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ContactsScreen"
          component={ContactsScreen}
          options={() => ({
            title: screenTitleObj.contact_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="AddContactScreen"
          component={AddContactScreen}
          options={() => ({
            title: screenTitleObj.addContact_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="DeleteContactScreen"
          component={DeleteContactScreen}
          options={() => ({
            title: screenTitleObj.editContact_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ConnectWatchScreen"
          component={ConnectWatchScreen}
          options={() => ({
            title: screenTitleObj.connectDevice_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ConnectionSucessScreen"
          component={ConnectionSucessScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            headerShown: false,
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ConnectionFailScreen"
          component={ConnectionFailScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="GetHelpScreen"
          component={GetHelpScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="HomeTab"
          component={HomeTab}
          options={() => ({
            headerShown: false,
            gestureEnabled: false,
          })}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={({navigation}) => ({
            title: screenTitleObj.settings_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            headerRight: () => (<GeneralRightNavigation {...{navigation}}/>),
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="AboutScreen"
          component={AboutScreen}
          options={() => ({
            title: screenTitleObj.about_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="FeedbackScreen"
          component={FeedbackScreen}
          options={() => ({
            title: screenTitleObj.feedback_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="WatchSettingsScreen"
          component={WatchSettingsScreen}
          options={({navigation}) => ({
            title: screenTitleObj.watchSetting_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
              alignSelf: 'center',
            },
            headerRight: () => (<GeneralRightNavigation {...{navigation}}/>),
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="CalibrateWatchSettingScreen"
          component={CalibrateWatchSettingScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="MeasureHelpScreen"
          component={MeasureHelpScreen}
          options={() => ({
            title: '',
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="CalibrateConnectionScreen"
          component={CalibrateConnectionScreen}
          options={() => ({
            title: screenTitleObj.calibrate,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="BloodGlucoseScreen"
          component={BloodGlucoseScreen}
        />
        <Stack.Screen
          name="BloodPressureScreen"
          component={BloodPressureScreen}
        />
        <Stack.Screen
          name="HeartRateScreen"
          component={HeartRateScreen}
        />
        <Stack.Screen
          name="RespirationRateScreen"
          component={RespirationRateScreen}
        />
        <Stack.Screen
          name="OxygenSaturationScreen"
          component={OxygenSaturationScreen}
        />
        <Stack.Screen
          name="StepsWalkedScreen"
          component={StepsWalkedScreen}
        />
        <Stack.Screen
          name="MealScreen"
          component={MealScreen}
          options={() => ({
            title: screenTitleObj.meal_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="HealthSymptomScreen"
          component={HealthSymptomScreen}
          options={() => ({
            title: screenTitleObj.healthSymptom_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="ShareDataScreen"
          component={ShareDataScreen}
          options={() => ({
            title: screenTitleObj.shareData_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="MeasureNowConnectionScreen"
          component={MeasureNowConnectionScreen}
          options={({navigation}) => ({
            title: screenTitleObj.instantMeasure,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            headerRight: () => ( <GeneralRightNavigation {...{navigation, hideWatchWorn:true}}/>),
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="VitalParameterBound"
          component={VitalParameterBound}
          options={() => ({
            title: screenTitleObj.vitalParameterBound_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="AddMealScreen"
          component={AddMealScreen}
          options={() => ({
            title: screenTitleObj.addMeal_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="AddHealthSymtomScreen"
          component={AddHealthSymtomScreen}
          options={() => ({
            title: screenTitleObj.addhealthSymptom_title,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={() => ({
            title: screenTitleObj.privacy,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
        <Stack.Screen
          name="TermsServiceScreen"
          component={TermsServiceScreen}
          options={() => ({
            title: screenTitleObj.terms,
            headerTitleStyle: {
              ...Fonts.fontBold,
            },
            ...GENERAL_SCREEN_PROPS
          })}
        />
          <Stack.Screen
              name="DeviceRegistrationScreen"
              component={DeviceRegistrationScreen}
              options={() => ({
                  title: screenTitleObj.verify,
                  headerTitleStyle: {
                      ...Fonts.fontBold,
                  },
                  headerBackTitle: '',
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
              })}
          />
          <Stack.Screen
              name="UpdateScreensFlow"
              component={UpdateScreensFlow}
              options={({ }) => ({
                  animationEnabled:false,
                  title: screenTitleObj.firmwareUpdate ,
                  headerTitleStyle: {
                      alignSelf: 'center',
                      // this padding substitutes missing right icon, so the text will be in center
                      paddingRight:  Platform.OS === 'ios' ? undefined : 60,
                      ...Fonts.fontBold,
                  },
                  headerBackTitle: '',
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
              })}
          />
          <Stack.Screen
              name="AccountRemoveScreen"
              component={AccountRemoveScreen}
              options={({ }) => ({
                  title: screenTitleObj.cancelAccount,
                  headerTitleStyle: {
                      alignSelf: 'center',
                      paddingRight:  Platform.OS === 'ios' ? undefined : 60,
                      ...Fonts.fontBold,
                  },
              })}
          />
          <Stack.Screen
              name="AccountRemoveProgressScreen"
              component={AccountRemoveProgressScreen}
              options={({ }) => ({
                  headerShown: false,
              })}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
