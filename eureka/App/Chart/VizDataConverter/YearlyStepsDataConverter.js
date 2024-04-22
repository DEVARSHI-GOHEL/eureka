import moment from 'moment';

import {addDateInfoToDataFragment, getSortedMonthsArray, getYearlyDatesMap} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS} from '../AppConstants/VitalDataConstants';
import {aggregateDays, getRoundedCeil} from "./tools";

export function convertYearlyStepsData(currentStepsData, stepGoal, startTs, endTs) {

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
    let currentBucket = getYearlyDatesMap(startTs, endTs);

    let arrOfDates = getSortedMonthsArray(currentBucket);
    let monthKeysArr = arrOfDates.monthKeysArr;
    let tsArr = arrOfDates.tsArr;

    let daysOfMonthArr = monthKeysArr;
    let bucket = {};

    daysOfMonthArr.forEach(month_name => {
        bucket[month_name] = {
            total: 0,
            label: month_name
        };
    });

    let totalSteps = 0;
    let averageStepsPerDay = 0;
    let dailyMaxTotalSteps = stepGoal;

    let stepGoalReachedCount = 0;
    let steps = 0;
    let month = 0

    const aggregatedDays = aggregateDays(currentStepsData);
    aggregatedDays.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS] * 1;

        data = addDateInfoToDataFragment(data);

        const date = data.monthInWords.substr(0, 3) + " " + data.year;

        let value = data[VITAL_CONSTANTS.KEY_STEPS] * 1;
        totalSteps += value;
        bucket[date].total += value;
        steps = steps + value;

        bucket[date].label = date;
        bucket[date].dateInWordsShort = date;
        bucket[date].ts = tsArr[month];

        if (value >= stepGoal) {
            stepGoalReachedCount += 1;
        }

        if (bucket[date].total > dailyMaxTotalSteps) {
            dailyMaxTotalSteps = bucket[date].total
        }

    });

    averageStepsPerDay = Math.round(totalSteps / 360);
    const bar_max_y = getRoundedCeil(dailyMaxTotalSteps);

    let barChartData = [];

    //create bar chart bucket
    daysOfMonthArr.forEach((day_name, index) => {
        console.log("Time", tsArr[index], moment(tsArr[index]).year());
        barChartData.push({
            x: day_name,
            y: bucket[day_name].total,
            label: bucket[day_name].label,
            stepGoalMet: bucket[day_name].total >= stepGoal
        });
    });


    let bucketKeys = [];
    daysOfMonthArr.forEach(day => {
        bucketKeys.push(bucket[day].dateInWordsShort);
    });

    return {
        bar_max_y,
        stepGoal,

        barChartData,
        bucket,
        bucketKeys: daysOfMonthArr,
        bucketK: bucketKeys,
        averageStepsPerDay,
        stepGoalReachedCount,
        free: true,
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

    let i=0;
    for(let item of arr) {
        let _label = "";
        let _value = "";

            if(i%4 == 0 || i===convertedDataViews.bucketKeys.length-1) {
                // let arr = item.split(" ");
                // let tempLabel = arr[0].substr(0, 3);
                _label = item; //tempLabel;
            }



        scaleData[item] = {
            "label" : _label,
            "value" : item
        }
        i++;
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
