import React, {useRef, useState, useEffect} from 'react';
import {Animated} from 'react-native';
import * as d3scale from 'd3-scale';
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
import SingleToolTip from './DayToolTip/SingleToolTip';
import ToolTipSys from './DualToolTips/ToolTipSys';
import ToolTipDia from './DualToolTips/TooltipDia';
import * as Properties from '../VizConstants/GraphProperties';
import * as shape from 'd3-shape';
import {
  stepsIcon,
  mealsLiteIcon,
  mealsMediumIcon,
  mealsHeavyIcon,
} from '../AppIcons/VizIcons';
import {getMeasureColor, toMMOL} from '../../utils/MeasureVizUtils';
import {
  Line as MyLine,
  Chart,
  Tooltip,
} from 'react-native-responsive-linechart';
const d3 = {shape};
import {Crosshair, DualCrosshair} from './Crosshair';
import moment from 'moment';
import ZoomableSvg from 'zoomable-svg';

export default function DailyScatterPlot({
  data,
  startTs,
  endTs,
  vitalType,
  onInteract,
}) {
  const crosshairRef = useRef();
  const [type, settype] = useState(1);
  const [constrain, setconstrain] = useState(true);
  const [constraints, setconstraints] = useState({
    combine: 'dynamic',
    scaleExtent: [Properties.SVG_WIDTH / Properties.SVG_HEIGHT, 5],
    translateExtent: [
      [0, 0],
      [100, 100],
    ],
  });
  const [initAnim, setinitAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(
      // Animate over time
      initAnim,
      {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      },
    ).start();
  }, []);

  let translateRectY = initAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0', '50'],
  });

  const setCrosshairPosition = (circleData, yAttr) => {
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
      };
    } else {
      positionObj = {
        x1: circleData.cx,
        x2: circleData.cx,
        ...yAttr,

        cx: circleData.cx,
        cy: circleData.cy,

        show: true,
      };
    }
    crosshairRef.current.setPosition(positionObj);

    circleData.convertGlucoseData = data.convertGlucoseData;

    if (onInteract) {
      onInteract(circleData);
    }
  };

  //CREATE X-SCALES
  let X_SCALE = getScaleX(data);

  //CREATE Y-SCALE
  let Y_SCALE = getScaleY(data);

  //X AND Y AXIS PLOT VALUES
  let XaxisTicks = getXAxisTicks(data, X_SCALE);
  let YaxisTicks = getYAxisTicks(data, Y_SCALE);

  //GET HORIZONTAL LINES PLOT VALUES
  let lineplotData = getHorizontalLinePlotData(data, X_SCALE, Y_SCALE);

  //GET SCATTER PLOT VALUES
  var scatterPlotData = getVitalDataScatterPlotValues(data, X_SCALE, Y_SCALE);

  //WARNING RECTANGLE LOW DATA
  var warningDataTopPlotData = getWarningDataTopValues(data, X_SCALE, Y_SCALE);

  //WARNING RECTANGLE HIGH DATA
  var warningDataBottomPlotData = getWarningDataBottomValues(
    data,
    X_SCALE,
    Y_SCALE,
  );

  //Get Meal PLOT VALUES
  var mealsPlotData = getMealDataPlotValues(data, X_SCALE, Y_SCALE);

  //GET Step PLOT VALUES
  var stepsPlotData = getStepsDataPlotValues(data, X_SCALE, Y_SCALE);

  //GET Fasting PLOT VALUES
  var fastingPlotData = getFastingDataPlotValues(data, X_SCALE, Y_SCALE);

  var focusSelectorYPlotData = getFocusSelectorYPlotData(
    data,
    X_SCALE,
    Y_SCALE,
  );
  var crossHairData = getCrosshairData(
    data.lastData,
    X_SCALE,
    Y_SCALE,
    focusSelectorYPlotData,
    data.dualPlot,
  );

  const onToggle = () => {
    settype((type + 1) % constraintCombinations.length);
    setconstrain((type + 1) % constraintCombinations.length !== 0);
    setconstraints((value) => ({
      ...value,
      combine: constraintCombinations[nextType],
    }));
  };

  const constraintCombinations = [
    'none',
    'dynamic',
    'static',
    'union',
    'intersect',
  ];

  let graphComponent = (
    <Svg width={Properties.SVG_WIDTH} height={Properties.SVG_HEIGHT}>
      <G
        transform={{
          translate:
            Properties.PADDING_HORIZONTAL + ', ' + Properties.PADDING_VERTICAL,
        }}>
        {/*DEFINE PATTERNS AND LINEAR GRADIENT CONFIGURATIONS*/}
        <Defs>
          <Pattern
            id="stripes"
            x="0"
            y="0"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)">
            <Rect
              x="0"
              y="0"
              width="1"
              height="10"
              stroke="none"
              fill={Properties.SELECTOR_AND_BLUE_SHADE_COLOR}
            />
          </Pattern>

          <LinearGradient
            id="warningShadeTop"
            x1="0%"
            y1="70%"
            x2="0%"
            y2="0%"
            spreadMethod="pad">
            <Stop
              offset="0%"
              stopColor={Properties.WARNING_RECTANGLE_SHADE.deep}
              stopOpacity="1"
            />
            <Stop
              offset="100%"
              stopColor={Properties.WARNING_RECTANGLE_SHADE.lite}
              stopOpacity="1"
            />
          </LinearGradient>

          <LinearGradient
            id="warningShadeBottom"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="70%"
            spreadMethod="pad">
            <Stop
              offset="0%"
              stopColor={Properties.WARNING_RECTANGLE_SHADE.deep}
              stopOpacity="1"
            />
            <Stop
              offset="100%"
              stopColor={Properties.WARNING_RECTANGLE_SHADE.lite}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>

        {/*DRAW Crosshair at start */}
        {/* {data.dualPlot ? null : (
          <Path d={line} fill={'red'} stroke="red" strokeWidth="2" />
        )} */}
        {data.dualPlot ? (
          <DualCrosshair ref={crosshairRef} initData={crossHairData} />
        ) : (
          <Crosshair ref={crosshairRef} initData={crossHairData} />
        )}

        {/*DRAW X-AXIS*/}
        <G
          transform={{translate: 0 + ', ' + Properties.GRAPH_HEIGHT}}
          textAnchor={'middle'}
          fontFamily={Properties.MAIN_FONT}>
          {Object.keys(XaxisTicks).map((key) => {
            let tick = XaxisTicks[key];
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
          })}
        </G>

        {/*DRAW Y-AXIS*/}
        <G textAnchor={'end'} fontFamily={Properties.MAIN_FONT}>
          {Object.keys(YaxisTicks).map((key) => {
            let tick = YaxisTicks[key];

            if (key == 'label') {
              return (
                <G key={key} transform={{translate: 0 + ', ' + tick.y}}>
                  <Text
                    fill={tick.color}
                    x={tick.labelSpacing}
                    dy={tick.labelSpacingRelative}
                    fontSize={tick.fontSize}
                    y={tick.labelSpacingY}
                    rotation={tick.rotate}
                    fontWeight={'bold'}>
                    {tick.text}
                  </Text>
                </G>
              );
            } else {
              return (
                <G key={key} transform={{translate: 0 + ', ' + tick.y}}>
                  <Text
                    fill={tick.color}
                    x={tick.labelSpacing}
                    dy={tick.labelSpacingRelative}
                    fontSize={tick.fontSize}>
                    {tick.text}
                  </Text>
                </G>
              );
            }
          })}
        </G>

        {/*DRAW Horizontal lines and warning lines*/}
        {Object.keys(lineplotData).map((key) => {
          let lineData = lineplotData[key];
          if (key == 'warningHigh' || key == 'warningLow') {
            return (
              <Line
                key={key}
                x1={lineData.x1}
                y1={lineData.y1}
                x2={lineData.x2}
                y2={lineData.y2}
                stroke={lineData.color}
                strokeDasharray={[lineData.dashWidth, lineData.dashWidth]}
              />
            );
          } else {
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
        })}

        {/*DRAW Meal vertical lines*/}
        {mealsPlotData.lineArr.map((mealLineData, key) => {
          return (
            <Line
              key={key}
              x1={mealLineData.x1}
              y1={mealLineData.y1}
              x2={mealLineData.x2}
              y2={mealLineData.y2}
              stroke={mealLineData.color}
              strokeDasharray={[mealLineData.dashWidth, mealLineData.dashWidth]}
            />
          );
        })}

        {/*DRAW Meal icons*/}
        {mealsPlotData.plotArr.map((mealIconData, key) => {
          return (
            <Image
              key={key}
              href={mealIconData.icon}
              x={mealIconData.x}
              y={mealIconData.y}
              width={mealIconData.width}
              height={mealIconData.height}
            />
          );
        })}

        {/*DRAW Steps icon*/}
        {stepsPlotData.plotArr.map((stepsIconData, key) => {
          return (
            <Image
              key={key}
              href={stepsIconData.icon}
              x={stepsIconData.x}
              y={stepsIconData.y}
              width={stepsIconData.width}
              height={stepsIconData.height}
            />
          );
        })}

        {/*DRAW Steps Rectangle*/}
        {stepsPlotData.rectArr.map((stepsRectData, key) => {
          let rectWidth = stepsRectData.x2 - stepsRectData.x1;
          let rectHeight = stepsRectData.y1 - stepsRectData.y2;
          return (
            <Rect
              key={key}
              x={stepsRectData.x}
              y={stepsRectData.y}
              width={rectWidth}
              height={rectHeight}
              rx={stepsRectData.rx ? stepsRectData.rx : 0}
              ry={stepsRectData.ry ? stepsRectData.ry : 0}
              stroke={stepsRectData.stroke}
              fill={stepsRectData.fill}
              strokeWidth={stepsRectData.strokeWidth}
            />
          );
        })}

        {/*DRAW Fasting Rectangles*/}
        {fastingPlotData.map((_fastingPlotData, key) => {
          let rectWidth =
            _fastingPlotData.background.x2 - _fastingPlotData.background.x1;
          let rectHeight =
            _fastingPlotData.background.y1 - _fastingPlotData.background.y2;
          return (
            <Rect
              key={key}
              x={_fastingPlotData.background.x}
              y={_fastingPlotData.background.y}
              width={rectWidth}
              height={rectHeight}
              rx={
                _fastingPlotData.background.rx
                  ? _fastingPlotData.background.rx
                  : 0
              }
              ry={
                _fastingPlotData.background.ry
                  ? _fastingPlotData.background.ry
                  : 0
              }
              stroke={_fastingPlotData.background.stroke}
              fill={_fastingPlotData.background.fill}
              strokeWidth={_fastingPlotData.background.strokeWidth}
            />
          );
        })}
        {fastingPlotData.map((_fastingPlotData, key) => {
          let rectWidth =
            _fastingPlotData.foreground.x2 - _fastingPlotData.foreground.x1;
          let rectHeight =
            _fastingPlotData.foreground.y1 - _fastingPlotData.foreground.y2;
          return (
            <Rect
              key={key}
              x={_fastingPlotData.foreground.x}
              y={_fastingPlotData.foreground.y}
              width={rectWidth}
              height={rectHeight}
              rx={
                _fastingPlotData.foreground.rx
                  ? _fastingPlotData.foreground.rx
                  : 0
              }
              ry={
                _fastingPlotData.foreground.ry
                  ? _fastingPlotData.foreground.ry
                  : 0
              }
              stroke={_fastingPlotData.foreground.stroke}
              fill={_fastingPlotData.foreground.fill}
              strokeWidth={_fastingPlotData.foreground.strokeWidth}
            />
          );
        })}

        {/*DRAW upper lower warning Rectangles*/}
        {warningDataTopPlotData.map((plotData, key) => {
          let rectWidth = plotData.x2 - plotData.x1;
          let rectHeight = plotData.y1 - plotData.y2;
          return (
            <Rect
              key={key}
              x={plotData.x}
              y={plotData.y}
              width={rectWidth}
              height={rectHeight}
              rx={plotData.rx ? plotData.rx : 0}
              ry={plotData.ry ? plotData.ry : 0}
              stroke={plotData.stroke}
              fill={plotData.fill}
              strokeWidth={plotData.strokeWidth}
            />
          );
        })}
        {warningDataBottomPlotData.map((plotData, key) => {
          let rectWidth = plotData.x2 - plotData.x1;
          let rectHeight = plotData.y1 - plotData.y2;
          return (
            <Rect
              key={key}
              x={plotData.x}
              y={plotData.y}
              width={rectWidth}
              height={rectHeight}
              rx={plotData.rx ? plotData.rx : 0}
              ry={plotData.ry ? plotData.ry : 0}
              stroke={plotData.stroke}
              fill={plotData.fill}
              strokeWidth={plotData.strokeWidth}
            />
          );
        })}

        {/*DRAW Scatter plot connected lines in case of BP if any */}
        {scatterPlotData.lineArr.map((lineAttr, key) => {
          return (
            <Line
              key={key}
              x1={lineAttr.x1}
              y1={lineAttr.y1}
              x2={lineAttr.x2}
              y2={lineAttr.y2}
              stroke={lineAttr.color}
              strokeDasharray={[lineAttr.dashWidth, lineAttr.dashWidth]}
            />
          );
        })}
        {/*DRAW Scatter circles*/}
        {scatterPlotData.plotArr.map((circleData, key) => {
          if (circleData.dualPlot) {
            return (
              <>
                <Circle
                  key={key + '_' + 1}
                  cx={circleData.cx}
                  cy={circleData.cy1}
                  r={circleData.radius}
                  stroke={circleData.stroke}
                  fill={circleData.filly1}
                  strokeWidth={circleData.strokeWidth}
                  onPress={() => {
                    setCrosshairPosition(circleData, focusSelectorYPlotData);
                  }}
                />

                <Circle
                  key={key + '_' + 2}
                  cx={circleData.cx}
                  cy={circleData.cy2}
                  r={circleData.radius}
                  stroke={circleData.stroke}
                  fill={circleData.filly2}
                  strokeWidth={circleData.strokeWidth}
                  onPress={() => {
                    setCrosshairPosition(circleData, focusSelectorYPlotData);
                  }}
                />
              </>
            );
          } else {
            return (
              <Circle
                key={key}
                cx={circleData.cx}
                cy={circleData.cy}
                r={circleData.radius}
                stroke={circleData.stroke}
                fill={circleData.fill}
                strokeWidth={circleData.strokeWidth}
                onPress={() => {
                  setCrosshairPosition(circleData, focusSelectorYPlotData);
                }}
              />
            );
          }
        })}
      </G>
    </Svg>
  );

  // <Svg height="500" width="1000">
  //     <G transform={{translate : "100,50"}}>
  //         <Line x1="0" y1="0" x2="200" y2="0" stroke="#060" />

  //         <Rect x="0" y="0" height="50" width="80" stroke="#060" fill="#060" />
  //          <Circle  r={30} stroke={"black"} strokeWidth={"3"} fill="red" />
  //     </G>
  // </Svg>

  // return graphComponent;
  return (
    <ZoomableSvg
      align="mid"
      vbWidth={100}
      vbHeight={100}
      width={Properties.SVG_WIDTH}
      height={Properties.SVG_HEIGHT}
      initialTop={-20}
      initialLeft={-50}
      initialZoom={1.2}
      doubleTapThreshold={300}
      meetOrSlice="meet"
      svgRoot={graphComponent}
      childProps={{
        onToggle,
      }}
      constrain={constrain ? constraints : null}
    />
  );
}

