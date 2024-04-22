import moment from "moment/moment";
import {t} from "i18n-js";

const twoDigits = (numberInText) => {
    if (numberInText.length > 1) return numberInText;
    if (numberInText.length > 0) return `0${numberInText}`;
    return '00';
}

const getDayKey = (stepsRecord) => `${stepsRecord.year}-${twoDigits(stepsRecord.month)}-${twoDigits(stepsRecord.day)}`;

/**
 * Reduce number of steps records and keep only one record per day - the one with most steps.
 * Reason: records are stored from watch. Those records contains steps of that moment. So the steps are accumulated during the day
 * and the last record has the biggest number of steps and it also represents how many steps did use in that day.
 *
 * Simple example:
 * stepsData = [ {day: X, time: A,  steps:'100'},{day: X, time: B, steps:'500'},{day: X,time: C, steps:'987'},
 * {day: Y, time: D,  steps:'200'},{day: Y, time: E, steps:'600'},{day: Y,time: C, steps:'1100'},
 * ]
 *
 * will be aggregate to:
 * [{day: X,time: C, steps:'987'}, {day: Y,time: C, steps:'1100'}]
 *
 * Note: don't use this for day view, because there will be only one record.
 *
 * @param stepsData
 * @return {any[]}
 */
export const aggregateDays = (stepsData) => {
    const days = new Map();
    stepsData.forEach(daySteps => {
        if (!daySteps) return;

        const key = getDayKey(daySteps);
        const yearFormatted = moment(daySteps.measure_time).format(
            t('dateFormats.year'),
        );
        const resultDayData = {...daySteps, year: yearFormatted};

        if (!days.has(stepsData)) {
            days.set(key, resultDayData);
            return;
        }

        const stored = days[key];
        if (stored.steps < resultDayData.steps) {
            days.set(key, resultDayData);
        }
    });

    const keys = [...days.keys()];
    keys.sort();

    return keys.map((dayKey) => (days.get(dayKey)));
}

/**
 * Round to nearest higher number dividable by 200
 *
 * @param count
 * @return {number}
 */
export const getRoundedCeil = (count, roundValue = 200) => {
    // round to 200s - the half of it in graph
    // will be rounded to 100s

    return Math.ceil(count / roundValue) * roundValue;
}
