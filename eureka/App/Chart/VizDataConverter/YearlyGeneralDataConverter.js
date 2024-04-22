import moment from 'moment';

import {addDateInfoToDataFragment, getAbsoluteHourInAmPm, getYearlyDatesMap, getSortedMonthsArray} from '../AppUtility/DateTimeUtils';
import {VITAL_CONSTANTS, WARNING_RANGE, DATA_BOUNDS, MEASURE_TREND, getScaleData} from '../AppConstants/VitalDataConstants';
import {getLabelByDataType} from '../AppUtility/ChartAxisUtils';

import {toMMOL} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {t} from 'i18n-js';
export function convertYearlyGeneralData(monthlyGeneralData, monthlyGeneralPreviousData, startTs, endTs, previousStartTs, previousEndTs, vital_type) {

    if(!monthlyGeneralData || Object.keys(monthlyGeneralData).length == 0 || monthlyGeneralData.vital_data.length == 0) {
        
        return null;
    }

    let renderPreviousLine = true;
    if(!monthlyGeneralPreviousData || Object.keys(monthlyGeneralPreviousData).length == 0 || monthlyGeneralPreviousData.vital_data.length == 0) {
        monthlyGeneralPreviousData = {};
        monthlyGeneralPreviousData.vital_data = [];
        renderPreviousLine = false;

    }

    let isBpData = (vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH || vital_type == VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW)
    var convertedDataViews = isBpData ? 
                            convertBpVitalData(startTs, endTs, previousStartTs, previousEndTs, monthlyGeneralData, monthlyGeneralPreviousData, vital_type) : 
                            convertGeneralVitalData(startTs, endTs, previousStartTs, previousEndTs, monthlyGeneralData, monthlyGeneralPreviousData, vital_type, monthlyGeneralData.convertGlucoseData);
    
    var scaleData = getYearlyGeneralVisualizationScaleData(vital_type, convertedDataViews,  monthlyGeneralData.convertGlucoseData);

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

function convertGeneralVitalData(startTs, endTs, previousStartTs, previousEndTs, dataCurrent, dataPrevious, vital_param_type, convertGlucoseData) {
    //change

    let vitalDataCurrent = dataCurrent.vital_data;
    let vitalDataPrevious =dataPrevious.vital_data;
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

    let currentBucket = getYearlyDatesMap(startTs, endTs);
    let previousBucket = getYearlyDatesMap(previousStartTs, previousEndTs);

    let arrOfMonths = getSortedMonthsArray(currentBucket);
    let sortedMonthArr = arrOfMonths.monthKeysArr;
    let tsArr = arrOfMonths.tsArr;

    
    sortedMonthArr.forEach((key, index) => {
        currentBucket[key] = {
            ...currentBucket[key],

            ...{
                total : 0, 
                totalCount : 0,
                countInRange : 0,
                max : 1000,
                min : 0
            },

            
        }
    });

    console.log("sortedMonthArr",sortedMonthArr);

    let prevArrOfMonths = getSortedMonthsArray(previousBucket);
    let prevSortedMonthsArr = prevArrOfMonths.monthKeysArr;
    let preTsArr = prevArrOfMonths.tsArr;

    prevSortedMonthsArr.forEach((key, index) => {

        previousBucket[key] = {
            ...previousBucket[key],
            ...{
                total : 0,
                totalCount : 0,
                countInRange : 0,
            }
        }
    });

    console.log("prevSortedMonthsArr",prevSortedMonthsArr);

    let __bucket = {
        current : currentBucket,
        previous : previousBucket
    }

    // console.log("Bucket created",__bucket);

    let __lastData = null;
    let hourlyLastData = null;
    
    //Loop through this weeks data if any and start calculating data
    var date = sortedMonthArr[0];
    var days=-1;
    let month=0;
    var day=-1

    vitalDataCurrent.forEach((data) => {
//change
        
        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);
    
        
        // if(days===29){
        //     days=-1;
        //     month++;
        //     date= month<12?sortedMonthArr[month]:sortedMonthArr[sortedMonthArr.length-1]
        //     console.log("Date",date);
        // }
        // if(day !== data.day){
        //     days++;
        //     day=data.day;
        // }

        date = data.monthInWords.substr(0, 3) + " " + data.year;

        let value = data[vital_param_type]*1; //change

        __bucket.current[date].total = __bucket.current[date].total + value;
        __bucket.current[date].totalCount = __bucket.current[date].totalCount + 1;
        

        if(__bucket.current[date].min == 0) {
            __bucket.current[date].min = value;
        }

        if(__bucket.current[date].max == 1000) {
            __bucket.current[date].max = value;
        }

        if(value < __bucket.current[date].min) {
            __bucket.current[date].min = value;
        }

        if(value > __bucket.current[date].max) {
            __bucket.current[date].max = value;
        }

        if(value >= WARNING_RANGE[vital_param_type].min && value <= WARNING_RANGE[vital_param_type].max) {
            __bucket.current[date].countInRange = __bucket.current[date].countInRange + 1;
        }

        let _moment = moment(data.ts);

        let hour = _moment.hour();

        let timeInWords = getAbsoluteHourInAmPm(hour);
        bucketByHour.current[hour].total = bucketByHour.current[hour].total + value;
        bucketByHour.current[hour].totalCount = bucketByHour.current[hour].totalCount + 1;
        bucketByHour.current[hour].timeInWords = timeInWords;

    });


    //Loop through previous month's data if any
    days=-1;
    
    date = sortedMonthArr[0];
    month=0;
    day=-1
    vitalDataPrevious.forEach((data) => {
        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);
        // if(days===29){
        //     days=-1;
        //     month++;
        //     date= month<12?sortedMonthArr[month]:sortedMonthArr[sortedMonthArr.length-1]
        //     console.log("Date",date);
        // }
        // if(day !== data.day){
        //     days++;
        //     day=data.day;
        // }
        date = date = data.monthInWords.substr(0, 3) + " " + data.year;

        let value = data[vital_param_type]*1; //change

        __bucket.previous[date].total = __bucket.previous[date].total + value;
        __bucket.previous[date].totalCount = __bucket.previous[date].totalCount + 1;

        if(value >= WARNING_RANGE[vital_param_type].min && value <= WARNING_RANGE[vital_param_type].max) {
            __bucket.previous[date].countInRange = __bucket.previous[date].countInRange + 1;
        }

        let _moment = moment(data.ts);

        let hour = _moment.hour();

        let timeInWords = getAbsoluteHourInAmPm(hour);

        bucketByHour.previous[hour].total = bucketByHour.previous[hour].total + value;
        bucketByHour.previous[hour].totalCount = bucketByHour.previous[hour].totalCount + 1;
        bucketByHour.previous[hour].timeInWords = timeInWords;
    });

    console.log("2 Buckets pushes\n","Starting data filter");


    //START DAY OF MONTH AVERAGE, MIN, MAX, CALCULATIONS


    let noOfDaysRangeImproved = 0;
    let noOfCurrentDaysAboveBenchmark = 0;
    let noOfPreviousDaysAboveBenchmark = 0;

    //Start bucketing weekly data and normalize
    sortedMonthArr.forEach((month, index) => {

        let currentTotalCount   = __bucket.current[month].totalCount;
        if(currentTotalCount==0)currentTotalCount =1;
        let currentCountInRange = __bucket.current[month].countInRange;
        let currentTotal        = __bucket.current[month].total; 
        
        let currentInRangePercent = Math.round( ((currentCountInRange/currentTotalCount)*100) * 10 ) / 10;
        let currentAverage        = Math.round( (currentTotal/currentTotalCount) * 10 ) / 10;

        //if some date is missing from previous month then normalize it
        if(!__bucket.previous[month]) {
            __bucket.previous[month] = {
                total : 0,
                totalCount : 0,
                countInRange : 0,
            };
        }

        let previousTotalCount   = __bucket.previous[month].totalCount;
        if(previousTotalCount==0)previousTotalCount =1;
        let previousCountInRange = __bucket.previous[month].countInRange;
        let previousTotal        = __bucket.previous[month].total; 

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

        // console.log("fallbackAverage1",fallbackAverage,currentAverage,_DATA_RANGE.min,_DATA_RANGE.max);
        //Normalize the values for daily comparison for week
        if(currentAverage < _DATA_RANGE.min) {
            fallbackAverage = _DATA_RANGE.fallback.averageMin;
        console.log("fallbackAverage","min");

        }
        else if(currentAverage > _DATA_RANGE.max) {
            fallbackAverage = _DATA_RANGE.fallback.averageMax;
        console.log("fallbackAverage","max");

        }
        // console.log("fallbackAverage2",fallbackAverage);

        if(previousAverage < _DATA_RANGE.min) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMin;
        }
        else if(previousAverage > _DATA_RANGE.max) {
            previousFallbackAverage = _DATA_RANGE.fallback.averageMax;
        }

        if(__bucket.current[month].min < _DATA_RANGE.min) {
            fallbackMin = _DATA_RANGE.fallback.min;
        }

        if(__bucket.current[month].min > _DATA_RANGE.max) {
            fallbackMin = _DATA_RANGE.fallback.max;
        }

        if(__bucket.current[month].max < _DATA_RANGE.min) {
            fallbackMax = _DATA_RANGE.fallback.min;
        }

        if(__bucket.current[month].max > _DATA_RANGE.max) {
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
        if(currentAverage == __bucket.current[month].max) {
            __bucket.current[month].skipMax = true; //Important
        }

        if(currentAverage == __bucket.current[month].min) {
            __bucket.current[month].skipMin = true; ///Important
        }
        /************************************************************************** */

        __bucket.current[month].percentInRange = currentInRangePercent;
        __bucket.current[month].average        = currentAverage;

        __bucket.previous[month].percentInRange = previousInRangePercent;
        __bucket.previous[month].average        = previousAverage;

        if(fallbackAverage != null) {
            __bucket.current[month].fallbackAverage = fallbackAverage*1;
        }

        if(fallbackMax != null) {
            __bucket.current[month].fallbackMax = fallbackMax*1;
        }

        if(fallbackMin != null) {
            __bucket.current[month].fallbackMin = fallbackMin*1;
        }

        if(previousFallbackAverage != null) {
            __bucket.previous[month].fallbackAverage = previousFallbackAverage*1;
        }
        

        let dayInWordsShort = month;
        //Organize weekday bar chart and scatter plot data
        barChartData.push({x : month, y : __bucket.current[month].percentInRange});

        currentComparisonDailyLineData.push({x : dayInWordsShort, y : __bucket.current[month].average, fallback : __bucket.current[month].fallbackAverage});
        previousComparisonDailyLineData.push({x : dayInWordsShort, y : __bucket.previous[month].average, fallback : __bucket.previous[month].fallbackAverage});
        
        let maindata = {x : dayInWordsShort, y : __bucket.current[month].average, fallback : __bucket.current[month].fallbackAverage};
        maindata = computeMetaDataWeekday(maindata, __lastData, __bucket.current[month], vital_param_type, convertGlucoseData);

        //This has to be computed because max min has to be shown along with average
        maindata.max = __bucket.current[month].max;
        maindata.min = __bucket.current[month].min;
        maindata.measureColorMax = DATA_BOUNDS[vital_param_type](__bucket.current[month].max);
        maindata.measureColorMin = DATA_BOUNDS[vital_param_type](__bucket.current[month].min);

        scatterPlotData.push(maindata);
        
        minScatterData.push({x : dayInWordsShort, y : __bucket.current[month].min, fallback : __bucket.current[month].fallbackMin, 
            measureColor : DATA_BOUNDS[vital_param_type](__bucket.current[month].min), skipMin : __bucket.current[month].skipMin});
        maxScatterData.push({x : dayInWordsShort, y : __bucket.current[month].max, fallback : __bucket.current[month].fallbackMax, 
            measureColor : DATA_BOUNDS[vital_param_type](__bucket.current[month].max), skipMax : __bucket.current[month].skipMax });
        
        let minmaxFallback = __bucket.current[month].fallbackAverage ? __bucket.current[month].fallbackAverage : __bucket.current[month].average;

        minmaxLineData.push({x1 : dayInWordsShort, y1 : __bucket.current[month].max, x2 : dayInWordsShort, y2 : __bucket.current[month].min,
                                fallbacky1 : __bucket.current[month].fallbackMax, fallbacky2 : __bucket.current[month].fallbackMin,
                                fallback : minmaxFallback,});

        if(__bucket.current[month].average != 0)
            __lastData = maindata;

    });

    // console.log("Barchar  Data",barChartData);

    // console.log("__bucket.current",__bucket.current);


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

    console.log("hoursArr",hoursArr);


    if(__lastData) {
        __lastData.convertGlucoseData = convertGlucoseData;
    }
    
    if(hourlyLastData) {
        hourlyLastData.convertGlucoseData = convertGlucoseData;
    }

    let bucketKeys = [];
    sortedMonthArr.forEach(day => {
        bucketKeys.push(__bucket.current[day].dateInWordsShort);
    });


    console.log("barChartData",barChartData);
    return {
        sortedMonthArr,
        bucketKeys:sortedMonthArr,
        hourBucketKeys : hoursArr,

        bucket : __bucket,
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

        lastDayData : __lastData,
        lastHourData : hourlyLastData //TODO
        
    };
}

