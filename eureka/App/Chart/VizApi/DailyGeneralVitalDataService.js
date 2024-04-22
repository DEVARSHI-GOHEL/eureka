import {
  getFakeDailyData,
  generateFakeDailyMealData,
  generateFakeDailyFastingData,
  generateFakeDailyStepsData,
} from './DailyVitalFakeDataGenerator';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {VITAL_CONSTANTS} from '../AppConstants/VitalDataConstants';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {DB_STORE} from '../../storage/DbStorage';

//THESE METHOD GENERATES REAL DATA IF YOU WANT FAKE DATA YOU CAN UNCOMMENT MEANING LINES IN METHODS AND USE THEM
export const getDailyGeneralData = async function (
  startTs,
  endTs,
  vital_type,
  isFake,
) {
  let user_id = await AsyncStorage.getItem('user_id');
  var vital_data = await getDailyGeneralVitalData(
    user_id,
    startTs,
    endTs,
    vital_type,
    isFake,
  );
  var meal_data = await getDailyMealData(startTs, endTs);

  var steps_data = getDailyActivityData(startTs, endTs);
  var fasting_data = getDailyFastingData(startTs, endTs);

  let convertGlucoseData = false;

  if (vital_type == VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE) {
    let userDbData = await DB_STORE.GET.userInfo(user_id);

    let glucose_unit = GLUCOSE_UNIT.MGDL;
    if (userDbData && userDbData.rows[0]) {
      glucose_unit = userDbData.rows[0].glucose_unit
        ? userDbData.rows[0].glucose_unit
        : GLUCOSE_UNIT.MGDL;
    }

    if (glucose_unit == GLUCOSE_UNIT.MMOL) {
      convertGlucoseData = true;
    }
  }

  let finalData = {
    vital_data,
    meal_data,
    steps_data,
    fasting_data,
    startTs,
    endTs,
    vital_type,
    convertGlucoseData,
  };

  return finalData;
};

async function getDailyGeneralVitalData(
  userId,
  startTs,
  endTs,
  vital_type,
  isFake,
) {
  var data = [];
  var now = endTs;

  //   if (!isFake) {
  let dbData = await DB_STORE.GET.measureDataByTime(startTs, endTs);
  // let dbData = await DB_STORE.GET.userMeasureDataByTime(userId, startTs, endTs);

  if (dbData && dbData.rows && dbData.rows.length > 0) {
    data = dbData.rows;
  }
  return data.reverse();
  //   } else {
  // var interval_in_ms = getDataPollIntervalInMs() * 1;

  // while (now >= startTs) {
  //   data.push(getFakeDailyData(now, vital_type));

  //   now = now - interval_in_ms;
  // }

  // return data.reverse();
  // }
}

export async function getDailyMealData(startTs, endTs) {
  var data = [];
  // var now = endTs;

  let dbData = await DB_STORE.GET.mealsDataByTime(startTs, endTs);

  // if (dbData && dbData.rows && dbData.rows.length > 0) {
  //   data = dbData.rows;
  // }
  // return data.reverse();

  if (dbData && dbData.rows && dbData.rows.length > 0) {
    data = dbData.rows;
  }

  return data;

  // return generateFakeDailyMealData(endTs);
}

export function getDailyActivityData(startTs, endTs) {
  return generateFakeDailyStepsData(endTs);
}

export function getDailyFastingData(startTs, endTs) {
  return generateFakeDailyFastingData(endTs);
}
