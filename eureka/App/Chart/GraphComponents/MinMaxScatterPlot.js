import React, {useRef} from 'react';

import * as d3scale from 'd3-scale';
import * as d3shape from 'd3-shape';

import Svg, {
  Text,
  Line,
  Circle,
  Rect,
  Defs,
  Pattern,
  LinearGradient,
  Image,
  G,
  Stop,
  Path,
} from 'react-native-svg';
import {
  icon_16_arrow_increase_green,
  icon_16_arrow_decrease_green,
  icon_16_arrow_increase_yellow,
  icon_16_arrow_decrease_yellow,
  icon_16_arrow_increase_orange,
  icon_16_arrow_decrease_orange,
  icon_16_arrow_increase_red,
  icon_16_arrow_decrease_red,
} from '../AppIcons/VizIcons';

import {getMeasureColor} from '../../utils/MeasureVizUtils';

import * as Properties from '../VizConstants/GraphProperties';
import {DATA_BOUNDS_TYPE} from '../AppConstants/VitalDataConstants';

import {Crosshair, DualCrosshair} from './Crosshair';
import {t} from "i18n-js";

const MaxMinIcons = {
  [DATA_BOUNDS_TYPE.none]: {
    max: icon_16_arrow_increase_green,
    min: icon_16_arrow_decrease_green,
  },
  [DATA_BOUNDS_TYPE.normal]: {
    max: icon_16_arrow_increase_green,
    min: icon_16_arrow_decrease_green,
  },
  [DATA_BOUNDS_TYPE.yellow]: {
    max: icon_16_arrow_increase_yellow,
    min: icon_16_arrow_decrease_yellow,
  },
  [DATA_BOUNDS_TYPE.orange]: {
    max: icon_16_arrow_increase_orange,
    min: icon_16_arrow_decrease_orange,
  },
  [DATA_BOUNDS_TYPE.red]: {
    max: icon_16_arrow_increase_red,
    min: icon_16_arrow_decrease_red,
  },
};

export function MinMaxScatterPlotLegend() {
  let jsx = getLegend();

  return (
    <Svg width={Properties.SVG_WIDTH} height={30}>
      {jsx}
    </Svg>
  );
}

