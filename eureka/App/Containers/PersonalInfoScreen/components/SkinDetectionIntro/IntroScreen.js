import React from 'react';
import {View, Image, Text, ScrollView} from 'react-native';
import {UIButton} from '../../../../Components/UI';
import {Fonts, GlobalStyle} from '../../../../Theme';
import styles from './IntroScreen.styles';

export default IntroScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.wristView}>
        <Image
          style={{height: 300, resizeMode: 'contain'}}
          source={require('../../../../assets/images/wrist-placement-img.png')}
        />
        <View style={[styles.textView]}>
          <Text style={styles.textTitleStyle}>Step-01</Text>
          <Text style={[styles.textStyle, {marginBottom: 10}]}>
            Set the Wrist in to the outline of the live camera preview, just
            like shown in picture.
          </Text>
        </View>
      </View>
      <View style={styles.wristView}>
        <View style={[styles.textView]}>
          <Text style={styles.textTitleStyle}>Step-02</Text>
          <Text style={[styles.textStyle, {marginBottom: 10}]}>
            Set the Fitzpatrick Skin Tone Scale in to the outline of the live
            camera preview and press the{' '}
            <Text style={[styles.textStyle, {...Fonts.fontBold}]}>
              “Capture”
            </Text>{' '}
            button.
          </Text>
        </View>
        <Image
          style={{height: 300, resizeMode: 'contain'}}
          source={require('../../../../assets/images/strip-placement-img.png')}
        />
      </View>
      <UIButton
        // style={[GlobalStyle.WrapForSlinglebttn]}
        mode="contained"
        accessibilityLabel="logout-ok"
        labelStyle={{...Fonts.fontSemiBold}}
        onPress={() => {
          navigation.goBack();
        }}>
        Go back and select your Skin Tone
      </UIButton>
    </View>
  );
};
