import React, {useEffect, useRef} from 'react';
import {Dimensions, TextInput} from 'react-native';
import {getPointAtLength, parsePath} from 'react-native-redash';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  event,
  interpolate,
  sub,
  useCode,
  call,
} from 'react-native-reanimated';
// import { GREEN, SUB_BACKGROUND } from 'utils/colors'
import {scaleQuantile} from 'd3-scale';

const {Value} = Animated;

export default function Cursor({d, scaleY, scaleX, data, width}) {
  const textRef = useRef();
  const translationX = new Value(0);
  const path = parsePath(d);
  const length = interpolate(translationX, {
    inputRange: [0, width],
    outputRange: [0, path.totalLength],
  });
  const {x, y} = getPointAtLength(path, length);
  const translateX = x;
  const cursorX = sub(x, 4);
  const cursorY = sub(y, 4);
  // const text = scaleY.invert(cursorX.__getValue())
  const onGestureEvent = event([
    {
      nativeEvent: {
        x: translationX,
      },
    },
  ]);

  useEffect(() => {
    updateText(0);
  }, []);

  useCode(() => {
    return call([translationX], (value) => {
      // console.log('translationX:value', value);
      updateText(value);
    });
  }, [translationX]);

  function updateText(xValue) {
    const {x, y} = getPointAtLength(path, xValue);
    console.log('x', x);
    const cursorX = sub(x, 4);
    const updated = scaleY.invert(cursorX.__getValue());
    console.log('updated', updated);
    textRef.current.setNativeProps({text: `${updated.toFixed(5)}`});
  }

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View>
        <Animated.View style={{transform: [{translateX}], ...styles.label}}>
          <TextInput ref={textRef} style={{color: 'white'}} />
        </Animated.View>
        <Animated.View style={[styles.line, {transform: [{translateX}]}]} />
        <Animated.View
          style={[
            styles.cursor,
            {transform: [{translateX: cursorX, translateY: cursorY}]},
          ]}
        />
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = {
  line: {
    height: '96%',
    width: 2,
    backgroundColor: 'gray',
    top: '4%',
  },
  cursor: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    top: -12,
    left: 0,
    width: 100,
  },
};
