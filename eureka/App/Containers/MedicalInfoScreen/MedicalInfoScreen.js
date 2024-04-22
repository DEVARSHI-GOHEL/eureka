/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
  RefreshControl,
} from 'react-native';

import {Label, CheckBox, ListItem, Body} from 'native-base';

import LinearGradient from 'react-native-linear-gradient';
import FeatherFont from 'react-native-vector-icons/Feather';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import {
  UITextInput,
  UIButton,
  UILoader,
  UIModal,
  UIGenericPlaceholder, UIPicker,
} from '../../Components/UI';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import {API} from '../../Services/API';
import {
  Fonts,
  Sign_In_Api,
  Get_master_Api,
  StepsGoal_Api,
  Colors,
} from '../../Theme';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNetInfo} from '@react-native-community/netinfo';
import {Translate, useTranslation} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

const MedicalInfoScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();
  let otherInputRef = React.useRef();
  const [bloodType, setBloodType] = useState('default');
  const [reload, setReload] = useState(false);
  const [editEnable, setEditEnable] = useState(false);
  const [otherDiseaseState, setOtherDisease] = useState('');
  const [isOtherChecked, setIsOtherChecked] = useState(null);
  const [showOtherDiseaseField, setShowOtherDiseaseField] = useState(false);
  const [otherInputCheck, setOtherInputCheck] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [knownDiseaseArray, setKnownDiseaseArray] = useState([]);
  const [bloodGroupArray, setBloodGroupArray] = useState([]);
  const [knownDiseaseUser, setKnownDiseaseUser] = useState([]);
  const [isCommingSoon, setIsCommingSoon] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trnDisease = useTranslation('diseases');
  const trnBloodType = useTranslation('bloodType');
  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('medicalInfoScreen'))) {
      const medicalInfoScreenContentObject = Translate('medicalInfoScreen');
      setContentScreenObj(medicalInfoScreenContentObject);
      console.log('contentScreenObj 1', contentScreenObj);
    }
  });
  /** ############################ */

  /**
   * Disable back button during api call
   */
  const [isBackEnable, setIsBackEnable] = React.useState(false);
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isBackEnable) {
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isBackEnable, setIsBackEnable]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getAllAPI();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  /**
   * Disable header and hardware back during after any api call
   */
  const backHandleHeaderDisableFun = () => {
    setIsBackEnable(true); //block user to back press
    navigation.setOptions({
      headerLeft: (props) => (
        <HeaderBackButton
          {...props}
          onPress={() => {}}
          tintColor={'lightgray'}
          headerBackTitle={' '}
        />
      ),
    });
  };

  /**
   * revert header and hardware back back to normal state and user can able to back
   */
  const backHandleHeaderNormalFun = () => {
    setIsBackEnable(false);
    navigation.setOptions({
      headerLeft: (props) => {
        return (
          <HeaderBackButton
            {...props}
            onPress={() => navigation.goBack(null)}
            headerBackTitle={' '}
            tintColor={'black'}
          />
        );
      },
    });
  };

  /**
   * compare self user selected diseases with the coming master list disease
   * @param {*} parentItem
   * @param {*} parentIndex
   * @param {*} getDeseaseParam
   */
  function checkDesease(parentItem, parentIndex, getDeseaseParam) {
    // console.log('parentItem', parentItem);

    // console.log('checkDesease getDeseaseParam param', getDeseaseParam[0]);

    let checkValue;
    let otherValue;

    if (getDeseaseParam !== null) {
      const item = getDeseaseParam.find((userItem) => {
        return userItem.id === parentItem.id;
      });
      // console.log('item.checked', item !== undefined && item);

      // if matches
      if (item !== undefined) {
        checkValue = true;
        otherValue = item.others;
      } else {
        checkValue = false;
        otherValue = null;
      }

      // if()
      // console.log('item name', item)

      return {...parentItem, checked: checkValue, others: otherValue};
    }
    // else {
    //   return { ...parentItem, checked: checkValue, others:otherValue }
    // }
  }

  /**
   * get KnownDiease List Api call
   */
  const getKnownDieaseInfo = async (getDesease) => {
    // console.log('getDesease', getDesease);

    /**
     * Show loader after sign in button press
     */

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    API.postApi(Get_master_Api, {
      dataType: 'KnownDieasesList',
    })
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        if (response.data.statusCode === 200) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          if (response.data.body.data !== undefined) {
            /** New modifile array variable */
            let newArr = [];
            let otherObj = null;
            /**
             * for Others disease position to last array index
             */

            response.data.body.data.master_data_list.forEach((item) => {
              // for making the other in the last
              if (item && item.id == 7) {
                otherObj = item;
              } else {
                newArr.push(item);
              }
            });

            if (otherObj) {
              newArr.push(otherObj);
            }

            let checkboxCal;

            /**
             * all items + others at bottom
             */
            let newArrayObject = newArr.map((item, itemIndex) => {
              // console.log('item', item);

              return checkDesease(item, itemIndex, getDesease);
            });

            let otherDeseaseTextField = newArrayObject.filter((item) => {
              return item.id === 7;
            });

            if (otherDeseaseTextField[0].others !== null) {
              setOtherDisease(otherDeseaseTextField[0].others);
              setIsOtherChecked(true);
            } else if (otherDeseaseTextField[0].others === null) {
              setOtherDisease('');
            }

            /**
             * setting the ethinicity value to array state
             */
            setKnownDiseaseArray(newArrayObject);
          }
        }
      })
      .catch(function (error) {
        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };
  /**
   * call all Api in at a time
   */

  const getAllAPI = async (isLoaderParam = true) => {
    /**
     * Show loader after sign in button press
     */
    setIsLoader(isLoaderParam);
    console.log('getAllAPI contentScreenObj', contentScreenObj);
    setLoaderText(contentScreenObj.loaderMsg_1);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    let userId = await AsyncStorage.getItem('user_id');

    const queryInfo = `query bloodGroup($userId:Int!){getBloodGroup(userId:$userId){statusCode body{success message data{id value}}}}`;
    axios
      .all([
        API.postApi(Get_master_Api, {
          dataType: 'BloodGroupList',
        }),
        postWithAuthorization(
          StepsGoal_Api,
          {
            query:
              'query disease($userId:Int!){getKnownDisease(userId:$userId){statusCode body{success message data{id value others}}}}',
            variables: {
              userId: userId,
            },
            operationName: 'disease',
          }
        ),
        postWithAuthorization(
          Sign_In_Api,
          {
            query: queryInfo,
            variables: {
              userId: userId,
            },
            operationName: 'bloodGroup',
          }
        ),
      ])
      .then(
        axios.spread(
          (resBloodGroupList, resGetKnownDiseaseUser, resBloodGroupUser) => {
            console.log(
              'resBloodGroupList',
              resBloodGroupList,
              'resGetKnownDiseaseUser',
              resGetKnownDiseaseUser,
              'resBloodGroupUser',
              resBloodGroupUser,
            );

            if (resBloodGroupList.data.statusCode === 200) {
              /**
               * Revert back header to normal
               */

              /**
               * setting the ethinicity value to array state
               */
              setBloodGroupArray(
                resBloodGroupList.data.body.data.master_data_list,
              );
            }

            /**
             * get response of user's deseases data
             */
            if (
              resGetKnownDiseaseUser.data.data.getKnownDisease.statusCode ===
              200
            ) {
              /**
               * Revert back header to normal
               */

              if (
                resGetKnownDiseaseUser.data.data.getKnownDisease.body.data !==
                undefined
              ) {
                setKnownDiseaseUser(
                  resGetKnownDiseaseUser.data.data.getKnownDisease.body.data,
                );

                setTimeout(() => {
                  getKnownDieaseInfo(
                    resGetKnownDiseaseUser.data.data.getKnownDisease.body.data,
                  );
                }, 2000);
              }
            } else if (
              resGetKnownDiseaseUser.data.data.getKnownDisease.statusCode ===
              201
            ) {
              if (
                resGetKnownDiseaseUser.data.data.getKnownDisease.body.data ===
                null
              ) {
                setKnownDiseaseUser(
                  resGetKnownDiseaseUser.data.data.getKnownDisease.body.data,
                );

                setTimeout(() => {
                  getKnownDieaseInfo(
                    resGetKnownDiseaseUser.data.data.getKnownDisease.body.data,
                  );
                }, 2000);
              }
            }

            /**
             * get data of user's blood group
             */
            if (resBloodGroupUser.status === 200) {
              // setIsLoader(false);
              /**
               * Revert back header to normal
               */

              if (
                resBloodGroupUser.data.data.getBloodGroup.statusCode !== 201
              ) {
                setBloodType(
                  resBloodGroupUser.data.data.getBloodGroup.body.data.id.toString(),
                );
              }
            }
          },
        ),
      )
      .catch((err) => {
        if (err.response !== undefined) {
          console.log('all api error ========================', err.response);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
        }
      });
  };

  /**
   * updateCheckbox
   * @param {*} idParam
   * @param {*} checkedParam
   */
  const updateCheckbox = (idParam, checkedParam) => {
    /**
     * knownDiseaseArray - map
     */
    knownDiseaseArray.map((item, index) => {
      /**
       * checking clicked item.id === listed item.id
       */
      if (item.id === idParam) {
        /**
         * copy of state
         */
        let oldObjArray = knownDiseaseArray;

        /**
         * if checkbox is true then toogle to false else toggle to true
         */
        if (checkedParam) {
          oldObjArray[index].checked = false;
        } else {
          oldObjArray[index].checked = true;
        }

        /**
         * cloning updated object array to new variable
         * if it's not done then state will mutate
         * so for updating it's important
         */
        let newObject = [...oldObjArray];

        if (idParam === 7 && checkedParam === false) {
          setShowOtherDiseaseField(true);
          setOtherInputCheck(true);
        } else if (idParam === 7 && checkedParam === true) {
          setOtherDisease('');
          setShowOtherDiseaseField(false);
        }

        let otherOptionArrayObj = newObject.filter((item) => {
          return item.id === 7;
        });

        setIsOtherChecked(otherOptionArrayObj[0].checked);

        /**
         * updating the KnownDiseaseArray array state with new checked and unchecked items
         * it will rerender the screen and checkboxes will shown checked/unchecked
         */
        setKnownDiseaseArray(newObject);
      }
    });
  };

  /**
   * get blood type from Api call
   */
  const updateBloodTypeApi = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userId = await AsyncStorage.getItem('user_id');

    const addMedicalInfo = `mutation add($userId:Int,$bloodGroup:Int){addBloodGroup(userId:$userId,bloodGroup:$bloodGroup){statusCode body}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);
    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: addMedicalInfo,
        variables: {
          userId: userId,
          bloodGroup: Number(bloodType),
        },
        operationName: 'add',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        if (response.status === 200) {
          setTimeout(() => {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
          }, 0);

          setTimeout(() => {
            // write your functions
            setModalVisible(!modalVisible);
          }, 200);
        }
      })
      .catch(function (error) {
        console.log('err', error.response);

        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  /**
   * add personal info Api call
   */
  const updateDeseaseTypeApi = async () => {
    let newarray = knownDiseaseArray.filter((item, ind) => {
      return item.checked === true ? item : null;
    });

    let arrayOfNumbers = newarray.map((i, ind) => {
      return newarray[ind].id;
    });

    /**
     * Store unique UserId in async storage
     */

    let userId = await AsyncStorage.getItem('user_id');

    const queryInfo = `mutation add($userId:Int,$knownDisease:[Int],$otherDisease:String){addKnownDisease(userId:$userId,knownDisease:$knownDisease,otherDisease:$otherDisease){statusCode body}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(
      Sign_In_Api,
      {
        query: queryInfo,
        variables: {
          userId: userId,
          knownDisease: arrayOfNumbers,
          otherDisease: otherDiseaseState,
        },
        operationName: 'add',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('updateDeseaseTypeApi', response);

        if (response.status === 200) {
          setIsLoader(false);
          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          getAllAPI();
        }
      })
      .catch(function (error) {
        console.log('err', error.response);

        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_3);
      });
  };

  const mergeFun = () => {
    updateDeseaseTypeApi();
    updateBloodTypeApi();
  };

  useEffect(() => {
    if (netInfo.isConnected) getAllAPI();
  }, [netInfo.isConnected]);

  let continueBtnDisableState;
  console.log('isOtherChecked============', isOtherChecked);
  console.log('otherDiseaseState===========', otherDiseaseState);

  if (isOtherChecked === true) {
    // when user inputs
    if (otherDiseaseState === '') {
      continueBtnDisableState = true;
    } else {
      continueBtnDisableState = false;
    }
  } else if (isOtherChecked === null) {
    // when already checked and getting data from api
    if (otherDiseaseState === '') {
      continueBtnDisableState = false;
    } else {
      continueBtnDisableState = false;
    }
  } else if (isOtherChecked === false) {
    // when user input
    if (otherDiseaseState === '') {
      continueBtnDisableState = false;
    }
  } else {
    continueBtnDisableState = false;
  }

  if (bloodType == 'default') {
    continueBtnDisableState = true;
  }

  if (isLoader) {
    return <UILoader title={loaderText} />;
  }

  if (netInfo.isConnected !== true) {
    return (
      <UIGenericPlaceholder
        noInternetIcon={true}
        message="No Internet Connection"
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
        <ScrollView
          style={styles.mainScrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#A4C8ED']}
            />
          }>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            <View style={styles.inputWrap}>
              <Label
                style={styles.inputLabel}
                accessibilityLabel="blood-type-heading">
                {contentScreenObj.bloodType_PickerText}
              </Label>
              <View style={styles.inputPicker}>
                <UIPicker
                  style={{width: '99.5%', paddingRight: '.5%'}}
                  textStyle={{
                    color: bloodType === 'default' ? '#B3B3B3' : '#000',
                    ...Fonts.fontMedium,
                    paddingLeft: 10,
                  }}
                  iosIcon={
                    <MaIcon
                      name="arrow-drop-down"
                      style={{color: Colors.gray, fontSize: 26}}
                    />
                  }
                  selectedValue={bloodType}
                  placeholder={contentScreenObj.selectOne}
                  onValueChange={(selectedItem) => {
                    console.log('selectedItem', selectedItem);
                    if (selectedItem === 'default') {
                    } else {
                      setBloodType(selectedItem);
                    }
                  }}
                  accessibilityLabel="blood-type-dropdown"
                  mode={'dialog'}>
                  <UIPicker.Item
                    label={contentScreenObj.selectOne}
                    value={'default'}
                    color="#999"
                  />
                  {bloodGroupArray.map((item, itemId) => {
                    return (
                      <UIPicker.Item
                        label={trnBloodType[item.value] ?? item.value}
                        value={item.id.toString()}
                        key={item.id}
                      />
                    );
                  })}
                </UIPicker>
              </View>
            </View>
            <View style={styles.inputWrap}>
              <Text
                style={styles.diseaseHeading}
                accessibilityLabel="known-diseases-heading">
                {contentScreenObj.diseaseHeading}
              </Text>
              {knownDiseaseArray.map((item, itemId) => {
                let otherInputVar;

                if (!editEnable) {
                  otherInputVar = item.others;
                } else {
                  if (!item.checked) {
                    otherInputVar = '';
                  } else {
                    otherInputVar = otherDiseaseState;
                  }
                }

                return (
                  <View key={itemId}>
                    <ListItem key={itemId} style={styles.chekboxRow}>
                      <CheckBox
                        style={[
                          styles.chekboxColor,
                          item.checked === true
                            ? {
                                borderColor: '#006dd7',
                                backgroundColor: '#006dd7',
                              }
                            : {},
                        ]}
                        checked={item.checked}
                        onPress={() => updateCheckbox(item.id, item.checked)}
                        value={item.id.toString()}
                        key={item.id}
                        accessibilityLabel="known-diseases-checkBox"
                      />
                      <Body style={{alignItems: 'flex-start'}}>
                        <Text
                          style={styles.diseaseText}
                          onPress={() => updateCheckbox(item.id, item.checked)}
                          accessibilityLabel="known-diseases-checkBox-text">
                          {trnDisease[item.value.trim()] ?? item.value}
                        </Text>
                      </Body>
                    </ListItem>
                    {item.checked && item.id === 7 ? (
                      <View style={styles.medicalinputWrap}>
                        <UITextInput
                          ref={otherInputRef}
                          placeholder={
                            contentScreenObj.otherDiseases_PlaceholderText
                          }
                          value={otherDiseaseState}
                          placeholderTextColor="#000"
                          onChangeText={(text) => setOtherDisease(text)}
                          accessibilityLabel="medical-info-other-textInput"
                          onFocus={(text) => {}}
                        />
                        {otherInputCheck && (
                          <Text
                            style={{
                              ...Fonts.sub,
                              color: 'hsl(210,61%,42%)',
                              marginTop: -8,
                            }}
                            accessibilityLabel="known-diseases-input-text">
                            ** {contentScreenObj.otherDiseasesInfo}
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          <UIButton
            mode="contained"
            labelStyle={{color: '#fff'}}
            style={
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={continueBtnDisableState}
            accessibilityLabel="symptom-save-button"
            onPress={() => mergeFun()}>
            {contentScreenObj.saveChange_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <UIModal
          Icon={
            <FeatherFont
              name="check-circle"
              style={GlobalStyle.iconStyle}
              color="green"
            />
          }
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.saveChange_PopUpText}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                accessibilityLabel="logout-ok"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default MedicalInfoScreen;
