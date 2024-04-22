import React from 'react';
import {StyleSheet} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import {Alignment, Colors, Spacer} from '../Theme';

export const styles = StyleSheet.create({
    gradientContainer: {
        ...Spacer.horizontalPadding,
        ...Spacer.mediumVerticalPadding,
        ...Alignment.fill,
    },
});

const GradientBackground = ({children, style}) => {

    return (<LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.3}}
        colors={[Colors.bgGradientStart, Colors.bgGradientEnd]}
        style={[styles.gradientContainer, style || {}]}>
        {children}
    </LinearGradient>);
}

export default GradientBackground;
