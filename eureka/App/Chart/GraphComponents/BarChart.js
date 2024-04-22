import React, {useRef, memo} from 'react';

import * as d3scale from 'd3-scale';
import Svg, {
  Text,
  Line,
  Rect,
  Defs,
  LinearGradient,
  G,
  Stop,
} from 'react-native-svg';

import * as Properties from '../VizConstants/GraphProperties';
import Tooltip from './Tooltip';
import {VITAL_CONSTANTS} from '../AppConstants/VitalDataConstants';
import {getAbsoluteHourInAmPm} from '../AppUtility/DateTimeUtils';

export default memo(({data, vitalType}) => {
  const TooltipRef = useRef();
  const isStepsData = vitalType == VITAL_CONSTANTS.KEY_STEPS;

  function setTooltip(_data) {
    let __data = {..._data, tooltipMeta: {}};
    __data.tooltipMeta.leftTextVal =
      Math.round(_data.meta.y) + (isStepsData ? '' : '%');
    __data.tooltipMeta.rightTextVal = isStepsData ? 'steps' : 'of time';
    __data.tooltipMeta.bottomTextVal = isStepsData
      ? _data.meta.label
      : vitalType == VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE
      ? 'in range'
      : 'in normal range';

    TooltipRef.current.setPosition(__data);
  }

  function drawBarChart(barPlotData) {
    let count = 1;

    const jsx = Object.keys(barPlotData).map((key) => {
      let barData = barPlotData[key];
      return drawBar(count++, barData);
    });

    return <>{jsx}</>;
  }

  function drawBar(key, barData) {
    return (
      <Rect
        key={key}
        x={barData.x}
        y={barData.y}
        width={barData.width}
        height={barData.height}
        rx={barData.rx ? barData.rx : 0}
        ry={barData.ry ? barData.ry : 0}
        stroke={barData.stroke}
        fill={barData.fill}
        strokeWidth={barData.strokeWidth}
        onPress={() => {
          setTooltip(barData);
        }}
      />
    );
  }

  //CREATE X-SCALES
  const X_SCALE = getScaleX(data);

  //CREATE Y-SCALE
  const Y_SCALE = getScaleY(data);

  //GET HORIZONTAL LINES PLOT VALUES
  const lineplotData = getHorizontalLinePlotData(data, X_SCALE, Y_SCALE);

  //X AND Y AXIS PLOT VALUES
  const XaxisTicks = isStepsData
    ? getXAxisTicksStep(data, X_SCALE)
    : getXAxisTicks(data, X_SCALE);
  const YaxisTicks = getYAxisTicks(data, Y_SCALE);

  //GET BAR VALUES
  const barPlotData = getBarPlotData(data, X_SCALE, Y_SCALE, vitalType);

  const xAxisJsx = createAxisX(XaxisTicks);
  const yAxisJsx = createAxisY(YaxisTicks);
  const lineJsx = drawHorizontalLines(lineplotData);
  const barJsx = drawBarChart(barPlotData);

  const defs = getDefs(vitalType, data.hourlyBar);

  const compact = isStepsData && data.hourlyBar;

  const tooltipExtendedLength = isStepsData && !data.hourlyBar;

  return (
    <Svg width={Properties.SVG_WIDTH} height={Properties.SVG_HEIGHT + 30}>
      <G
        transform={{
          translate:
            Properties.PADDING_HORIZONTAL * 1 -
            10 +
            ', ' +
            (Properties.PADDING_VERTICAL + 30),
        }}>
        {defs}
        {xAxisJsx}
        {yAxisJsx}
        {lineJsx}
        {barJsx}

        {
          <Tooltip
            ref={TooltipRef}
            compact={compact}
            extended={tooltipExtendedLength}
            textSpace={data.free}
          />
        }
      </G>
    </Svg>
  );
});

function getGradientId(prcnt) {
  if (prcnt <= 30) {
    return 'barGradient30';
  } else if (prcnt > 30 && prcnt <= 50) {
    return 'barGradient50';
  } else if (prcnt > 50 && prcnt <= 60) {
    return 'barGradient60';
  } else if (prcnt > 60 && prcnt <= 70) {
    return 'barGradient70';
  } else if (prcnt > 70 && prcnt <= 85) {
    return 'barGradient85';
  } else if (prcnt > 85) {
    return 'barGradient0';
  }
}

//Get X axis scale function
function getScaleX(data) {
  return d3scale
    .scaleBand()
    .domain(data.bucketKeys)
    .range([0, Properties.GRAPH_WIDTH])
    .padding(data.barPadding ? data.barPadding : 0.5);
}

