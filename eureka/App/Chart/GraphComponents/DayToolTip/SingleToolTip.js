import React from 'react';
import {StyleSheet, Animated} from 'react-native';
import * as Properties from '../../VizConstants/GraphProperties';
import {getMeasureColor} from '../../../utils/MeasureVizUtils';

const SingleToolTip = ({data, position, value}) => {
  const animStyle = {
    transform: [{translateX: position.x}, {translateY: 0}],
    backgroundColor: getMeasureColor(
      data.plottableData.find((item) => item.y == value.y).measureColor,
    ),
  };

  const textAnimStyle = {
    transform: [{translateY: position.y - 20}, {translateX: 0}],
  };
  const circleViewStyle = {
    transform: [{translateX: 0}, {translateY: position.y - 15}],
    backgroundColor: getMeasureColor(
      data.plottableData.find((item) => item.y == value.y).measureColor,
    ),
  };

  return (
    <Animated.View style={[styles.ball, animStyle]}>
      <Animated.View style={[styles.circle, circleViewStyle]}>
        <Animated.Text style={[styles.text]}>{value.y}</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export default SingleToolTip;

const styles = StyleSheet.create({
  ball: {
    height: Properties.GRAPH_HEIGHT,
    width: 3,
    backgroundColor: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    // justifyContent: 'center',
    alignItems: 'center',
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
