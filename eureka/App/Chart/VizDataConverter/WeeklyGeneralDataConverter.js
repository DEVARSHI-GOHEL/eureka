import moment from 'moment';

import {getDateString, getShortHour, addDateInfoToDataFragment, getDaysArray, getAbsoluteHourInAmPm} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS, WARNING_RANGE, DATA_BOUNDS, MEASURE_TREND, getScaleData} from '../AppConstants/VitalDataConstants';
import {getLabelByDataType} from '../AppUtility/ChartAxisUtils';

import {toMMOL} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {t} from 'i18n-js';

const createBucketByWeekDay = () => {
    const result = {current:{},previous:{}};

    getDaysArray(0).forEach(index => {
        result.current[index] = {
            total : 0,
            totalCount : 0,
            countInRange : 0,
            max : 0,
            min : 0
        }
        result.previous[index] = {
            total : 0,
            totalCount : 0,
            countInRange : 0
        }
    })
    return result;
}


const createbucketByWeekDayBP = () => {
    const result = {current:{},previous:{}};
    getDaysArray(0).forEach(index => {
        result.current[index] = {
            totalSys : 0,
            totalCountSys : 0,
            countInRangeSys : 0,
            maxSys : 0,
            minSys : 0,
            totalDia : 0,
            totalCountDia : 0,
            countInRangeDia : 0,
        }
        result.previous[index] = {
            totalSys : 0,
            totalCountSys : 0,
            countInRangeSys : 0,
            totalDia : 0,
            totalCountDia : 0,
            countInRangeDia : 0
        }
    })
    return result;

}


export function convertWeeklyGeneralData(weeklyGeneralData, weeklyGeneralPreviousWeekData, startTs, endTs, vital_type) {

    if(!weeklyGeneralData || Object.keys(weeklyGeneralData).length == 0 || weeklyGeneralData.vital_data.length == 0) {
        return null;
    }

    let renderPreviousLine = true;
    if(!weeklyGeneralPreviousWeekData || Object.keys(weeklyGeneralPreviousWeekData).length == 0 || weeklyGeneralPreviousWeekData.vital_data.length == 0) {
        weeklyGeneralPreviousWeekData = {};
        weeklyGeneralPreviousWeekData.vital_data = [];
        renderPreviousLine = false;
    }

    let isBpData = (vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH || vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW)
    var convertedDataViews = isBpData ? 
                            convertWeeklyBpVitalData(startTs, endTs, weeklyGeneralData, weeklyGeneralPreviousWeekData, vital_type) : 
                            convertWeeklyGeneralVitalData(startTs, endTs, weeklyGeneralData, weeklyGeneralPreviousWeekData, vital_type, weeklyGeneralData.convertGlucoseData);
    
    var scaleData = getWeeklyGeneralVisualizationScaleData(vital_type, convertedDataViews, weeklyGeneralData.convertGlucoseData);

    var data = {
        startTs,
        endTs,
        ...scaleData,
        ...convertedDataViews,
        dualPlot : isBpData,
        renderPreviousLine
    };
    
    return data;
}

