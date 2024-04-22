import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import styles from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { GlobalStyle } from '../../Theme';

export function VitalParameterBar({
  leftRedValue,
  leftRedValuePer,
  leftOrangeValue,
  leftOrangeValuePer,
  leftYellowValue,
  leftYellowValuePer,
  centerGreenValue,
  centerGreenValuePer,
  rightYellowValue,
  rightYellowValuePer,
  rightOrangeValue,
  rightOrangeValuePer,
  rightRedValue,
  rightRedValuePer,
  onlyRight,
  pressureUnitProp
}) {

  const valueUnitFun = (pressureUnitParam, pressureUnitValue) => {
      return pressureUnitValue
  }

  return (
    <View style={{
      justifyContent: 'center',
      flex: 1,
      // borderWidth:1
    }}>
      <View style={styles.vitalBarWrap}>
        {/* left side ==================== */}
        
        {
          !onlyRight ? (
          <>
            <View style={[styles.vitalBarItem, styles.redBlockFirst, { width: leftRedValuePer }]}>
              <View style={styles.vitalBarItemInner}>
                {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

                <Text style={[styles.vitalBarLabelTxt, styles.rightLabel]}>{valueUnitFun(pressureUnitProp, leftRedValue)}</Text>
              </View>
            </View>
            <View style={[styles.vitalBarItem, styles.orangeBlock, { width: leftOrangeValuePer }]}>
              <View style={styles.vitalBarItemInner}>
                {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

                <Text style={[styles.vitalBarLabelTxt, styles.rightLabel]}>{valueUnitFun(pressureUnitProp, leftOrangeValue)}</Text>
              </View>
            </View>
            <View style={[styles.vitalBarItem, styles.yellowBlock, { width: leftYellowValuePer }]}>
              <View style={styles.vitalBarItemInner}>
                {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

                <Text style={[styles.vitalBarLabelTxt, styles.rightLabel]}>{valueUnitFun(pressureUnitProp, leftYellowValue)}</Text>
              </View>
            </View>
          </>
          ) : <></>
        }
        

        {/* green - middle */}
        <View style={[styles.vitalBarItem, onlyRight ? styles.greenFirstBlock : styles.greenBlock, { width: centerGreenValuePer }]}>
          <View style={styles.vitalBarItemInner}>
            {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

            <Text style={[styles.vitalBarLabelTxt, onlyRight ? {} : styles.rightLabel]}>{valueUnitFun(pressureUnitProp, centerGreenValue)}</Text>
          </View>
        </View>

        {/* right side ======================= */}
        <View style={[styles.vitalBarItem, styles.yellowBlock, { width: rightYellowValuePer }]}>
          <View style={styles.vitalBarItemInner}>
            {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

            <Text style={[styles.vitalBarLabelTxt, onlyRight ? {} : styles.rightLabel]}>{valueUnitFun(pressureUnitProp, rightYellowValue)}</Text>
          </View>
        </View>
        <View style={[styles.vitalBarItem, styles.orangeBlock, { width: rightOrangeValuePer }]}>
          <View style={styles.vitalBarItemInner}>
            {/* <Text style={[styles.vitalBarLabelTxt, styles.leftLabel]}>0</Text> */}

            <Text style={[styles.vitalBarLabelTxt, onlyRight ? {} : styles.rightLabel]}>{valueUnitFun(pressureUnitProp, rightOrangeValue)}</Text>
          </View>
        </View>
        <View style={[styles.vitalBarItem, styles.redBlockLast, { width: rightRedValuePer }]}>
          <View style={styles.vitalBarItemInner}>
            {
              onlyRight ? (<Text style={[styles.vitalBarLabelTxt]}>{rightRedValue}</Text>) : <></>
            }
          </View>
        </View>
      </View>
    </View>
  );
}
