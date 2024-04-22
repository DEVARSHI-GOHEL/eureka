import moment from 'moment';
import {PERIOD_NAME} from '../AppConstants/VitalDataConstants';
import {Translate} from "../../Services/Translate";

export function DayBrowser() {
  var dateObject = null;

  this.next = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else if (dateObject.isCurrent) {
      return dateObject;
    } else {
      let nextDayTs = moment(dateObject.end.ts)
        .add({days: 1})
        .toDate()
        .getTime();

      if (_isToday(nextDayTs)) {
        nextDayTs = moment.now();
      }

      dateObject = getRange(nextDayTs);
    }

    return dateObject;
  };

  this.previous = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else {
      let previousDateTs = moment(dateObject.end.ts)
        .subtract({days: 1})
        .toDate()
        .getTime();
      let previousDate = _getDateString(previousDateTs);

      let previousDayEndTs = moment(previousDate + 'T23:59:59')
        .toDate()
        .getTime();

      dateObject = getRange(previousDayEndTs);
    }

    return dateObject;
  };

  function getRange(_ts) {
    let dateStr = _getDateString(_ts);

    let currentHour = moment(_ts).hour();
    let startTimeStr = 'T00:00:00';
    let endTimeStr = 'T23:59:59';

    if (currentHour != 23) {
      currentHour += 1;
      let hourStr = currentHour < 10 ? '0' + currentHour : '' + currentHour;
      endTimeStr = 'T' + hourStr + ':00:00';
    }

    return {
      end: getDateTimeInfo(
        moment(dateStr + endTimeStr)
          .toDate()
          .getTime(),
      ),
      start: getDateTimeInfo(
        moment(dateStr + startTimeStr)
          .toDate()
          .getTime(),
      ),
      isCurrent: _isToday(_ts),
    };
  }
}

export function WeekBrowser() {
  var dateObject = null;

  this.next = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else if (dateObject.isCurrent) {
      return dateObject;
    } else {
      let nextWeekEndTs = moment(dateObject.end.ts)
        .add({days: 7})
        .toDate()
        .getTime();

      if (_isToday(nextWeekEndTs)) {
        nextWeekEndTs = moment.now();
      }

      dateObject = getRange(nextWeekEndTs);
    }

    return dateObject;
  };

  this.previous = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else {
      let previousWeekDateEndTs = moment(dateObject.end.ts)
        .subtract({days: 7})
        .toDate()
        .getTime();
      let previousEndDate = _getDateString(previousWeekDateEndTs);

      let previousWeekEndDayTs = moment(previousEndDate + 'T23:59:59')
        .toDate()
        .getTime();

      dateObject = getRange(previousWeekEndDayTs);
    }

    return dateObject;
  };

  function getRange(_ts) {
    let endDateStr = _getDateString(_ts);
    let startDateStr = _getDateString(
      moment(_ts).subtract({days: 6}).toDate().getTime(),
    ); //Go to 7 days prior to this end date

    let currentHour = moment(_ts).hour();
    let startTimeStr = 'T00:00:00';
    let endTimeStr = 'T23:59:59';

    if (currentHour != 23) {
      currentHour += 1;
      let hourStr = currentHour < 10 ? '0' + currentHour : '' + currentHour;
      endTimeStr = 'T' + hourStr + ':00:00';
    }

    return {
      end: getDateTimeInfo(
        moment(endDateStr + endTimeStr)
          .toDate()
          .getTime(),
      ),
      start: getDateTimeInfo(
        moment(startDateStr + startTimeStr)
          .toDate()
          .getTime(),
      ),
      isCurrent: _isToday(_ts),
    };
  }
}

export function MonthBrowser() {
  var dateObject = null;

  this.next = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else if (dateObject.isCurrent) {
      return dateObject;
    } else {
      let nextMonthEndTs = moment(dateObject.end.ts)
        .add({days: 30})
        .toDate()
        .getTime();

      if (_isToday(nextMonthEndTs)) {
        nextMonthEndTs = moment.now();
      }

      dateObject = getRange(nextMonthEndTs);
    }

    return dateObject;
  };

  this.previous = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else {
      let previousMonthDateEndTs = moment(dateObject.end.ts)
        .subtract({days: 30})
        .toDate()
        .getTime();
      let previousEndDate = _getDateString(previousMonthDateEndTs);

      let previousMonthEndDayTs = moment(previousEndDate + 'T23:59:59')
        .toDate()
        .getTime();

      dateObject = getRange(previousMonthEndDayTs);
    }

    return dateObject;
  };

  function getRange(_ts) {
    let endDateStr = _getDateString(_ts);
    let startDateStr = _getDateString(
      moment(_ts).subtract({days: 29}).toDate().getTime(),
    ); //Go to 30 days prior to this end date

    let currentHour = moment(_ts).hour();
    let startTimeStr = 'T00:00:00';
    let endTimeStr = 'T23:59:59';

    if (currentHour != 23) {
      currentHour += 1;
      let hourStr = currentHour < 10 ? '0' + currentHour : '' + currentHour;
      endTimeStr = 'T' + hourStr + ':00:00';
    }

    return {
      end: getDateTimeInfo(
        moment(endDateStr + endTimeStr)
          .toDate()
          .getTime(),
      ),
      start: getDateTimeInfo(
        moment(startDateStr + startTimeStr)
          .toDate()
          .getTime(),
      ),
      isCurrent: _isToday(_ts),
    };
  }
}

