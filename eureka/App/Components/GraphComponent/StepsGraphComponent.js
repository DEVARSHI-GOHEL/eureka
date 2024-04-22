import React, {useState, useEffect, useRef, memo} from 'react';
import {View} from 'react-native';
import moment from 'moment';
import {t} from 'i18n-js';

import {TabDateNav} from '../TabDateNav';
import {Translate} from '../../Services/Translate';
import {UIGenericPlaceholder} from '../../Components/UI';
import {getBrowser} from '../../Chart/AppUtility/DateTimeUtils';
import {getStepsData} from '../../Chart/VizApi/StepsDataService';

import StepsGraphWrapperContainer from './StepsGraphWrapperContainer';
import styles from './style';

const initState = {
  dataLoading: true,
  dataFetchError: false,
  data: null,
};

export default (key) =>
  memo(() => {
    const browser = useRef(getBrowser(key)).current;
    const dateBrowser = useRef(browser).current;

    const [containerState, setContainerState] = useState({
      ...initState,
      previousDateFragment: browser.previous(),
      dateFragment: browser.next(),
    });

    useEffect(() => {
      changeDateAndRenderData(true);
    }, []);

    // Method to change the date and act as a wrapper for data fetch and load
    function changeDateAndRenderData(isNext) { 
      dateBrowser.previous();
      dateBrowser.next();
      fetchDataAndSetState(isNext ? dateBrowser.next() : dateBrowser.previous());
    }

    /** Method to fetch data and set graph and associated components rendering states*/
    async function fetchDataAndSetState(dateFragment) {
      setContainerState({ ...initState, dataLoading: true, dateFragment });

      try {
        const currentData = await getStepsData(dateFragment.start, dateFragment.end);

        if ( !currentData || Object.keys(currentData).length == 0 ||
          currentData.steps_data.length == 0
        ) throw new Error('The currentData is empty'); 
        
        setContainerState({
          ...containerState,
          dataLoading: false,
          dataFetchError: false,
          data: currentData,
          dateFragment: dateFragment,
        });
      } catch (e) {
        setContainerState({
          ...initState,
          dataLoading: false,
          dataFetchError: true,
          dateFragment: dateFragment,
        });
      }
    }

    let viz_container = null;
    let dateInWordsEnd = moment(containerState.dateFragment.end.ts).format(
        t('dateFormats.periodMid'),
    );
    let dateInWordsStart = moment(containerState.dateFragment.start.ts).format(
        t('dateFormats.periodMid'),
    );

    const dateInWords = dateInWordsStart + ' - ' + dateInWordsEnd;
    const isCurrent = containerState.dateFragment.isCurrent;

    const startTs = containerState.dateFragment.start.ts;
    const endTs = containerState.dateFragment.end.ts;
    const vitalData = {...containerState.data, key};

    if (containerState.dataLoading) {
      viz_container = (
        <UIGenericPlaceholder
          loadingIcon={true}
          visibility={true}
          message={Translate('commonHomeDetails.loading')}
        />
      );
    } else if (containerState.dataFetchError) {
      viz_container = (
        <UIGenericPlaceholder
          noDataIcon={true}
          visibility={true}
          message={Translate('StepsWalkedScreen.noData')}
        />
      );
    } else {
      viz_container = (
        <StepsGraphWrapperContainer
          startTs={startTs}
          endTs={endTs}
          vitalData={vitalData}
        />
      );
    }

    return (
      <View style={styles.tabContent}>
        <TabDateNav
          title={dateInWords}
          onLeftPress={() => {
            changeDateAndRenderData(false);
          }}
          onRightPress={() => {
            if (isCurrent) return;
            changeDateAndRenderData(true);
          }}
          leftIconDisableState={false}
          rightIconDisableState={isCurrent}
        />
        {viz_container}
      </View>
    );
  });
