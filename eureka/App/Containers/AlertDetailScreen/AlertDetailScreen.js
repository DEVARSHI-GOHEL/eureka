import React, {useState, useLayoutEffect} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FatherIcon from 'react-native-vector-icons/Feather';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import {Card} from 'react-native-paper';
import {useDispatch} from 'react-redux';

import {DATA_BOUNDS_TYPE} from '../../Chart/AppConstants/VitalDataConstants';
import {
  UIBellSvgIcon,
  UIButton,
  UIOrangeBellSvgIcon,
  UIRedBellSvgIcon,
  UITextInput,
  UIModal,
} from '../../Components/UI';
import {
  setAlertAsDeleted,
  setAlertAsEdited,
  getKey
} from '../AlertScreen';

import {Colors, Fonts, GlobalStyle} from '../../Theme';
import styles from './styles';

import {Translate, useTranslation} from "../../Services/Translate";
import {getLabelByUnits} from "../../Chart/AppUtility/ChartAxisUtils";
import AlarmIcon from "../../Components/AlarmIcon";
import ModalWithCancel, {useModal} from "../../Components/ModalWithCancel/ModalWithCancel";


export const AlertDetailScreen = ({navigation, route}) => {
  const deleteAlertsHook = useModal();
  const trn = useTranslation('alertScreen');
  const dispatch = useDispatch();
  const [notes, setNotes] = useState(route.params.notes);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerIconWrap}
          onPress={() => {
            deleteAlertsHook.showModal();
          }}
          accessible={false}>
          <MaIcon
            name="delete"
            style={[styles.headerMenuIcon, styles.seetingIcon, {color: Colors.black}]}
            onPress={() => deleteAlertsHook.showModal()}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);



  const renderCard = () => {
    return (
      <View style={styles.cardContainer}>
        <Card style={styles.healthOverviewBox}>
          <View style={styles.bellArea}>
            <AlarmIcon alarmType={route.params.color} />
          </View>

          <View style={styles.title}>
            <Text style={styles.cardText1}>{route.params.date}</Text>

            <Text
              style={styles.cardTex2}>
              {Translate(route.params.isLow?'alertScreen.measureIsLow':'alertScreen.measureIsHigh',
                {name:trn[route.params.name] ?? route.params.name})}
            </Text>
             <Text style={styles.cardTex3}>
              {Translate(route.params.isLow?'alertScreen.lessThan':'alertScreen.greaterThan',
                {value:route.params.value, unit:getLabelByUnits(route.params.unit)})}
            </Text>
          </View>
          <View style={styles.calibrateTopText}>
            <TouchableOpacity accessible={false}>
              <FatherIcon style={styles.infoIcon} name="info" />
            </TouchableOpacity>
            <Text style={styles.subHeading}>
              {Translate('alertScreen.reading', {
                aboveOrBelow:!route.params.isLow ? trn.readingAbove : trn.readingBelow,
                value:route.params.value,
                unit:getLabelByUnits(route.params.unit)
              })}
            </Text>
          </View>
          <View style={styles.calibrateTopText}>
            <TouchableOpacity accessible={false}>
              <FatherIcon style={styles.infoIcon} name="info" />
            </TouchableOpacity>
            <View style={styles.viewStyle}>
              <Text style={[styles.subHeading2]}>{trn.whatNext}</Text>
              <View style={styles.row}>
                <View style={styles.dot}/>
                <Text style={styles.text}>
                  {trn.nextStep1}
                </Text>
              </View>
              {route?.params?.id == 1 && //show only when Blood Glucose variant (id == 1 );
                <View style={styles.row}>
                  <View style={styles.dot}/>
                  <Text style={styles.text}>
                    {trn.nextStep2}
                  </Text>
                </View>
              }
              <View style={styles.row}>
                <View style={styles.dot}/>
                <Text style={styles.text}>
                  {trn.nextStep3}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior="position"
      enabled={Platform.OS === 'ios'}
      contentContainerStyle={styles.keyboardAvoidingView}
      style={styles.mainContainer}
      keyboardVerticalOffset={30}
    >
      <ScrollView style={styles.scrollContainer}>
        {renderCard()}
        <View style={styles.buttonsView}>
          <UITextInput
            labelText={trn.details}
            value={notes}
            style={styles.feedbackTextfield}
            labelStyles={{fontWeight: 'bold'}}
            placeholder={trn.addNotes}
            multiline={true}
            textAlignVertical={'top'}
            accessibilityLabel="symptom-text-input"
            onChangeText={(text) => setNotes(text)}
            onBlur={() => {
              dispatch(setAlertAsEdited({ ...route.params, notes }));
            }}
          />
        </View>
      </ScrollView>

      <ModalWithCancel
        modalHook={deleteAlertsHook}
        text={trn.deleteQuestion}
        onOK={() => {
          dispatch(setAlertAsDeleted(getKey(route.params)));
          navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};
