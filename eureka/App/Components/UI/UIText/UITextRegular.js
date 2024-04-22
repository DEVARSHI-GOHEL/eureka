import React from 'react';
import { Text } from 'react-native';
import { Fonts, Colors } from '../../../Theme';

export function UITextRegular({ children, ...props }) {
  return (
    <Text
      {...props}
      style={[Fonts.fontRegular, Fonts.normal, Colors.black, props.style]}
    >
      {children}
    </Text>
  );
}
