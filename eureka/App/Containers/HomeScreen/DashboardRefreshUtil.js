import store from '../../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WATCH_CONNECTION_STATE,
  WATCH_WORN_STATE,
} from '../../constants/AppDataConstants';
import {
  watchConnectionAction,
  watchWornAction,
  homeHealthOverviewUpdateAction,
} from './action';
import {convertMeasureInfoFromDb} from '../../utils/MeasureVizUtils';
import {VITAL_CONSTANTS} from '../../Chart/AppConstants/VitalDataConstants';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {
  DayBrowser,
  getDateTimeInfo,
  isToday,
} from '../../Chart/AppUtility/DateTimeUtils';
import {DB_STORE} from '../../storage/DbStorage';
import {getStepsData} from '../../Chart/VizApi/StepsDataService';
import {dispatchStopFirmwareUpdateChecking} from "../FirmwareUpdateScreen/redux/richActions";

export async function getConnectionStatus() {
  setWatchConnected();
  setWatchWorn();
}

function setWatchConnected() {
  store.dispatch(watchConnectionAction(WATCH_CONNECTION_STATE.CONNECTED));
}

function setWatchDisconnected() {
  store.dispatch(watchConnectionAction(WATCH_CONNECTION_STATE.NOT_CONNECTED));
  dispatchStopFirmwareUpdateChecking();
}

function setWatchSync() {
  store.dispatch(watchConnectionAction(WATCH_CONNECTION_STATE.SYNCING));
}

function setWatchWorn() {
  store.dispatch(watchWornAction(WATCH_WORN_STATE.WORN));
}

function setWatchNotWorn() {
  store.dispatch(watchWornAction(WATCH_WORN_STATE.NOT_WORN));
}

export const DEVICE_STATUS_RENDERER = {
  setWatchConnected,
  setWatchDisconnected,
  setWatchSync,

  setWatchWorn,
  setWatchNotWorn,
};

export async function refreshHomeScreen() {
  try {
    const userId = await AsyncStorage.getItem('user_id');

    const measureDbResult = await DB_STORE.GET.dashboardSimulationMeasureData();

    const isAutoCalibrateEnabled = await AsyncStorage.getItem(
      'auto_calibrate_enabled',
    );

    let dashboardData = {};
    if (measureDbResult && measureDbResult.rows) {
      dashboardData = convertMeasureInfoFromDb(
        measureDbResult.rows[0],
        measureDbResult.rows[1],
      );
    }
    let userData = await DB_STORE.GET.userInfo(userId);
    let stepGoals = 1000;
    let glucoseUnit = GLUCOSE_UNIT.MGDL;
    let totalStepsTakenToday = 0;
    if (userData && userData.rows[0]) {
      if (!isNaN(userData.rows[0].step_goal)) {
        stepGoals = userData.rows[0].step_goal * 1;
      }
      if (userData.rows[0].glucose_unit) {
        glucoseUnit = userData.rows[0].glucose_unit;
      }
    }

    let dateToday = new DayBrowser();

    let todayValue = dateToday.next();

    let currentData = await getStepsData(todayValue.start, todayValue.end);

    totalStepsTakenToday =
      currentData.steps_data.length > 0
        ? currentData.steps_data[currentData.steps_data.length - 1].steps_count
        : 0;

    let stepGoalPercent = (totalStepsTakenToday / stepGoals) * 100;
    stepGoalPercent = stepGoalPercent > 100 ? 100 : stepGoalPercent;
    dashboardData.mainData[VITAL_CONSTANTS.KEY_STEPS] = totalStepsTakenToday;
    dashboardData.stepGoalPercent = stepGoalPercent;
    if (glucoseUnit == GLUCOSE_UNIT.MMOL) {
      let glucose = dashboardData.mainData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE];
      glucose = Math.round((glucose / 18) * 10) / 10;
      dashboardData.mainData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE] = glucose;
    }
    let dateTime = '';
    if (dashboardData.mainData[VITAL_CONSTANTS.KEY_TS] != 0) {
      let dateTimeObj = getDateTimeInfo(
        dashboardData.mainData[VITAL_CONSTANTS.KEY_TS],
      );
      if (dateTimeObj) {
        let date = isToday(dashboardData.mainData[VITAL_CONSTANTS.KEY_TS])
          ? 'Today'
          : dateTimeObj.dateInWords;
        let time = dateTimeObj.timeInWords;
        dateTime = date + ', ' + time;
      }
    }
    store.dispatch(
      homeHealthOverviewUpdateAction({
        bloodGlucoseValue:
          dashboardData.mainData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
        heartRateValue: dashboardData.mainData[VITAL_CONSTANTS.KEY_HEART_RATE],
        bloodPressureSystolicValue:
          dashboardData.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH],
        bloodPressureDiastolicValue:
          dashboardData.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW],
        respirationRateValue:
          dashboardData.mainData[VITAL_CONSTANTS.KEY_RESP_RATE],
        oxygenSaturationValue:
          dashboardData.mainData[VITAL_CONSTANTS.KEY_OXY_SAT],
        stepsWalkValue: dashboardData.mainData[VITAL_CONSTANTS.KEY_STEPS],
        bloodGlucoseTrend:
          dashboardData.trendData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
        heartRateTrend: dashboardData.trendData[VITAL_CONSTANTS.KEY_HEART_RATE],
        bloodPressureTrend:
          dashboardData.trendData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH],
        respirationRateTrend:
          dashboardData.trendData[VITAL_CONSTANTS.KEY_RESP_RATE],
        oxygenSaturationTrend:
          dashboardData.trendData[VITAL_CONSTANTS.KEY_OXY_SAT],
        bloodGlucoseColor:
          dashboardData.colorData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
        heartRateColor: dashboardData.colorData[VITAL_CONSTANTS.KEY_HEART_RATE],
        bloodPressureColor:
          dashboardData.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] >
          dashboardData.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]
            ? dashboardData.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]
            : dashboardData.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW],
        respirationRateColor:
          dashboardData.colorData[VITAL_CONSTANTS.KEY_RESP_RATE],
        oxygenSaturationColor:
          dashboardData.colorData[VITAL_CONSTANTS.KEY_OXY_SAT],
        stepGoalPercent,
        stepGoal:stepGoals,
        glucoseUnit,
        measureUpdateTime: dateTime,
      }),
    );
  } catch (error) {
    console.log('error in renderDashboard', error);
  }
}