export function YearBrowser() {
  var dateObject = null;

  this.next = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else if (dateObject.isCurrent) {
      return dateObject;
    } else {
      let nextYearEndTs = moment(dateObject.end.ts)
        .add({days: 359})
        .toDate()
        .getTime();

      if (_isToday(nextYearEndTs)) {
        nextYearEndTs = moment.now();
      }

      dateObject = getRange(nextYearEndTs);
    }

    return dateObject;
  };

  this.previous = function () {
    if (dateObject == null) {
      let _ts = moment.now();
      dateObject = getRange(_ts);
    } else {
      let previousYearDateEndTs = moment(dateObject.end.ts)
        .subtract({days: 359})
        .toDate()
        .getTime();
      let previousEndDate = _getDateString(previousYearDateEndTs);

      let previousYearEndDayTs = moment(previousEndDate + 'T23:59:59')
        .toDate()
        .getTime();

      dateObject = getRange(previousYearEndDayTs);
    }

    return dateObject;
  };

  function getRange(_ts) {
    let endDateStr = _getDateString(_ts);
    let startDateStr = _getDateString(
      moment(_ts).subtract({days: 359}).toDate().getTime(),
    ); //Go to 365 days prior to this end date

    let currentHour = moment(_ts).hour();
    let startTimeStr = 'T00:00:00';
    let endTimeStr = 'T23:59:59';

    if (currentHour != 23) {
      currentHour += 1;
      let hourStr = currentHour < 10 ? '0' + currentHour : '' + currentHour;
      endTimeStr = 'T' + hourStr + ':00:00';
    }

    return {
      end: getDateTimeInfo(
        moment(endDateStr + endTimeStr)
          .toDate()
          .getTime(),
      ),
      start: getDateTimeInfo(
        moment(startDateStr + startTimeStr)
          .toDate()
          .getTime(),
      ),
      isCurrent: _isToday(_ts),
    };
  }
}

const DATE_FORMAT = "YYYY-M-D";
export function getDateTimeInfo(ts) {
  const formats = Translate('dateFormats');
  const _moment = moment(ts);

  let dateInfo = {
    ts: ts,
    date:_moment.format(DATE_FORMAT),
    dayOfWeekInWords:_moment.format(formats.dayOfWeekInWords),
    dayOfTheWeekInWordsShort:_moment.format(formats.dayOfTheWeekInWordsShort),
    dayOfTheWeekIndex: _moment.day(),
    dateInWords: _moment.format(formats.dateInWords),
    dateInWordsShort: _moment.format(formats.dateInWordsShort),
    timeInWords: _moment.format(formats.timeInWords),
    day:_moment.format(formats.day),
    year: _moment.format(formats.year),
    monthInWords:_moment.format(formats.monthInWords),
    monthInWordsShort: _moment.format(formats.monthInWordsShort),
  };

  return dateInfo;
}

function _isToday(_ts) {
  return _getDateString(moment.now()) == _getDateString(_ts);
}

function _getDateString(ts) {
  let now = moment(ts);

  let now_year = now.year();

  let now_month = now.month() + 1;
  let now_month_str = now_month < 10 ? '0' + now_month : '' + now_month;

  let now_day = now.date();
  let now_day_str = now_day < 10 ? '0' + now_day : '' + now_day;

  let today = now_year + '-' + now_month_str + '-' + now_day_str;

  return today;
}

const daysNamesArr = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'];

export function getDaysArray(dayIndex, computeAsStart) {

  const daysLocal = Translate('daySortName');
  let startIndex = dayIndex;
  let endIndex = 6;

  if (dayIndex > 0) {
    endIndex = dayIndex - 1;
  }

  let daysArr = [];

  for (var i = startIndex; i <= 6; i++) {
    daysArr.push(daysLocal[daysNamesArr[i]]);
  }

  if (endIndex < 6) {
    for (var j = 0; j <= endIndex; j++) {
      daysArr.push(daysLocal[daysNamesArr[j]]);
    }
  }

  if (!computeAsStart) {
    let endday = daysArr.shift();
    daysArr.push(endday);
  }
  return daysArr;
}