function convertWeeklyGeneralVitalData(startTs, endTs, dataThisWeek, dataPreviousWeek, vital_param_type, convertGlucoseData) {
    
    let vitalDataThisWeek = dataThisWeek.vital_data;
    let vitalDataPreviousWeek = dataPreviousWeek.vital_data;
    //bar
    var barChartData = [];

    //daily average
    var currentComparisonDailyLineData = [];
    var previousComparisonDailyLineData = [];
    var scatterPlotData = [];
    var minScatterData = [];
    var maxScatterData = [];
    var minmaxLineData = [];

    var currentComparisonHourlyLineData = [];
    var previousComparisonHourlyLineData = [];
    var currentComparisonHourlyScatterData = [];

    var bucketByHour = {
        current : [
            
        ],
        previous : [

        ]
    };

    let _hour = 0;
    while(_hour <= 23) {
        bucketByHour.current.push({total : 0,totalCount : 0, average : 0});
        bucketByHour.previous.push({total : 0,totalCount : 0, average : 0});
        _hour++;
    }

    var bucketByWeekDay = createBucketByWeekDay();

    let weekdayLastData = null
    let hourlyLastData = null;
    
    //Loop through this weeks data if any and start calculating data
    vitalDataThisWeek.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);

        let value = data[vital_param_type]*1;

        console.log('data',JSON.stringify(data))
        console.log('data.dayOfTheWeekInWordsShort:',JSON.stringify(data.dayOfTheWeekInWordsShort))
        console.log('bucketByWeekDay.current:',JSON.stringify(bucketByWeekDay.current))

        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].total = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].total + value;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCount = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCount + 1;
        
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dayOfWeekInWords = data.dayOfWeekInWords;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dayOfTheWeekInWordsShort = data.dayOfTheWeekInWordsShort;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dateInWords = data.dateInWords;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dateInWordsShort = data.dateInWordsShort;

        if(bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].min == 0) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].min = value;
        }

        if(bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].max == 0) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].max = value;
        }

        if(value < bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].min) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].min = value;
        }

        if(value > bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].max) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].max = value;
        }

        if(value >= WARNING_RANGE[vital_param_type].min && value <= WARNING_RANGE[vital_param_type].max) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRange = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRange + 1;
        }

        let _moment = moment(data.ts);

        let hour = _moment.hour();

        let timeInWords = getAbsoluteHourInAmPm(hour);
        bucketByHour.current[hour].total = bucketByHour.current[hour].total + value;
        bucketByHour.current[hour].totalCount = bucketByHour.current[hour].totalCount + 1;
        bucketByHour.current[hour].timeInWords = timeInWords;

    });

    //Loop through previous week's data if any
    vitalDataPreviousWeek.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);

        let value = data[vital_param_type]*1;

        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].total = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].total + value;
        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCount = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCount + 1;

        if(value >= WARNING_RANGE[vital_param_type].min && value <= WARNING_RANGE[vital_param_type].max) {
            bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRange = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRange + 1;
        }
        
        let _moment = moment(data.ts);

        let hour = _moment.hour();

        let timeInWords = getAbsoluteHourInAmPm(hour);

        bucketByHour.previous[hour].total = bucketByHour.previous[hour].total + value;
        bucketByHour.previous[hour].totalCount = bucketByHour.previous[hour].totalCount + 1;
        bucketByHour.previous[hour].timeInWords = timeInWords;
    });


    //START DAY OF THE WEEK AVERAGE, MIN, MAX, CALCULATIONS

    //Find the week day name orders
    let daysOfWeekArr = getDaysArray(moment(endTs).day());


    let noOfDaysRangeImproved = 0;
    let noOfCurrentDaysAboveBenchmark = 0;
    let noOfPreviousDaysAboveBenchmark = 0;

    //Start bucketing weekly data and normalize
    daysOfWeekArr.forEach((dayShortName) => {

        let currentTotalCount   = bucketByWeekDay.current[dayShortName].totalCount;
        if(currentTotalCount==0)currentTotalCount =1;
        let currentCountInRange = bucketByWeekDay.current[dayShortName].countInRange;
        let currentTotal        = bucketByWeekDay.current[dayShortName].total; 
        
        let currentInRangePercent = Math.round( ((currentCountInRange/currentTotalCount)*100) * 10 ) / 10;
        let currentAverage        = Math.round( (currentTotal/currentTotalCount) * 10 ) / 10;

        let previousTotalCount   = bucketByWeekDay.previous[dayShortName].totalCount;
        if(previousTotalCount==0)previousTotalCount =1;
        let previousCountInRange = bucketByWeekDay.previous[dayShortName].countInRange;
        let previousTotal        = bucketByWeekDay.previous[dayShortName].total; 

        let previousInRangePercent = Math.round( ((previousCountInRange/previousTotalCount)*100) * 10 ) / 10;
        let previousAverage        = Math.round( (previousTotal/previousTotalCount) * 10 ) / 10;

        //Check if this day of the current week had percentage value in range
        if(currentInRangePercent > 70) {
            noOfCurrentDaysAboveBenchmark+=1;
        }

        //Check if this day of the current week had percentage value in range
        if(previousInRangePercent > 70) {
            noOfPreviousDaysAboveBenchmark+=1;
        }

        let _DATA_RANGE = WARNING_RANGE[vital_param_type];

        let fallbackAverage = null;
        let previousFallbackAverage = null;

        let fallbackMax = null;
        let fallbackMin = null;

        //Normalize the values for daily comparison for week
        if(currentAverage < _DATA_RANGE.min) {
            fallbackAverage = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverage > _DATA_RANGE.max) {
            fallbackAverage = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverage < _DATA_RANGE.min) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverage > _DATA_RANGE.max) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMax;
        }

        if(bucketByWeekDay.current[dayShortName].min < _DATA_RANGE.min) {
            fallbackMin = _DATA_RANGE.fallback.min;
        }

        if(bucketByWeekDay.current[dayShortName].min > _DATA_RANGE.max) {
            fallbackMin = _DATA_RANGE.fallback.max;
        }

        if(bucketByWeekDay.current[dayShortName].max < _DATA_RANGE.min) {
            fallbackMax = _DATA_RANGE.fallback.min;
        }

        if(bucketByWeekDay.current[dayShortName].max > _DATA_RANGE.max) {
            fallbackMax = _DATA_RANGE.fallback.max;
        }

        /*Extra conditions for rendering min max icons and circle icons*/
        if(currentAverage == 0 || fallbackAverage ==  _DATA_RANGE.fallback.averageMin) {
            fallbackMin = 0;
        }

        if(currentAverage == 0 || fallbackAverage ==  _DATA_RANGE.fallback.averageMax) {
            fallbackMax = 0;
        }

        if(fallbackMin == fallbackMax) {
            
            if(fallbackMin!=null)
                fallbackMin = 0;

            if(fallbackMax!=null)
                fallbackMax = 0;
        }

        //This is for when everything is normal and not out of bounds
        if(currentAverage == bucketByWeekDay.current[dayShortName].max) {
            bucketByWeekDay.current[dayShortName].skipMax = true; //Important
        }

        if(currentAverage == bucketByWeekDay.current[dayShortName].min) {
            bucketByWeekDay.current[dayShortName].skipMin = true; ///Important
        }
        /************************************************************************** */

        bucketByWeekDay.current[dayShortName].percentInRange = currentInRangePercent;
        bucketByWeekDay.current[dayShortName].average        = currentAverage;

        bucketByWeekDay.previous[dayShortName].percentInRange = previousInRangePercent;
        bucketByWeekDay.previous[dayShortName].average        = previousAverage;

        if(fallbackAverage != null) {
            bucketByWeekDay.current[dayShortName].fallbackAverage = fallbackAverage*1;
        }

        if(fallbackMax != null) {
            bucketByWeekDay.current[dayShortName].fallbackMax = fallbackMax*1;
        }

        if(fallbackMin != null) {
            bucketByWeekDay.current[dayShortName].fallbackMin = fallbackMin*1;
        }

        if(previousFallbackAverage != null) {
            bucketByWeekDay.previous[dayShortName].fallbackAverage = previousFallbackAverage*1;
        }
        

        //Organize weekday bar chart and scatter plot data
        barChartData.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].percentInRange});

        currentComparisonDailyLineData.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].average, fallback : bucketByWeekDay.current[dayShortName].fallbackAverage});
        previousComparisonDailyLineData.push({x : dayShortName, y : bucketByWeekDay.previous[dayShortName].average, fallback : bucketByWeekDay.previous[dayShortName].fallbackAverage});
        
        let maindata = {x : dayShortName, y : bucketByWeekDay.current[dayShortName].average, fallback : bucketByWeekDay.current[dayShortName].fallbackAverage};
        maindata = computeMetaDataWeekday(maindata, weekdayLastData, bucketByWeekDay.current[dayShortName], vital_param_type, convertGlucoseData);

        //This has to be computed because max min has to be shown along with average
        maindata.max = bucketByWeekDay.current[dayShortName].max;
        maindata.min = bucketByWeekDay.current[dayShortName].min;
        maindata.measureColorMax = DATA_BOUNDS[vital_param_type](bucketByWeekDay.current[dayShortName].max);
        maindata.measureColorMin = DATA_BOUNDS[vital_param_type](bucketByWeekDay.current[dayShortName].min);

        scatterPlotData.push(maindata);
        
        minScatterData.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].min, fallback : bucketByWeekDay.current[dayShortName].fallbackMin, 
            measureColor : DATA_BOUNDS[vital_param_type](bucketByWeekDay.current[dayShortName].min), skipMin : bucketByWeekDay.current[dayShortName].skipMin });
        maxScatterData.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].max, fallback : bucketByWeekDay.current[dayShortName].fallbackMax, 
            measureColor : DATA_BOUNDS[vital_param_type](bucketByWeekDay.current[dayShortName].max), skipMax : bucketByWeekDay.current[dayShortName].skipMax });
        
        let minmaxFallback = bucketByWeekDay.current[dayShortName].fallbackAverage ? bucketByWeekDay.current[dayShortName].fallbackAverage : bucketByWeekDay.current[dayShortName].average;

        minmaxLineData.push({x1 : dayShortName, y1 : bucketByWeekDay.current[dayShortName].max, x2 : dayShortName, y2 : bucketByWeekDay.current[dayShortName].min,
                                fallbacky1 : bucketByWeekDay.current[dayShortName].fallbackMax, fallbacky2 : bucketByWeekDay.current[dayShortName].fallbackMin, 
                                fallback : minmaxFallback,
                                skipMin : bucketByWeekDay.current[dayShortName].skipMin, skipMax : bucketByWeekDay.current[dayShortName].skipMax});

        if(bucketByWeekDay.current[dayShortName].average != 0)
            weekdayLastData = maindata;

    });


    //START HOURLY DATA AVERAGE CALCULATIONs
    var hoursArr = Object.keys(bucketByHour.current);

    hoursArr.forEach((hour) => {

        let currentTotalCount = bucketByHour.current[hour].totalCount;
        if(currentTotalCount == 0)currentTotalCount=1; 
        let currentTotal = bucketByHour.current[hour].total;

        let previousTotalCount = bucketByHour.previous[hour].totalCount;
        if(previousTotalCount == 0)previousTotalCount=1; 
        let previousTotal = bucketByHour.previous[hour].total;

        let currentAverage = Math.round((currentTotal/currentTotalCount) * 10)/10;
        let previousAverage = Math.round((previousTotal/previousTotalCount) * 10)/10;

        let fallbackAverage = null;
        let previousFallbackAverage = null;

        let _DATA_RANGE = WARNING_RANGE[vital_param_type];
        //Normalize the values for daily comparison for week
        if(currentAverage < _DATA_RANGE.min) {
            fallbackAverage = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverage > _DATA_RANGE.max) {
            fallbackAverage = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverage < _DATA_RANGE.min) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverage > _DATA_RANGE.max) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMax;
        }

        bucketByHour.current[hour].average = currentAverage;
        bucketByHour.previous[hour].average = previousAverage;

        if(fallbackAverage) {
            bucketByHour.current[hour].fallbackAverage = fallbackAverage*1;
        }

        if(previousFallbackAverage) {
            bucketByHour.previous[hour].fallbackAverage = previousFallbackAverage*1;
        }

        currentComparisonHourlyLineData[hour] = {x : hour, y : bucketByHour.current[hour].average, fallback : bucketByHour.current[hour].fallbackAverage};
        previousComparisonHourlyLineData[hour] = {x : hour, y : bucketByHour.previous[hour].average, fallback : bucketByHour.previous[hour].fallbackAverage};
        
        let maindata = {x : hour, y : bucketByHour.current[hour].average, fallback : bucketByHour.current[hour].fallbackAverage};
        maindata = computeMetaDataHourly(maindata, hourlyLastData, bucketByHour.current[hour], vital_param_type, convertGlucoseData);

        currentComparisonHourlyScatterData[hour] = maindata;

        if(bucketByHour.current[hour].average != 0)
            hourlyLastData = maindata;
    });

    if(weekdayLastData) {
        weekdayLastData.convertGlucoseData = convertGlucoseData;
    }
    
    if(hourlyLastData) {
        hourlyLastData.convertGlucoseData = convertGlucoseData;
    }

    return {
        bucketKeys : daysOfWeekArr,
        hourBucketKeys : hoursArr,

        bucket : bucketByWeekDay,
        hourBucket : bucketByHour,

        barChartData,
        
        linePathData : currentComparisonDailyLineData,
        previousLinePathData : previousComparisonDailyLineData,
        scatterPlotData,
        minScatterData,
        maxScatterData,
        minmaxLineData,

        hourLinePathData : currentComparisonHourlyLineData,
        previousHourLinePathData : previousComparisonHourlyLineData,
        hourScatterPlotData : currentComparisonHourlyScatterData,
        hourMinmaxLineData : [],

        summary : {
            noOfDaysRangeImproved : (noOfCurrentDaysAboveBenchmark - noOfPreviousDaysAboveBenchmark),
            noOfCurrentDaysAboveBenchmark
        },

        convertGlucoseData,

        lastDayData : weekdayLastData,
        lastHourData : hourlyLastData //TODO
        
    };
}

