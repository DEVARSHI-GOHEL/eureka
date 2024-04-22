import {WATCH_CHARGER_STATE} from "../../constants/AppDataConstants";

export const getWatchStore = app => app.watch;

export const getWatchChargingState = (appState) => getWatchStore(appState)?.watchChargerValue;
export const selectIsWatchCharging = (appState) => getWatchStore(appState)?.watchChargerValue ===  WATCH_CHARGER_STATE.CONNECTED;
