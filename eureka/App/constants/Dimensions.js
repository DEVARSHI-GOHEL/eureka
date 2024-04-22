import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const lowerDimension =
  windowWidth > windowHeight ? windowHeight : windowWidth;

export const lowerDimension80Percent = lowerDimension * 0.8;