function convertWeeklyBpVitalData(startTs, endTs, dataThisWeek, dataPreviousWeek, vital_param_type) {
    
    let vitalDataThisWeek = dataThisWeek.vital_data;
    let vitalDataPreviousWeek = dataPreviousWeek.vital_data;
    //bar
    var barChartDataSys = [];
    var barChartDataDia = [];

    //daily average
    var currentComparisonDailyLineData = [];
    var previousComparisonDailyLineData = [];
    var scatterPlotData = [];
    var minScatterData = [];
    var maxScatterData = [];
    var minmaxLineData = [];
    var minmaxLineHourlyData = [];

    var currentComparisonHourlyLineData = [];
    var previousComparisonHourlyLineData = [];
    var currentComparisonHourlyScatterData = [];

    var bucketByHour = {
        current : [
            
        ],
        previous : [

        ]
    };

    let _hour = 0;
    while(_hour <= 23) {
        bucketByHour.current.push({totalSys : 0,totalCountSys : 0, averageSys : 0, totalDia : 0,totalCountDia : 0, averageDia : 0});
        bucketByHour.previous.push({totalSys : 0,totalCountSys : 0, averageSys : 0, totalDia : 0,totalCountDia : 0, averageDia : 0});
        _hour++;
    }

    var bucketByWeekDay =createbucketByWeekDayBP();

    let weekdayLastData = null
    let hourlyLastData = null;

    //Loop through current WEEK data and calculate weekday and hourly bucket for current week
    vitalDataThisWeek.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);

        let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]*1;
        let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]*1;
        //Sys
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalSys = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalSys + valueSys;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCountSys = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCountSys + 1;

        //Dia
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalDia = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalDia + valueDia;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCountDia = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].totalCountDia + 1;
        
        //Add date time info to bucket
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dayOfWeekInWords = data.dayOfWeekInWords;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dayOfTheWeekInWordsShort = data.dayOfTheWeekInWordsShort;
        bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].dateInWords = data.dateInWords;

        //Compute value in range - Sys
        if(valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min && valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRangeSys = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRangeSys + 1;
        }

        //Compute value in range - Dia
        if(valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min && valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max) {
            bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRangeDia = bucketByWeekDay.current[data.dayOfTheWeekInWordsShort].countInRangeDia + 1;
        }

        let _moment = moment(data.ts);

        let hour = _moment.hour();

        let timeInWords = getAbsoluteHourInAmPm(hour);

        //Hourly bucket - Sys
        bucketByHour.current[hour].totalSys = bucketByHour.current[hour].totalSys + valueSys;
        bucketByHour.current[hour].totalCountSys = bucketByHour.current[hour].totalCountSys + 1;

        //Hourly bucket - Dia
        bucketByHour.current[hour].totalDia = bucketByHour.current[hour].totalDia + valueDia;
        bucketByHour.current[hour].totalCountDia = bucketByHour.current[hour].totalCountDia + 1;

        bucketByHour.current[hour].timeInWords = timeInWords;

    });

     //Loop through previous WEEK data and calculate weekday and hourly bucket for current week, if at all any
    vitalDataPreviousWeek.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);

        let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]*1;
        let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]*1;

        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalSys = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalSys + valueSys;
        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCountSys = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCountSys + 1;

        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalDia = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalDia + valueDia;
        bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCountDia = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].totalCountDia + 1;

        if(valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min && valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
            bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRangeSys = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRangeSys + 1;
        }

        if(valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min && valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max) {
            bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRangeDia = bucketByWeekDay.previous[data.dayOfTheWeekInWordsShort].countInRangeDia + 1;
        }
        
        let _moment = moment(data.ts);

        let hour = _moment.hour();

        bucketByHour.previous[hour].totalSys = bucketByHour.previous[hour].totalSys + valueSys;
        bucketByHour.previous[hour].totalCountSys = bucketByHour.previous[hour].totalCountSys + 1;

        bucketByHour.previous[hour].totalDia = bucketByHour.previous[hour].totalDia + valueDia;
        bucketByHour.previous[hour].totalCountDia = bucketByHour.previous[hour].totalCountDia + 1;
    });


    //START DAY OF THE WEEK AVERAGE, MIN, MAX, CALCULATIONS

    //Find the week day name orders
    let daysOfWeekArr = getDaysArray(moment(endTs).day());


    let noOfDaysRangeImprovedSys = 0;
    let noOfPreviousDaysAboveBenchmarkSys = 0;
    let noOfCurrentDaysAboveBenchmarkSys = 0;

    let noOfDaysRangeImprovedDia = 0;
    let noOfPreviousDaysAboveBenchmarkDia = 0;
    let noOfCurrentDaysAboveBenchmarkDia = 0;


    //Start bucketing weekly data and normalize
    daysOfWeekArr.forEach((dayShortName) => {

        //====================================== FOR SYSTOLIC =================================================
        let currentTotalCountSys   = bucketByWeekDay.current[dayShortName].totalCountSys;
        if(currentTotalCountSys==0)currentTotalCountSys =1;
        let currentCountInRangeSys = bucketByWeekDay.current[dayShortName].countInRangeSys;
        let currentTotalSys        = bucketByWeekDay.current[dayShortName].totalSys; 
        
        let currentInRangePercentSys = Math.round( ((currentCountInRangeSys/currentTotalCountSys)*100) * 10 ) / 10;
        let currentAverageSys        = Math.round( (currentTotalSys/currentTotalCountSys) * 10 ) / 10;

        let previousTotalCountSys   = bucketByWeekDay.previous[dayShortName].totalCountSys;
        if(previousTotalCountSys==0)previousTotalCountSys =1;
        let previousCountInRangeSys = bucketByWeekDay.previous[dayShortName].countInRangeSys;
        let previousTotalSys        = bucketByWeekDay.previous[dayShortName].totalSys; 

        let previousInRangePercentSys = Math.round( ((previousCountInRangeSys/previousTotalCountSys)*100) * 10 ) / 10;
        let previousAverageSys        = Math.round( (previousTotalSys/previousTotalCountSys) * 10 ) / 10;

        //Check if this day of the current week had percentage value in range
        if(currentInRangePercentSys > 70) {
            noOfCurrentDaysAboveBenchmarkSys+=1;
        }
        
        //Check if this day of the previous week had percentage value in range
        if(previousInRangePercentSys > 70) {
            noOfPreviousDaysAboveBenchmarkSys+=1;
        }

        let _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH];

        let fallbackAverageSys = null;
        let previousFallbackAverageSys = null;

        //Normalize the values for daily comparison for week
        if(currentAverageSys < _DATA_RANGE.min) {
            fallbackAverageSys = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverageSys > _DATA_RANGE.max) {
            fallbackAverageSys = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverageSys < _DATA_RANGE.min) {
            previousFallbackAverageSys = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverageSys > _DATA_RANGE.max) {
            previousFallbackAverageSys = _DATA_RANGE.fallback.averageMax;
        }

        bucketByWeekDay.current[dayShortName].percentInRangeSys = currentInRangePercentSys;
        bucketByWeekDay.current[dayShortName].averageSys        = currentAverageSys;

        bucketByWeekDay.previous[dayShortName].percentInRangeSys = previousInRangePercentSys;
        bucketByWeekDay.previous[dayShortName].averageSys        = previousAverageSys;

        if(fallbackAverageSys != null) {
            bucketByWeekDay.current[dayShortName].fallbackAverageSys = fallbackAverageSys*1;
        }

        if(previousFallbackAverageSys != null) {
            bucketByWeekDay.previous[dayShortName].fallbackAverageSys = previousFallbackAverageSys*1;
        }


        // ========================================= FOR DIASTOLIC =============================================================
        let currentTotalCountDia   = bucketByWeekDay.current[dayShortName].totalCountDia;
        if(currentTotalCountDia==0)currentTotalCountDia =1;
        let currentCountInRangeDia = bucketByWeekDay.current[dayShortName].countInRangeDia;
        let currentTotalDia        = bucketByWeekDay.current[dayShortName].totalDia; 
        
        let currentInRangePercentDia = Math.round( ((currentCountInRangeDia/currentTotalCountDia)*100) * 10 ) / 10;
        let currentAverageDia        = Math.round( (currentTotalDia/currentTotalCountDia) * 10 ) / 10;

        let previousTotalCountDia   = bucketByWeekDay.previous[dayShortName].totalCountDia;
        if(previousTotalCountDia==0)previousTotalCountDia =1;
        let previousCountInRangeDia = bucketByWeekDay.previous[dayShortName].countInRangeDia;
        let previousTotalDia        = bucketByWeekDay.previous[dayShortName].totalDia; 

        let previousInRangePercentDia = Math.round( ((previousCountInRangeDia/previousTotalCountDia)*100) * 10 ) / 10;
        let previousAverageDia        = Math.round( (previousTotalDia/previousTotalCountDia) * 10 ) / 10;

        //Check if this day of the current week had percentage value in range
        if(currentInRangePercentDia > 70) {
            noOfCurrentDaysAboveBenchmarkDia+=1;
        }

        //Check if this day of the previous week had percentage value in range
        if(previousInRangePercentDia > 70) {
            noOfPreviousDaysAboveBenchmarkDia+=1;
        }

        _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW];

        let fallbackAverageDia = null;
        let previousFallbackAverageDia = null;

        //Normalize the values for daily comparison for week
        if(currentAverageDia < _DATA_RANGE.min) {
            fallbackAverageDia = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverageDia > _DATA_RANGE.max) {
            fallbackAverageDia = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverageDia < _DATA_RANGE.min) {
            previousFallbackAverageDia = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverageDia > _DATA_RANGE.max) {
            previousFallbackAverageDia = _DATA_RANGE.fallback.averageMax;
        }

        bucketByWeekDay.current[dayShortName].percentInRangeDia = currentInRangePercentDia;
        bucketByWeekDay.current[dayShortName].averageDia        = currentAverageDia;

        bucketByWeekDay.previous[dayShortName].percentInRangeDia = previousInRangePercentDia;
        bucketByWeekDay.previous[dayShortName].averageDia        = previousAverageDia;

        if(fallbackAverageDia != null) {
            bucketByWeekDay.current[dayShortName].fallbackAverageDia = fallbackAverageDia*1;
        }

        if(previousFallbackAverageDia != null) {
            bucketByWeekDay.previous[dayShortName].fallbackAverageDia = previousFallbackAverageDia*1;
        }


        // SYS stays on top - y1 | DIA stays at bottom - y2 *****

        //Organize weekday bar chart and scatter plot data
        barChartDataSys.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].percentInRangeSys});
        barChartDataDia.push({x : dayShortName, y : bucketByWeekDay.current[dayShortName].percentInRangeDia});

        let maindata = {x : dayShortName, x1 : dayShortName, x2 : dayShortName, y1 : bucketByWeekDay.current[dayShortName].averageSys, y2 : bucketByWeekDay.current[dayShortName].averageDia,
            fallbacky1 : bucketByWeekDay.current[dayShortName].fallbackAverageSys, fallbacky2 : bucketByWeekDay.current[dayShortName].fallbackAverageDia}

        maindata = computeMetaDataWeekday(maindata, weekdayLastData, bucketByWeekDay.current[dayShortName], vital_param_type);

        currentComparisonDailyLineData.push(maindata);

        previousComparisonDailyLineData.push(
            {x : dayShortName, y1 : bucketByWeekDay.previous[dayShortName].averageSys, y2 : bucketByWeekDay.previous[dayShortName].averageDia,
                fallbacky1 : bucketByWeekDay.previous[dayShortName].fallbackAverageSys, fallbacky2 : bucketByWeekDay.previous[dayShortName].fallbackAverageDia}
        );

        scatterPlotData.push(maindata);
        
        minmaxLineData.push(maindata);

        if(bucketByWeekDay.current[dayShortName].averageSys > 0 && bucketByWeekDay.current[dayShortName].averageDia > 0) {
            weekdayLastData = maindata;
        }
        
    });


    //START HOURLY DATA AVERAGE CALCULATIONs
    var hoursArr = Object.keys(bucketByHour.current);

    hoursArr.forEach((hour) => {

        //====================================== FOR SYSTOLIC =================================================
        let currentTotalCountSys = bucketByHour.current[hour].totalCountSys;
        if(currentTotalCountSys == 0)currentTotalCountSys=1; 
        let currentTotalSys = bucketByHour.current[hour].totalSys;

        let previousTotalCountSys = bucketByHour.previous[hour].totalCountSys;
        if(previousTotalCountSys == 0)previousTotalCountSys=1; 
        let previousTotalSys = bucketByHour.previous[hour].totalSys;

        let currentAverageSys = Math.round((currentTotalSys/currentTotalCountSys) * 10)/10;
        let previousAverageSys = Math.round((previousTotalSys/previousTotalCountSys) * 10)/10;

        let fallbackAverageSys = null;
        let previousFallbackAverageSys = null;

        let _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH];

        //Normalize the values for daily comparison for week
        if(currentAverageSys < _DATA_RANGE.min) {
            fallbackAverageSys = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverageSys > _DATA_RANGE.max) {
            fallbackAverageSys = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverageSys < _DATA_RANGE.min) {
            previousFallbackAverageSys = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverageSys > _DATA_RANGE.max) {
            previousFallbackAverageSys = _DATA_RANGE.fallback.averageMax;
        }

        bucketByHour.current[hour].averageSys = currentAverageSys;
        bucketByHour.previous[hour].averageSys = previousAverageSys;

        if(fallbackAverageSys) {
            bucketByHour.current[hour].fallbackAverageSys = fallbackAverageSys*1;
        }

        if(previousFallbackAverageSys) {
            bucketByHour.previous[hour].fallbackAverageSys = previousFallbackAverageSys*1;
        }

        //====================================== FOR DIASTOLIC =================================================

        let currentTotalCountDia = bucketByHour.current[hour].totalCountDia;
        if(currentTotalCountDia == 0)currentTotalCountDia=1; 
        let currentTotalDia = bucketByHour.current[hour].totalDia;

        let previousTotalCountDia = bucketByHour.previous[hour].totalCountDia;
        if(previousTotalCountDia == 0)previousTotalCountDia=1; 
        let previousTotalDia = bucketByHour.previous[hour].totalDia;

        let currentAverageDia = Math.round((currentTotalDia/currentTotalCountDia) * 10)/10;
        let previousAverageDia = Math.round((previousTotalDia/previousTotalCountDia) * 10)/10;

        let fallbackAverageDia = null;
        let previousFallbackAverageDia = null;

        _DATA_RANGE = WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW];

        //Normalize the values for daily comparison for week
        if(currentAverageDia < _DATA_RANGE.min) {
            fallbackAverageDia = _DATA_RANGE.fallback.averageMin;
        }
        else if(currentAverageDia > _DATA_RANGE.max) {
            fallbackAverageDia = _DATA_RANGE.fallback.averageMax;
        }

        if(previousAverageDia < _DATA_RANGE.min) {
            previousFallbackAverageDia = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverageDia > _DATA_RANGE.max) {
            previousFallbackAverageDia = _DATA_RANGE.fallback.averageMax;
        }

        bucketByHour.current[hour].averageDia = currentAverageDia;
        bucketByHour.previous[hour].averageDia = previousAverageDia;

        if(fallbackAverageDia) {
            bucketByHour.current[hour].fallbackAverageDia = fallbackAverageDia*1;
        }

        if(previousFallbackAverageDia) {
            bucketByHour.previous[hour].fallbackAverageDia = previousFallbackAverageDia*1;
        }

        let maindata = {x : hour, x1 : hour, x2 : hour, y1 : bucketByHour.current[hour].averageSys, y2 : bucketByHour.current[hour].averageDia,
            fallbacky1 : bucketByHour.current[hour].fallbackAverageSys, fallbacky2 : bucketByHour.current[hour].fallbackAverageDia, dualPlot : true};
        
        maindata = computeMetaDataHourly(maindata, hourlyLastData, bucketByHour.current[hour], vital_param_type);

        currentComparisonHourlyLineData[hour] = maindata;
        previousComparisonHourlyLineData[hour] = {x : hour, x1 : hour, x2 : hour, y1 : bucketByHour.previous[hour].averageSys, y2 : bucketByHour.previous[hour].averageDia,
            fallbacky1 : bucketByHour.previous[hour].fallbackAverageSys, fallbacky2 : bucketByHour.previous[hour].fallbackAverageDia};

        currentComparisonHourlyScatterData[hour] = maindata;

        minmaxLineHourlyData[hour] = maindata;

        if(bucketByHour.current[hour].averageSys > 0 && bucketByHour.current[hour].averageDia > 0) {
            hourlyLastData = maindata;
        }
    });

    return {
        bucketKeys : daysOfWeekArr,
        hourBucketKeys : hoursArr,

        bucket : bucketByWeekDay,
        hourBucket : bucketByHour,

        barChartData : {
            [VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] : barChartDataSys,
            [VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW] : barChartDataDia
        },
        
        linePathData : currentComparisonDailyLineData,
        previousLinePathData : previousComparisonDailyLineData,
        scatterPlotData,

        minScatterData,
        maxScatterData,

        minmaxLineData,

        hourLinePathData : currentComparisonHourlyLineData,
        previousHourLinePathData : previousComparisonHourlyLineData,
        hourScatterPlotData : currentComparisonHourlyScatterData,

        hourMinmaxLineData : minmaxLineHourlyData,

        summary : {
            noOfDaysRangeImprovedSys : (noOfCurrentDaysAboveBenchmarkSys - noOfPreviousDaysAboveBenchmarkSys),
            noOfCurrentDaysAboveBenchmarkSys,noOfPreviousDaysAboveBenchmarkSys,
            noOfDaysRangeImprovedDia : (noOfCurrentDaysAboveBenchmarkDia - noOfPreviousDaysAboveBenchmarkDia),noOfPreviousDaysAboveBenchmarkDia,
            noOfCurrentDaysAboveBenchmarkDia
        },

        lastDayData : weekdayLastData,
        lastHourData : hourlyLastData //TODO
        
    };
}

