import {
    getFakeDailyData
} from './DailyVitalFakeDataGenerator';

//IN REALITY THESE METHODS ARE ASYNCHRONOUS AND SHOULD BE REPLACED WITH DB CALLS
export const getWeeklyGeneralData = function (startTs, endTs, vital_type) {
    
    var vital_data = getWeeklyGeneralVitalData( startTs, endTs, vital_type);

    let finalData =  {
        vital_data,
        startTs,
        endTs,
        vital_type
    };


    return finalData;
    //return Promise.resolve(finalData);

}

function getWeeklyGeneralVitalData(startTs, endTs, vital_type) {
    var data = [];
	var now	=	endTs;

	var interval_in_ms = getDataPollIntervalInMs();

	while (now >= startTs){
		
		data.push(getFakeDailyData(now, vital_type));
		
        now = now - interval_in_ms;
	}
	
	return data;
}

function getDataPollIntervalInMs() {
    return 30*60*1000;
}