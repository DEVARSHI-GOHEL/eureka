import React from 'react';
import {Text, View} from 'react-native';
import IconFont from 'react-native-vector-icons/FontAwesome';
import parentStyles from '../styles';

const WarningText = ({errorText}) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <IconFont
        name="warning"
        style={{color: 'red', fontSize: 16, marginRight: 8}}
      />
      <Text style={parentStyles.warnText}>{errorText}</Text>
    </View>
  );
};

export default WarningText;