function convertBpVitalData(startTs, endTs, previousStartTs, previousEndTs, dataCurrent, dataPrevious, vital_param_type) {
    
    let vitalDataCurrent = dataCurrent.vital_data;
    let vitalDataPrevious = dataPrevious.vital_data;

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

    let currentBucket = getYearlyDatesMap(startTs, endTs);
    let previousBucket = getYearlyDatesMap(previousStartTs, previousEndTs);
    
    let arrOfMonths = getSortedMonthsArray(currentBucket);
    let sortedMonthArr = arrOfMonths.monthKeysArr;
    let tsArr = arrOfMonths.tsArr;

    let prevArrOfMonths = getSortedMonthsArray(previousBucket);
    let prevsortedMonthArr = prevArrOfMonths.monthKeysArr;
    let preTsArr = prevArrOfMonths.tsArr;

    sortedMonthArr.forEach((key, index) => {
        currentBucket[key] = {
            ...currentBucket[key],
            ...{
                totalSys : 0,
                totalCountSys : 0,
                countInRangeSys : 0,
                maxSys : 1000,
                minSys : 0,
                totalDia : 0,
                totalCountDia : 0,
                countInRangeDia : 0,
                maxDia : 1000,
                minDia : 0,
            }
        }
    });

    prevsortedMonthArr.forEach((key, index) => {
        previousBucket[key] = {
        ...previousBucket[key],
        ...{
                totalSys : 0,
                totalCountSys : 0,
                countInRangeSys : 0,
                maxSys : 1000,
                minSys : 0,
                totalDia : 0,
                totalCountDia : 0,
                countInRangeDia : 0,
            }
        }
    });

    let __bucket = {
        current : currentBucket,
        previous : previousBucket
    }

    let __lastData = null
    let hourlyLastData = null;

    var date = sortedMonthArr[0];
    var days=-1;
    let month=0;
    var day=-1
    //Loop through current WEEK data and calculate weekday and hourly bucket for current week
    vitalDataCurrent.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);
        // if(days===29){
        //     days=-1;
        //     month++;
        //     date= month<12?sortedMonthArr[month]:sortedMonthArr[sortedMonthArr.length-1]
        //     console.log("Date",date);
        // }
        // if(day !== data.day){
        //     days++;
        //     day=data.day;
        // }
        date = data.monthInWords.substr(0, 3) + " " + data.year;
        let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]*1;
        let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]*1;
        //Sys
        __bucket.current[date].totalSys = __bucket.current[date].totalSys + valueSys;
        __bucket.current[date].totalCountSys = __bucket.current[date].totalCountSys + 1;

        //Dia
        __bucket.current[date].totalDia = __bucket.current[date].totalDia + valueDia;
        __bucket.current[date].totalCountDia = __bucket.current[date].totalCountDia + 1;
        

        //Compute value in range - Sys
        if(valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min && valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
            __bucket.current[date].countInRangeSys = __bucket.current[date].countInRangeSys + 1;
        }

        //Compute value in range - Dia
        if(valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min && valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max) {
            __bucket.current[date].countInRangeDia = __bucket.current[date].countInRangeDia + 1;
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

    days=-1;
    
    date = sortedMonthArr[0];
    month=0;
    day=-1
     //Loop through previous month data and calculate daily and hourly bucket for current month, if at all any
    vitalDataPrevious.forEach((data) => {

        data.ts = data[VITAL_CONSTANTS.KEY_TS]*1;
        data = addDateInfoToDataFragment(data);

        // if(days===29){
        //     days=-1;
        //     month++;
        //     date= month<12?sortedMonthArr[month]:sortedMonthArr[sortedMonthArr.length-1]
        //     console.log("Date",date);
        // }
        // if(day !== data.day){
        //     days++;
        //     day=data.day;
        // }

        date = data.monthInWords.substr(0, 3) + " " + data.year;

        let valueSys = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]*1;
        let valueDia = data[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]*1;

        __bucket.previous[date].totalSys = __bucket.previous[date].totalSys + valueSys;
        __bucket.previous[date].totalCountSys = __bucket.previous[date].totalCountSys + 1;

        __bucket.previous[date].totalDia = __bucket.previous[date].totalDia + valueDia;
        __bucket.previous[date].totalCountDia = __bucket.previous[date].totalCountDia + 1;

        if(valueSys >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].min && valueSys <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH].max) {
            __bucket.previous[date].countInRangeSys = __bucket.previous[date].countInRangeSys + 1;
        }

        if(valueDia >= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].min && valueDia <= WARNING_RANGE[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW].max) {
            __bucket.previous[date].countInRangeDia = __bucket.previous[date].countInRangeDia + 1;
        }
        
        let _moment = moment(data.ts);

        let hour = _moment.hour();

        bucketByHour.previous[hour].totalSys = bucketByHour.previous[hour].totalSys + valueSys;
        bucketByHour.previous[hour].totalCountSys = bucketByHour.previous[hour].totalCountSys + 1;

        bucketByHour.previous[hour].totalDia = bucketByHour.previous[hour].totalDia + valueDia;
        bucketByHour.previous[hour].totalCountDia = bucketByHour.previous[hour].totalCountDia + 1;
    });


    //START AVERAGE, MIN, MAX, CALCULATIONS

    let noOfDaysRangeImprovedSys = 0;
    let noOfPreviousDaysAboveBenchmarkSys = 0;
    let noOfCurrentDaysAboveBenchmarkSys = 0;

    let noOfDaysRangeImprovedDia = 0;
    let noOfPreviousDaysAboveBenchmarkDia = 0;
    let noOfCurrentDaysAboveBenchmarkDia = 0;

    //Start bucketing weekly data and normalize
    sortedMonthArr.forEach((month) => {
        
        //====================================== FOR SYSTOLIC =================================================
        let currentTotalCountSys   = __bucket.current[month].totalCountSys;
        if(currentTotalCountSys==0)currentTotalCountSys =1;
        let currentCountInRangeSys = __bucket.current[month].countInRangeSys;
        let currentTotalSys        = __bucket.current[month].totalSys; 
        
        let currentInRangePercentSys = Math.round( ((currentCountInRangeSys/currentTotalCountSys)*100) * 10 ) / 10;
        let currentAverageSys        = Math.round( (currentTotalSys/currentTotalCountSys) * 10 ) / 10;

        if(!__bucket.previous[month]) {
            __bucket.previous[month] = {
                totalSys : 0,
                totalCountSys : 0,
                countInRangeSys : 0,
                maxSys : 1000,
                minSys : 0,
                totalDia : 0,
                totalCountDia : 0,
                countInRangeDia : 0,
            };
        }

        let previousTotalCountSys   = __bucket.previous[month].totalCountSys;
        if(previousTotalCountSys==0)previousTotalCountSys =1;
        let previousCountInRangeSys = __bucket.previous[month].countInRangeSys;
        let previousTotalSys        = __bucket.previous[month].totalSys; 

        let previousInRangePercentSys = Math.round( ((previousCountInRangeSys/previousTotalCountSys)*100) * 10 ) / 10;
        let previousAverageSys        = Math.round( (previousTotalSys/previousTotalCountSys) * 10 ) / 10;

        //Check if this day of the current week had percentage value in range
        if(currentInRangePercentSys > 70) {
            noOfCurrentDaysAboveBenchmarkSys+=1;
        }
        
        //Check if this day of the previous week had percentage value in range
        if(currentInRangePercentSys > 70) {
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

        __bucket.current[month].percentInRangeSys = currentInRangePercentSys;
        __bucket.current[month].averageSys        = currentAverageSys;

        __bucket.previous[month].percentInRangeSys = previousInRangePercentSys;
        __bucket.previous[month].averageSys        = previousAverageSys;

        if(fallbackAverageSys != null) {
            __bucket.current[month].fallbackAverageSys = fallbackAverageSys*1;
        }

        if(previousFallbackAverageSys != null) {
            __bucket.previous[month].fallbackAverageSys = previousFallbackAverageSys*1;
        }


        // ========================================= FOR DIASTOLIC =============================================================
        let currentTotalCountDia   = __bucket.current[month].totalCountDia;
        if(currentTotalCountDia==0)currentTotalCountDia =1;
        let currentCountInRangeDia = __bucket.current[month].countInRangeDia;
        let currentTotalDia        = __bucket.current[month].totalDia; 
        
        let currentInRangePercentDia = Math.round( ((currentCountInRangeDia/currentTotalCountDia)*100) * 10 ) / 10;
        let currentAverageDia        = Math.round( (currentTotalDia/currentTotalCountDia) * 10 ) / 10;

        let previousTotalCountDia   = __bucket.previous[month].totalCountDia;
        if(previousTotalCountDia==0)previousTotalCountDia =1;
        let previousCountInRangeDia = __bucket.previous[month].countInRangeDia;
        let previousTotalDia        = __bucket.previous[month].totalDia; 

        let previousInRangePercentDia = Math.round( ((previousCountInRangeDia/previousTotalCountDia)*100) * 10 ) / 10;
        let previousAverageDia        = Math.round( (previousTotalDia/previousTotalCountDia) * 10 ) / 10;

        //Check if this day of the current week had percentage value in range
        if(currentInRangePercentDia > 70) {
            noOfCurrentDaysAboveBenchmarkDia+=1;
        }

        //Check if this day of the previous week had percentage value in range
        if(currentInRangePercentDia > 70) {
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

        __bucket.current[month].percentInRangeDia = currentInRangePercentDia;
        __bucket.current[month].averageDia        = currentAverageDia;

        __bucket.previous[month].percentInRangeDia = previousInRangePercentDia;
        __bucket.previous[month].averageDia        = previousAverageDia;

        if(fallbackAverageDia != null) {
            __bucket.current[month].fallbackAverageDia = fallbackAverageDia*1;
        }

        if(previousFallbackAverageDia != null) {
            __bucket.previous[month].fallbackAverageDia = previousFallbackAverageDia*1;
        }


        // SYS stays on top - y1 | DIA stays at bottom - y2 *****
        // let dayInWordsShort = __bucket.current[month].dateInWordsShort;
        let dayInWordsShort = month;
        
        //Organize weekday bar chart and scatter plot data
        barChartDataSys.push({x : dayInWordsShort, y : __bucket.current[month].percentInRangeSys});
        barChartDataDia.push({x : dayInWordsShort, y : __bucket.current[month].percentInRangeDia});

        let maindata = {x : dayInWordsShort, x1 : dayInWordsShort, x2 : dayInWordsShort, y1 : __bucket.current[month].averageSys, y2 : __bucket.current[month].averageDia,
            fallbacky1 : __bucket.current[month].fallbackAverageSys, fallbacky2 : __bucket.current[month].fallbackAverageDia}

        maindata = computeMetaDataWeekday(maindata, __lastData, __bucket.current[month], vital_param_type);

        currentComparisonDailyLineData.push(maindata);

        previousComparisonDailyLineData.push(
            {x : dayInWordsShort, y1 : __bucket.previous[month].averageSys, y2 : __bucket.previous[month].averageDia,
                fallbacky1 : __bucket.previous[month].fallbackAverageSys, fallbacky2 : __bucket.previous[month].fallbackAverageDia}
        );

        scatterPlotData.push(maindata);
        
        minmaxLineData.push(maindata);

        if(__bucket.current[month].averageSys > 0 && __bucket.current[month].averageDia > 0)
            __lastData = maindata;
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

        if(bucketByHour.current[hour].averageSys > 0 && bucketByHour.current[hour].averageDia > 0)
            hourlyLastData = maindata;
    });

    let bucketKeys = [];
    sortedMonthArr.forEach(day => {
        bucketKeys.push(__bucket.current[day].dateInWordsShort);
    });

    return {
        sortedMonthArr,
        bucketKeys:sortedMonthArr,
        hourBucketKeys : hoursArr,

        bucket : __bucket,
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
            noOfCurrentDaysAboveBenchmarkSys,
            noOfDaysRangeImprovedDia : (noOfCurrentDaysAboveBenchmarkDia - noOfPreviousDaysAboveBenchmarkDia),
            noOfCurrentDaysAboveBenchmarkDia
        },

        lastDayData : __lastData,
        lastHourData : hourlyLastData //TODO
        
    };
}

