import React, {useRef} from 'react';

import * as d3scale from 'd3-scale';
import * as d3shape from 'd3-shape';

import Svg, {
  Text,
  Line,
  Defs,
  Path,
  LinearGradient,
  G,
  Stop,
} from 'react-native-svg';

import * as Properties from '../VizConstants/GraphProperties';
import {getDateTimeInfo} from '../AppUtility/DateTimeUtils';
import Tooltip from './Tooltip';

export default function LineChart({data, startTs, endTs, onInteract}) {
  let TooltipRef = useRef();

  //CREATE X-SCALES
  let X_SCALE = getScaleX(data);

  //CREATE Y-SCALE
  let Y_SCALE = getScaleY(data);

  function setTooltip(_data, nativeEvent) {
    let xValue = X_SCALE.invert(_data.x);
    let yValue = Math.round(Y_SCALE.invert(_data.y) * 1);
    let dateTimeInfo = getDateTimeInfo(xValue.getTime());

    let __data = {..._data, tooltipMeta: {}};
    __data.tooltipMeta.leftTextVal = yValue + ''; //_data.meta.y + "%";
    // __data.tooltipMeta.rightTextVal = 'steps';
    __data.tooltipMeta.bottomTextVal = dateTimeInfo.timeInWords;

    TooltipRef.current.setPosition(__data);
  }

  function drawPath(pathAttr, onTouch) {
    let jsx = (
      <Path
        d={pathAttr.path}
        stroke={pathAttr.stroke}
        strokeWidth={pathAttr.strokeWidth}
        fill={pathAttr.fill}
        onPress={(e) => {
          console.log(e.nativeEvent);
          if (onTouch)
            onTouch(
              {
                x: e.nativeEvent.locationX - 50,
                y: e.nativeEvent.locationY - 80,
                width: 0,
              },
              e.nativeEvent,
            );
        }}
      />
    );

    return jsx;
  }

  //X AND Y AXIS PLOT VALUES
  //   let XaxisTicks = getXAxisTicks(data, X_SCALE);
  //   let YaxisTicks = getYAxisTicks(data, Y_SCALE);

  //GET HORIZONTAL LINES PLOT VALUES
  //   let lineplotData = getHorizontalLinePlotData(data, X_SCALE, Y_SCALE);

  //GET AREA GRAPH VALUES
  let areaGraphPathData = getAreaGraphPlotValues(data, X_SCALE, Y_SCALE);

  //GET LINE GRAPH VALUES
  let lineGraphPathData = getLineGraphPlotValues(data, X_SCALE, Y_SCALE);

  //   let xAxisJsx = createAxisX(XaxisTicks);
  //   let yAxisJsx = createAxisY(YaxisTicks);
  //   let lineJsx = drawHorizontalLines(lineplotData);
  let area = drawPath(areaGraphPathData);

  let line = drawPath(lineGraphPathData, setTooltip);
  let graphJsx = (
    <Svg
      width={Properties.SVG_WIDTH}
      height={Properties.SVG_HEIGHT + 30}
      backgroundColor="url(#stepAreaGraphBg)">
      <G
        transform={{
          translate:
            Properties.PADDING_HORIZONTAL * 1 -
            10 +
            ', ' +
            (Properties.PADDING_VERTICAL + 30),
        }}>
        {/*DEFINE PATTERNS AND LINEAR GRADIENT CONFIGURATIONS*/}
        <Defs>
          <LinearGradient gradientTransform={{rotate: 90}} id="stepAreaGraphBg">
            <Stop offset="5%" stopColor={'#aecaeb'} stopOpacity="0.8" />
            {/* <Stop offset="95%" stopColor={'#fff'} stopOpacity="1" /> */}
          </LinearGradient>
        </Defs>

        {/* {xAxisJsx}
        {yAxisJsx}
        {lineJsx} */}
        {area}
        {line}
        {<Tooltip ref={TooltipRef} />}
      </G>
    </Svg>
  );

  return graphJsx;
}

//Get X axis scale function
function getScaleX(data) {
  return d3scale
    .scaleTime()
    .domain([
      data.date_scale.ts_scale_start.date,
      data.date_scale.ts_scale_end.date,
    ])
    .range([0, Properties.GRAPH_WIDTH]);
}

//GET Y axis scale function
function getScaleY(data) {
  return d3scale
    .scaleLinear()
    .domain([data.vital_scale.start.value, data.vital_scale.end.value])
    .range([Properties.GRAPH_HEIGHT, 0]);
}

function getXAxisTicks(data, X_SCALE) {
  let lineChartXAxisValues = data.lineChartScales.axisX;
  let xAxisTicks = [];

  Object.keys(lineChartXAxisValues).forEach((key) => {
    let item = lineChartXAxisValues[key];
    xAxisTicks.push({
      x: X_SCALE(item.date),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: item.label,
    });
  });

  return xAxisTicks;
}

