import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Easing, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from "react-native-svg";
import GradientPath from 'react-native-svg-path-gradient';
import {Fonts, Spacer} from "../../../Theme";
import {ANIMATION_DURATION} from "./CircleLoaderConfig";


const windowWidth = Dimensions.get('window').width;
const PROGRESS_SIZE = windowWidth * 0.7;

/**
 * Font size depends on progress component size
 * @type {number}
 */
const PROGRESS_FONT_SIZE = PROGRESS_SIZE / 4;


const AnimatedGradientPath = Animated.createAnimatedComponent(GradientPath);
const {PI, cos, sin} = Math;

const MARGIN = 10;
const CIRCLE_SIZE = 90;
const STROKE_WIDTH = 7;

const PI_2 = PI * 2;
const PI_HALF = PI / 2;
const SAMPLING = 2;
const STEP = PI_2 / SAMPLING;
const CX = CIRCLE_SIZE / 2;
const CY = CIRCLE_SIZE / 2;
const RADIUS = CIRCLE_SIZE / 2 - STROKE_WIDTH / 2;
const x = (a) => CX - RADIUS * cos(a) + MARGIN;
const y = (a) => -RADIUS * sin(a) + CY + MARGIN;

/**
 * Create n-th ARC of circle
 * @type {string[]}
 */
const ARCS = new Array(SAMPLING).fill(0).map((_, i) => {
    const a = i * (STEP) + PI_HALF;
    return `M ${x(a)} ${y(a)} A ${RADIUS} ${RADIUS} 0 0 1 ${x(a + STEP)} ${y(a + STEP)}`;
});

export const styles = StyleSheet.create({
    text: {
        ...Fonts.extraLarge,
        ...Fonts.fontSemiBold,
        ...Spacer.smallTopMargin,
        ...Spacer.tinyBottomMargin,
        width: '100%',
        textAlign: 'center',
        color: '#C1F0FF',
    },
});

/**
 *
 * @param size
 * @param percent
 * @param animationEnd call animation end when other the value is shown. If value is the same as last, call it too,
 *  because the parent component will not call rerender it.
 * @return {JSX.Element}
 * @constructor
 */
const AnimatedProgress = ({size, percent, animationEnd}) => {
    const fillPercent = useRef(new Animated.Value(0)).current
    const [lastValue, setLastValue] = useState(0);

    const fillAnim = useCallback((toPercentValue) => {
        Animated.timing(fillPercent, {
            toValue: toPercentValue / 100,
            duration: ANIMATION_DURATION,
            delay: 0,
            easing: Easing.linear,
            useNativeDriver: false, // don't use native driver! It's breaking the animation
        }).start(() => {
            setLastValue(toPercentValue);
            animationEnd?.();
        });
    }, [fillPercent]);

    useEffect(() => {
        if (lastValue !== percent) {
            fillAnim(percent);
        } else {
            animationEnd?.();
        }
    }, [percent, lastValue, animationEnd]);

    return (
        <Svg height={size} width={size} viewBox="0 0 110 110">
            <Circle
                r={55}
                x={45 + MARGIN}
                y={45 + MARGIN}
                fill={'black'}
            />
            <GradientPath
                d={ARCS.join(',')}
                colors={['#092340']}
                strokeWidth={STROKE_WIDTH}
                precision={4}
                percent={100}
                roundedCorners
            />
            <AnimatedGradientPath
                d={ARCS.join(',')}
                colors={['#1975D5', '#00CDFE']}
                strokeWidth={STROKE_WIDTH}
                precision={3}
                percent={fillPercent}
                roundedCorners
            />
        </Svg>);
}

function propsAreEqual(prevMovie, nextMovie) {
    return prevMovie.size === nextMovie.size
        && prevMovie.percent === nextMovie.percent
        && prevMovie.animationEnd === nextMovie.animationEnd;
}

/**
 * Without this, the animation will be interrupted witch each progress update.
 * @type {React.NamedExoticComponent<{readonly percent?: *, readonly animationEnd?: *, readonly size?: *}>}
 */
const MemoizedProgress = React.memo(AnimatedProgress, propsAreEqual);

const CircleLoader = ({size = PROGRESS_SIZE, fontSize = PROGRESS_FONT_SIZE, percent = 0,}) => {
    const [allowChange, setAllowChange] = useState(true);
    const [throttledPercent, setThrottledPercent] = useState(0);

    // throttling change of percentage value
    useEffect(() => {
        if (allowChange && percent !== throttledPercent) {
            setThrottledPercent(percent);
            setAllowChange(false);
        }
    }, [allowChange, throttledPercent, percent]);

    const animationEnd = useCallback(() => {
        setAllowChange(true);
    }, [setAllowChange]);

    return (
        <View style={{height: size, width: size}}>
            <MemoizedProgress key="animated-progress" {...{percent: throttledPercent, size, animationEnd}}  />

            <View style={{height: size, width: size, position: 'absolute', justifyContent: 'center'}}>
                <Text
                    style={[styles.text, {fontSize}]}
                    accessibilityLabel="deviceMsn-heading">
                    {`${throttledPercent}%`}
                </Text>

            </View>
        </View>
    );
}

export default CircleLoader;