export function MinMaxScatterPlot({
  data,
  startTs,
  endTs,
  vitalType,
  onInteract,
  hourly,
}) {
  const crosshairRef = useRef();

  const setCrosshairPosition = (circleData, yAttr, key) => {
    let positionObj = {};

    if (circleData.dualPlot) {
      positionObj = {
        x1: circleData.cx,
        x2: circleData.cx,
        ...yAttr,

        cx: circleData.cx,
        cy1: circleData.cy1,
        cy2: circleData.cy2,
        dualPlot: true,
        show: true,
        ...key,
      };
    } else {
      positionObj = {
        x1: circleData.cx,
        x2: circleData.cx,
        ...yAttr,

        cx: circleData.cx,
        cy: circleData.cy,

        show: true,
        ...key,
      };
    }
    crosshairRef.current.setPosition(positionObj);

    if (onInteract) {
      onInteract({
        ...circleData,
        convertGlucoseData: data.convertGlucoseData,
        key: key,
      });
    }
  };

  function drawScatter(scatterPlotData) {
    let count = 1;
    let jsx = scatterPlotData.map((circleData, key) => {
      if (circleData.dualPlot) {
        return (
          <>
            <Circle
              key={count++}
              cx={circleData.cx}
              cy={circleData.cy1}
              r={circleData.radius}
              stroke={circleData.stroke}
              fill={circleData.filly1}
              strokeWidth={circleData.strokeWidth}
              onPress={() => {
                setCrosshairPosition(circleData, focusSelectorYPlotData, key);
              }}
            />

            <Circle
              key={count++}
              cx={circleData.cx}
              cy={circleData.cy2}
              r={circleData.radius}
              stroke={circleData.stroke}
              fill={circleData.filly2}
              strokeWidth={circleData.strokeWidth}
              onPress={() => {
                setCrosshairPosition(circleData, focusSelectorYPlotData, key);
              }}
            />
          </>
        );
      } else {
        return (
          <Circle
            key={count++}
            cx={circleData.cx}
            cy={circleData.cy}
            r={circleData.radius}
            stroke={circleData.stroke}
            fill={circleData.fill}
            strokeWidth={circleData.strokeWidth}
            onPress={() => {
              setCrosshairPosition(circleData, focusSelectorYPlotData, key);
            }}
          />
        );
      }
    });

    return <>{jsx}</>;
  }

  //CREATE X-SCALES
  let X_SCALE = getScaleX(data, hourly);

  //CREATE Y-SCALE
  let Y_SCALE = getScaleY(data, hourly);

  //X AND Y AXIS PLOT VALUES
  let XaxisTicks = getXAxisTicks(data, X_SCALE, hourly);
  let YaxisTicks = getYAxisTicks(data, Y_SCALE, hourly);

  //GET HORIZONTAL LINES PLOT VALUES
  let lineplotData = getHorizontalLinePlotData(data, X_SCALE, Y_SCALE, hourly);

  //GET CURRENT WEEK LINE PLOT VALUES
  let currentLinePlotData = getCurrentLinePlotData(
    data,
    X_SCALE,
    Y_SCALE,
    hourly,
  ); //This needs to be specifically handled for BP
  let previousLinePlotData = data.renderPreviousLine
    ? getPreviousLinePlotData(data, X_SCALE, Y_SCALE, hourly)
    : null; //This needs to be specifically handled for BP

  let maxminLineData = getMaxMinLineData(data, X_SCALE, Y_SCALE, hourly);
  let maxScatterPlotData =
    !hourly && !data.dualPlot
      ? getMaxScatterPlotData(data, X_SCALE, Y_SCALE, hourly)
      : [];
  let minScatterPlotData =
    !hourly && !data.dualPlot
      ? getMinScatterPlotData(data, X_SCALE, Y_SCALE, hourly)
      : [];

  let averageScatterPlotData = getAverageScatterPlotData(
    data,
    X_SCALE,
    Y_SCALE,
    hourly,
  );

  let xAxisJsx = createAxisX(XaxisTicks);
  let yAxisJsx = createAxisY(YaxisTicks);
  let lineJsx = drawLines(lineplotData);

  let currentLinePathJsx = currentLinePlotData ? (
    drawPath(currentLinePlotData)
  ) : (
    <></>
  ); //This needs to be specifically handled for BP
  let previousLinePathJsx =
    data.renderPreviousLine && previousLinePlotData ? (
      drawPath(previousLinePlotData)
    ) : (
      <></>
    ); //This needs to be specifically handled for BP

  let maxMinLineJsx =
    maxminLineData && maxminLineData.length > 0 ? (
      drawLines(maxminLineData)
    ) : (
      <></>
    );

  let maxScatterPlotJsx =
    !hourly && maxScatterPlotData && maxScatterPlotData.length > 0 ? (
      drawIndicators(maxScatterPlotData)
    ) : (
      <></>
    );
  let minScatterPlotJsx =
    !hourly && minScatterPlotData && minScatterPlotData.length > 0 ? (
      drawIndicators(minScatterPlotData)
    ) : (
      <></>
    );

  let averageScatterPlotJsx =
    averageScatterPlotData && averageScatterPlotData.length > 0 ? (
      drawScatter(averageScatterPlotData)
    ) : (
      <></>
    );

  let focusSelectorYPlotData = getFocusSelectorYPlotData(
    data,
    X_SCALE,
    Y_SCALE,
    hourly,
  );
  let lastData = hourly ? data.lastHourData : data.lastDayData;
  let crossHairData = getCrosshairData(
    lastData,
    X_SCALE,
    Y_SCALE,
    focusSelectorYPlotData,
    data.dualPlot,
  );

  let graphJsx = (
    <Svg width={Properties.SVG_WIDTH} height={Properties.SVG_HEIGHT}>
      <G
        transform={{
          translate:
            Properties.PADDING_HORIZONTAL + ', ' + Properties.PADDING_VERTICAL,
        }}>
        {/*DRAW Crosshair at start */}
        {data.dualPlot ? (
          <DualCrosshair ref={crosshairRef} initData={crossHairData} />
        ) : (
          <Crosshair ref={crosshairRef} initData={crossHairData} />
        )}

        {xAxisJsx}
        {yAxisJsx}
        {lineJsx}

        {maxMinLineJsx}

        {maxScatterPlotJsx}
        {minScatterPlotJsx}

        {previousLinePathJsx}
        {currentLinePathJsx}

        {averageScatterPlotJsx}
      </G>
    </Svg>
  );

  return graphJsx;
}

