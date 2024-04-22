import React, {useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../../styles';
import {UITextInput} from '../../../../Components/UI';
import {toFixedLocale} from '../../tools';
import IconFont from 'react-native-vector-icons/FontAwesome';
import {KG, POUND} from '../../hooks/measurement';
import {getWeightByUnits} from './tools';
import {Translate} from "../../../../Services/Translate";

const WEIGHT_MATCH = /^\d*\.?(?:\d{1,2})?$/;

const WeightComponent = ({
  setWeightType,
  weightType,
  kilograms,
  setKilograms,
  pounds,
  setPounds,
  resultWeight,
}) => {
  const [weightWarning, setWeightWarning] = useState(false);
  const [weight, setWeight] = useState(resultWeight);

  let weightDigit = useMemo(() => {
    if ((weight + '').includes('.') || (weight + '').includes(',')) {
      return 6;
    }
    return 4;
  }, [weight]);

  let weightWarningTxt;
  if (weightWarning) {
    weightWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>Weight must be between 1 and 500.</Text>
      </View>
    );
  }

  const weightValidate = () => {
    if (weight === '') {
      setWeightWarning(false);
    } else if (Number(weight) <= 500 && Number(weight) !== 0) {
      setWeightWarning(false);
    } else if (Number(weight) === 0) {
      setWeightWarning(true);
    } else {
      setWeightWarning(true);
    }
  };

  const onWeightChange = (value) => {
    let fixedValue = value.replace(',', '.');
    if (!WEIGHT_MATCH.test(fixedValue)) {
      // entered value does not match the regexp -> no change
      return;
    }

    setWeight(fixedValue);
    if (weightType == POUND) {
      setPounds(fixedValue);
      setKilograms(getWeightByUnits(fixedValue, weightType, KG));
      return;
    }

    setKilograms(fixedValue);
    setPounds(getWeightByUnits(fixedValue, weightType, POUND));
  };

  return (
    <>
      <View style={styles.weightTab}>
        <TouchableOpacity
          onPress={() => {
            setWeight(pounds);
            setWeightType(POUND);
          }}
          style={styles.lbBttn}
          accessibilityLabel="bttn-lb"
          accessible={false}>
          <Text
            style={[
              styles.bttnText,
              weightType === POUND && styles.buttonSelectedLeft,
            ]}
            accessibilityLabel="txt-lb">
            {Translate("units.pound")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setWeight(kilograms);
            setWeightType(KG);
          }}
          style={styles.kgBttn}
          accessibilityLabel="bttn-kg"
          accessible={false}>
          <Text
            style={[
              styles.bttnText,
              weightType === KG && styles.buttonSelectedRight,
            ]}
            accessibilityLabel="txt-kg">
            {Translate("units.kilogram")}
          </Text>
        </TouchableOpacity>
      </View>
      <UITextInput
        value={toFixedLocale(weightType == POUND ? pounds : kilograms)}
        maxLength={weightDigit}
        keyboardType={'numeric'}
        onChangeText={onWeightChange}
        iconsRight={
          <Text style={styles.iconsRightTextWeight}>{Translate(weightType === POUND? "units.pound":"units.kilogram")}</Text>
        }
        onBlur={weightValidate}
        error={weightWarning}
        accessibilityLabel="weight"
      />
      {weightWarningTxt}
    </>
  );
};

export default WeightComponent;
