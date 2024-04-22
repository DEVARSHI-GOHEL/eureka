import moment from 'moment';

import {addDateInfoToDataFragment, getDaysArray} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS} from '../AppConstants/VitalDataConstants';
import {aggregateDays, getRoundedCeil} from "./tools";

export function convertWeeklyStepsData(currentStepsData, stepGoal, startTs, endTs) {

    if(!currentStepsData || !currentStepsData.steps_data || currentStepsData.steps_data.length == 0) {
        return null;
    }

    let convertedStepsData = convertStepsData(currentStepsData.steps_data, stepGoal, startTs, endTs);
    let scales = getStepsScaleData(convertedStepsData);

    return {
        ...convertedStepsData,
        ...scales
    }

}

function convertStepsData(currentStepsData, stepGoal = 1000, startTs, endTs) {

    //Find the week day name orders
    let daysOfWeekArr = getDaysArray(moment(endTs).day());
    let bucket = {};

    daysOfWeekArr.forEach(day_name => {
        bucket[day_name] = {
            total: 0,
            label: day_name
        };
    });

    let totalSteps = 0;
    let dailyMaxTotalSteps = stepGoal;
    let stepGoalReachedCount = 0;

    const aggregatedDays = aggregateDays(currentStepsData);
    aggregatedDays.forEach((stepsData) => {
        stepsData.ts = stepsData[VITAL_CONSTANTS.KEY_TS] * 1;

        const data = addDateInfoToDataFragment(stepsData);
        const dayKey = data.dayOfTheWeekInWordsShort;

        bucket[dayKey].total = data[VITAL_CONSTANTS.KEY_STEPS] * 1;
        bucket[dayKey].label = dayKey + ", " + data.monthInWordsShort + ' ' + data.day + ', ' + data.year;

        totalSteps += bucket[dayKey].total;

        if (bucket[dayKey].total > dailyMaxTotalSteps) {
            dailyMaxTotalSteps = bucket[dayKey].total;
        }

        if (bucket[dayKey].total >= stepGoal) {
            stepGoalReachedCount += 1;
        }

    });

    const averageStepsPerDay = Math.round(totalSteps / 7);
    const bar_max_y = getRoundedCeil(dailyMaxTotalSteps);

    //create bar chart bucket
    const barChartData = daysOfWeekArr.map((day_name) => ({
            x: day_name,
            y: bucket[day_name].total,
            label: bucket[day_name].label,
            stepGoalMet: bucket[day_name].total >= stepGoal
        })
    );

    return {
        bar_max_y,
        stepGoal,

        barChartData,
        bucket,
        bucketKeys: daysOfWeekArr,

        averageStepsPerDay,
        stepGoalReachedCount,

    };
}

function getStepsScaleData(convertedData) {

    return {
        barChartScales : getBarChartScales(convertedData)
    }

}

function getBarChartScales(convertedData) {
    return {
        axisX : getBarChartScaleX(convertedData),
        axisY : getBarChartScaleY(convertedData)
    }
}

function getBarChartScaleX(convertedDataViews) {

    let scaleData= {};

    let arr = convertedDataViews.bucketKeys;

    for(let item of arr) {
        scaleData[item] = {
            "label" : item,
            "value" : item
        }
    }

    return scaleData;
}

function getBarChartScaleY(convertedDataViews) {
    let _mid = Math.round(convertedDataViews.bar_max_y/2);
    return {
        start : {"label" : "0", value : 0},
        mid : {"label" : _mid, value : _mid},
        end : {"label" : convertedDataViews.bar_max_y, value : convertedDataViews.bar_max_y},
        scale_label : {"label" : "", value : 0}
    };
}
