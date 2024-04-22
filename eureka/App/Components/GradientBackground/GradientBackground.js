import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import {styles} from './GradientBackground.styles';

const GradientBackground = ({children}) => {
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0, y: 0.3}}
      colors={['#f1fbff', '#fff']}
      style={[styles.gradientContainer]}>
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
