import {Dimensions} from 'react-native';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

export const SVG_WIDTH = windowWidth * (98 / 100); //600;
// export const SVG_HEIGHT = windowHeight * (70 / 100); //600;
export const SVG_HEIGHT = windowHeight - 400; //600;

export const PADDING_VERTICAL = 50;
export const PADDING_HORIZONTAL = 60;

export const GRAPH_WIDTH = SVG_WIDTH - PADDING_HORIZONTAL * 1.5;
export const GRAPH_HEIGHT = SVG_HEIGHT - PADDING_VERTICAL * 2;

export const X_AXIS_LABEL_SPACING = 20;
export const DX_AXIS_LABEL_SPACING = 10;

export const Y_AXIS_LABEL_SPACING = 20;
export const DY_AXIS_LABEL_SPACING = 10;

export const Y_AXIS_MAIN_TEXT_LABEL_SPACING_VERTICAL = 10;
export const Y_AXIS_MAIN_TEXT_LABEL_SPACING_HORIZONTAL =
  -1 * (PADDING_HORIZONTAL / 2);

const _MAIN_FONT = 'sans-serif-condensed'; //"Verdana";

export const MAIN_FONT = MAIN_FONT;

export const AXIS_LABEL_COLOR = '#636363';
export const AXIS_LABEL_FONT_SIZE = 10;
export const AXIS_LABEL_FONT_FAMILY = _MAIN_FONT;

export const WARNING_LINE_COLOR = '#f54545';
export const LINE_COLOR = '#636363';

export const WARNING_RECTANGLE_SHADE = {
  deep: WARNING_LINE_COLOR,
  lite: '#ffe0e0',
};

export const WARNING_LINE_DASH = 10;
export const NORMAL_LINE_DASH = 2;

export const SELECTOR_AND_BLUE_SHADE_COLOR = '#58a8e8';

export const CIRCLE_STYLES = {
  radius: 6,
  strokeWidth: 1,
  fill: '#00c711',
  stroke: '#5d7a92',
};

export const SVG_ICON_STYLE = {
  width: 16,
  height: 16,
};

export const WARNING_RECTANGLE_STYLE = {
  top: {fill: 'url(#warningShadeTop)', width: 14, rx: 4, ry: 4},
  bottom: {fill: 'url(#warningShadeBottom)', width: 14, rx: 4, ry: 4},
};

export const STEPS_RECTANGLE_STYLE = {
  fill: 'rgba(88, 168, 232, 0.5)',
  rx: 12,
  ry: 12,
};

export const FASTING_RECTANGLE_STYLE = {
  fill: 'url(#stripes)',
  strokeWidth: 0,
  stroke: SELECTOR_AND_BLUE_SHADE_COLOR,
  backgroundfill: 'rgba(88, 168, 232, 0.2)',
};

export const WARNING_COLOR = '#f54545';
export const OK_COLOR = '#00c711';

export const PERCENT_IN_RANGE_BAR_STYLE = {
  fill: 'url(#barGradient0)',
  fillmask: WARNING_COLOR,
  rx: 5,
  ry: 5,
};

export const BAR_GRADIENT_COLOR = {
  warning: WARNING_COLOR,
  ok: OK_COLOR,
};

export const PATH_CURRENT_COLOR = '#3b3b3b';
export const PATH_PREVIOUS_COLOR = '#a6a6a6'; //"#636363";

export const SHADE_LINE_CHART_AREA = 'rgb(236,242,252)';

export const AREA_GRAPH_STYLE = {
  fill: 'url(#stepAreaGraphBg)',
};

export const LINE_GRAPH_STYLE = {
  fill: 'none',
  stroke: '#3583EF', //'rgb(36,121,218)' -- changed color format for GetPixelColor to work 
  strokeWidth: '3',
  cursor: 'pointer',
};

export const STEPS_BAR_COLOR = {
  liteBottom: 'rgb(46, 201, 240)',
  liteTop: 'rgb(10, 167, 207)',
  darkTop: 'rgb(16,109,216)',
  darkBottom: 'rgb(48, 133, 230)',
};
//export const SELECTOR_AND_BLUE_SHADE_COLOR = "rgb(36,121,218)";
