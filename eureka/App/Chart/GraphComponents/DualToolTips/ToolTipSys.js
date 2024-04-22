import React from 'react';
import {StyleSheet, Animated} from 'react-native';
import * as Properties from '../../VizConstants/GraphProperties';
import {getMeasureColor} from '../../../utils/MeasureVizUtils';

const TooltipSys = ({data, position, value}) => {
  let color = data.plottableData.find((item) => item.y1 == value.y);

  const animStyle = {
    transform: [{translateX: position.x}, {translateY: 0}],
    backgroundColor: getMeasureColor(color.measureColorSys),
  };

  const circleViewStyle = {
    transform: [{translateX: 0}, {translateY: position.y - 15}],
    backgroundColor: getMeasureColor(color.measureColorSys),
  };

  return (
    <Animated.View style={[styles.ball1, animStyle]}>
      <Animated.View style={[styles.circle, circleViewStyle]}>
        <Animated.Text style={[styles.text]}>{value.y} Sys</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export default TooltipSys;

const styles = StyleSheet.create({
  ball1: {
    height: '50%',
    width: 3,
    backgroundColor: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    alignItems: 'center',
  },
  ball2: {
    height: '50%',
    width: 3,
    backgroundColor: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,

    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  circle: {
    fontSize: 12,
    height: 25,
    width: 25,
    borderRadius: 25,
    paddingTop: 5,
    color: '#fff',
    textAlign: 'center',
    borderWidth: 5,
    backgroundColor: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    borderColor: '#fff',
    elevation: 3,
  },
  circle2: {
    fontSize: 12,
    height: 25,
    width: 25,
    borderRadius: 25,
    paddingTop: 5,
    color: '#fff',
    textAlign: 'center',
    borderWidth: 5,
    borderColor: '#fff',
    elevation: 3,
  },
  text: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    right: 0,
    width: 60,
    height: 40,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 10,
    color: '#000',
    textAlign: 'center',
    paddingTop: 10,
    fontFamily: 'Rajdhani-Bold',
  },
});