/****************************************************END OF REACT COMPONENT | PLOT FORMATTER METHODS STARTS HERE ***********************************************************/

//Get focus selector Y axis configurations
function getFocusSelectorYPlotData(data, X_SCALE, Y_SCALE) {
  return {
    y1: Y_SCALE(data.vital_scale.start.value),
    y2: Y_SCALE(data.vital_scale.end.value),
  };
}

function getCrosshairData(
  data,
  X_SCALE,
  Y_SCALE,
  focusSelectorYPlotData,
  dualPlot = false,
) {
  if (!data) {
    return null;
  }

  let circleData = getCirclePlotValue(data, X_SCALE, Y_SCALE, dualPlot);
  let crosshairData = {};

  if (dualPlot) {
    crosshairData = {
      x1: circleData.cx,
      x2: circleData.cx,
      ...focusSelectorYPlotData,

      cx: circleData.cx,
      cy1: circleData.cy1,
      cy2: circleData.cy2,
      dualPlot,
      show: true,
    };
  } else {
    crosshairData = {
      x1: circleData.cx,
      x2: circleData.cx,
      ...focusSelectorYPlotData,

      cx: circleData.cx,
      cy: circleData.cy,

      show: true,
    };
  }

  return crosshairData;
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

//Get ticks and label info for X Axis
function getXAxisTicks(data, X_SCALE) {
  return {
    start: {
      x: X_SCALE(data.date_scale.ts_scale_start.date),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.date_scale.ts_scale_start.label,
    },
    mid: {
      x: X_SCALE(data.date_scale.ts_scale_mid.date),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.date_scale.ts_scale_mid.label,
    },
    end: {
      x: X_SCALE(data.date_scale.ts_scale_end.date),
      y: 0,
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: Properties.X_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DX_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.date_scale.ts_scale_end.label,
    },
  };
}

//Get ticks and label info for Y axis
function getYAxisTicks(data, Y_SCALE) {
  return {
    start: {
      x: 0,
      y: Y_SCALE(data.vital_scale.actual_start.value),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.actual_start.label,
    },
    mid: {
      x: 0,
      y: Y_SCALE(data.vital_scale.mid.value),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.mid.label,
    },
    end: {
      x: 0,
      y: Y_SCALE(data.vital_scale.actual_end.value),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.actual_end.label,
    },
    meal: {
      x: 0,
      y: Y_SCALE(data.vital_scale.meals.line),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.meals.label,
    },
    fasting: {
      x: 0,
      y: Y_SCALE(data.vital_scale.fasting.line),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.fasting.label,
    },
    activity: {
      x: 0,
      y: Y_SCALE(data.vital_scale.activity.line),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE,
      labelSpacing: -1 * Properties.Y_AXIS_LABEL_SPACING,
      labelSpacingRelative: Properties.DY_AXIS_LABEL_SPACING,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.activity.label,
    },
    label: {
      x: 0,
      y: Y_SCALE(data.vital_scale.vital_scale_label.value),
      color: Properties.AXIS_LABEL_COLOR,
      fontSize: Properties.AXIS_LABEL_FONT_SIZE + 5,
      labelSpacing: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_VERTICAL,
      labelSpacingY: Properties.Y_AXIS_MAIN_TEXT_LABEL_SPACING_HORIZONTAL + 5,
      labelSpacingRelative: -1 * Properties.DY_AXIS_LABEL_SPACING * 2,
      font: Properties.MAIN_FONT,
      text: data.vital_scale.vital_scale_label.label,
      rotate: -90,
      bold: true,
    },
  };
}

//Get plot data for the horizontal lines
function getHorizontalLinePlotData(data, X_SCALE, Y_SCALE) {
  return {
    top: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.end.value),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.end.value),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    mid: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.mid.value),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.mid.value),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    zero: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.start.value),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.start.value),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    meal: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.meals.line),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.meals.line),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    fasting: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.fasting.line),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.fasting.line),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    activity: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.activity.line),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.activity.line),
      color: Properties.LINE_COLOR,
      isDashed: false,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    warningHigh: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.actual_end.value),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.actual_end.value),
      color: data.vital_scale.actual_end.warning
        ? Properties.WARNING_LINE_COLOR
        : Properties.LINE_COLOR,
      isDashed: true,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
    warningLow: {
      x1: 0,
      y1: Y_SCALE(data.vital_scale.actual_start.value),
      x2: X_SCALE(data.date_scale.ts_scale_end.date),
      y2: Y_SCALE(data.vital_scale.actual_start.value),
      color: data.vital_scale.actual_start.warning
        ? Properties.WARNING_LINE_COLOR
        : Properties.LINE_COLOR,
      isDashed: true,
      dashWidth: Properties.WARNING_LINE_DASH,
    },
  };
}

