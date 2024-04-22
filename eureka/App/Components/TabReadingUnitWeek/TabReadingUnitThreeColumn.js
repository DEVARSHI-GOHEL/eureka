import React from 'react';
import {
  View,
  Text
} from 'react-native';
import styles from './TabReadingUnitThreeColumnStyles';
import OctIcon from 'react-native-vector-icons/Octicons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {getMeasureColor, getMeasureTrendIcon, toMMOL} from '../../utils/MeasureVizUtils';
import {getLabelByUnits} from "../../Chart/AppUtility/ChartAxisUtils";
import {Translate} from "../../Services/Translate";

// export function _TabReadingUnitThreeColumn({
//   radioElement,
//   time,
//   averageLabel,
//   averageValue,
//   averageUnit,
//   unit,
//   highestLabel,
//   highestValue,
//   highestUnit,
//   lowestLabel,
//   lowestValue,
//   lowestUnit
// }) {

//   return (
//     <>
//     <View style={styles.readingArea}>
//       <View style={styles.leftArea}>
//         <View style={styles.readingBorder}>
//           <OctIcon name="primitive-dot" style={[styles.circleIcon]} />
//         </View>
//         <View>
//           <Text style={styles.reading}>{averageLabel}</Text>
//           <Text style={styles.measureVal}>{averageValue}</Text>
//           <Text style={styles.measureUnit}>{averageUnit}</Text>
//         </View>
//       </View>
//       <View>
//         <View style={styles.rightArea}>
//         <View style={styles.topArrowIcon}>
//             {highestValue > 100 ?
//               <AntIcon name='caretup' style={[styles.upIcon, { color: 'red' }]} /> :

//               <AntIcon name='caretdown' style={styles.downIcon} />

//             }
//           </View>
//           <View>
//             <Text style={styles.reading}>{highestLabel}</Text>
//             <Text style={styles.measureVal}>{highestValue}</Text>
//             <Text style={styles.measureUnit}>{highestUnit}</Text>
//           </View>
//         </View>
//       </View>
//       <View>
//         <View style={{...styles.rightArea}}>
//           <View style={styles.topArrowIcon}>
//             {lowestValue > 200 ?
//               <AntIcon name='caretup' style={[styles.upIcon, { color: 'red' }]} /> :

//               <AntIcon name='caretdown' style={styles.downIcon} />

//             }
//           </View>
//           <View>
//             <Text style={styles.reading}>{lowestLabel}</Text>
//             <Text style={styles.measureVal}>{lowestValue}</Text>
//             <Text style={styles.measureUnit}>{lowestUnit}</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//     </>
//   );
// }

const defaultState = {
  show : false,
  unit: '--',
  unitValue: '--',
  measureTrend : 0, //Arrow trend can be 0, 1, 2, if 0 do not display, 1 means down arrow, 2 means up arrow. All variables stored in constant
  measureColor : 0, //Circle and arrow color can be 0, 1, 2, 3, 4. 0 is grey. 1 is green. 2 is yellow. 3 is orange. 4 is red. All variables stored in constant
  
  max : 0,
  min : 0,
  measureColorMax : 0,
  measureColorMin : 0
}

export default class TabReadingUnitThreeColumn extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = (props && props.initData && props.initData.meta) ? this.getNextState(props.initData) : defaultState;
  }

  setReading = (attr) => {

    let nextState = this.getNextState(attr);

    this.setState(nextState);
    //attr.show = true;
    //this.setState({...this.state, ...attr});
  }

  getNextState = (attr) => {

    let min = attr.meta.min;
    let max = attr.meta.max;
    let unitValue = attr.meta.y;

    if(attr.convertGlucoseData) {

      if(min) {
        min = toMMOL(min*1);
      }

      if(max) {
        max = toMMOL(max*1);
      }

      if(unitValue) {
        unitValue = toMMOL(unitValue*1);
      }
    }
    else {
      if(unitValue)
        unitValue = Math.round(unitValue);
    }

    return {
      show : true, 
      unit: attr.meta.unit, 
      unitValue, 
      measureTrend : attr.meta.measureTrend, 
      measureColor : attr.meta.measureColor,

      max,
      min,
      measureColorMax : attr.meta.measureColorMax,
      measureColorMin : attr.meta.measureColorMin,
    };
  }

  render () {
      if(!this.state.show)
        return <Text />;

      let averageIconColor = getMeasureColor(this.state.measureColor);
      let maxIconColor = getMeasureColor(this.state.measureColorMax);
      let minIconColor = getMeasureColor(this.state.measureColorMin);


      return (
        <>
        <View style={styles.readingArea}>
          <View style={styles.leftArea}>
            <View style={[styles.readingBorder, {marginTop: 10}]}>
              <OctIcon name="primitive-dot" style={[styles.circleIcon, {color : averageIconColor}]} />
            </View>
            <View>
              <Text style={styles.reading}>{Translate("bloodGlucoseScreen.average")}</Text>
              <Text style={styles.measureVal}>{this.state.unitValue}</Text>
              <Text style={styles.measureUnit}>{getLabelByUnits(this.state.unit)}</Text>
            </View>
          </View>

          <View>
            <View style={styles.rightArea}>
              <View style={styles.topArrowIcon}>
                    <AntIcon name='caretup' style={[styles.upIcon, { color: maxIconColor }]} />
              </View>
              <View>
                  <Text style={styles.reading}>{Translate("bloodGlucoseScreen.highest")}</Text>
                  <Text style={styles.measureVal}>{this.state.max}</Text>
                  <Text style={styles.measureUnit}>{getLabelByUnits(this.state.unit)}</Text>
              </View>
            </View>
          </View>

          <View>
            <View style={{...styles.rightArea}}>
              <View style={styles.topArrowIcon}>
                    <AntIcon name='caretdown' style={[styles.downIcon, { color: minIconColor }]} />
              </View>
              <View>
                  <Text style={styles.reading}>{Translate("bloodGlucoseScreen.lowest")}</Text>
                  <Text style={styles.measureVal}>{this.state.min}</Text>
                  <Text style={styles.measureUnit}>{getLabelByUnits(this.state.unit)}</Text>
              </View>
            </View>
          </View>

        </View>
        </>
      );
  }
}
