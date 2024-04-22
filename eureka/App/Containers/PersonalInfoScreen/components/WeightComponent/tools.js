import {POUND} from "../../hooks/measurement";

const KG_TO_POUNDS  = 2.20462262;
const POUNDS_TO_KG  = 1 / KG_TO_POUNDS;

export const kgToLbs = (value ) => {
    return Math.round(KG_TO_POUNDS * value);
}

export const lbsToKg = ( value ) => {
    return Math.round(POUNDS_TO_KG * value );
}

/**
 * Function for getting the proper value of weight.
 *
 * @param value input weight
 * @param units input units (kg/lb)
 * @param toUnits output units (kg/lb)
 * @return {number|*} input value converted to  "toUnits"
 */
export const getWeightByUnits = (value, units, toUnits) => {
    if (units == toUnits) {
        return value
    }

    if (toUnits == POUND) {
        return kgToLbs(value);
    }

    return lbsToKg(value);
}
