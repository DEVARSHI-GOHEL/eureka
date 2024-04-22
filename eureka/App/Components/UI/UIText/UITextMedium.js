import React from 'react';
import { Text } from 'react-native';
import { Fonts } from '../../../Theme';

export function UITextMedium({ children, ...props }) {
  return (
    <Text {...props} style={[Fonts.fontMedium, Fonts.normal, props.style]}>
      {children}
    </Text>
  );
}
