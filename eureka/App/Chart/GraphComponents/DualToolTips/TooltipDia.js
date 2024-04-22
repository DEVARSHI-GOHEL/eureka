import React from 'react';
import {StyleSheet, Animated} from 'react-native';
import * as Properties from '../../VizConstants/GraphProperties';
import {getMeasureColor} from '../../../utils/MeasureVizUtils';

const ToolTipDia = ({data, position, value}) => {
  let color = data.plottableData.find((item) => item.y2 == value.y);

  const animStyle = {
    transform: [{translateY: 0}, {translateX: position.x}],
    backgroundColor: getMeasureColor(color.measureColorDia),
  };
  const circleViewStyle = {
    transform: [{translateY: position.y - 230}, {translateX: 0}],
    backgroundColor: getMeasureColor(color.measureColorDia),
  };

  return (
    <Animated.View style={[styles.ball1, animStyle]}>
      <Animated.View style={[styles.circle, circleViewStyle]}>
        <Animated.Text style={[styles.text]}>{value.y} Dia</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export default ToolTipDia;

const styles = StyleSheet.create({
  ball1: {
    height: '50%',
    width: 3,
    backgroundColor: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    // justifyContent: 'center',
    alignItems: 'center',
    // position: 'absolute',
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
    bottom: -70,
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