//GET Y axis scale function
function getScaleY(data) {
  return d3scale
    .scaleLinear()
    .domain([
      data.barChartScales.axisY.start.value,
      data.barChartScales.axisY.end.value,
    ])
    .range([Properties.GRAPH_HEIGHT, 0]);
}

function getXAxisTicks(data, X_SCALE) {
  const barChartXAxisKeys = Object.keys(data.barChartScales.axisX);
  let xAxisTicks = [];

  barChartXAxisKeys.forEach((key) => {
    let item = data.barChartScales.axisX[key];
    let itemVal = item.value ? item.value + '' : item + '';
    let itemText = item.label || item.label == '' ? item.label : item;
    xAxisTicks.push({
      x: X_SCALE(itemVal),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      labelSpacingX: 0, //X_SCALE.bandwidth()/3, //This needs to be dynamic
      font: Properties.MAIN_FONT,
      text: itemText,
      textAnchor: 'start',
    });
  });
  return xAxisTicks;
}

function getXAxisTicksStep(data, X_SCALE) {
  const barChartXAxisKeys = Object.keys(data.barChartScales.axisX);
  let xAxisTicks = [];

  const isDayKey = !barChartXAxisKeys.some((key) => Number.isNaN(Number(key)));

  if (isDayKey) {
    barChartXAxisKeys.forEach((key) => {
      const item = data.barChartScales.axisX[key];
      const itemVal = item.value ?? '';
      const itemLabel = getAbsoluteHourInAmPm(itemVal);

      xAxisTicks.push({
        x: X_SCALE(itemVal),
        y: 0,
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE,
        labelSpacing: Properties.X_AXIS_LABEL_SPACING,
        labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
        labelSpacingX: X_SCALE.bandwidth() / 2,
        labelSpacingY: 10,
        font: Properties.MAIN_FONT,
        text: itemLabel ?? '',
        textAnchor: 'middle',
      });
    });
  } else {
    barChartXAxisKeys.forEach((key) => {
      const item = data.barChartScales.axisX[key];
      const itemVal = item.value ?? '';
      const itemText = item.label || item.label == '' ? item.label : item;
      xAxisTicks.push({
        x: X_SCALE(itemVal),
        y: 0,
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE,
        labelSpacing: Properties.X_AXIS_LABEL_SPACING,
        labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
        labelSpacingX: 0,
        font: Properties.MAIN_FONT,
        text: itemText,
        textAnchor: 'start',
      });
    });
  }

  if (!isDayKey || xAxisTicks.length < 8) {
    return xAxisTicks;
  }

  if (xAxisTicks.length < 12) {
    return xAxisTicks.map((el, ind) => {
      if (ind % 2) el.text = '';
      return el;
    });
  }

  return xAxisTicks.map((el, ind) => {
    if (ind % 3) el.text = '';
    return el;
  });
}