function getWeeklyGeneralVisualizationScaleData(vital_type, convertedDataViews, convertGlucoseData) {
    
    var barChartScales = {};
    var scatterScale = {};
    var scatterScaleHour = {};

    barChartScales.axisX = getWeeklyBarChartXScaleData(convertedDataViews);
    barChartScales.axisY = getWeeklyBarChartYScaleData(vital_type);

    scatterScale.axisX = getWeeklyAverageByDayXScaleData(convertedDataViews)
    scatterScale.axisY = getYScaleData(vital_type, WARNING_RANGE[vital_type].min, WARNING_RANGE[vital_type].max, convertGlucoseData);

    scatterScaleHour.axisX = getWeeklyAverageByHourXScaleData(convertedDataViews)
    scatterScaleHour.axisY = getYScaleData(vital_type, WARNING_RANGE[vital_type].min, WARNING_RANGE[vital_type].max, convertGlucoseData);

    return {barChartScales, scatterScale, scatterScaleHour};
}

function getWeeklyBarChartXScaleData(convertedDataViews) {
    return convertedDataViews.bucketKeys;
}

function getWeeklyBarChartYScaleData(vital_type) {

    //let isB
    return {
        start : {"label" : "0", value : 0},
        mid : {"label" : 70, value : 70},
        end : {"label" : 100, value : 100},
        scale_label : {"label" : vital_type == VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE ? t('barChartYScaleData.label') : t('barChartYScaleData.labelNormal'), value : 65}
    };
}

