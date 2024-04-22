import React, {useEffect} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  BackHandler,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import styles from './styles';
import {useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EnIcon from 'react-native-vector-icons/Entypo';
import ConnectCommandHandler from '../ConnectWatchScreen/ConnectCommandHandler';
import {HeaderBackButton} from '@react-navigation/stack';
import {translateError, useTranslation} from "../../Services/Translate";

const ConnectionFailScreen = ({navigation, ...props}) => {
    const {connectError, locationError, bluetoothError} = useSelector(
        (state) => state.connectWatch,
    );

  const trn = useTranslation('screenConnectionFail');

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      ConnectCommandHandler.resetPairConnect();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        routes: [{name: 'DeviceRegistrationScreen'}],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  /**
   * revert header and hardware back back to normal state and user can able to back
   */

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props) => {
        return (
          <HeaderBackButton
            {...props}
            onPress={() =>
              navigation.reset({
                routes: [{name: 'DeviceRegistrationScreen'}],
              })
            }
            headerBackTitle={' '}
            tintColor={'black'}
          />
        );
      },
    });
  }, [navigation]);

  const renderError = () => (
    <View
      style={{
        marginTop: 50,
        backgroundColor: '#d0e7ff',
        height: 220,
        width: 220,
        borderRadius: 220,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View style={[styles.crossIcon, styles.topCross]}>
        <EnIcon name="cross" size={20} style={{color: 'red'}} />
      </View>
      <View style={[styles.crossIcon, styles.rightCross]}>
        <EnIcon name="cross" size={20} style={{color: 'red'}} />
      </View>
      <View style={[styles.crossIcon, styles.bottomCross]}>
        <EnIcon name="cross" size={20} style={{color: 'red'}} />
      </View>

      <MaterialIcons name="location-off" size={150} />
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
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
              <View style={{flex: 1}}>
                <View style={{height: 350}}>
                  <View style={styles.imageContent}>
                    {locationError ? (
                      renderError()
                    ) : (
                      <Image
                        style={styles.signInImage}
                        source={require('../../assets/images/connectErrorWatch.png')}
                      />
                    )}
                  </View>
                </View>
                {locationError ? (
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.createAccHeading}>
                      {translateError(locationError.eventDescription)}
                    </Text>
                    <Text style={styles.subHeading}>
                        {trn.locationError}
                    </Text>
                  </View>
                ) : bluetoothError ? (
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.createAccHeading}>
                      {translateError(bluetoothError.eventDescription)}
                    </Text>
                    <Text style={styles.subHeading}>
                        {trn.bluetoothError}
                    </Text>
                  </View>
                ) : (
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.createAccHeading}>
                      {translateError(connectError.eventDescription)}
                    </Text>
                    <Text style={styles.subHeading}>
                        {trn.defaultError}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.haveAccountContent}>
                <Text style={styles.leftText}>{trn.trouble}</Text>
                <TouchableOpacity
                  style={styles.signInBttn}
                  onPress={() => navigation.navigate('GetHelpScreen')}
                  accessible={false}
                >
                  <Text style={styles.rightText}>{trn.help}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConnectionFailScreen;