function getYearlyGeneralVisualizationScaleData(vital_type, convertedDataViews, convertGlucoseData) {
    
    var barChartScales = {};
    var scatterScale = {};
    var scatterScaleHour = {};

    barChartScales.axisX = getYearlyBarChartXScaleData(convertedDataViews);
    barChartScales.axisY = getYearlyBarChartYScaleData();
    console.log("barChartScales",barChartScales.axisX,barChartScales.axisY);


    scatterScale.axisX = getYearlyAverageByDayXScaleData(convertedDataViews)
    scatterScale.axisY = getYScaleData(vital_type, WARNING_RANGE[vital_type].min, WARNING_RANGE[vital_type].max, convertGlucoseData);

    scatterScaleHour.axisX = getYearlyAverageByHourXScaleData(convertedDataViews)
    scatterScaleHour.axisY = getYScaleData(vital_type, WARNING_RANGE[vital_type].min, WARNING_RANGE[vital_type].max, convertGlucoseData);

    return {barChartScales, scatterScale, scatterScaleHour};
}

function getYearlyBarChartXScaleData(convertedDataViews) {

    let barChartXScaleData = [];

    convertedDataViews.bucketKeys.forEach((_data, i) => {
        let _label = "";

        console.log("Data",_data);
        if(i%4 == 0 || i===convertedDataViews.bucketKeys.length-1) {
            // let arr = _data.split(" ");
            // let tempLabel = arr[0].substr(0, 3);
            _label = _data; //tempLabel;
        }
        

        barChartXScaleData.push({label : _label, value : _data});
    });

    console.log("barChartXScaleData",barChartXScaleData);
    return barChartXScaleData;
}

function getYearlyBarChartYScaleData(vital_type) {

    //let isB
    return {
        start : {"label" : "0", value : 0},
        mid : {"label" : 70, value : 70},
        end : {"label" : 100, value : 100},
        scale_label : {"label" : t('barChartYScaleData.label'), value : 65}
    };
}

function getYearlyAverageByDayXScaleData(convertedDataViews) {
    let scaleData= {};
    
    convertedDataViews.bucketKeys.forEach((item, index) => {

        let _label = "";

        if(index == 0 || index == (convertedDataViews.bucketKeys.length)/2 || index == (convertedDataViews.bucketKeys.length -1)) {
            _label = item; //item.substr(0,3);
        }

        scaleData[item] = {
            "label" : _label,
            "value" : item
        }
    })

    return scaleData;
}

function getYearlyAverageByHourXScaleData(convertedDataViews) {

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
            "label" : convertGlucoseData ? toMMOL(_DATA_RANGE.RANGE_MID) : _DATA_RANGE.RANGE_MID, 
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

function computeMetaDataWeekday (thisData, dataBefore, bucketData, vital_type,convertGlucoseData) {
    
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
    tempData = addDateSignatureMeta(tempData, bucketData);
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