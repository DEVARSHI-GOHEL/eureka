import {useCallback, useMemo, useState} from "react";
import {WEIGHT_UNIT} from "../../../constants/AppDataConstants";

export const FEET = 'feet';
export const METER = 'meter';
export const KG = 'kg';
export const POUND = 'lb';
export const IMPERIAL_SYSTEM = WEIGHT_UNIT.FPS;
export const METRIC_SYSTEM = WEIGHT_UNIT.MKS;

export const useMeasurement = (initialUnitsOfMeasurement = IMPERIAL_SYSTEM) => {
  const [unitsOfMeasurement, setUnitsOfMeasurement] = useState(initialUnitsOfMeasurement);

  const setHeightType = useCallback((newHeightType) => {
    setUnitsOfMeasurement(newHeightType == FEET ? IMPERIAL_SYSTEM:METRIC_SYSTEM);
  },[setUnitsOfMeasurement])

  const setWeightType = useCallback((newWeightType) => {
    setUnitsOfMeasurement(newWeightType == POUND ? IMPERIAL_SYSTEM : METRIC_SYSTEM);
  },[setUnitsOfMeasurement])

  return useMemo(()=>({
    heightType: (unitsOfMeasurement == IMPERIAL_SYSTEM) ? FEET : METER,
    setHeightType,
    weightType: (unitsOfMeasurement == IMPERIAL_SYSTEM) ? POUND : KG,
    setWeightType,
    unitsOfMeasurement,
    setUnitsOfMeasurement,
  }),[unitsOfMeasurement, setHeightType, setWeightType, unitsOfMeasurement, setUnitsOfMeasurement ]);

}