function getWeeklyAverageByDayXScaleData(convertedDataViews) {
    let scaleData= {};
    
    convertedDataViews.bucketKeys.forEach(item => {
        scaleData[item] = {
            "label" : item,
            "value" : item
        }
    })

    return scaleData;
}

function getWeeklyAverageByHourXScaleData(convertedDataViews) {

    let scaleData= {24 : {"label" : "", value : 24}};

    let hoursArr = convertedDataViews.hourBucketKeys;

    hoursArr.forEach(item => {
        scaleData[item] = {
            "label" : [0, 12, 23].indexOf(item*1) > -1 ?  (item*1 == 23 ? "<12pm" : getAbsoluteHourInAmPm(item*1) ) : "",
            "value" : item
        }
    });

    return scaleData;

    // return {
    //     "start" : {"label" : "12 am", value : 0},
    //     "end" : {"label" : "12 am", value : 24}
    // }
}

function getYScaleData(vital_type, y_min, y_max, convertGlucoseData) {

    let _DATA_RANGE = getScaleData(vital_type, y_min, y_max, true);
    let yAxisLabel = convertGlucoseData ? GLUCOSE_UNIT.MMOL : getLabelByDataType(vital_type);

    return {
        "start" : {
            "label" : "", 
            "value" : _DATA_RANGE.MIN
        },
        "actual_start" : {
            "label" : convertGlucoseData ? toMMOL(_DATA_RANGE.RANGE_BOTTOM) : _DATA_RANGE.RANGE_BOTTOM, 
            "value" : _DATA_RANGE.RANGE_BOTTOM,
            "warning" : (_DATA_RANGE.RANGE_BOTTOM == WARNING_RANGE[vital_type].min)
        },

        "mid" : {
            "label" :  convertGlucoseData ? toMMOL(_DATA_RANGE.RANGE_MID) : _DATA_RANGE.RANGE_MID, 
            "value" : _DATA_RANGE.RANGE_MID
        },

        "scale_label" : {
            "label" : yAxisLabel, 
            "value" : _DATA_RANGE.RANGE_MID
        },
        
        "end" : {"label" : "", value : _DATA_RANGE.MAX},

        "actual_end" : {
            "label" : convertGlucoseData ? toMMOL(_DATA_RANGE.RANGE_TOP) : _DATA_RANGE.RANGE_TOP, 
            "value" : _DATA_RANGE.RANGE_TOP,
            "warning" : (_DATA_RANGE.RANGE_TOP == WARNING_RANGE[vital_type].max)
        }
    };
}

