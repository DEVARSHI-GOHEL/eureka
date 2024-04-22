import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { ScrollView } from 'react-native-gesture-handler';

export function UISnackbar({
  modalClose,
  Icon,
  title,
  subTitle,
  content,
  buttons,
  bottomText,
  ...props
}) {

  return (
   
    <View style={styles.modalWrap}>
      <View style={styles.modalView}>
      <ScrollView>
        <View style={styles.modalTopArea}>
          <View style={styles.closeIconWrap}>
            <TouchableOpacity onPress={modalClose} accessible={false}>
              <AntIcon name='close' style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={{ alignSelf:'center'}}>{Icon}</View>
          {title}
          {subTitle}
          {content}
        </View>
        {buttons}
        {bottomText}
        </ScrollView>
      </View>
    </View>
    
  );
}
