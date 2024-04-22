import React from 'react';
import { Button } from 'react-native-paper';
import { Colors, Fonts } from '../../../Theme';

/**
 *
 * @param {boolean} uppercase -
 */
export function UIButton({
  mode = 'contained',
  style,
  uppercase,
  contentStyle,
  labelStyle,
  children,
  ...props
}) {
  let resultStyle = [{ borderRadius: 4, color:Colors.white}];
  if (style) {
    if (Array.isArray(style)) {
      resultStyle = [...resultStyle, ...style];
    }else{
      resultStyle = [...resultStyle, style];
    }
  }
  return (
    <Button
      {...props}
      color={Colors.ButtonColor}
      style={resultStyle}
      uppercase={uppercase ? uppercase : false}
      contentStyle={[{ height: 50  }, contentStyle]}
      labelStyle={[{ ...Fonts.fontBold, ...Fonts.h2}, labelStyle]}
      mode={mode}
    >
      {children}
    </Button>
  );
}