function computeMetaDataWeekday (thisData, dataBefore, bucketData, vital_type, convertGlucoseData) {
    
    if(vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH || vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW) {
        return computeBpMetaDataWeekday(thisData, dataBefore, bucketData, vital_type);
    }
    else {
        return computeGeneralMetaDataWeekday(thisData, dataBefore, bucketData, vital_type, convertGlucoseData);
    }
}

function computeMetaDataHourly(thisData, dataBefore, bucketData, vital_type, convertGlucoseData) {
    if(vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH || vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW) {
        return computeBpMetaDataHourly(thisData, dataBefore,bucketData, vital_type);
    }
    else {
        return computeGeneralMetaDataHourly(thisData, dataBefore, bucketData, vital_type, convertGlucoseData);
    }
}

function computeGeneralMetaDataWeekday(thisData, dataBefore, bucketData, vital_type, convertGlucoseData) {

    let tempData = computeGeneralMetaData(thisData, dataBefore, bucketData, vital_type, convertGlucoseData);
    tempData = addDateSignatureMeta(tempData, bucketData);console.log(tempData);
    tempData.readingText = "averageFor";
    return tempData;
}

function computeBpMetaDataWeekday(thisData, dataBefore, bucketData, vital_type) {
    let tempData = computeBpMetaData(thisData, dataBefore, bucketData, vital_type);
    tempData = addDateSignatureMeta(tempData, bucketData);
    tempData.readingText = "averageFor";
    return tempData;
}

