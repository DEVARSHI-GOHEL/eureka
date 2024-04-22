/**
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Card} from 'react-native-paper';
import {CheckBox} from 'native-base';
import {useIsFocused} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import MaIcon from 'react-native-vector-icons/MaterialIcons';

import {
  UIButton,
  UILoader,
  UIPicker,
} from '../../Components/UI';
import {
  DATA_BOUNDS_TYPE,
  DEVIATION_LOW_THRESHOLD,
  MEASURE_TREND,
  VITAL_CONSTANTS,
} from '../../Chart/AppConstants/VitalDataConstants';

import {DB_STORE} from '../../storage/DbStorage';
import {
  DayBrowser,
  getDateTimeInfo,
  isToday,
} from '../../Chart/AppUtility/DateTimeUtils';
import {convertMeasureInfoFromDb, toMMOL} from '../../utils/MeasureVizUtils';
import {GLUCOSE_UNIT} from '../../constants/AppDataConstants';
import {selectGlucoseUnit} from '../HomeScreen/selectors';
import {
  getKey,
  selectNewAlertList,
  selectDeletedAlertList,
  selectEditedAlertMap,
  setAlertAsOpened,
  setAlertAsDeleted,
  setHideAlertBadge,
  setShowAlertBadge,
} from '.';

import {Fonts, Colors} from '../../Theme';
import styles from './styles';
import ModalWithCancel, {useModal} from "../../Components/ModalWithCancel/ModalWithCancel";
import {Translate, useTranslation} from "../../Services/Translate";
import {getLabelByUnits} from "../../Chart/AppUtility/ChartAxisUtils";
import AlarmIcon from "../../Components/AlarmIcon";

function sortByMeasureTime(obj1, obj2) {
  if (!obj1?.measure_time) return 1;
  if (!obj2?.measure_time) return -1;
  return (obj2.measure_time - obj1.measure_time)
};

function filterByTypeAndTime({removeMap, sourceList}) {
  return sourceList.filter(sItem => !removeMap?.has(getKey(sItem)));
}

const getVitalItemKey = (itemId, vitalItemId) => (`${itemId}#${vitalItemId}`)

function deleteItemFromList({list, deletedKeys}) {

  return list
    .map(item => {
      const vitalData = item?.vitalData?.filter(vitalItem => !(deletedKeys.has(getVitalItemKey(item.id, vitalItem.id))));
      return vitalData?.length > 0 ? ({...item, vitalData}) : null;
    })
    .filter(a => !!a);
}

const AlertScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const newAlertMap = useSelector(selectNewAlertList);
  const removeMap = useSelector(selectDeletedAlertList);
  const editedMap = useSelector(selectEditedAlertMap);
  const glucoseUnit = useSelector(selectGlucoseUnit);

  const [currentData, setCurrentData] = useState([]);
  const [dateBrowser] = useState(new DayBrowser());
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [selectedAlert, setSelectedAlert] = useState('default');

  const deleteAlertsHook = useModal();
  const readAlertsHook = useModal();

  const addSelectedItem = item => {
    // Create a new Set for the state update
    const newSet = new Set(selected);
    newSet.add(item);
    setSelected(newSet); // This will trigger a re-render
  };

  const removeSelectedItem = item => {
    const newSet = new Set(selected);
    newSet.delete(item);
    setSelected(newSet); // This will trigger a re-render
  };
  const trn = useTranslation('alertScreen');


  const addedNotes = useCallback((id, time) => {
    const key = getKey({time, id});
    return editedMap.has(key) ? editedMap.get(key).notes : ''
  }, [editedMap]);

  const formatVitalData = useCallback((dbData) => {
    if (!Array.isArray(dbData?.rows)) return [];

    return dbData.rows
      .sort(sortByMeasureTime)
      .map((item, index) => {
        const data = convertMeasureInfoFromDb(item);
        data.id = index + 1;

        const glucoseData = {
          id: 1,
          color: data.colorData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
          value:
            glucoseUnit === GLUCOSE_UNIT.MGDL
              ? data.mainData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE]
              : toMMOL(data.mainData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE]),
          time: data.mainData.measure_time,
          trendData: data.trendData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
          deviationData: data.deviationData[VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE],
          name: 'Blood Glucose',
          notes: addedNotes(1, data.mainData.measure_time),
          seen: newAlertMap.has(getKey({time: data.mainData.measure_time, id: 1})),
          unit: glucoseUnit,
        };

        const heartRateData = {
          id: 2,
          color: data.colorData[VITAL_CONSTANTS.KEY_HEART_RATE],
          value: data.mainData[VITAL_CONSTANTS.KEY_HEART_RATE],
          time: data.mainData.measure_time,
          trendData: data.trendData[VITAL_CONSTANTS.KEY_HEART_RATE],
          deviationData: data.deviationData[VITAL_CONSTANTS.KEY_HEART_RATE],
          name: 'Heart Rate',
          notes: addedNotes(2, data.mainData.measure_time),
          seen: newAlertMap.has(getKey({time: data.mainData.measure_time, id: 2})),
          unit: 'bpm',
        };

        const bpData = {
          id: 3,
          color:
            data.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH] >
            data.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]
              ? data.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]
              : data.colorData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW],
          bpSysValue: data.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH],
          bpDiaValue: data.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW],
          time: data.mainData.measure_time,
          trendData: data.trendData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH],
          deviationData: data.deviationData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH],
          name: 'Blood Pressure',
          notes: addedNotes(3, data.mainData.measure_time),
          seen: newAlertMap.has(getKey({time: data.mainData.measure_time, id: 3})),
          unit: 'mmHg',
          value: `${data.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH]}/${data.mainData[VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW]}`
        };

        const respirationData = {
          id: 4,
          color: data.colorData[VITAL_CONSTANTS.KEY_RESP_RATE],
          value: data.mainData[VITAL_CONSTANTS.KEY_RESP_RATE],
          time: data.mainData.measure_time,
          trendData: data.trendData[VITAL_CONSTANTS.KEY_RESP_RATE],
          deviationData: data.deviationData[VITAL_CONSTANTS.KEY_RESP_RATE],
          name: 'Respiration Rate',
          notes: addedNotes(4, data.mainData.measure_time),
          seen: newAlertMap.has(getKey({time: data.mainData.measure_time, id: 4})),
          unit: 'brpm',
        };

        const oxygenData = {
          id: 5,
          color: data.colorData[VITAL_CONSTANTS.KEY_OXY_SAT],
          value: data.mainData[VITAL_CONSTANTS.KEY_OXY_SAT],
          time: data.mainData.measure_time,
          trendData: data.trendData[VITAL_CONSTANTS.KEY_OXY_SAT],
          deviationData: data.deviationData[VITAL_CONSTANTS.KEY_OXY_SAT],
          name: 'Oxygen Saturation',
          notes: addedNotes(5, data.mainData.measure_time),
          seen: newAlertMap.has(getKey({time: data.mainData.measure_time, id: 5})),
          unit: '%',
        };

        data.vitalData = filterByTypeAndTime({
          removeMap,
          sourceList: [
            glucoseData,
            heartRateData,
            bpData,
            respirationData,
            oxygenData,
          ]
        });
        return {
          vitalData: data.vitalData,
          id: data.id,
        };
      });
  }, [newAlertMap, removeMap, addedNotes, convertMeasureInfoFromDb]);

  const getAlerts = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      setCurrentData(formatVitalData(
        await DB_STORE.GET.measureDataByTime(
          dateBrowser.next().start.ts,
          dateBrowser.next().end.ts,
          true
        )
      ));

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const renderVitals = (item, index) => {
    return item.vitalData?.filter((vitalItem) => {
      if (selectedAlert !== 'default' && selectedAlert != vitalItem.name) {
        return false;
      }
      return true;
    }).map((vitalItem, vitalIndex) => {
      const key = getVitalItemKey(item.id, vitalItem.id);
      const dateTimeObj = getDateTimeInfo(vitalItem.time);
      const dateTime = isToday(vitalItem.time) ? trn.today : dateTimeObj.dateInWords;
      // console.log('vitalItem:', vitalItem);

      return (
        vitalItem.color != 1 &&
        vitalItem.color != 0 && (
          <View style={styles.row} key={vitalIndex}>

            <View style={{flex: 1, flexDirection: 'row'}}>

              <View style={{alignSelf: 'center', height: 80, justifyContent: 'center', width: edit ? 45 : '5%'}}>
                {edit && (
                  <TouchableOpacity
                    style={{
                      height: '100%',
                      justifyContent: 'center'
                    }}
                    onPress={() => {
                      if (selected.has(key)) {
                        removeSelectedItem(key);
                      } else {
                        addSelectedItem(key);
                      }
                    }}
                  >

                    <CheckBox
                      style={[
                        styles.checkboxColor,
                        selected.has(key)
                          ? {borderColor: Colors.iconColor, backgroundColor: Colors.iconColor}
                          : {},
                      ]}
                      checked={selected.has(key)}
                      onPress={() => {
                        if (selected.has(key)) {
                          removeSelectedItem(key);
                        } else {
                          addSelectedItem(key);
                        }
                      }}
                    />
                  </TouchableOpacity>
                )}


              </View>
              <View style={{flex: 1,}}>

                <Card style={[styles.alertCard]}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('AlertDetails', {
                        name: vitalItem.name,
                        date: dateTime,
                        time: vitalItem.time,
                        color: vitalItem.color,
                        value: vitalItem.value,
                        vitalIndex,
                        index,
                        notes: vitalItem.notes,
                        id: vitalItem.id,
                        isLow: vitalItem.trendData <= MEASURE_TREND.down,
                        unit: vitalItem.unit,
                      });
                      onAlertOpen(index, vitalIndex);
                    }}
                    accessible={false}>

                    <View style={{marginStart: 75, marginVertical: 25}}>
                      <View
                        style={{
                          justifyContent: 'space-between',
                          marginEnd: 20,
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text style={{color: Colors.gray}}>{dateTime}</Text>
                        <MaIcon
                          size={25}
                          color={Colors.black}
                          name={'keyboard-arrow-right'}
                        />
                      </View>
                      <Text
                        style={[
                          {
                            color: Colors.black,
                            fontSize: 16,
                            ...Fonts.fontBold,
                          },
                        ]}>
                        {Translate(vitalItem.deviationData <= DEVIATION_LOW_THRESHOLD
                          ? "alertScreen.measureIsLow"
                          : "alertScreen.measureIsHigh", {name: trn[vitalItem.name]})}
                      </Text>
                      <Text style={{color: Colors.black, fontWeight: '700'}}>
                        {Translate(vitalItem.deviationData <= DEVIATION_LOW_THRESHOLD
                            ? "alertScreen.lessThan"
                            : "alertScreen.greaterThan",
                          {
                            value: vitalItem.id == 3
                              ? `${vitalItem.bpSysValue}/${vitalItem.bpDiaValue}`
                              : vitalItem.value,
                            unit: getLabelByUnits(vitalItem.unit)
                          })
                        }
                      </Text>
                    </View>
                    <View style={styles.bellArea}>
                      <AlarmIcon alarmType={vitalItem.color} />
                    </View>
                  </TouchableOpacity>
                </Card>
                {!vitalItem.seen && (<View style={[styles.isNew]} collapsable={false}/>)}
              </View>
              <View style={{width: edit ? '2%' : '5%'}}></View>
            </View>
          </View>
        )
      );
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getAlerts();
    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  };

  const renderAlertItem = ({item, index}) => {
    return (
      <View style={styles.renderAlertItemView}>
        {renderVitals(item, index)}
      </View>
    );
  };

  const renderAlerts = () => {
    return (
      <View style={styles.renderAlertsView}>
        <View>
          <UIPicker
            mode="dropdown"
            style={styles.pickerView}
            textStyle={{color: Colors.black, ...Fonts.fontBold, paddingLeft: 10}}
            iosIcon={<MaIcon color={Colors.black} name={'arrow-drop-down'} />}
            selectedValue={selectedAlert}
            placeholder={trn.selectOne}
            accessibilityLabel="relation-type"
            onValueChange={(selectedItem) => {
              setLoading(true);
              setSelectedAlert(selectedItem);
              setLoading(false);
            }}
            mode={'dialog'}
            accessibilityLabel="contact-edit-type">
            <UIPicker.Item
              label={Translate('alertScreen.allAlert')}
              value={'default'}
              color={selectedAlert == 'default' ? Colors.lightGray : Colors.black}
            />
            {list.map((item, index) => {
              return (
                <UIPicker.Item
                  label={trn[item.key]}
                  value={item.key}
                  key={index}
                  color={selectedAlert == item.key ? Colors.lightGray : Colors.black}
                />
              );
            })}
          </UIPicker>
        </View>
        <FlatList
          data={currentData}
          keyExtractor={(_, index) => index.toString()}
          style={styles.flex1}
          renderItem={renderAlertItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.blue]}
            />
          }
        />
        {edit && (
          <View style={styles.bttnWrap}>
            <UIButton
              mode="contained"
              labelStyle={{color: Colors.white}}
              disabled={selected.size === 0}
              onPress={() => deleteAlertsHook.showModal()}>
              {trn.delete}
            </UIButton>
            <UIButton
              mode="contained"
              labelStyle={{color: Colors.white}}
              disabled={selected.size === 0}
              onPress={() => readAlertsHook.showModal()}>
              {trn.markAsRead}
            </UIButton>
          </View>
        )}
      </View>
    );
  };

  const onAlertDelete = () => {
    const keysToDelete = [];

    currentData.forEach(item => {
      item.vitalData?.forEach(vitalItem => {
        const key = getVitalItemKey(item.id, vitalItem.id);
        if (selected.has(key)) {
          keysToDelete.push(getKey({time: vitalItem.time, id: vitalItem.id}));
        }
      })
    })

    setCurrentData(list => deleteItemFromList({list, deletedKeys: selected}));
    dispatch(setAlertAsDeleted(keysToDelete));

  }

  const onAlertRead = () => {
    const keysToMark = [];
    const newData = currentData.map(item => {
      const vitalData = item.vitalData?.map(vitalItem => {
        const key = getVitalItemKey(item.id, vitalItem.id);

        if (selected.has(key)) {
          keysToMark.push(getKey({time: vitalItem.time, id: vitalItem.id}));
          return {...vitalItem, seen: true};
        }
        return vitalItem;
      })
      return {...item, vitalData}
    })

    dispatch(setAlertAsOpened(keysToMark));
    setCurrentData(newData);
  }

  const onAlertOpen = (outerindex, vitalIndex) => {
    setCurrentData((list) => {
      return list.map((item, index) => {
        if (index == outerindex) {
          item.vitalData = item.vitalData.map((obj, vitalInnerIndex) => {
            if (vitalInnerIndex == vitalIndex) {
              dispatch(setAlertAsOpened(getKey(obj)));
              obj.seen = true;
            }
            return obj;
          });
        }
        return item;
      });
    });
  };

  const checkAlertBadge = () => {
    const result = currentData?.find(level1 =>
      level1?.vitalData?.find(
        level2 => (!level2.seen === true && level2.color > 1)));

    dispatch(!!result
      ? setShowAlertBadge()
      : setHideAlertBadge()
    );
  }

  useEffect(() => {
    checkAlertBadge();
  }, [currentData]);

  useEffect(() => {
    if (isFocused) getAlerts();
  }, [isFocused]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerIconWrap}
          onPress={() => {
            setSelected(new Set());
            setEdit((e) => !e);
          }}
          accessible={false}>
          {edit ? (
            <Text
              style={{
                color: Colors.blue,
                ...Fonts.h2,
              }}>
              {trn.done}
            </Text>
          ) : (
            <MaIcon
              name="edit"
              style={[
                styles.headerMenuIcon,
                styles.seetingIcon,
                {color: Colors.black},
              ]}
            />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, edit]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {loading && <UILoader/>}
      <View style={styles.tabArea}>
        {renderAlerts()}
      </View>
      <ModalWithCancel
        modalHook={deleteAlertsHook}
        text={trn.deleteQuestion}
        onOK={() => {
          onAlertDelete();
          setEdit(false);
        }}
      />
      <ModalWithCancel
        modalHook={readAlertsHook}
        text={trn.seenQuestion}
        onOK={() => {
          onAlertRead();
          setEdit(false);
        }}
      />

    </SafeAreaView>
  );
};

export default AlertScreen;

const list = [
  {key: "Blood Glucose"},
  {key: "Blood Pressure"},
  {key: "Heart Rate"},
  {key: "Respiration Rate"},
  {key: "Oxygen Saturation"},
];