//Get focus selector Y axis configurations
function getFocusSelectorYPlotData(data, X_SCALE, Y_SCALE, hourly) {
  let scaleData = hourly
    ? data.scatterScaleHour.axisY
    : data.scatterScale.axisY;
  return {y1: Y_SCALE(scaleData.start.value), y2: Y_SCALE(scaleData.end.value)};
}

function getCrosshairData(
  _data,
  X_SCALE,
  Y_SCALE,
  focusSelectorYPlotData,
  dualPlot = false,
) {
  if (!_data) {
    return null;
  }

  let circleData = getCirclePlotValue(_data, X_SCALE, Y_SCALE, dualPlot);
  let crosshairData = {};
  //circleData && Added By Yash Need To Recheck Failing For BP
  if (dualPlot) {
    crosshairData = {
      x1: circleData && circleData.cx,
      x2: circleData && circleData.cx,
      ...focusSelectorYPlotData,

      cx: circleData && circleData.cx,
      cy1: circleData && circleData.cy1,
      cy2: circleData && circleData.cy2,
      dualPlot,
      show: true,
    };
  } else {
    crosshairData = {
      x1: circleData && circleData.cx,
      x2: circleData && circleData.cx,
      ...focusSelectorYPlotData,

      cx: circleData && circleData.cx,
      cy: circleData && circleData.cy,

      show: true,
    };
  }

  return crosshairData;
}

function getLegend() {
  let jsx = (
    <G transform={{translate: Properties.PADDING_HORIZONTAL + 20 + ', ' + 0}}>
      <Line
        x1={0}
        y1={20}
        x2={30}
        y2={20}
        stroke={Properties.PATH_CURRENT_COLOR}
        strokeWidth={2.5}
      />
      <Text fill={'#000'} x={35} y={25} fontSize={12}>
        {t('graphComponents.thisWeek')}
      </Text>
      <Line
        x1={120}
        y1={20}
        x2={150}
        y2={20}
        stroke={Properties.PATH_PREVIOUS_COLOR}
        strokeWidth={2}
      />
      <Text fill={'#000'} x={155} y={25} fontSize={12}>
        {t('graphComponents.prevWeek')}
      </Text>
    </G>
  );

  return jsx;
}

//Get X axis scale function
function getScaleX(data, hourly) {
  let _domainArr = hourly
    ? Object.keys(data.scatterScaleHour.axisX)
    : Object.keys(data.scatterScale.axisX);
  return d3scale
    .scaleBand()
    .domain(_domainArr)
    .range([0, Properties.GRAPH_WIDTH])
    .padding(hourly ? 0.2 : 0.4);
}

//GET Y axis scale function
function getScaleY(data, hourly) {
  let scale = hourly ? data.scatterScaleHour.axisY : data.scatterScale.axisY;
  return d3scale
    .scaleLinear()
    .domain([scale.start.value, scale.end.value])
    .range([Properties.GRAPH_HEIGHT, 0]);
}

