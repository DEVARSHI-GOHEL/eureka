export const UiMapper = {
  measureColorMap: {
    0: '#999999',
    1: '#2EE48A',
    2: '#fffc52',
    3: '#FFA42C',
    4: '#F86362',
  },
  measureTrendMap: {
    0: 'minus',
    1: 'caretdown',
    2: 'caretup',
  },
};

export const MEASURE_SUCCESS = {
  INSTANT_MEASURE_COMPLETED: 399,
  AUTO_MEASURE_COMPLETED: 599,
};

export const MEASURE_PROGRESS = {
  MEASURE_ACKNOWLEDGE: 398,
  MEASURE_IN_PROGRESS: 397,
  AUTO_MEASURE_STARTED: 598,
  AUTO_MEASURE_IN_PROGRESS: '019',
};

export const MEASURE_ERROR = {
  UNABLE_START_INSTANT_MEASURE: 301,
  VITAL_READ_COMMAND_FAILED: 302,
  INVALID_AUTO_MEASURE: 205,
  INVALID_AUTO_MEASURE_INTERVAL: 206,
  MEASURE_FAILED: '031',
};

export const MEASURE_TYPE = {
  M: 'M',
  R: 'R',
  U: 'U',
}