//Get plot data for icons and lines of meal
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

//get plot data for icons and rectangles for steps
function getStepsDataPlotValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];
  var rectArr = [];

  if (!data.stepsData || data.stepsData.length == 0) {
    return {plotArr, rectArr};
  }

  data.stepsData.forEach((stepData) => {
    let plot = {
      x: X_SCALE(stepData.x) - Properties.SVG_ICON_STYLE.width / 2,
      y: Y_SCALE(data.vital_scale.activity.value),
      icon: stepsIcon,
      ...Properties.SVG_ICON_STYLE,
    };

    let rect = {
      x: X_SCALE(stepData.x1),
      y: Y_SCALE(data.vital_scale.activity.value_upper),
      x1: X_SCALE(stepData.x1),
      x2: X_SCALE(stepData.x2),
      y1: Y_SCALE(data.vital_scale.activity.value_lower),
      y2: Y_SCALE(data.vital_scale.activity.value_upper),
      ...Properties.STEPS_RECTANGLE_STYLE,
    };
    plotArr.push(plot);
    rectArr.push(rect);
  });

  return {plotArr, rectArr};
}

//Get plot data for foreground and background rectangles for fasting
function getFastingDataPlotValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];

  if (!data.fastingData || data.fastingData.length == 0) {
    return plotArr;
  }

  data.fastingData.forEach((fastingData) => {
    let thisdata = {
      foreground: {
        x: X_SCALE(fastingData.x1),
        y: Y_SCALE(data.vital_scale.fasting.value_upper),
        x1: X_SCALE(fastingData.x1),
        x2: X_SCALE(fastingData.x2),
        y1: Y_SCALE(data.vital_scale.fasting.value_lower),
        y2: Y_SCALE(data.vital_scale.fasting.value_upper),
        ...Properties.FASTING_RECTANGLE_STYLE,
      },
      background: {
        x: X_SCALE(fastingData.x1),
        y: Y_SCALE(data.vital_scale.fasting.value_upper),
        x1: X_SCALE(fastingData.x1),
        x2: X_SCALE(fastingData.x2),
        y1: Y_SCALE(data.vital_scale.fasting.value_lower),
        y2: Y_SCALE(data.vital_scale.fasting.value_upper),
        ...Properties.FASTING_RECTANGLE_STYLE,
        fill: Properties.FASTING_RECTANGLE_STYLE.backgroundfill,
      },
    };
    plotArr.push(thisdata);
  });

  return plotArr;
}

function getVitalDataScatterPlotValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];
  var lineArr = [];

  var vitalData = data.plottableData;

  if (!vitalData || vitalData.length == 0) {
    console.log('No data to plot');
    return {plotArr, lineArr};
  }

  vitalData.forEach((_data) => {
    let circleAttr = getCirclePlotValue(_data, X_SCALE, Y_SCALE, data.dualPlot);

    if (circleAttr) plotArr.push(circleAttr);

    if (data.dualPlot) {
      lineArr.push({
        x1: circleAttr.cx,
        y1: circleAttr.cy1,
        x2: circleAttr.cx,
        y2: circleAttr.cy2,
        color: Properties.LINE_COLOR,
        isDashed: true,
        dashWidth: Properties.NORMAL_LINE_DASH,
      });
    }
  });

  return {plotArr, lineArr};
}

function getCirclePlotValue(data, X_SCALE, Y_SCALE, dualPlot) {
  let circleData = null;

  if (!dualPlot) {
    circleData = {
      cx: X_SCALE(data.x),
      cy: Y_SCALE(data.y),
      ts: data.ts,
      meta: data,
      ...Properties.CIRCLE_STYLES,
      fill: getMeasureColor(data.measureColor),
    };
  } else {
    circleData = {
      cx: X_SCALE(data.x),
      cy1: Y_SCALE(data.fallback_y1 ? data.fallback_y1 : data.y1),
      cy2: Y_SCALE(data.fallback_y2 ? data.fallback_y2 : data.y2),
      ts: data.ts,
      meta: data,
      dualPlot,
      ...Properties.CIRCLE_STYLES,
      filly1: getMeasureColor(data.measureColorSys),
      filly2: getMeasureColor(data.measureColorDia),
    };
  }

  return circleData;
}

