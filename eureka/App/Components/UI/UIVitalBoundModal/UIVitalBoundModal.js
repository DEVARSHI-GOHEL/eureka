import React, {useState, useEffect} from 'react';
import {Text, StyleSheet, Modal} from 'react-native';
import {Colors} from '../../../Theme';
import {UIModal} from '../../../Components/UI/UIModal';
import GlobalStyle from '../../../Theme/GlobalStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {GLUCOSE_UNIT} from '../../../constants/AppDataConstants';
import {DB_STORE} from '../../../storage/DbStorage';

import {DataBounds} from '../../../Containers/VitalParameterBound/VitalParameterBound';
import {getVitalDataBoundsNameAndUnit} from "../../../Chart/AppConstants/VitalDataTool";

export function UIVitalBoundModal({
  visiblity,
  noInternetIcon,
  noDataIcon,
  errorIcon,
  loadingIcon,
  message,
  vitalBoundModalCloseFun,
  vitalTypeProp,
  ...props
}) {
  const [glucoseUnit, setGlucoseUnit] = useState(GLUCOSE_UNIT.MGDL);

  useEffect(() => {
    getAndSetGlucoseUnit();
  }, []);

  async function getAndSetGlucoseUnit() {
    let user_id = await AsyncStorage.getItem('user_id');
    let userDbData = await DB_STORE.GET.userInfo(user_id);

    let glucose_unit = GLUCOSE_UNIT.MGDL;
    if (userDbData && userDbData.rows[0]) {
      glucose_unit = userDbData.rows[0].glucose_unit
        ? userDbData.rows[0].glucose_unit
        : GLUCOSE_UNIT.MGDL;
    }

    setGlucoseUnit(glucose_unit);
  }

  let __info = getVitalDataBoundsNameAndUnit(vitalTypeProp, glucoseUnit);
  let modalType = (
    <UIModal
      modalClose={vitalBoundModalCloseFun}
      title={<UIModalTitle titleData={__info} />}
      content={
        <DataBounds
          glucoseUnit={glucoseUnit}
          vitalType={vitalTypeProp}
          withoutHeader={true}
        />
      }
    />
  );

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visiblity}
      // onRequestClose={() => {
      //   Alert.alert("Modal has been closed.");
      // }}
    >
      {modalType}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalView: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    // paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 0,
  },
});

function UIModalTitle({titleData}) {
  return (
    <>
      <Text style={GlobalStyle.modalVitalHeading}>{titleData.name}</Text>
      <Text style={GlobalStyle.modalVitalSubHeading}>{titleData.unit}</Text>
    </>
  );
}