function computeGeneralMetaDataHourly(thisData, dataBefore, bucketData, vital_type, convertGlucoseData) {

    let tempData = computeGeneralMetaData(thisData, dataBefore, bucketData, vital_type, convertGlucoseData);
    tempData = addTimeSignature(tempData, bucketData);
    tempData.readingText = "averageAt";
    return tempData;
}

function computeBpMetaDataHourly(thisData, dataBefore, bucketData, vital_type) {
    let tempData = computeBpMetaData(thisData, dataBefore, bucketData, vital_type);
    tempData = addTimeSignature(tempData, bucketData);
    tempData.readingText = "averageAt";
    return tempData;
}

function computeGeneralMetaData(thisData, dataBefore, bucketData, vital_type, convertGlucoseData) {

    let measureColor = DATA_BOUNDS[vital_type](thisData.y*1);
    let measureTrend = 0;

    if(!dataBefore) {
        measureTrend = MEASURE_TREND.up;
    }
    else {
        if(thisData.y*1 > dataBefore.y*1) {
            measureTrend = MEASURE_TREND.up;
        }
        else {
            measureTrend = MEASURE_TREND.down;
        }
    }

    thisData.measureColor = measureColor;
    thisData.measureTrend = measureTrend;
    thisData.unit = convertGlucoseData ? GLUCOSE_UNIT.MMOL : getLabelByDataType(vital_type);

    return thisData;

}

