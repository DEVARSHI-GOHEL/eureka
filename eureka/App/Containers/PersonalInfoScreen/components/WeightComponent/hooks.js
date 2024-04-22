import React, {useMemo, useState} from 'react';
import {getWeightByUnits} from './tools';
import {KG, POUND} from '../../hooks/measurement';

export const useWeight = (weight, weightType) => {
  const [kilograms, setKilograms] = useState(
    getWeightByUnits(weight, weightType, KG),
  );
  const [pounds, setPounds] = useState(
    getWeightByUnits(weight, weightType, POUND),
  );

  return useMemo(() => {
    return {
      kilograms,
      setKilograms,
      pounds,
      setPounds,
      resultWeight: weightType == POUND ? `${pounds}` : `${kilograms}`,
      setWeight: (weightRaw, weightType) => {
        const weight = weightRaw * 1; // remove zeros in decimals places
        setKilograms(getWeightByUnits(weight, weightType, KG));
        setPounds(getWeightByUnits(weight, weightType, POUND));
      },
    };
  }, [kilograms, setKilograms, pounds, setPounds, weightType, weight]);
};
