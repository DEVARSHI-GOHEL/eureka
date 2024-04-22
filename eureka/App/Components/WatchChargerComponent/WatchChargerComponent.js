import React from 'react';
import {View, Text, Image} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import styles from './styles';
import {UIWatchNotWorn, UIModal, UIButton, UIBatteryChargingIcon} from '../UI';
import {watchChargerAction} from '../../Containers/HomeScreen/action';
import {GlobalStyle, Fonts} from '../../Theme';

export function WatchChargerComponent() {
  const dispatch = useDispatch();
  return (
    <UIModal
      Icon={
        <Image
          style={styles.iconImage}
          resizeMode="contain"
          source={require('../../assets/images/connecting_help_step_2.png')}
        />
      }
      modalClose={() => dispatch(watchChargerAction(false))}
      title={<Text style={GlobalStyle.modalHeading}>Watch is on charging</Text>}
      content={
        <Text style={[GlobalStyle.modalContent, {textAlign: 'center'}]}>
          Make sure watch{'\n'}is not on charging.
        </Text>
      }
      buttons={
        <View style={GlobalStyle.bttnWrap}>
          <UIButton
            style={[GlobalStyle.WrapForSlinglebttn]}
            mode="contained"
            labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
            onPress={(val) => dispatch(watchChargerAction(false))}>
            OK
          </UIButton>
        </View>
      }
    />

  );
}