function computeBpMetaData(thisData, dataBefore, bucketData, vital_type) {

    let measureColorSys = DATA_BOUNDS[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH](thisData.y1*1);
    let measureColorDia = DATA_BOUNDS[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW](thisData.y2*1);

    let measureTrendSys = 0;
    let measureTrendDia = 0;

    if(!dataBefore) {
        measureTrendSys = MEASURE_TREND.up;
        measureTrendDia = MEASURE_TREND.up;
    }
    else {
        if(thisData.y1*1 > dataBefore.y1*1) {
            measureTrendSys = MEASURE_TREND.up;
        }
        else {
            measureTrendSys = MEASURE_TREND.down;
        }

        if(thisData.y2*1 > dataBefore.y2*1) {
            measureTrendDia = MEASURE_TREND.up;
        }
        else {
            measureTrendDia = MEASURE_TREND.down;
        }
    }

    thisData.measureColorSys = measureColorSys;
    thisData.measureTrendSys = measureTrendSys;
    thisData.measureColorDia = measureColorDia;
    thisData.measureTrendDia = measureTrendDia;

    thisData.unit = getLabelByDataType(vital_type);

    return thisData;
}

function addDateSignatureMeta(thisData, bucketData) {
    thisData.dateInWords = bucketData.dateInWords;
    thisData.dateInWordsShort = bucketData.dateInWordsShort;
    thisData.dayOfWeekInWords = bucketData.dayOfWeekInWords;
    thisData.dayOfTheWeekInWordsShort = bucketData.dayOfTheWeekInWordsShort;
    return thisData;
}

function addTimeSignature(thisData, bucketData) {
    thisData.timeInWords = bucketData.timeInWords;
    return thisData;
}