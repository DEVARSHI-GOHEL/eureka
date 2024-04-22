import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import {useDispatch} from 'react-redux';
import {watchSyncAction} from '../../Containers/HomeScreen/action';
import {Fonts, GlobalStyle} from '../../Theme';
import {UIButton, UIModal} from '../UI';
import NavigationService from '../../Navigators/NavigationService'
import styles from './styles';
import {useTranslation} from "../../Services/Translate";

export const WatchSyncComponent = () => {
  const dispatch = useDispatch();
  const trn = useTranslation('WatchSyncComponent');

  const modalCloseFun = () => {
    NavigationService.navigate('GetHelpScreen');
    dispatch(watchSyncAction(false));
  };

  return (
    <UIModal
      Icon={
        <Image
          resizeMode="contain"
          style={styles.syncImage}
          source={require('../../assets/images/watch_sync.png')}
        />
      }
      modalClose={() => dispatch(watchSyncAction(false))}
      title={
        <Text style={GlobalStyle.modalHeading}>
          {trn.heading1}
        </Text>
      }
      content={
        <Text style={[GlobalStyle.modalContent, {textAlign: 'center'}]}>
          {trn.heading2}.
        </Text>
      }
      buttons={
        <View style={GlobalStyle.bttnWrap}>
          <UIButton
            style={[GlobalStyle.WrapForSlinglebttn]}
            mode="contained"
            labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
            onPress={() => dispatch(watchSyncAction(false))}>
            {trn.OK_PopUpButtonText}
          </UIButton>
        </View>
      }
      bottomText={
        <View style={[GlobalStyle.linkText, { flexWrap: 'wrap'}]}>
          <Text style={[GlobalStyle.leftText]}>{trn.troubleText}</Text>
          <TouchableOpacity
            onPress={modalCloseFun}
            accessible={false}>
            <Text style={[GlobalStyle.rightText]}>{trn.get_ButtonText}</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};
