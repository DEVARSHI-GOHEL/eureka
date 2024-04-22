import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import MaIcon from 'react-native-vector-icons/MaterialIcons';

import styles from './HeightComponent.styles';
import {Colors, Fonts} from '../../../../Theme';
import {UIPicker, UITextInput} from '../../../../Components/UI';
import {
  feetToMeters,
  formatInches,
  metersToImperial,
  toFixedLocale,
} from '../../tools';
import WarningText from "../WarningText";
import {FEET, METER} from "../../hooks/measurement";
import {Translate} from "../../../../Services/Translate";

const MAX_HEIGHT_DIGITS = 4;

export const isHeightValid = (heightType, meter, feet, inch) => {
  if (heightType === METER) {
    return  meter && Number(meter) > 0 && Number(meter) < 4;
  }

  return feet !== '' && feet <= 10 && inch <= 11;
}


const HeightComponent = ({
  heightType,
  setHeightType,
  contentScreenObj,
  feet,
  setFeet,
  inch: inches,
  setInch: setInches,
  meter: meters,
  setMeter: setMeters,
}) => {

  const [heightFeetWarning, setHeightFeetWarning] = useState(false);
  const [heightMeterWarning, setHeightMeterWarning] = useState(false);

  const heightMeterValidateFun = () => {
    if (Number(meters) === 0) {
      setHeightMeterWarning(true);
    } else if (Number(meters) > 3.33) {
      setHeightMeterWarning(true);
    } else {
      setHeightMeterWarning(false);
    }
  };

  useEffect(()=>{
    heightMeterValidateFun()
  },[meters])


  const setInchesFromMeters = (valueInMeters) => {

    const [newFeet, newInches]=metersToImperial(valueInMeters<0 ? 0 : valueInMeters);

    if (newFeet > 10) {
      setFeet('10');
      setInches('11');
      return;
    }

    setFeet(`${newFeet}`);
    setInches(formatInches(newInches));
  }

  const onMetersChange = (text) => {
    let testReq = new RegExp(/^\d*\.?(?:\d{1,2})?$/g);
    let textFixed = text.replace(',', '.');
    let testReqResult = testReq.test(textFixed);
    if (testReqResult) {
      setMeters(textFixed);
      setInchesFromMeters(Number(textFixed))
    }
  }

  const onInchesChange = (selectedItem) => {
    if (selectedItem == 'default') {
      return;
    }
    setInches(selectedItem);
    setMeters(feetToMeters(feet, selectedItem));
  }

  const onFeetChange = (selectedItemParam) => {
    if (selectedItemParam == 'default') {
      return;
    }

    setHeightFeetWarning(true);
    if (selectedItemParam == '00') {
      setHeightFeetWarning(true);
    } else {
      setHeightFeetWarning(false);
    }
    setFeet(selectedItemParam);
    setMeters(feetToMeters(selectedItemParam, inches));
  };

  let heightFeetWarningTxt;
  if (heightFeetWarning) {
    heightFeetWarningTxt = (<WarningText errorText="Feet must be between 1 and 10."/>);
  }

  let heightMeterWarningTxt;
  if (heightMeterWarning) {
    heightMeterWarningTxt = (<WarningText errorText="Meter must be between 0 and 3."/>);
  }


  return (
    <>
      <View style={styles.weightTab}>
        <TouchableOpacity
          onPress={() => {
            setHeightType(FEET);
          }}
          style={styles.lbBttn}
          accessibilityLabel="bttn-feet"
          accessible={false}>
          <Text
            style={[
              styles.bttnText,
              heightType === FEET && styles.buttonSelectedLeft,
            ]}
            accessibilityLabel="txt-feet">
            {contentScreenObj.feet_PickerText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!meters) {
              setMeters(feetToMeters(feet, inches));
            }
            setHeightType(METER);
          }}
          style={styles.kgBttn}
          accessibilityLabel="bttn-meter"
          accessible={false}>
          <Text
            style={[
              styles.bttnText,
              heightType === METER && styles.buttonSelectedRight,
            ]}
            accessibilityLabel="txt-meter">
            {contentScreenObj.meter_PickerText}
          </Text>
        </TouchableOpacity>
      </View>

      {heightType === FEET ? (
        <View style={{flexDirection: 'row', flex: 1}}>
          <View style={{flex: 1, marginRight: 5}}>
            <View style={styles.inputPicker} accessibilityLabel="pick-feet">
              <View accessibilityLabel={'selected-pick-feet-'+feet}>
                <UIPicker
                  mode="dialog"
                  style={{width: '99.5%', paddingRight: '.5%'}}
                  textStyle={{
                    color: feet === '00' ? '#B3B3B3' : '#000',
                    ...Fonts.fontMedium,
                    paddingLeft: 10,
                  }}
                  iosIcon={
                    <MaIcon
                      name="arrow-drop-down"
                      style={{color: Colors.gray, fontSize: 26}}
                    />
                  }
                  selectedValue={feet}
                  placeholder="Feet"
                  onValueChange={onFeetChange}>
                  <UIPicker.Item label={'ft'} value={'default'} color="#999" />
                  {/* <UIPicker.Item label="ft" value="00" /> */}
                  <UIPicker.Item label="1" value="1" />
                  <UIPicker.Item label="2" value="2" />
                  <UIPicker.Item label="3" value="3" />
                  <UIPicker.Item label="4" value="4" />
                  <UIPicker.Item label="5" value="5" />
                  <UIPicker.Item label="6" value="6" />
                  <UIPicker.Item label="7" value="7" />
                  <UIPicker.Item label="8" value="8" />
                  <UIPicker.Item label="9" value="9" />
                  <UIPicker.Item label="10" value="10" />
                </UIPicker>
              </View>
            </View>

            {heightFeetWarningTxt}
          </View>
          <View style={{flex: 1, marginLeft: 5}}>
            <View style={styles.inputPicker} accessibilityLabel="pick-inch">
              <View accessibilityLabel={'selected-pick-inch-'+inches}>
                <UIPicker
                  mode="dialog"
                  style={{width: '99.5%', paddingRight: '.5%'}}
                  textStyle={{
                    color: inches === '00' ? '#B3B3B3' : '#000',
                    ...Fonts.fontMedium,
                    paddingLeft: 10,
                  }}
                  iosIcon={
                    <MaIcon
                      name="arrow-drop-down"
                      style={{color: Colors.gray, fontSize: 26}}
                    />
                  }
                  selectedValue={inches}
                  placeholder="Inch"
                  onValueChange={onInchesChange}>
                  <UIPicker.Item label={'in'} value={'default'} color="#999" />
                  <UIPicker.Item label="00" value="00" />
                  <UIPicker.Item label="01" value="01" />
                  <UIPicker.Item label="02" value="02" />
                  <UIPicker.Item label="03" value="03" />
                  <UIPicker.Item label="04" value="04" />
                  <UIPicker.Item label="05" value="05" />
                  <UIPicker.Item label="06" value="06" />
                  <UIPicker.Item label="07" value="07" />
                  <UIPicker.Item label="08" value="08" />
                  <UIPicker.Item label="09" value="09" />
                  <UIPicker.Item label="10" value="10" />
                  <UIPicker.Item label="11" value="11" />
                </UIPicker>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <>
        <UITextInput
          value={toFixedLocale(meters)}
          maxLength={MAX_HEIGHT_DIGITS}
          keyboardType={'numeric'}
          onChangeText={onMetersChange}
          iconsRight={<Text style={styles.iconsRightTextWeight}>{Translate('units.meter')}</Text>}
          error={heightMeterWarning}
          accessibilityLabel="height-meter"
        />
        {heightMeterWarningTxt}
        </>
      )}

    </>
  );
};

export default HeightComponent;
