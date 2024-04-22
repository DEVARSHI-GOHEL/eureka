import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import * as path from 'svg-path-properties';
import * as shape from 'd3-shape';
import * as d3scale from 'd3-scale';

import * as Properties from '../../../Chart/VizConstants/GraphProperties';
import {scaleTime, scaleLinear, scaleQuantile} from 'd3-scale';

const d3 = {
  shape,
};

const height = 400;
const {width} = Dimensions.get('window');
const verticalPadding = 5;
const cursorRadius = 10;
const labelWidth = 100;

const data = [
  {x: new Date(2018, 9, 1), y: 0},
  {x: new Date(2018, 9, 16), y: 0},
  {x: new Date(2018, 9, 17), y: 200},
  {x: new Date(2018, 10, 1), y: 200},
  {x: new Date(2018, 10, 2), y: 300},
  {x: new Date(2018, 10, 5), y: 300},
];

const DailyNewGraphy = ({
  data,
  startTs,
  endTs,
  vitalType,
  vitalData,
  onInteract,
}) => {
  const cursor = useRef();
  const label = useRef();

  const [x, setx] = useState(new Animated.Value(0));

  const scaleX = scaleTime()
    .domain([new Date(startTs), new Date(endTs)])
    .range([0, Properties.GRAPH_WIDTH]);
  const scaleLabel = scaleQuantile().domain([0, 300]).range([0, 200, 300]);
  const scaleY = scaleLinear()
    .domain([data.vital_scale.start.value, data.vital_scale.end.value])
    .range([Properties.GRAPH_HEIGHT, 0]);

  const line = d3.shape
    .line()
    .x((d) => scaleX(new Date(d.ts)))
    .y((d) => scaleY(d[vitalType]))
    .curve(d3.shape.curveBasis)(vitalData.vital_data);
  const properties = path.svgPathProperties(line);
  const lineLength = properties.getTotalLength();

  function moveCursor(value) {
    const {x, y} = properties.getPointAtLength(lineLength - value);
    cursor.current?.setNativeProps({
      top: y - cursorRadius,
      left: x - cursorRadius,
    });
    const label = scaleLabel(scaleY.invert(y));
    label.current?.setNativeProps({text: `${label} CHF`});
  }

  useEffect(() => {
    x.addListener(({value}) => moveCursor(value));
    moveCursor(0);
  }, []);

  const translateX = x.interpolate({
    inputRange: [0, lineLength],
    outputRange: [width - labelWidth, 0],
    extrapolate: 'clamp',
  });
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Svg
          {...{
            width: Properties.SVG_WIDTH,
            height: Properties.SVG_HEIGHT - 180,
          }}>
          <Defs>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="gradient">
              <Stop stopColor="#CDE3F8" offset="0%" />
              <Stop stopColor="#eef6fd" offset="80%" />
              <Stop stopColor="#FEFFFF" offset="100%" />
            </LinearGradient>
          </Defs>
          <Path d={line} fill="transparent" stroke="#367be2" strokeWidth={5} />
          <Path
            d={`${line} L ${width} ${Properties.SVG_HEIGHT - 180} L 0 ${
              Properties.SVG_HEIGHT - 180
            }`}
            fill="url(#gradient)"
          />
          <View ref={cursor} style={styles.cursor} />
        </Svg>
        <Animated.View style={[styles.label, {transform: [{translateX}]}]}>
          <TextInput ref={label} />
        </Animated.View>
        <Animated.ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={{width: lineLength * 2}}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces={false}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {x},
                },
              },
            ],
            {useNativeDriver: true},
          )}
          horizontal
        />
      </View>
    </SafeAreaView>
  );
};

export default DailyNewGraphy;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    marginTop: 60,
    height,
    width,
  },
  cursor: {
    width: cursorRadius * 2,
    height: cursorRadius * 2,
    borderRadius: cursorRadius,
    borderColor: '#367be2',
    borderWidth: 3,
    backgroundColor: 'white',
  },
  label: {
    position: 'absolute',
    top: -45,
    left: 0,
    backgroundColor: 'lightgray',
    width: labelWidth,
  },
});

function getMealDataPlotValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];
  var lineArr = [];
  if (!data.mealData || data.mealData.length == 0) {
    return {plotArr, lineArr};
  }

  data.mealData.forEach((mealData) => {
    let mealsIcon = '';
    if (mealData.mealType == 1) mealsIcon = mealsLiteIcon;
    else if (mealData.mealType == 2) mealsIcon = mealsMediumIcon;
    else if (mealData.mealType == 3) mealsIcon = mealsHeavyIcon;

    plotArr.push({
      x: X_SCALE(mealData.x) - Properties.SVG_ICON_STYLE.width / 2,
      y: Y_SCALE(data.vital_scale.meals.value),
      icon: mealsIcon,
      ...Properties.SVG_ICON_STYLE,
    });

    lineArr.push({
      x1: X_SCALE(mealData.x),
      y1: Y_SCALE(data.vital_scale.start.value),
      x2: X_SCALE(mealData.x),
      y2: Y_SCALE(data.vital_scale.end.value),
      color: Properties.LINE_COLOR,
      isDashed: true,
      dashWidth: Properties.NORMAL_LINE_DASH,
    });
  });

  return {plotArr, lineArr};
}

function getScaleX(data) {
  return d3scale
    .scaleTime()
    .domain([
      data.date_scale.ts_scale_start.date,
      data.date_scale.ts_scale_end.date,
    ])
    .range([0, Properties.GRAPH_WIDTH]);
}

function getScaleY(data) {
  return d3scale
    .scaleLinear()
    .domain([data.vital_scale.start.value, data.vital_scale.end.value])
    .range([Properties.GRAPH_HEIGHT, 0]);
}