function getYAxisTicks(data, Y_SCALE) {
  let lineChartYAxisKeys = Object.keys(data.lineChartScales.axisY);
  let yAxisTicks = [];

  lineChartYAxisKeys.forEach((key) => {
    let item = data.lineChartScales.axisY[key];

    let attr = null;

    if (key == 'scale_label') {
      attr = {
        x: 0,
        y: Y_SCALE(item.value),
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE + 5,
        labelSpacing: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_VERTICAL,
        labelSpacingY: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_HORIZONTAL,
        labelSpacingRelative: -1 * Properties.DY_AXIS_LABEL_SPACING * 2 + 15,
        font: Properties.MAIN_FONT,
        rotate: -90,
        bold: true,
        text: item.label,
      };
    } else {
      attr = {
        x: 0,
        y: Y_SCALE(item.value) - 5,
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE,
        labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING + 10,
        labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
        font: Properties.MAIN_FONT,
        text: item.label,
      };
    }

    yAxisTicks.push(attr);
  });

  return yAxisTicks;
}

function getHorizontalLinePlotData(data, X_SCALE, Y_SCALE) {
  let xScaleLastItem = data.lineChartScales.axisX.ts_scale_end;
  let yAxisKeys = Object.keys(data.lineChartScales.axisY);

  var plotData = [];

  yAxisKeys.forEach((key) => {
    if (key == 'scale_label') {
      return;
    }

    let item = data.lineChartScales.axisY[key];
    plotData.push({
      x1: 0,
      y1: Y_SCALE(item.value),
      x2: X_SCALE(xScaleLastItem.date),
      y2: Y_SCALE(item.value),
      color: Properties.LINE_COLOR,
    });
  });

  return plotData;
}

function getAreaGraphPlotValues(data, X_SCALE, Y_SCALE) {
  var stepsData = data.plottableData;
  if (!stepsData || stepsData.length == 0) {
    console.log('No Area data to plot');
    return null;
  }

  return getAreaPlotValue(stepsData, X_SCALE, Y_SCALE);
}

function getLineGraphPlotValues(data, X_SCALE, Y_SCALE) {
  var stepsData = data.plottableData;
  if (!stepsData || stepsData.length == 0) {
    console.log('No Line data to plot');
    return null;
  }

  return getLinePlotValue(stepsData, X_SCALE, Y_SCALE);
}

function getAreaPlotValue(_stepsData, X_SCALE, Y_SCALE) {
  let d = getPathAttrForAreaChart(_stepsData, X_SCALE, Y_SCALE);
  return {
    path: d,
    ...Properties.AREA_GRAPH_STYLE,
  };
}

function getPathAttrForAreaChart(_stepsData, X_SCALE, Y_SCALE) {
  var areaGenerator = d3shape.area();
  areaGenerator
    .x(function (d, i) {
      return X_SCALE(d.x);
    })
    .y0(Y_SCALE(0))
    .y1(function (d) {
      return Y_SCALE(d.y);
    });
  return areaGenerator(_stepsData);
}

function getLinePlotValue(_stepsData, X_SCALE, Y_SCALE) {
  let d = getPathAttrForLineChart(_stepsData, X_SCALE, Y_SCALE);
  return {
    path: d,
    ...Properties.LINE_GRAPH_STYLE,
  };
}

function getPathAttrForLineChart(_stepsData, X_SCALE, Y_SCALE) {
  var lineGenerator = d3shape.line();
  lineGenerator
    .x(function (d, i) {
      return X_SCALE(d.x);
    })
    .y(function (d) {
      return Y_SCALE(d.y);
    })
    .curve(d3shape.curveMonotoneX);
  return lineGenerator(_stepsData);
}

/*************************************************************************************************************************************** */

//START DRAWING
function createAxisX(axisTicks) {
  let jsx = Object.keys(axisTicks).map((key) => {
    let tick = axisTicks[key];
    return drawXAxisLabel(key, tick);
  });

  return (
    <G
      transform={{translate: 0 + ', ' + Properties.GRAPH_HEIGHT}}
      textAnchor={'middle'}
      fontFamily={Properties.MAIN_FONT}>
      {jsx}
    </G>
  );
}

function drawXAxisLabel(key, tick) {
  return (
    <G key={key} transform={{translate: tick.x + ',' + 0}}>
      <Text
        fill={tick.color}
        y={tick.labelSpacing}
        dy={tick.labelSpacingRelative}
        fontSize={tick.fontSize}>
        {tick.text}
      </Text>
    </G>
  );
}

function createAxisY(axisTicks) {
  var count = 1;
  let jsx = Object.keys(axisTicks).map((key) => {
    let tick = axisTicks[key];
    return drawYAxisLabel(count++, tick);
  });

  return (
    <G textAnchor={'end'} fontFamily={Properties.MAIN_FONT}>
      {jsx}
    </G>
  );
}

function drawYAxisLabel(key, tick) {
  return (
    <G key={key} transform={{translate: 0 + ',' + tick.y}}>
      <Text
        fill={tick.color}
        x={tick.labelSpacing}
        y={tick.labelSpacingY ? tick.labelSpacingY : ''}
        dy={tick.labelSpacingRelative}
        fontSize={tick.fontSize}
        fontWeight={tick.bold ? 'bold' : 'normal'}
        rotation={tick.rotate ? tick.rotate : ''}>
        {tick.text}
      </Text>
    </G>
  );
}

function drawHorizontalLines(lineplotData) {
  var count = 1;

  let jsx = Object.keys(lineplotData).map((key) => {
    let lineData = lineplotData[key];
    return drawlLineSegment(count++, lineData);
  });

  return jsx;
}

function drawlLineSegment(key, lineData) {
  return (
    <Line
      key={key}
      x1={lineData.x1}
      y1={lineData.y1}
      x2={lineData.x2}
      y2={lineData.y2}
      stroke={lineData.color}
    />
  );
}