//Get plot data for warning high rectangles
function getWarningDataTopValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];

  var warningData = data.warningDataHigh;

  if (!warningData || warningData.length == 0) {
    console.log('No warning high data to plot');
    return plotArr;
  }

  warningData.forEach((thisdata) => {
    plotArr.push({
      x: X_SCALE(thisdata.x),
      y: Y_SCALE(
        data.vital_scale.end.value - data.vital_scale.warningDataOffset,
      ),
      x1: X_SCALE(thisdata.x),
      x2: X_SCALE(thisdata.x) + Properties.WARNING_RECTANGLE_STYLE.top.width,
      y1: Y_SCALE(
        data.vital_scale.actual_end.value + data.vital_scale.warningDataOffset,
      ), //upper in plot value top to bottom
      y2: Y_SCALE(
        data.vital_scale.end.value - data.vital_scale.warningDataOffset,
      ), //lower in plot value top to bottom
      ...Properties.WARNING_RECTANGLE_STYLE.top,
    });
  });

  return plotArr;
}

//Get plot data for warning low rectangles
function getWarningDataBottomValues(data, X_SCALE, Y_SCALE) {
  var plotArr = [];

  var warningData = data.warningDataLow;

  if (!warningData || warningData.length == 0) {
    console.log('No warning low data to plot');
    return plotArr;
  }

  warningData.forEach((thisdata) => {
    plotArr.push({
      x: X_SCALE(thisdata.x),
      y: Y_SCALE(
        data.vital_scale.actual_start.value -
          data.vital_scale.warningDataOffset,
      ),
      x1: X_SCALE(thisdata.x),
      x2: X_SCALE(thisdata.x) + Properties.WARNING_RECTANGLE_STYLE.bottom.width,
      y1: Y_SCALE(
        data.vital_scale.activity.line + data.vital_scale.warningDataOffset,
      ), //upper in plot value top to bottom
      y2: Y_SCALE(
        data.vital_scale.actual_start.value -
          data.vital_scale.warningDataOffset,
      ), //lower in plot value top to bottom
      ...Properties.WARNING_RECTANGLE_STYLE.bottom,
    });
  });

  return plotArr;
}
