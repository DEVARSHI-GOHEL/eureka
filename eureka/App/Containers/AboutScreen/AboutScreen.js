/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {SafeAreaView, ScrollView, View, Text} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {List, ListItem, Left, Right} from 'native-base';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { Translate } from '../../Services/Translate';
import {APP_VERSION, APP_RELEASE_DATE} from '../../Theme/Constant/Constant';

const AboutScreen = ({navigation, ...props}) => {
  const [deviceMsn, setDeviceMsn] = useState('');

    /** ############# Language Related codes ############### */
    const [contentScreenObj, setContentScreenObj] = useState({})

    useEffect(() => {
      if (!_.isEmpty(Translate('aboutScreen'))) {
        const aboutScreenContentObject = Translate('aboutScreen');
        setContentScreenObj(aboutScreenContentObject);
      }
    })
    /** ############################ */

  useEffect(() => {
    getAndSetDeviceMsn();
  });

  async function getAndSetDeviceMsn() {
    let device_msn = await AsyncStorage.getItem('device_msn');
    setDeviceMsn(device_msn);
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
        <LinearGradient
          colors={['#f1fbff', '#fff']}
          style={styles.settingsWrap}>
          <View style={styles.navArea}>
            <List style={styles.listSeperator}>
              <ListItem underlayColor="green" style={styles.listRow}>
                <Left>
                  <Text style={styles.navText} accessibilityLabel="App-version">
                    {contentScreenObj.appVersionText}
                  </Text>
                </Left>
                <Right>
                  <Text
                    style={styles.aboutRightInfo}
                    accessibilityLabel="App-version-value">
                      {/* Version */}
                     {APP_VERSION}
                  </Text>
                </Right>
              </ListItem>
              <ListItem underlayColor="green" style={styles.listRow}>
                <Left>
                  <Text style={styles.navText} accessibilityLabel="Release">
                    {contentScreenObj.releaseDate}
                  </Text>
                </Left>
                <Right>
                  <Text
                    style={styles.aboutRightInfo}
                    accessibilityLabel="Release-value">
                    {APP_RELEASE_DATE}
                  </Text>
                </Right>
              </ListItem>
              <ListItem underlayColor="green" style={styles.listRow}>
                <Left>
                  <Text
                    style={styles.navText}
                    accessibilityLabel="Operating-System">
                    {contentScreenObj.OS}
                  </Text>
                </Left>
                <Right>
                  <Text
                    style={styles.aboutRightInfo}
                    accessibilityLabel="Operating-System-value">
                    {DeviceInfo.getSystemName()} {DeviceInfo.getSystemVersion()}
                  </Text>
                </Right>
              </ListItem>
              <ListItem underlayColor="green" style={styles.listRow}>
                <Left>
                  <Text
                    style={styles.navText}
                    accessibilityLabel="Connected-Watch">
                    {contentScreenObj.connectedWatch}
                  </Text>
                </Left>
                <Right>
                  <Text
                    style={styles.aboutRightInfo}
                    accessibilityLabel="Connected-Watch-value">
                    {deviceMsn}
                  </Text>
                </Right>
              </ListItem>
            </List>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
