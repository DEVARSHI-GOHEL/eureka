import * as React from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {scaleTime, scaleLinear} from 'd3-scale';
import * as shape from 'd3-shape';
import * as Properties from '../../../Chart/VizConstants/GraphProperties';
import {LineChart} from 'react-native-chart-kit';

import Cursor from './cursor';

const φ = (1 + Math.sqrt(5)) / 2;
const {width, height: wHeight} = Dimensions.get('window');
const height = (1 - 1 / φ) * wHeight;
const strokeWidth = 2;
const padding = strokeWidth / 2;
const CURSOR_RADIUS = 8;
const STROKE_WIDTH = CURSOR_RADIUS / 2;
const getDomain = (domain) => [Math.min(...domain), Math.max(...domain)];

export default ({vitalData, vitalType, startTs, endTs}) => {
  let mydata = vitalData.vital_data.map((item) => ({
    date: item.ts,
    value: Number(item[vitalType]),
  }));
  // console.log(data, 'data');

  // const data = [
  //   {date: new Date(2018, 9, 8).getTime(), value: 0},
  //   {date: new Date(2018, 9, 16).getTime(), value: 0},
  //   {date: new Date(2018, 9, 17).getTime(), value: 200},
  //   {date: new Date(2018, 10, 1).getTime(), value: 200},
  //   {date: new Date(2018, 10, 2).getTime(), value: 300},
  //   {date: new Date(2018, 10, 5).getTime(), value: 300},
  // ];
  // const scaleX = scaleTime()
  //   .domain(getDomain(data.map((d) => d.date)))
  //   .range([0, width]);
  // const scaleY = scaleLinear()
  //   .domain(getDomain(data.map((d) => d.value)))
  //   .range([height - padding, padding]);
  // const d = shape
  //   .line()
  //   .x((p) => scaleX(new Date(p.date)))
  //   .y((p) => scaleY(p.value))
  //   .curve(shape.curveBasis)(data);
  console.log(
    vitalData.vital_data.map((item) => item[vitalType]),
    'asdasd',
  );

  const data = {
    // labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        // data: vitalData.vital_data.map((item) => item[vitalType]),
        data: [0, 10, 20],

        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],

    // legend: ['Rainy Days'], // optional
  };

  const minValue = 0;
  const maxValue = 20;
  let maxmin = getDomain(mydata.map((d) => d.value));
  console.log(maxmin);
  function* yLabel() {
    yield* [0, maxmin[1]];
  }

  const yLabelIterator = yLabel();

  return (
    <LineChart
      data={data}
      width={Properties.SVG_WIDTH}
      height={Properties.SVG_HEIGHT}
      bezier
      fromZero
      formatYLabel={() => yLabelIterator.next().value}
      xLabelsOffset
      yAxisInterval={5}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },

        fillShadowGradient: 'red',
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
      }}
    />
  );
};
{
  /* <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#cee3f9" />
            <Stop offset="80%" stopColor="#ddedfa" />
            <Stop offset="100%" stopColor="#feffff" />
          </LinearGradient>
        </Defs>
        <Path
          d={`${d} L ${width} ${height} L 0 ${height}`}
          fill="url(#gradient)"
        />
        <Path fill="transparent" stroke="#3977e3" {...{d, strokeWidth}} />
      </Svg>
      <Cursor
        r={CURSOR_RADIUS}
        borderWidth={STROKE_WIDTH}
        borderColor="#3977e3"
        {...{d}}
      /> */
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
  },
});
