import React from 'react';
import { Text } from 'react-native';
import { Fonts } from '../../../Theme';

export function UITextSemiBold({ children, ...props }) {
  return (
    <Text {...props} style={[Fonts.fontSemiBold, Fonts.normal, props.style]}>
      {children}
    </Text>
  );
}
