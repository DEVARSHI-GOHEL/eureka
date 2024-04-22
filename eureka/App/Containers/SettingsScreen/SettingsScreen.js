/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {List, ListItem, Left, Right} from 'native-base';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {UIButton} from '../../Components/UI';
import {Translate} from '../../Services/Translate';
import {useSelector, useDispatch} from 'react-redux';
import {
  OFFLINE_SYNC_STATE,
  WATCH_CONNECTION_STATE,
} from '../../constants/AppDataConstants';
import {watchConnectPopupAction, watchSyncAction} from '../HomeScreen/action';

const SettingsScreen = ({navigation, ...props}) => {
  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    if (!_.isEmpty(Translate('settingsScreen'))) {
      const settingsScreenContentObject = Translate('settingsScreen');
      setContentScreenObj(settingsScreenContentObject);
    }
  });
  /** ############################ */
  const {isWatchConnected, offlineSyncData} = useSelector((state) => ({
    isWatchConnected: state.watchStatus.isWatchConnected,
    offlineSyncData: state.watch.offlineSyncData,
  }));
  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
        <LinearGradient
          colors={['#f1fbff', '#fff']}
          style={styles.settingsWrap}>
          <View style={styles.navArea}>
            <List style={styles.listSeperator}>
              <ListItem underlayColor="green" style={styles.listRow}>
                <TouchableOpacity
                  accessibilityLabel="watch-settings"
                  accessible={false}
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  onPress={() => {
                    if (
                      isWatchConnected == WATCH_CONNECTION_STATE.SYNCING ||
                      offlineSyncData == OFFLINE_SYNC_STATE.SYNC_START
                    ) {
                      dispatch(watchSyncAction(true));
                    } else if (
                      isWatchConnected == WATCH_CONNECTION_STATE.NOT_CONNECTED
                    ) {
                      dispatch(watchConnectPopupAction(true));
                    } else {
                      navigation.navigate('WatchSettingsScreen');
                    }
                  }}>
                  <Left>
                    <Text style={styles.navText}>
                      {contentScreenObj.watchSetting_subMenuTitle}
                    </Text>
                  </Left>
                  <Right>
                    <MaIcon
                      name="keyboard-arrow-right"
                      style={styles.navIcon}
                    />
                  </Right>
                </TouchableOpacity>
              </ListItem>

              <ListItem style={styles.listRow}>
                <TouchableOpacity
                  accessibilityLabel="vitalParameter-settings"
                  accessible={false}
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  onPress={() => navigation.navigate('VitalParameterBound')}>
                  <Left>
                    <Text style={styles.navText}>
                      {contentScreenObj.vitalParameter_subMenuTitle}
                    </Text>
                  </Left>
                  <Right>
                    <MaIcon
                      name="keyboard-arrow-right"
                      style={styles.navIcon}
                    />
                  </Right>
                </TouchableOpacity>
              </ListItem>
              <ListItem style={styles.listRow}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  accessibilityLabel="about-screen"
                  accessible={false}
                  onPress={() => navigation.navigate('AboutScreen')}>
                  <Left>
                    <Text style={styles.navText}>
                      {contentScreenObj.about_subMenuTitle}
                    </Text>
                  </Left>
                  <Right>
                    <View style={styles.infoNotification}>
                      <MaIcon
                        name="keyboard-arrow-right"
                        style={styles.navIcon}
                      />
                    </View>
                  </Right>
                </TouchableOpacity>
              </ListItem>
              {/* <ListItem underlayColor="green" style={styles.listRow}>
                <TouchableOpacity
                  accessibilityLabel="watch-settings"
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  onPress={() => weatherToggleSwitch()}
                  // onPress={() => navigation.navigate('WatchSettingsScreen')}
                  accessible={false}
                >
                  <Left>
                    <Text style={styles.navText}>Weather Feed</Text>
                  </Left>
                  <Right>
                    <Switch
                      accessibilityLabel="Adaptive-power-switch"
                      style={styles.switchSizeAdjust}
                      trackColor={{false: '#A4C8ED', true: '#1A74D3'}}
                      thumbColor={weatherSwitch ? '#fff' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={weatherToggleSwitch}
                      value={weatherSwitch}
                    />
                  </Right>
                </TouchableOpacity>
              </ListItem> */}
              {/* <ListItem underlayColor="green" style={styles.listRow}>
                <TouchableOpacity
                  accessibilityLabel="watch-settings"
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  onPress={() => notificationToggleSwitch()}
                  // onPress={() => navigation.navigate('WatchSettingsScreen')}
                  accessible={false}
                >
                  <Left>
                    <Text style={styles.navText}>Notification</Text>
                  </Left>
                  <Right>
                    <Switch
                      accessibilityLabel="Adaptive-power-switch"
                      style={styles.switchSizeAdjust}
                      trackColor={{false: '#A4C8ED', true: '#1A74D3'}}
                      thumbColor={notificationSwitch ? '#fff' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={notificationToggleSwitch}
                      value={notificationSwitch}
                    />
                  </Right>
                </TouchableOpacity>
              </ListItem> */}
              {/* <ListItem style={styles.listRow}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.listRowTouch}
                  accessibilityLabel="about-screen"
                  onPress={() => navigation.navigate('AboutScreen')}>
                  <Left>
                    <Text style={styles.navText}>About</Text>
                  </Left>
                  <Right>
                    <View style={styles.infoNotification}>
                      <MaIcon
                        name="keyboard-arrow-right"
                        style={styles.navIcon}
                      />
                    </View>
                  </Right>
                </TouchableOpacity>
              </ListItem> */}
            </List>
          </View>
          <View style={styles.settingsBottomrow}>
            <TouchableOpacity
              accessibilityLabel="privacy-policy"
              accessible={false}
              onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
              <Text style={styles.settingsLinkText}>
                {contentScreenObj.privacyPolicy_ButtonText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="terms-service"
              accessible={false}
              onPress={() => navigation.navigate('TermsServiceScreen')}>
              <Text style={styles.settingsLinkText}>
                {contentScreenObj.termService_ButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
      <View style={styles.bttnWrap}>
        <UIButton
          //disabled={continueBtnDisableState}
          accessibilityLabel="feedback-button"
          labelStyle={{color: '#fff'}}
          mode="contained"
          onPress={() => navigation.navigate('FeedbackScreen')}>
          {contentScreenObj.feedback_ButtonText}
        </UIButton>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
