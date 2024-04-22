import React, {useMemo, useState} from 'react';
import {
  View,
  StylesSheet,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../Theme';
import {
  DATA_BOUNDS,
  VITAL_CONSTANTS,
} from '../../Chart/AppConstants/VitalDataConstants';
import {getValues} from './utils';
import {
  UIHeavyMealIcon,
  UILightMealIcon,
  UIModerateMealIcon,
  UIRedBellSvgIcon,
} from '../UI/UISvgIcon/UISvgIcon';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import {toMMOL} from '../../utils/MeasureVizUtils';
import {Translate} from "../../Services/Translate";
import {MEASURE_TYPE} from "../../constants/MeasureUIConstants";

const TimeComponent = ({data, vitalType, onSave, onDelete, measureType}) => {
  const formats = Translate('dateFormats');
  const trn = Translate('TimeComponent');

  const getValue = () => {
    return Math.floor(Number(data[vitalType]));
  };

  var tempTime = moment(data.measure_time * 1);
  var time = tempTime.format(formats.timeInWords);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const {color, value, type} = getValues(vitalType, getValue());

  const renderValue = useMemo(
    () => {
      if (data.type === MEASURE_TYPE.U){
        return '--';
      }
      if (vitalType === VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH){
        return `${data[vitalType]}/${
          data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]
        }`
      }
      if (measureType){
        return `${toMMOL(data[vitalType])}`;
      }
      return value;
    },
    [data, vitalType, measureType, value]
  );

  return (
    <View>
      <View
        style={[
          open ? styles.openContainer : styles.container,
          open && {
            borderColor: color,
          },
        ]}>
        <LinearGradient
          colors={open ? [color + '0D', color + '4D'] : ['#fff', '#fff']}
          start={{x: 0, y: 0}}
          style={styles.dailyItem}>
          <View style={[styles.dailyItem, open && {paddingVertical: 5}]}>
            <Text
              style={[
                styles.textStyle,
                open && {fontWeight: 'bold'},
              ]}>{`${time}`}</Text>
            <Text
              style={[
                styles.textStyle,
                {textAlign: 'right'},
                open && {fontWeight: 'bold'},
              ]}>
              {renderValue}
            </Text>
            <View style={{flex: 1}} />
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => setOpen(!open)}
              accessible={false}
            >
              <Icon
                name={open ? 'remove' : 'add'}
                color={'#4a4949'}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        {open && (
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={trn.enter}
              value={text}
              style={styles.input}
              onChangeText={(val) => {
                setText(val);
              }}
            />

            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => onSave(text)}
              accessible={false}
            >
              <Icon name={'save'} color={'#4a4949'} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                setText('');
              }}
              accessible={false}
            >
              <Image
                style={{width: 30, height: 30, tintColor: '#4a4949'}}
                source={require('../../assets/images/icon_28_trash.png')}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {open && type > 1 && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            start: 5,
            backgroundColor: 'white',
            paddingVertical: 3,
          }}>
          {<UIRedBellSvgIcon fill={color} />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2819213d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  openContainer: {
    marginVertical: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',

    marginHorizontal: 20,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    flex: 1,
    color: Colors.black,
    paddingStart: 40,
  },
  imageContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingStart: 30,
  },
});

export default TimeComponent;
