import {
    WATCH_BATTERY_STATE,
    WATCH_CHARGER_STATE,
    WATCH_CONNECTION_STATE,
    WATCH_WRIST_STATE,
} from '../../constants/AppDataConstants';

const getWatchStatusStore = (appState) => (appState.watchStatus);
const getWatchStore = (appState) => (appState.watch);

export const selectWatchConnected = (state) => getWatchStatusStore(state)?.isWatchConnected;
export const selectIsWatchConnected = (state) => getWatchStatusStore(state)?.isWatchConnected === WATCH_CONNECTION_STATE.CONNECTED;

export const selectIsWatchNotOnWrist = (state) => getWatchStore(state)?.watchWristValue === WATCH_WRIST_STATE.NOT_ON_WRIST;
export const selectIsWatchBatteryNormal = (state) => getWatchStore(state)?.watchBatteryValue === WATCH_BATTERY_STATE.NORMAL;
export const selectIsWatchChargerDisconnected = (state) => getWatchStore(state)?.watchChargerValue === WATCH_CHARGER_STATE.NOT_CONNECTED;