export function addDateInfoToDataFragment(dataFragment) {
  let dateTimeInfo = getDateTimeInfo(dataFragment.ts);
  let fragment = {
    ...dateTimeInfo,
    ...dataFragment,
    day: dateTimeInfo.day, // override day by formatted day (this may vary with localization)
  };
  return fragment;
}

export function getShortHour(ts) {
  const trn  = Translate('dateFormats')
  const _moment = moment(ts);
  return _moment.format(trn.hourShort)
}

export function getAbsoluteHourInAmPm(hour) {
  // just set some time, the most important is the hour
  const date = new Date(2000, 1,1,hour,0, 0,0);
  return getShortHour(date.getTime());
}

export function getSortedDatesArray(dataMap) {
  let tsMap = {};
  let tsArr = [];

  let dateKeysArr = [];
  let tsKeyArr = [];
  Object.keys(dataMap).forEach((key) => {
    let ts = dataMap[key].ts;
    tsArr.push(ts * 1);
    tsMap['_' + ts] = key;
  });

  tsArr = tsArr.sort(); //Sort in descending, earliest first

  tsArr.forEach((item) => {
    dateKeysArr.push(tsMap['_' + item]);
  });

  return {dateKeysArr, tsArr};
}

export function getMonthlyDatesMap(startTs, endTs) {
  let dataMap = {};

  let startDateFragment = getDateTimeInfo(startTs);

  dataMap[startDateFragment.day] = {...startDateFragment, ts: startTs};

  let __ts = endTs;
  while (__ts >= startTs) {
    let dateFragment = getDateTimeInfo(__ts);
    dataMap[dateFragment.day] = {...dateFragment, ts: __ts}; // fix
    __ts = __ts - 1000 * 60 * 60 * 24;
  }

  return dataMap;
}

export function getSortedMonthsArray(monthMap, startTs) {
  let tsMap = {};
  let tsArr = [];

  let tsKeyArr = [];
  Object.keys(monthMap).forEach((key) => {
    let ts = monthMap[key].ts;
    tsArr.push(ts * 1);
    tsMap['_' + ts] = key;
  });

  tsArr = tsArr.sort(); //Sort in descending, earliest first
  // console.log("start Ts",startTs);

  tsArr.forEach((d) => {
    tsKeyArr.push(tsMap['_' + d]); //Keys in form Jan, 2020 etc is sorted
  });

  // let startDateFragment = getDateTimeInfo(startTs);

  // console.log("monthsName",startTs,startDateFragment.monthInWords);
  // const startMonth=monthsNamesArr.indexOf(startDateFragment.monthInWords.substr(0, 3))+1;
  // console.log("StartMonth",startMonth);

  // console.log("monthKeysArr",monthKeysArr,tsArr);
  return {monthKeysArr: tsKeyArr, tsArr};
}

export function getYearlyDatesMap(startTs, endTs) {
  let dataMap = {};

  let startDateFragment = getDateTimeInfo(startTs);

  dataMap[
    startDateFragment.monthInWords.substr(0, 3) + ' ' + startDateFragment.year
  ] = {...startDateFragment, ts: startTs};

  let __ts = endTs;

  while (__ts >= startTs) {
    let dateFragment = getDateTimeInfo(__ts);
    dataMap[dateFragment.monthInWords.substr(0, 3) + ' ' + dateFragment.year] =
      {...dateFragment, ts: __ts * 1};

    //next_iterator calculation
    let next_iterator = moment(__ts).subtract(28, 'days'); //This ensures fine grained calculation for the months involved. Each month (with a minimum of 29 days for leap year feb) is put as key of the map, without skipping any month

    __ts = next_iterator.valueOf();
  }
  // console.log("dataMap",dataMap);

  return dataMap;
}

function _toMs(microSec) {
  return Math.round(microSec / 1000);
}

export function jsTs(mls, addOne) {
  mls = addOne ? mls + 1 : mls;
  let ts = mls * 1000;
  return ts;
}

export const getDateString = _getDateString;
export const isToday = _isToday;
export const toMs = _toMs;

export const getBrowser = (periodNameAsString) => {
  switch (periodNameAsString || '') {
    case PERIOD_NAME.week: return new WeekBrowser();
    case PERIOD_NAME.month: return new MonthBrowser();
    case PERIOD_NAME.year: return new YearBrowser();
    default: return new DayBrowser();
  }
};
