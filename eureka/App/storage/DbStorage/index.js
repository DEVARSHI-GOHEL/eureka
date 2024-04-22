import LifePlusModuleExport from '../../../LifePlusModuleExport';

const QUERY_TYPE = {
  SELECT: 'select',
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete',
};

import moment from 'moment';
import {MEASURE_TYPE} from "../../constants/MeasureUIConstants";

/**
 * Get simple timestamp for day.
 * It was need to get timestamp of year,month,day which may be calculated in DB query and in javascript.
 *
 * Function will generate iso-like number from date eg 2022-8-3 will generate number 20220803
 *
 * @param dateString
 * @return {number}
 */
const dateToSimpleDayStamp = (dateString) => {
  const [year = '0', month = '0', day = '0'] = dateString.split("-");

  return year * 10000 + month * 100 + day * 1;
}

const _DbStore = {
  GET: {
    ethnicityList: async function () {
      let q = 'select * from ethnicities;';
      let result = null;

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    userInfo: async function (user_id) {
      let q = 'select * from users where id=' + user_id + ';';
      let result = null;

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    activeSession: async function (user_id) {
      let result = null;

      let q =
        'select s.* from sessions s where s.user_id=' +
        user_id +
        ' and s.logout_date is null order by s.login_date desc limit 1;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    activeSessionAndDevice: async function (user_id) {
      let result = null;

      let q =
        'select s.*, d.hw_id as device_msn from sessions s, devices d where s.user_id=' +
        user_id +
        ' and s.logout_date is null and ' +
        's.device_id = d.id order by s.login_date desc limit 1;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    dashboardMeasureData: async function (user_id) {
      let result = null;

      let q =
        'select * from measures where session_id in (select id as session_id from sessions where user_id =' +
        user_id +
        ') order by measure_time desc LIMIT 2;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    dashboardSimulationMeasureData: async function (user_id) {
      let result = null;
      let q = `select * from measures where measure_time < ( unixepoch('now')*1000 ) and type <> '${MEASURE_TYPE.U}' order by measure_time desc LIMIT 2;`;

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    userMeasureDataByTime: async function (user_id, startTs, endTs) {
      let result = null;

      let q =
        'select * from measures where session_id in (select id as session_id from sessions where user_id =' +
        user_id +
        ') and ' +
        'measure_time between ' +
        startTs +
        ' and ' +
        endTs +
        ' order by measure_time asc;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    /**
     * Retrieve measurements form DB
     * @param startTs - from
     * @param endTs - to
     * @param ignoreBadData - ignore unsuccessful measurements
     * @returns {Promise<null>}
     */
    measureDataByTime: async function (startTs, endTs, ignoreBadData = false) {
      let result = null;
      let ignoreCondition = '';
      if (ignoreBadData) {
        ignoreCondition = ` and type <> '${MEASURE_TYPE.U}'`;
      }

      let q =
        `select * from measures where  measure_time between ${startTs} and ${endTs} ${ignoreCondition} order by measure_time asc;`;
      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    stepsDataByTime: async function (start, end) {

      let q =
          "select s.* from steps s" +
          " inner join (select year, month, day, MAX(time) as time from steps group by year, month, day) g" +
          " on s.year = g.year and s.month = g.month and s.day = g.day and s.time = g.time" +
          " where (s.year*10000 + s.month*100 + s.day) between " + dateToSimpleDayStamp(start.date) + " and " + dateToSimpleDayStamp(end.date) +
          " order by s.time asc;";
      try {
        const result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
        return result;
      } catch (e) {
        console.log(e);
      }

      return null;
    },
    stepsDataForDay: async function (day) {
      // for info about inserting/updating steps, see _DbStore.GET.stepsDataForDay in README.mf

      let result = null;
      let q =
          "select * from steps" +
          " where year || '-' || month || '-' || day = '" + day.date + "'" +
          " order by time asc;";

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    mealsDataByTime: async function (startTs, endTs) {
      let result = null;
      let q = 'select * from meals';
      // let q =
      //   'select * from meals where ' +
      //   'time between ' +
      //   startTs +
      //   ' and ' +
      //   endTs +
      //   ' order by time asc;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    device: async function (deviceMsn) {
      let result = null;

      let q = "select * from devices where hw_id = '" + deviceMsn + "'";

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    //TEST QUERIES
    allUsers: async function () {
      let result = null;

      let q = 'select * from users';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allDevices: async function () {
      let result = null;

      let q = 'select * from devices';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allSessions: async function () {
      let result = null;

      let q = 'select * from sessions';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allMeasureData: async function () {
      let result = null;

      let q = 'select * from measures;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    sessionByTimeTest: async function () {
      let result = null;
      let formattedDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      let q =
        "select * from sessions where login_date < '" + formattedDate + "'";

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allAlerts: async function () {
      let result = null;

      let q = 'select * from alerts;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.SELECT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    //END OF GET
  },

  PUT: {
    userInfo: async function (info) {
      let result = null;

      let q =
        'insert into users (id, name, birth_date, gender_id, ethnicity_id, skin_tone_id, address, country, zip, password, height_ft, height_in, weight, weight_unit, tnc_date, step_goal, weather_unit, hw_id, ' +
        'glucose_unit, auto_measure, auto_frequency, sleep_tracking, power_save, cgm_debug, registration_state, update_date, upload_date) values ' +
        '(' +
        info.id +
        ', ' +
        info.name +
        ', ' +
        info.birth_date +
        ', ' +
        info.gender_id +
        ', ' +
        info.ethnicity_id +
        ', ' +
        info.skin_tone_id +
        ', ' +
        info.address +
        ', ' +
        info.country +
        ', ' +
        info.zip +
        ', ' +
        '' +
        info.password +
        ', ' +
        info.height_ft +
        ', ' +
        info.height_in +
        ', ' +
        info.weight +
        ', ' +
        info.weight_unit +
        ', ' +
        Date.now() +
        ', ' +
        info.step_goal +
        ', ' +
        info.weather_unit +
        ', ' +
        info.hw_id +
        ', ' +
        '' +
        info.glucose_unit +
        ', ' +
        info.auto_measure +
        ', ' +
        info.auto_frequency +
        ', ' +
        info.sleep_tracking +
        ', ' +
        info.power_save +
        ', ' +
        info.cgm_debug +
        ', ' +
        info.registration_state +
        ', ' +
        '' +
        Date.now() +
        ', ' +
        Date.now() +
        ');';
      try {
        result = (await executeQuery(q, QUERY_TYPE.INSERT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    session: async function (info) {
      let result = null;

      let q =
        'insert into sessions (user_id, device_id, login_date, auth_token, refresh_token, gateway_token) values ' +
        '(' +
        info.user_id +
        ', ' +
        info.device_id +
        ', ' +
        Date.now() +
        ", '" +
        info.auth_token +
        "', '" +
        info.refresh_token +
        "', '" +
        info.gateway_token +
        "')";

      try {
        result = (await executeQuery(q, QUERY_TYPE.INSERT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    device: async function (hw_id) {
      let result = null;

      let q =
        "insert into devices (hw_id, date_added) values ('" +
        hw_id +
        "', " +
        Date.now() +
        ')';

      try {
        result = (await executeQuery(q, QUERY_TYPE.INSERT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    measureData: async function (data) {

      let result = null;
      let q =
        'insert into measures (session_id, type, measure_time, o2, respiration, heart_rate, bpsys, bpdia, glucose) values ' +
        '(' +
        data.session_id +
        ', ' +
        data.type +
        ", '" +
        data.measure_time +
        "', " +
        data.o2 +
        ', ' +
        data.respiration +
        ', ' +
        data.heart_rate +
        ', ' +
        data.bpsys +
        ', ' +
        data.bpdia +
        ', ' +
        data.glucose +
        ')';

      try {
        result = (await executeQuery(q, QUERY_TYPE.INSERT)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    //end of PUT
  },
  UPDATE: {
    userInfo: async function (info) {
      let result = null;

      let subq = '';
      let subqArr = ['update_date=' + Date.now()];

      Object.keys(info).forEach((key) => {
        subqArr.push(key + '=' + info[key]);
      });

      subq = subqArr.join(',');
      let q = 'update users set ' + subq + ' where id=' + info.id + ';';

      try {
        result = (await executeQuery(q, QUERY_TYPE.UPDATE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    session: async function (info, session_id) {
      let result = null;

      let subq = '';
      let subqArr = [];

      Object.keys(info).forEach((key) => {
        subqArr.push(key + '=' + info[key]);
      });

      subq = subqArr.join(',');
      let q = 'update sessions set ' + subq + ' where id=' + session_id + ';';

      try {
        result = (await executeQuery(q, QUERY_TYPE.UPDATE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    device: async function (hw_id) {
      let result = null;

      let q = "update devices set hw_id ='" + hw_id + "';";

      try {
        result = (await executeQuery(q, QUERY_TYPE.UPDATE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    //end of UPDATE
  },

  DELETE: {
    user: async function (user_id) {
      let result = null;

      let q = 'delete from users where user_id = ' + user_id;

      try {
        result = (await executeQuery(q, QUERY_TYPE.DELETE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allSessions: async function () {
      let result = null;

      let q = 'delete from sessions;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.DELETE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allUsers: async function (user_id) {
      let result = null;

      let q = 'delete from users;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.DELETE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allDevices: async function () {
      let result = null;

      let q = 'delete from devices;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.DELETE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    allMeasureData: async function () {
      let result = null;

      let q = 'delete from measures;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.DELETE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },

    //end of DELETE
  },
  UTILS: {
    invalidateSession: async function () {
      let result = null;

      let q =
        'update sessions set logout_date=' +
        Date.now() +
        ' where logout_date is null;';

      try {
        result = (await executeQuery(q, QUERY_TYPE.UPDATE)).result;
      } catch (e) {
        console.log(e);
      }

      return result;
    },
    clearAllData: async function () {
      await _DbStore.DELETE.allDevices();
      await _DbStore.DELETE.allUsers();
      await _DbStore.DELETE.allSessions();
      await _DbStore.DELETE.allMeasureData();
    },
  },
};

async function __executeQuery(query, queryType) {
  console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ EXECUTING QUERY @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
  );
  console.log(queryType);
  console.log(query);
  console.log(
    '____________________________________________________________________________________________________________________',
  );

  let result = null;
  let queryResponse = null;
  try {
    queryResponse = await LifePlusModuleExport.dbTunnel(
      JSON.stringify({queryType, query}),
    );
    result = JSON.parse(queryResponse.databaseTunnel);
    result = queryType == QUERY_TYPE.SELECT ? result['result'] : result;

    if (result.status != 'success') {
      throw new Error('Got failure from db query');
    }
  } catch (e) {
    result = null;
    console.log(e);
  }


  return {query, queryType, result};
}

async function executeQuery(query, queryType) {

  let result = null;
  let queryResponse = null;
  try {
    queryResponse = await LifePlusModuleExport.dbTunnel(
      JSON.stringify({queryType, query}),
    );
    queryResponse =
      typeof queryResponse == 'string'
        ? JSON.parse(queryResponse)
        : queryResponse;
    result =
      typeof queryResponse.databaseTunnel == 'string'
        ? JSON.parse(queryResponse.databaseTunnel)
        : queryResponse.databaseTunnel;
    result = result['result'] ? result['result'] : result;

    if (result.status != 'success') {
      console.log('Got failure from db query: ');
      console.log(JSON.stringify(result))
      throw new Error('Got failure from db query');
    }
  } catch (e) {
    result = null;
    console.log(e);
  }

  return {query, queryType, result};
}

export const DB_STORE = _DbStore;