function getXAxisTicks(data, X_SCALE, hourly) {
  let scaleData = hourly
    ? data.scatterScaleHour.axisX
    : data.scatterScale.axisX;
  let chartXAxisValues = Object.keys(scaleData);

  let xAxisTicks = [];

  chartXAxisValues.forEach((item) => {
    xAxisTicks.push({
      x: X_SCALE(item),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      labelSpacingX: (-1 * X_SCALE.bandwidth()) / 3,
      font: Properties.MAIN_FONT,
      text: scaleData[item].label,
      textAnchor: 'start',
    });
  });
  return xAxisTicks;
}

function getYAxisTicks(data, Y_SCALE, hourly) {
  let scaleData = hourly
    ? data.scatterScaleHour.axisY
    : data.scatterScale.axisY;
  let chartXAxisValues = Object.keys(scaleData);

  let yAxisTicks = [];

  chartXAxisValues.forEach((key) => {
    let item = scaleData[key];

    let attr = null;

    if (key == 'scale_label') {
      attr = {
        x: 0,
        y: Y_SCALE(item.value),
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE + 5,
        labelSpacing: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_VERTICAL,
        labelSpacingY: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_HORIZONTAL + 2,
        labelSpacingRelative: -1 * Properties.DY_AXIS_LABEL_SPACING * 2,
        font: Properties.MAIN_FONT,
        rotate: -90,
        bold: true,
        text: item.label,
      };
    } else {
      attr = {
        x: 0,
        y: Y_SCALE(item.value),
        color: Properties.AXIS_LABEL_COLOR,
        fontSize: Properties.AXIS_LABEL_FONT_SIZE,
        labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
        labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
        font: Properties.MAIN_FONT,
        text: item.label,
      };
    }

    yAxisTicks.push(attr);
  });

  return yAxisTicks;
}

function getHorizontalLinePlotData(data, X_SCALE, Y_SCALE, hourly) {
  let msg = hourly ? 'Hey' : 'Hi';

  let xScaleData = hourly
    ? data.scatterScaleHour.axisX
    : data.scatterScale.axisX;
  let yScaleData = hourly
    ? data.scatterScaleHour.axisY
    : data.scatterScale.axisY;

  let lastItemKey = hourly
    ? data.hourBucketKeys[data.hourBucketKeys.length - 1]
    : data.bucketKeys[data.bucketKeys.length - 1];

  let xScaleLastItem = xScaleData[lastItemKey];
  let yAxisKeys = Object.keys(yScaleData);

  var plotData = [];

  let extendedLineLength = X_SCALE.bandwidth();

  yAxisKeys.forEach((key) => {
    if (key == 'scale_label') {
      return;
    }

    let item = yScaleData[key];
    plotData.push({
      x1: 0,
      y1: Y_SCALE(item.value),
      x2: X_SCALE(xScaleLastItem.value) + extendedLineLength,
      y2: Y_SCALE(item.value),
      color:
        key == 'actual_start' || key == 'actual_end'
          ? Properties.WARNING_LINE_COLOR
          : Properties.LINE_COLOR,
      isDashed: key == 'actual_start' || key == 'actual_end',
      dashWidth: Properties.WARNING_LINE_DASH,
    });
  });

  return plotData;
}

//Get current average line plot path data
function getCurrentLinePlotData(data, X_SCALE, Y_SCALE, hourly) {
  let __data = hourly ? data.hourLinePathData : data.linePathData;

  if (!__data || __data.length == 0) {
    return null;
  }

  return getLinePlotPathAttr(__data, X_SCALE, Y_SCALE, data.dualPlot);
}

//Get current average line plot path data
function getPreviousLinePlotData(data, X_SCALE, Y_SCALE, hourly) {
  let __data = hourly
    ? data.previousHourLinePathData
    : data.previousLinePathData;

  if (!__data || __data.length == 0) {
    return null;
  }

  let pathAttr = getLinePlotPathAttr(__data, X_SCALE, Y_SCALE, data.dualPlot);
  pathAttr.strokeWidth = 2;
  pathAttr.stroke = Properties.PATH_PREVIOUS_COLOR;

  return pathAttr;
}

