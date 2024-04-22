import {Translate} from "../../Services/Translate";
import {_VITAL_CONSTANTS, VITAL_UNITS} from "./VitalDataConstants";

export function getVitalDataBoundsNameAndUnit(vitalType, glucose_unit) {
  const bounds = Translate('vitalDataBounds');
  const vitalUnits = Translate('vitalUnits')

  let unit = vitalUnits[VITAL_UNITS[vitalType]];

  if (vitalType == _VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE) {
    return {name: bounds.glucose, unit: vitalUnits[glucose_unit]};
  } else if (bounds[vitalType]) {
    return {name: bounds[vitalType], unit};
  } else {
    return {name: bounds.data, unit: 'n/a'};
  }
}