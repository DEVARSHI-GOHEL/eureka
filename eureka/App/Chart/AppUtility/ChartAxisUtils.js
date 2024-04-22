import {VITAL_CONSTANTS, VITAL_UNITS} from '../AppConstants/VitalDataConstants';
import {Translate} from "../../Services/Translate";

export function getLabelByDataType(vital_type) {
    const vitalUnits = Translate('vitalUnits')
    let label = vitalUnits[VITAL_UNITS[vital_type]] || '';

    if (vital_type == VITAL_CONSTANTS.KEY_OXY_SAT) {
        label = vitalUnits['o2%'];
    }
    return label;
}

export function getLabelByUnits(vitalUnits) {
    const trn = Translate('vitalUnits')
    return trn[vitalUnits] || vitalUnits;
}

