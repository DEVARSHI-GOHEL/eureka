import React from 'react';
import {View, Text} from 'react-native';
import styles from './style';
import OctIcon from 'react-native-vector-icons/Octicons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {
  getMeasureColor,
  getMeasureTrendIcon,
  toMMOL,
} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {Translate} from "../../Services/Translate";
import {getLabelByUnits} from "../../Chart/AppUtility/ChartAxisUtils";

// function TabReadingUnit({
//   radioElement,
//   time,
//   unitValue,
//   unit
// }) {

//   return (
//     <View style={styles.readingArea}>
//       <View style={styles.leftArea}>
//         <View style={{ height: 20 }}>
//           {radioElement}
//         </View>
//         <View>
//           <Text style={styles.readig}>Reading at</Text>
//           <Text style={styles.time}>{time}</Text>
//         </View>
//       </View>
//       <View>
//         <View style={styles.rightArea}>
//           {unitValue > 200 ?
//             <AntIcon name='caretup' style={[styles.upIcon, { color: 'red' }]} /> :

//             <AntIcon name='caretdown' style={styles.upIcon} />

//           }

//           <View>
//             <Text style={styles.blGlucose}>{unitValue}</Text>
//             <Text style={styles.blGlumeter}>{unit}</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

const defaultState = {
  show: false,
  time: '--',
  unit: '--',
  unitValue: '--',
  measureTrend: 0, //Arrow trend can be 0, 1, 2, if 0 do not display, 1 means down arrow, 2 means up arrow. All variables stored in constant
  measureColor: 0, //Circle and arrow color can be 0, 1, 2, 3, 4. 0 is grey. 1 is green. 2 is yellow. 3 is orange. 4 is red. All variables stored in constant

  measureTrendSys: 0, //Arrow trend can be 0, 1, 2, if 0 do not display, 1 means down arrow, 2 means up arrow. All variables stored in constant
  measureColorSys: 0, //Circle and arrow color can be 0, 1, 2, 3, 4. 0 is grey. 1 is green. 2 is yellow. 3 is orange. 4 is red. All variables stored in constant
  measureTrendDia: 0, //Arrow trend can be 0, 1, 2, if 0 do not display, 1 means down arrow, 2 means up arrow. All variables stored in constant
  measureColorDia: 0, //Circle and arrow color can be 0, 1, 2, 3, 4. 0 is grey. 1 is green. 2 is yellow. 3 is orange. 4 is red. All variables stored in constant
  readingText: 'Reading at',
};

export default class TabReadingUnit extends React.Component {

  constructor(props) {
    super(props);
    this.trn = Translate('tabReadingUnit');
    this.state =
      props && props.initData && props.initData.meta
        ? this.getNextState(props.initData, props.yearly)
        : defaultState;
  }

  setReading = (attr, yearly) => {
    let nextState = this.getNextState(attr);

    this.setState(nextState);
    //attr.show = true;
    //this.setState({...this.state, ...attr});
  };

  getNextState = (attr, yearly) => {
    return {
      show: true,
      time: attr.meta.timeInWords
        ? attr.meta.timeInWords
        : attr.meta.dateInWords
        ? yearly
          ? attr.meta.dateInWords.split(' ')[0] +
            ' ' +
            attr.meta.dateInWords.split(' ')[2]
          : attr.meta.dateInWords
        : '--',
      unit: getLabelByUnits(attr.meta.unit),
      unitValue: attr.meta.y
        ? attr.convertGlucoseData
          ? toMMOL(attr.meta.y)
          : Math.round(attr.meta.y)
        : '' + Math.round(attr.meta.y1) + '/' + Math.round(attr.meta.y2),
      measureTrend: attr.meta.measureTrend,
      measureColor: attr.meta.measureColor,

      measureTrendSys: attr.meta.measureTrendSys,
      measureColorSys: attr.meta.measureColorSys,
      measureTrendDia: attr.meta.measureTrendDia,
      measureColorDia: attr.meta.measureColorDia,
      readingText: attr.meta.readingText ? attr.meta.readingText : this.trn.readingAt,
    };
  };

  render() {
    if (!this.state.show) return <Text />;

    let arrowIconClassName = getMeasureTrendIcon(
      this.state.measureTrend
        ? this.state.measureTrend
        : this.state.measureTrendSys &&
          this.state.measureTrendSys > this.state.measureTrendDia
        ? this.state.measureTrendSys
        : this.state.measureTrendDia,
    );
    let iconColor = getMeasureColor(
      this.state.measureColor
        ? this.state.measureColor
        : this.state.measureColorSys &&
          this.state.measureColorSys > this.state.measureColorDia
        ? this.state.measureColorSys
        : this.state.measureColorDia,
    );

    return (
      <View style={styles.readingArea}>
        <View style={styles.leftArea}>
          <View style={[styles.readingBorder, {marginTop: 10}]}>
            <OctIcon
              name="primitive-dot"
              style={[styles.circleIcon, {color: iconColor}]}
            />
          </View>
          <View>
            <Text style={styles.reading}>{this.trn[this.state.readingText]||this.state.readingText}</Text>
            <Text style={styles.time}>{this.state.time}</Text>
          </View>
        </View>
        <View>
          <View style={styles.rightArea}>
            {
              <AntIcon
                name={arrowIconClassName}
                style={[styles.upIcon, {color: iconColor}]}
              />
            }
            <View>
              <Text
                style={
                  this.props.smallerFont
                    ? {...styles.measureVal, fontSize: 32}
                    : styles.measureVal
                }>
                {this.state.unitValue}
              </Text>
              <Text style={styles.measureUnit}>{this.state.unit}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