function getLinePlotPathAttr(__data, X_SCALE, Y_SCALE, dualPlot) {
  if (dualPlot) {
    return {
      pathSys: d3shape
        .line()
        .x((d) => X_SCALE(d.x))
        .y((d) => Y_SCALE(d.fallbacky1 ? d.fallbacky1 : d.y1))(__data),
      pathDia: d3shape
        .line()
        .x((d) => X_SCALE(d.x))
        .y((d) => Y_SCALE(d.fallbacky2 ? d.fallbacky2 : d.y2))(__data),
      stroke: Properties.PATH_CURRENT_COLOR,
      strokeWidth: 3,
      fill: 'none',
      dualPlot,
    };
  } else {
    return {
      path: d3shape
        .line()
        .x((d) => X_SCALE(d.x))
        .y((d) => Y_SCALE(d.fallback ? d.fallback : d.y))(__data),
      stroke: Properties.PATH_CURRENT_COLOR,
      strokeWidth: 3,
      fill: 'none',
    };
  }
}

//Get maximum minimum connected lines plot data
function getMaxMinLineData(data, X_SCALE, Y_SCALE, hourly) {
  let lineplotdata = [];

  let minmaxLineData = hourly ? data.hourMinmaxLineData : data.minmaxLineData;

  if (!minmaxLineData || minmaxLineData.length == 0) {
    return lineplotdata;
  }

  minmaxLineData.forEach((_data) => {
    let fallbacky1 = 0;
    let fallbacky2 = 0;

    if (_data.fallbacky1 == 0) {
      fallbacky1 = _data.fallback;
    } else {
      fallbacky1 = _data.fallbacky1 ? _data.fallbacky1 : _data.y1;
    }

    if (_data.fallbacky2 == 0) {
      fallbacky2 = _data.fallback;
    } else {
      fallbacky2 = _data.fallbacky2 ? _data.fallbacky2 : _data.y2;
    }

    lineplotdata.push({
      x1: X_SCALE(_data.x1),
      y1: Y_SCALE(fallbacky1),
      x2: X_SCALE(_data.x2),
      y2: Y_SCALE(fallbacky2),
      color: Properties.LINE_COLOR,
      isDashed: true,
      dashWidth: Properties.NORMAL_LINE_DASH,
    });
  });

  return lineplotdata;
}

function getAverageScatterPlotData(data, X_SCALE, Y_SCALE, hourly) {
  let dualPlot = data.dualPlot;

  let plotdata = [];

  let scatterPlotData = hourly
    ? data.hourScatterPlotData
    : data.scatterPlotData;

  if (!scatterPlotData || scatterPlotData.length == 0) {
    return plotdata;
  }

  scatterPlotData.forEach((_data) => {
    let circlePlotData = getCirclePlotValue(_data, X_SCALE, Y_SCALE, dualPlot);

    if (circlePlotData) plotdata.push(circlePlotData);
  });

  return plotdata;
}

function getCirclePlotValue(_data, X_SCALE, Y_SCALE, dualPlot) {
  let thisPlotData = null;
  if (dualPlot) {
    if (_data.y1 == 0 && _data.y2 == 0) {
      return thisPlotData;
    }

    thisPlotData = {
      cx: X_SCALE(_data.x),
      cy1: Y_SCALE(_data.fallbacky1 ? _data.fallbacky1 : _data.y1),
      cy2: Y_SCALE(_data.fallbacky2 ? _data.fallbacky2 : _data.y2),
      meta: _data,
      ...Properties.CIRCLE_STYLES,
      filly1: getMeasureColor(_data.measureColorSys),
      filly2: getMeasureColor(_data.measureColorDia),
      dualPlot,
    };
  } else {
    if (_data.y == 0) {
      return thisPlotData;
    }

    thisPlotData = {
      cx: X_SCALE(_data.x),
      cy: Y_SCALE(_data.fallback ? _data.fallback : _data.y),
      meta: _data,
      ...Properties.CIRCLE_STYLES,
      fill: getMeasureColor(_data.measureColor),
    };
  }

  return thisPlotData;
}

