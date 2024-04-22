import React from 'react';
import {SafeAreaView, ScrollView, View, Text, Image} from 'react-native';

import {UIButton} from '../../Components/UI';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

const ConnectionSucessScreen = ({navigation, ...props}) => {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.mainScrollView}>
        <ScrollView>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            <View style={styles.imageContent}>
              <Image
                style={styles.connectSucessImage}
                source={require('../../assets/images/connectionSucess.png')}
              />
            </View>

            <View style={{flex: 1, alignItems: 'center'}}>
              <Text
                style={styles.createAccHeading}
                accessibilityLabel="sucess-watch-connection-heading">
                Your device{'\n'}has been{'\n'}successfully{'\n'}connected.
              </Text>
            </View>

            <View>
              <UIButton
                mode="contained"
                accessibilityLabel="sucess-watch-connection-button"
                onPress={() =>
                  navigation.reset({
                    routes: [{name: 'HomeTab'}],
                  })
                }>
                Continue
              </UIButton>
            </View>
          </LinearGradient>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ConnectionSucessScreen;
