import {DB_STORE} from '../../storage/DbStorage';
import {selectStepGoal} from "../../Containers/HomeScreen/selectors";
import store from "../../../store/store";

//IN REALITY THESE METHODS ARE ASYNCHRONOUS AND SHOULD BE REPLACED WITH DB CALLS
export const getStepsData = async function (start, end) {

  const stepDBData = await DB_STORE.GET.stepsDataByTime(start, end);
  const stepsData = stepDBData.rows.map((item) => ({
    ...item,
    steps: Number(item.steps_count),
    measure_time: Number(item.time),
    uid: 50,
    device_id: 'IKURE2',
  }));

  const finalData = {};
  finalData.steps_data = stepsData;

  return finalData;
};

const sortByTimeStamp = (time1, time2) => {
  const measureTimeA = +time1?.measure_time || 0;
  const measureTimeB = +time2?.measure_time || 0;

  return measureTimeA - measureTimeB;
}

const checkStepDataForCorrectness = (stepData) => {

  const dataArray = [...stepData]
    .sort(sortByTimeStamp)
    .map((item, index, Arr) => {
      const preStepsCounter = Arr[index - 1]?.steps || +Arr[index - 1]?.steps_count || 0;
      let stepsCounter = item?.steps || item?.steps_count || 0;

      if (stepsCounter >= preStepsCounter) return item;

      return {
        ...item,
        steps: preStepsCounter,
        steps_count: `${preStepsCounter}`
      };
    })
    || [];

  if (!dataArray.length) return stepData;

  return dataArray;
}

/**
 * Get steps records for the day from app DB
 *
 * @param day
 * @return {Promise<{}>}
 */
export const getStepsDataForDay = async function (day) {

  const stepDBData = await DB_STORE.GET.stepsDataForDay(day);
  const stepsData = stepDBData.rows.map((item) => ({
    ...item,
    steps: Number(item.steps_count),
    measure_time: Number(item.time),
    uid: 50,
    device_id: 'IKURE2',
  }));

  return {
    steps_data: checkStepDataForCorrectness(stepsData),
  };

};

export const constGetStepGoal = () => {
  return selectStepGoal(store.getState());
};
