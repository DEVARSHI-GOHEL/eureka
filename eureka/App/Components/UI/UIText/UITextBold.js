import React from 'react';
import { Text } from 'react-native';
import { Fonts, Colors } from '../../../Theme';

let renderCount = 0;
export function UITextBold({ children, ...props }) {

  return (
    <Text
      {...props}
      style={[Fonts.fontBold, Fonts.normal, Colors.black, props.style]}
    >
      {children}
    </Text>
  );
}
