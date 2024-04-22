import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';

import {VITAL_CONSTANTS} from '../../AppConstants/VitalDataConstants';

import {getDailyGeneralData} from '../../VizApi/DailyGeneralVitalDataService';
import {convertDailyGeneralData} from '../../VizDataConverter/DailyGeneralDataConverter';

import DailyScatterPlot from '../../GraphComponents/DailyScatterPlot';

const DailyVizContainerInitialState = {
    graphLoading : true,
    dataFetchError : false,
    vitalData : null,
    vizData : null
};

export default function DailyVizContainer({startTs, endTs, vitalType}){

    const [containerState, setContainerState] = useState(DailyVizContainerInitialState);

    useEffect(() => {

        setContainerState({...DailyVizContainerInitialState, graphLoading : true});

        getDailyGeneralData(startTs, endTs, vitalType)
        .then((data) => {

            //do stuff with data
            let convertedVizData = convertToViewData(startTs, endTs, data, vitalType);
            
            if(!convertedVizData) {
                setContainerState({...DailyVizContainerInitialState, graphLoading : false, dataFetchError : true});
                return;
            }

            setContainerState({...containerState, graphLoading : false, dataFetchError : false, vitalData : data, vizData: convertedVizData});
        })
        .catch((e) => {
            
            setContainerState({...DailyVizContainerInitialState, graphLoading : false, dataFetchError : true});
        });


    }, [startTs, endTs]);

    if(containerState.graphLoading) {
        return (
            <Text>Loading ... </Text>
        );
    }
    else if (containerState.dataFetchError) {
        return (
            <Text>Could not fetch data</Text>
        );
    }
    else {

        return (
            <DailyScatterPlot data={containerState.vizData} startTs={startTs} endTs={endTs} vitalType={vitalType}/>
        );
    }
}

function convertToViewData(startTs, endTs, dailyVitalData, vital_type) {

    if(!dailyVitalData || Object.keys(dailyVitalData).length == 0 || !dailyVitalData.vital_data || dailyVitalData.vital_data.length == 0) {
        return null;
    }

    try {
        return convertDailyGeneralData(dailyVitalData, startTs, endTs, vital_type);
    }
    catch(e) {
        console.log(e);
        return null;
    }
    
}