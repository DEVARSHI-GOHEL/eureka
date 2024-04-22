import React, {useEffect, useRef, useState} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import moment from 'moment';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {t} from 'i18n-js';

import {DATA_BOUNDS, VITAL_CONSTANTS, VITAL_UNITS,} from '../../Chart/AppConstants/VitalDataConstants';
import TimeComponent from './HourlyComponent';
import {CustomTab} from '../CustomTab';
import {VitalDataListType} from './utils';
import styles from './styles';

import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';

const HealthDetailComponent = ({type = 'DAILY', vitalType, data = []}) => {
  const [glucoseMeasure, setGlucoseMeasure] = useState(GLUCOSE_UNIT.MGDL);

  useEffect(() => {
    //console.log("DATA",vitalType,data);

    if (vitalType === VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE) {
      console.log('Convet', data.convertGlucoseData);
      if (data.convertGlucoseData) {
        setGlucoseMeasure(GLUCOSE_UNIT.MMOL);
      }
    }

    if (type === VitalDataListType.DAILY) {
      getData(0);
    } else if (type === VitalDataListType.WEEKLY) {
      getData(6);
    } else if (type === VitalDataListType.MONTHLY) {
      getData(29);
    } else if (type === VitalDataListType.YEARLY) {
      getData(359);
    }
  }, [data]);

  const [data1, setData] = useState([]);
  const [openDay, setOpenDay] = useState(-1);
  const [openMonth, setOpenMonth] = useState(-1);
  const [outOfRange, setOutOfRange] = useState(-1);
  const [isAll, setIsAll] = useState(true);
  const weeklyRef = useRef();
  const yearlyRef = useRef();

  function groupday(value, index, array) {
    let byday = {};
    let d = new Date(value.date);
    d = Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
    byday[d] = byday[d] || [];
    byday[d].push(value);
    return byday;
  }

  const getData = async (days) => {
    return new Promise((resolve, reject) => {
      const val = data;
      //   console.log(val.vital_data);
      if (type === VitalDataListType.DAILY) {
        setData(val.vital_data);

        var count = 0;
        var totalCount = 0;
        val.vital_data.filter((value, index, array) => {
          if (DATA_BOUNDS[vitalType](value[vitalType]) === 4) count++;
          totalCount++;
        });
        setOutOfRange(count);
      } else if (
        type === VitalDataListType.WEEKLY ||
        type === VitalDataListType.MONTHLY
      ) {
        let byday = {};

        var count = 0;
        var totalCount = 0;
        val.vital_data.map((value, index, array) => {
          if (DATA_BOUNDS[vitalType](value[vitalType]) === 4) count++;
          totalCount++;
          var d = moment(value.measure_time * 1).format('YYYY - MM - DD');
          byday[d] = byday[d] || [];
          byday[d].push(value);
          return value;
        });

        setOutOfRange(count);
        const values = [];
        Object.keys(byday).map((item, index) => {
          var tc = 0;
          byday[item].filter((item, index) => {
            if (DATA_BOUNDS[vitalType](item[vitalType]) === 4) tc++;
          });

          values.push({
            key: item,
            data: byday[item],
            count: tc,
          });
        });

        setData(values);

        resolve(values);
      } else if (type === VitalDataListType.YEARLY) {
        var months = [];
        var i = 0;
        var prevdate = '';
        var monthNumber = 0;
        var count = -1;
        var monthOutOfRangeCount = 0;
        var outOfR = [];

        var outOf = 0;
        var totalCount = 0;
        val.vital_data.forEach((value) => {
          if (DATA_BOUNDS[vitalType](value[vitalType]) === 4) {
            outOf++;
            monthOutOfRangeCount++;
          }
          totalCount++;
          var date = moment(value.measure_time * 1).format('YYYY - MM - DD');

          if (prevdate !== date) {
            // console.log(date,prevdate);
            count++;
            prevdate = date;
            if (count === 30) {
              outOfR[monthNumber] = monthOutOfRangeCount;
              monthNumber++;
              count = 0;
              monthOutOfRangeCount = 0;
            }
          }
          months[monthNumber] = months[monthNumber] || [];
          months[monthNumber][date] = months[monthNumber][date] || [];
          months[monthNumber][date].push(value);
        });
        outOfR[monthNumber] = monthOutOfRangeCount;
        setOutOfRange(outOf);
        console.log('outOfR', outOfR);

        const values = [];
        Object.keys(months).forEach((item, mainIndex) => {
          // console.log("Item",item);
          console.log(mainIndex, outOfR[mainIndex]);
          const oneMonth = [];
          const dates = Object.keys(months[item]);
          dates.forEach((date, index) => {
            var oorange = 0;
            months[item][date].filter((val, ind) => {
              if (DATA_BOUNDS[vitalType](val[vitalType]) === 4) {
                oorange++;
              }
            });
            oneMonth.push({
              key: date,
              data: months[item][date],
              count: oorange,
            });
          });
          values.push({
            name: item,
            data: oneMonth,
          });
        });
        setData(values);
      }
    });
    //   console.log(days);
  };

  const onDeleteTime = (index) => {
    if (type === 'MONTHLY') {
      const values = data1.map((item, index1) => {
        if (index1 !== openDay) {
          return item;
        }
        const filtered = item.data.filter((item2, index2) => {
          return index2 !== index;
        });
        return {
          ...item,
          data: filtered,
        };
      });
      setData(values);
    } else if (type === VitalDataListType.YEARLY) {
      const values = data1.map((month, monthIndex) => {
        if (monthIndex !== openMonth) {
          return month;
        }
        const monthData = month.data.map((date, dateIndex) => {
          if (dateIndex !== openDay) {
            return date;
          }
          const filtered = date.data.filter((time, timeIndex) => {
            return timeIndex !== index;
          });
          return {
            ...date,
            data: filtered,
          };
        });
        return {
          ...month,
          data: monthData,
        };
      });
      setData(values);
    }
  };

  const renderDaily = (data) => {
    return (
      <FlatList
        data={data}
        style={styles.dailyList}
        initialNumToRender={20}
        keyExtractor={(item, index) =>
          (item.measure_time + ' ' + index).toString()
        }
        renderItem={({item, index}) => {
          if (isAll) {
            return (
                            <TimeComponent
                data={item}
                measureType={glucoseMeasure === 'mmol/L'}
                vitalType={vitalType}
                onDelete={() => {
                  onDeleteTime(index);
                }}
                                onSave={() => {
                                }}
              />
            );
          } else {
            if (DATA_BOUNDS[vitalType](item[vitalType]) === 4) {
              return (
                                <TimeComponent
                  data={item}
                  measureType={glucoseMeasure === 'mmol/L'}
                  vitalType={vitalType}
                  onDelete={() => {
                    onDeleteTime(index);
                  }}
                                    onSave={() => {
                                    }}
                />
              );
            }
          }
        }}
      />
    );
  };

  const renderWeekly = (data) => {
    return (
      <FlatList
        ref={weeklyRef}
        style={styles.dailyList}
        initialNumToRender={20}
        extraData={isAll}
        data={data}
        keyExtractor={(item, index) => item.key.toString()}
        renderItem={({item, index}) => {
          const day = moment(item.key, 'YYYY - MM - DD').format(t('dateFormats.fullDayFormat'));
          if (isAll || item.count > 0)
            return (
              <View>
                <TouchableOpacity
                  style={[
                    styles.row,
                    openDay === index && styles.selectedMonth,
                    {paddingStart: 30},
                  ]}
                  onPress={() => {
                    setOpenDay(index === openDay ? -1 : index);
                    if (type !== VitalDataListType.YEARLY) {
                      weeklyRef.current.scrollToIndex({
                        index: openDay > 0 ? openDay - 1 : 0,
                      });
                    }
                  }}
                  accessible={false}
                >
                  <Text>
                    {isAll
                      ? `${day} (${item.data.length})`
                      : `${day} (${item.count})`}
                  </Text>
                  <Icon
                    name={
                      openDay === index
                        ? 'keyboard-arrow-up'
                        : 'keyboard-arrow-down'
                    }
                    color={'#7C7C7C'}
                    size={20}
                  />
                </TouchableOpacity>
                {index === openDay ? renderDaily(item.data) : null}
              </View>
            );
        }}
      />
    );
  };

  const renderYearly = () => {
    return (
      <FlatList
        data={data1}
        keyExtractor={(item, index) => index.toString()}
        style={styles.dailyList}
        ref={yearlyRef}
        initialNumToRender={20}
        renderItem={({item, index}) => {
          const endDate = moment(
            data1[index].data[0].key,
            'YYYY - MM -DD',
          ).format(t('dateFormats.periodMid'));
          const startDate = moment(
            data1[index].data[data1[index].data.length - 1].key,
            'YYYY - MM -DD',
          ).format(t('dateFormats.periodMid'));
          return (
            <View>
              <TouchableOpacity
                style={[
                  styles.row,
                  openMonth === index && styles.selectedMonth,
                ]}
                onPress={() => {
                  if (index === openMonth) {
                    setOpenDay(-1);
                  }
                  yearlyRef.current.scrollToIndex({
                    index: openMonth > 0 ? openMonth - 1 : 0,
                  });
                  setOpenMonth(openMonth === index ? -1 : index);
                }}
                accessible={false}
              >
                <Text>{`${startDate} - ${endDate}`}</Text>
                <Icon
                  name={
                    openMonth === index
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  color={'#7C7C7C'}
                  size={20}
                />
              </TouchableOpacity>
              <View style={styles.yearlyItemsContainer}>
                {index === openMonth ? renderWeekly(item.data) : null}
              </View>
            </View>
          );
        }}
      />
    );
  };

  const renderData = () => {
    if (type === VitalDataListType.DAILY) {
      return renderDaily(data1);
    } else if (type === VitalDataListType.WEEKLY || type === 'MONTHLY') {
      return renderWeekly(data1);
    } else if (type === VitalDataListType.YEARLY) {
      return renderYearly(data1);
    }
  };

  let outOfRangeVal = outOfRange;
  let allVal = data.vital_data.length > 1000 ? '1000+' : data.vital_data.length;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <CustomTab
                tab1={t('HealthDetailComponent.outOfRange',{outOfRangeVal})}
                tab2={t('HealthDetailComponent.allVal',{allVal})}
        onPressTab={(index) => {
          setIsAll(index === 1);
          setOpenDay(-1);
          setOpenMonth(-1);
        }}
        selected={isAll ? 1 : 0}
      />
      <View style={[styles.title]}>
                <Text style={styles.titleStyles}>{t('HealthDetailComponent.timeOfReading')}</Text>
                <Text style={styles.titleStyles}>{
                    t('HealthDetailComponent.value',{
                        units:vitalType === 'glucose'?glucoseMeasure: VITAL_UNITS[vitalType]}
                    )}

        </Text>
      </View>
            <View>{renderData()}</View>
    </SafeAreaView>
  );
};

export default HealthDetailComponent;