function getMaxScatterPlotData(data, X_SCALE, Y_SCALE) {
  let plotdata = [];

  let scatterPlotData = data.maxScatterData;

  if (!scatterPlotData || scatterPlotData.length == 0) {
    return plotdata;
  }

  scatterPlotData.forEach((_data) => {
    if (_data.fallback == 0 || _data.skipMax) {
      return;
    }

    plotdata.push({
      x: X_SCALE(_data.x) - 8,
      y: Y_SCALE(_data.fallback ? _data.fallback : _data.y) - 4,
      icon: MaxMinIcons[_data.measureColor].max,
      width: 16,
      height: 16,
    });
  });

  return plotdata;
}

function getMinScatterPlotData(data, X_SCALE, Y_SCALE) {
  let plotdata = [];

  let scatterPlotData = data.minScatterData;

  if (!scatterPlotData || scatterPlotData.length == 0) {
    return plotdata;
  }

  scatterPlotData.forEach((_data) => {
    if (_data.fallback == 0 || _data.skipMin) {
      return;
    }

    plotdata.push({
      x: X_SCALE(_data.x) - 8,
      y: Y_SCALE(_data.fallback ? _data.fallback : _data.y) - 4,
      icon: MaxMinIcons[_data.measureColor].min,
      width: 16,
      height: 16,
    });
  });

  return plotdata;
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
  return (
    <G key={key} transform={{translate: tick.x + ',' + 0}}>
      <Text
        fill={tick.color}
        x={tick.labelSpacingX}
        y={tick.labelSpacing}
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

function drawLines(lineplotData) {
  var count = 1;

  let jsx = Object.keys(lineplotData).map((key) => {
    let lineData = lineplotData[key];
    return drawlLineSegment(count++, lineData);
  });

  return <>{jsx}</>;
}

function drawlLineSegment(key, lineData) {
  let jsx = lineData.isDashed ? (
    <Line
      key={key}
      x1={lineData.x1}
      y1={lineData.y1}
      x2={lineData.x2}
      y2={lineData.y2}
      stroke={lineData.color}
      strokeDasharray={[lineData.dashWidth, lineData.dashWidth]}
    />
  ) : (
    <Line
      key={key}
      x1={lineData.x1}
      y1={lineData.y1}
      x2={lineData.x2}
      y2={lineData.y2}
      stroke={lineData.color}
    />
  );

  return <>{jsx}</>;
}

function drawIndicators(plotData) {
  var count = 1;

  let jsx = Object.keys(plotData).map((key) => {
    let _data = plotData[key];
    return drawIcon(count++, _data);
  });

  return <>{jsx}</>;
}

function drawIcon(key, iconData) {
  return (
    <Image
      key={key}
      href={iconData.icon}
      x={iconData.x}
      y={iconData.y}
      width={iconData.width}
      height={iconData.height}
    />
  );
}

function drawPath(pathAttr) {
  let jsx = <></>;

  if (pathAttr.dualPlot) {
    jsx = (
      <>
        <Path
          key={1}
          d={pathAttr.pathSys}
          stroke={pathAttr.stroke}
          strokeWidth={pathAttr.strokeWidth}
          fill={pathAttr.fill}
        />
        <Path
          key={2}
          d={pathAttr.pathDia}
          stroke={pathAttr.stroke}
          strokeWidth={pathAttr.strokeWidth}
          fill={pathAttr.fill}
        />
      </>
    );
  } else {
    jsx = (
      <Path
        d={pathAttr.path}
        stroke={pathAttr.stroke}
        strokeWidth={pathAttr.strokeWidth}
        fill={pathAttr.fill}
      />
    );
  }

  return jsx;
}