function getYAxisTicks(data, Y_SCALE) {
  let barChartYAxisKeys = Object.keys(data.barChartScales.axisY);
  let yAxisTicks = [];

  barChartYAxisKeys.forEach((key) => {
    let item = data.barChartScales.axisY[key];

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

/**
 * If the first attribute is not null nor undefined return it.
 * Otherwise return defaultValue.
 *
 * @param value
 * @param defaultValue
 * @return {*}
 */
const definedValue = (value, defaultValue) => {
  if (value !== null && value !== undefined) return value;

  return defaultValue;
};

function getHorizontalLinePlotData(data, X_SCALE, Y_SCALE) {
  let xScaleLastItemKey = data.bucketKeys[data.bucketKeys.length - 1];

  let xScaleLastItem = data.barChartScales.axisX[xScaleLastItemKey];
  xScaleLastItem = xScaleLastItem ? xScaleLastItem : xScaleLastItemKey;
  let yAxisKeys = Object.keys(data.barChartScales.axisY);

  var plotData = [];

  let bandwidth = X_SCALE.bandwidth();

  let extendedLineLength = bandwidth + bandwidth / 3; //This needs to be dynamic

  yAxisKeys.forEach((key) => {
    if (key == 'scale_label') {
      return;
    }

    let item = data.barChartScales.axisY[key];

    plotData.push({
      x1: 0,
      y1: Y_SCALE(item.value),
      x2:
        X_SCALE(definedValue(xScaleLastItem.value, xScaleLastItem)) +
        extendedLineLength,
      y2: Y_SCALE(item.value),
      color: Properties.LINE_COLOR,
    });
  });

  return plotData;
}

function getBarPlotData(data, X_SCALE, Y_SCALE, vital_type) {
  var plotArr = [];

  var barChartData = data.dualPlot
    ? data.barChartData[vital_type]
    : data.barChartData;

  if (!barChartData || barChartData.length == 0) {
    console.log('No bar chart data to plot');
    return plotArr;
  }

  barChartData.forEach((data) => {
    const tempHeight = Properties.GRAPH_HEIGHT - Y_SCALE(data.y);
    const barAttr = {
      x: X_SCALE(data.x),
      y: Y_SCALE(data.y),
      width: X_SCALE.bandwidth(), //NEEDS TO BE DYNAMIC
      height: tempHeight < 0 ? 0 : tempHeight,
      meta: data,
      ...Properties.PERCENT_IN_RANGE_BAR_STYLE,
      fill: 'url(#' + getGradientId(data.y) + ')',
    };

    if (vital_type == VITAL_CONSTANTS.KEY_STEPS) {
      barAttr.rx = 3;
      barAttr.ry = 3;
      barAttr.fill = data.stepGoalMet
        ? 'url(#stepBarGraphRectBg2)'
        : 'url(#stepBarGraphRectBg)';
      plotArr.push(barAttr);
      return;
    }

    plotArr.push(barAttr);

    plotArr.push({
      x: X_SCALE(data.x),
      y: Y_SCALE(data.y < 1 ? 0 : 1),
      width: X_SCALE.bandwidth(),
      height: Properties.GRAPH_HEIGHT - Y_SCALE(data.y < 1 ? 0 : 1),
      ...Properties.PERCENT_IN_RANGE_BAR_STYLE,
      meta: data,
      fill: Properties.PERCENT_IN_RANGE_BAR_STYLE.fillmask,
      rx: 0,
      ry: 0,
    });
  });

  return plotArr;
}

/******************************************************************************************************************************************************************* */

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
  const labelSpacing = tick?.labelSpacingY || tick?.labelSpacing

  return (
    <G key={key} transform={{translate: tick.x + ',' + 0}}>
      <Text
        fill={tick.color}
        x={tick.labelSpacingX}
        y={labelSpacing}
        dy={tick.labelSpacingRelative}
        fontSize={tick.fontSize}
        textAnchor={tick.textAnchor}>
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

  return Object.keys(lineplotData).map((key) => {
    let lineData = lineplotData[key];
    return drawlLineSegment(count++, lineData);
  });
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

function getDefs(vital_type) {
  {
    /*DEFINE PATTERNS AND LINEAR GRADIENT CONFIGURATIONS*/
  }

  let jsx = <></>;

  if (vital_type == VITAL_CONSTANTS.KEY_STEPS) {
    jsx = (
      <Defs>
        <LinearGradient
          id="stepBarGraphRectBg"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          spreadMethod="pad">
          <Stop
            offset="20%"
            stopColor={Properties.STEPS_BAR_COLOR.darkTop}
            stopOpacity="1"
          />
          <Stop
            offset="80%"
            stopColor={Properties.STEPS_BAR_COLOR.darkBottom}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="stepBarGraphRectBg2"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          spreadMethod="pad">
          <Stop
            offset="20%"
            stopColor={Properties.STEPS_BAR_COLOR.liteTop}
            stopOpacity="1"
          />
          <Stop
            offset="80%"
            stopColor={Properties.STEPS_BAR_COLOR.liteBottom}
            stopOpacity="1"
          />
        </LinearGradient>
      </Defs>
    );
  } else {
    jsx = (
      <Defs>
        <LinearGradient
          id="barGradient30"
          x1="0%"
          y1="-100%"
          x2="0%"
          y2="30%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="barGradient50"
          x1="0%"
          y1="-50%"
          x2="0%"
          y2="50%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="barGradient60"
          x1="0%"
          y1="-30%"
          x2="0%"
          y2="60%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="barGradient70"
          x1="0%"
          y1="-20%"
          x2="0%"
          y2="70%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="barGradient85"
          x1="0%"
          y1="-10%"
          x2="0%"
          y2="85%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>

        <LinearGradient
          id="barGradient0"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          spreadMethod="pad">
          <Stop
            offset="0%"
            stopColor={Properties.BAR_GRADIENT_COLOR.ok}
            stopOpacity="1"
          />
          <Stop
            offset="100%"
            stopColor={Properties.BAR_GRADIENT_COLOR.warning}
            stopOpacity="1"
          />
        </LinearGradient>
      </Defs>
    );
  }

  return jsx;
}
