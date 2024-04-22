import moment from 'moment';
import {VITAL_CONSTANTS, WARNING_RANGE} from '../AppConstants/VitalDataConstants';
import {getDateString} from '../AppUtility/DateTimeUtils';

export function getFakeDailyData(ts_ms, vital_type) {

    if(!vital_type)
        throw new Error("Cannot generate fake data because vital type did not match with available types");

    if(vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH || vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW) {
        return getFakeBpVitalData(ts_ms);
    }
    else if(vital_type == VITAL_CONSTANTS.KEY_STEPS) {
        return getFakeStepsData(ts_ms);
    }
    else {
        return getFakeGeneralVitalData(ts_ms, vital_type);
    }

    
}

function getFakeStepsData(ts_ms) {
    var min = 0;
    var max = 300;

    let data = {};
    data[VITAL_CONSTANTS.KEY_UID] = 50;
    data[VITAL_CONSTANTS.KEY_DEVICE_ID] = "adsad876";
    data[VITAL_CONSTANTS.KEY_STEPS] = randomInteger(min, max),

    data[VITAL_CONSTANTS.KEY_TS] = ts_ms;

    return data;
}

function getFakeGeneralVitalData(ts_ms, vital_type) {
    var min = WARNING_RANGE[vital_type].min - 2;
    var max = vital_type == VITAL_CONSTANTS.KEY_OXY_SAT ? WARNING_RANGE[vital_type].max : WARNING_RANGE[vital_type].max + 2;

    let data = {};
    data[VITAL_CONSTANTS.KEY_UID] = 50;
    data[VITAL_CONSTANTS.KEY_DEVICE_ID] = "adsad876";
    data[vital_type] = randomInteger(min, max),
    data[VITAL_CONSTANTS.KEY_TS] = ts_ms;

    return data;
}

function getFakeBpVitalData(ts_ms) {

    var sysmin = 75;
    var sysmax = 185;

    var diamin = 45;
    var diamax = 115;

    let data = {};
    data[VITAL_CONSTANTS.KEY_UID] = 50;
    data[VITAL_CONSTANTS.KEY_DEVICE_ID] = "adsad876";
    data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] = randomInteger(sysmin, sysmax),
    data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] = randomInteger(diamin, diamax),
    data[VITAL_CONSTANTS.KEY_TS] = ts_ms;

    return data;
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFakeDailyMealData(ts) {
    let dateStr = getDateString(ts);

    let firstMealTimeMs = moment(dateStr+"T09:00:00").toDate().getTime();

    let fake_meal_date = [{
        mealType : 2, //Medium
        mealTs : firstMealTimeMs
    }];

    return fake_meal_date;
}

export function generateFakeDailyStepsData(ts) {
    let dateStr = getDateString(ts);

    let firstActivityTimeStartMs = moment(dateStr+"T06:00:00").toDate().getTime();
    let firstActivityTimeEndMs = moment(dateStr+"T09:00:00").toDate().getTime();

    let fake_steps_date = [{
        stepsWalked : 120,
        activityStartTs : firstActivityTimeStartMs,
        activityEndTs : firstActivityTimeEndMs
    }];

    return fake_steps_date;
}

export function generateFakeDailyFastingData(ts) {
    let dateStr = getDateString(ts);

    let fastingStart = moment(dateStr+"T05:15:00").toDate().getTime();
    let fastingEnd = moment(dateStr+"T09:00:00").toDate().getTime();

    var fake_fasting_data = [{
        fastingStartTs: fastingStart,
        fastingEndTs: fastingEnd
    }];

    return fake_fasting_data;
}