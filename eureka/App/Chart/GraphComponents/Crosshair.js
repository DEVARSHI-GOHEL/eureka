import React from 'react';

import {Line, Circle, Rect, Text, G} from 'react-native-svg';
import * as Properties from '../VizConstants/GraphProperties';
import {t} from 'i18n-js';

const FOCUS_LINE_CONFIG = {
  show: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  cx: 0,
  cy: 0,
  cy1: 0,
  cy2: 0,
  radius: 10,
  stroke: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
  strokeWidth: 2,
  fill: 'transparent',
};

export class Crosshair extends React.Component {
  constructor(props) {
    super(props);
    this.state =
      props && props.initData
        ? {...FOCUS_LINE_CONFIG, ...props.initData, show: true}
        : FOCUS_LINE_CONFIG;
  }

  setPosition = (attr) => {
    this.setState({...this.state, ...attr});
  };

  render() {
    let isHidden = this.state.show ? '' : 'none';
    return (
      <G style={{display: isHidden}}>
        <Line
          x1={this.state.x1}
          x2={this.state.x2}
          y1={this.state.y1}
          y2={this.state.y2}
          stroke={this.state.stroke}
          strokeWidth={this.state.strokeWidth}
        />
        <Circle
          r={this.state.radius}
          cx={this.state.cx}
          cy={this.state.cy}
          stroke={this.state.stroke}
          strokeWidth={this.state.strokeWidth}
          fill={this.state.fill}
        />
      </G>
    );
  }
}

export class DualCrosshair extends React.Component {
  constructor(props) {
    super(props);
    this.state =
      props && props.initData
        ? {...FOCUS_LINE_CONFIG, ...props.initData, show: true}
        : FOCUS_LINE_CONFIG;
  }

  setPosition = (attr) => {
    this.setState({...this.state, ...attr});
  };

  render() {
    let isHidden = this.state.show ? '' : 'none';

    let rectWidth = 40;
    let rectHeight = 30;
    let rectRadius = 5;
    let rectFill = '#fff';
    let rectStroke = '#c5c5c5';
    let rectStrokeWidth = 2;

    let rectX = this.state.cx * 1 - Math.round(rectWidth / 2);
    let rectY1 =
      this.state.cy1 * 1 - Math.round(this.state.radius * 1) - rectHeight - 4;
    let rectY2 = this.state.cy2 * 1 + this.state.radius * 1 + 4;

    let textX = rectX + 8;
    let textY1 = rectY1 + 20;
    let textY2 = rectY2 + 20;
    let textFill = '#031a29';

    return (
      <G style={{display: isHidden}}>
        <Line
          x1={this.state.x1}
          x2={this.state.x2}
          y1={this.state.y1}
          y2={this.state.y2}
          stroke={this.state.stroke}
          strokeWidth={this.state.strokeWidth}
        />

        <Rect
          width={rectWidth}
          height={rectHeight}
          rx={rectRadius}
          ry={rectRadius}
          x={rectX}
          y={rectY1}
          fill={rectFill}
          stroke={rectStroke}
          strokeWidth={rectStrokeWidth}
        />
        <Text
          fill={textFill}
          x={textX}
          y={textY1}
          fontSize={14}
          fontWeight={'bold'}>
          {t('bloodPressureScreen.systolic')}
        </Text>

        <Rect
          width={rectWidth}
          height={rectHeight}
          x={rectX}
          y={rectY2}
          rx={rectRadius}
          ry={rectRadius}
          fill={rectFill}
          stroke={rectStroke}
          strokeWidth={rectStrokeWidth}
        />
        <Text
          fill={textFill}
          x={textX}
          y={textY2}
          fontSize={14}
          fontWeight={'bold'}>
          {t('bloodPressureScreen.diastolic')}
        </Text>

        <Circle
          r={this.state.radius}
          cx={this.state.cx}
          cy={this.state.cy1}
          stroke={this.state.stroke}
          strokeWidth={this.state.strokeWidth}
          fill={this.state.fill}
        />
        <Circle
          r={this.state.radius}
          cx={this.state.cx}
          cy={this.state.cy2}
          stroke={this.state.stroke}
          strokeWidth={this.state.strokeWidth}
          fill={this.state.fill}
        />
      </G>
    );
  }
}
