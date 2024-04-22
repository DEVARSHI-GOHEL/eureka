import {AUTO_MEASURE_STATE, INSTANT_MEASURE_STATE} from "../../constants/AppDataConstants";

export const getMeasureStore = (appState) => appState.measure;
export const selectIsMeasuring = (appState) =>
    getMeasureStore(appState).operationState === INSTANT_MEASURE_STATE.ONGOING ||
    getMeasureStore(appState).autoMeasureState === AUTO_MEASURE_STATE.STARTED;
