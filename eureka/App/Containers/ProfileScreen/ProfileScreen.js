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
  Image,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {List, ListItem, Left, Right} from 'native-base';
import IconFont from 'react-native-vector-icons/FontAwesome';
import EnIcon from 'react-native-vector-icons/Entypo';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import {
  Fonts,
  StepsGoal_Api,
  Update_User_Api,
  Profile_Pic_Upload_Api,
  Profile_Pic_Get_Url,
} from '../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import {API} from '../../Services/API';
import {useFocusEffect} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import {UILoader, UIButton, UIModal, UIPicker} from '../../Components/UI';
import styles from './styles';
import GlobalStyle from '../../Theme/GlobalStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import {refreshHomeScreen} from '../HomeScreen/DashboardRefreshUtil';
import {Colors} from '../../Theme';
import {logoutSuccess} from '../SignInScreen/action';
import {Translate} from '../../Services/Translate';
import {removeUserAuthDetails} from '../../Services/AuthService';
import {DB_STORE} from '../../storage/DbStorage';
import {resetProfileCheck} from "../HomeScreen/components/CheckProfileModal/CheckProfileModal";
import {postWithAuthorization} from "../../Services/graphqlApi";
import {EVENT_MANAGER} from "../../Ble/NativeEventHandler";
import {fetchStepsGoal} from "./tools";

const ProfileScreen = ({navigation, ...props}) => {
  const {userId, userName} = useSelector((state) => ({
    userId: state.auth.userId,
    userName: state.auth.userName,
  }));

  const dispatch = useDispatch();
  const [imageUploaded, setImageUploaded] = useState('');
  const [stepGoal, setStepGoal] = useState('default');
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('profileScreen'))) {
      const profileScreenContentObject = Translate('profileScreen');
      setContentScreenObj(profileScreenContentObject);
    }
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    onImageGet();
    getStepsGoal();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  /** ############################ */

  const chooseFile = () => {
    ImagePicker.openPicker({
      cropping: true,
      includeBase64: true,
      mediaType: 'photo',
    })
      .then((image) => {
        // console.log('image', image);

        if (image !== null && image !== undefined) {
          // console.log('hu');
          if (image.size <= 2000000) {
            onImageUpload(image);
          } else {
            Alert.alert(
              contentScreenObj.errorMsg_3,
              contentScreenObj.errorMsg_4,
              [{text: contentScreenObj.OK_PopUpButtonText}],
            );
          }
        }
      })
      .catch((err) => {
        console.log('error ###', err);
        if (err.toString() === 'Error: Cannot find image data') {
          Alert.alert(
            contentScreenObj.errorMsg_3,
            contentScreenObj.errorMsg_5,
            [{text: contentScreenObj.OK_PopUpButtonText}],
          );
        }
      });
  };

  /**
   *
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

  /**
   * Disable header and hardware back during after any api call
   */
  // const backHandleHeaderDisableFun = () => {
  //   setIsBackEnable(true); //block user to back press
  //   navigation.setOptions({
  //     headerLeft: ({ navigation }) => (
  //       <HeaderBackButton tintColor={'lightgray'} />
  //     )
  //   });
  // }

  /**
   * revert header and hardware back back to normal state and user can able to back
   */
  // const backHandleHeaderNormalFun = () => {
  //   setIsBackEnable(false);
  //   navigation.setOptions({
  //     headerLeft: ({ }) => {
  //       return (
  //         <HeaderBackButton
  //           onPress={() => navigation.goBack(null)}
  //           tintColor={'black'}
  //         />
  //       );
  //     }
  //   });
  // }

  /**
   * Get image api
   */
  const onImageGet = async () => {
    console.log('Profile_Pic_Get_Url', Profile_Pic_Get_Url);

    let getProfilePicUrl = await AsyncStorage.getItem('user_pp_name');
    // console.log('getProfilePicUrl', getProfilePicUrl);
    if (getProfilePicUrl !== null) {
      let pp_name = `${Profile_Pic_Get_Url}/${getProfilePicUrl}`;
      console.log('pp', pp_name);
      if (pp_name !== '') {
        setImageUploaded(pp_name);
      }
    } else {
      setImageUploaded('');
    }
  };

  /**
   * Image upload Api call
   */
  const onImageUpload = async (file) => {
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);
    if (file !== undefined) {
      let user_id = await AsyncStorage.getItem('user_id');

      /**
       * Api call
       */
      postWithAuthorization(
        Profile_Pic_Upload_Api,
        {
          userId: Number(user_id),
          imgData: file.data, //base64 image
        }
      )
        .then(async (response) => {

          let responseBody = JSON.parse(response.data.body);

          if (response.status === 200) {
            if (responseBody.statusCode === 200) {
              if (responseBody.body.url !== null) {
                console.log('if#####');

                let ImageUrl = responseBody.body.url;

                let ImageUrlSplitArray = ImageUrl.split('/');

                let ImageUrlSplitArrayFileName =
                  ImageUrlSplitArray[ImageUrlSplitArray.length - 1];

                AsyncStorage.setItem(
                  'user_pp_name',
                  ImageUrlSplitArrayFileName,
                );
                let displayImgUrl = `${Profile_Pic_Get_Url}/${ImageUrlSplitArrayFileName}`;
                console.log('displayImgUrl', displayImgUrl);
                setImageUploaded(displayImgUrl);
                setIsLoader(false);
              }
            } else if (responseBody.statusCode === 501) {
              console.log('else if #### 501');
              setIsLoader(false);

              /**
               * Revert back header to normal
               */
              backHandleHeaderNormalFun();

              Alert.alert(
                contentScreenObj.errorMsg_6,
                contentScreenObj.errorMsg_7,
                [{text: contentScreenObj.OK_PopUpButtonText}],
              );
            } else if (responseBody.statusCode === 502) {
              console.log('else if #### 502');
              setIsLoader(false);

              /**
               * Revert back header to normal
               */
              backHandleHeaderNormalFun();

              Alert.alert(
                contentScreenObj.errorMsg_6,
                contentScreenObj.errorMsg_7,
                [{text: contentScreenObj.OK_PopUpButtonText}],
              );
            } else if (responseBody.statusCode === 500) {
              console.log('else if #### 500');
              setIsLoader(false);

              /**
               * Revert back header to normal
               */
              backHandleHeaderNormalFun();

              Alert.alert(
                contentScreenObj.errorMsg_6,
                contentScreenObj.errorMsg_7,
                [{text: contentScreenObj.OK_PopUpButtonText}],
              );
            }
          }
        })
        .catch(function (error) {
          console.log('onImageUpload err-----', error.response);
          setIsLoader(false);
          Alert.alert(
            contentScreenObj.errorMsg_6,
            contentScreenObj.errorMsg_7,
            [{text: contentScreenObj.OK_PopUpButtonText}],
          );
        });
    }
  };

  const logout = async () => {
    await removeUserAuthDetails();

    resetProfileCheck();

    await AsyncStorage.clear();

    dispatch(logoutSuccess());
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInScreen'}],
    });
  };

  const modalFunCombined = () => {
    setModalVisible(!modalVisible);
  };
  /**
   * get user info Api call
   */
  const getUserAccInfo = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userId = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = `query user{getUserCredDetails(userId:${userId}){userId emailId userTypeId userType creationDate updationDate firstName lastName phone}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);

    /**
     * Api call
     */
    postWithAuthorization(
      Update_User_Api,
      {
        query: getAgreementUserState,
        variables: null,
        operationName: 'user',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        if (response.status === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          // backHandleHeaderNormalFun();

          let {emailId, firstName, lastName} =
            response.data.data.getUserCredDetails;
        }
      })
      .catch(function (error) {
        console.log(error);

        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        // backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_7);
      });
  };

  /**
   * steps goal Api call
   */
  const sendStepsGoal = async (selectedParam) => {
    // console.log(selectedParam);
    if (selectedParam == 'default') {
      return;
    }

    setStepGoal(selectedParam);
    /**
     * Store unique UserId in async storage
     */

    let userId = await AsyncStorage.getItem('user_id');

    await DB_STORE.UPDATE.userInfo({
      id: userId,
      step_goal: isNaN(selectedParam) ? 1000 : selectedParam * 1,
    });
    refreshHomeScreen();

    const getStepsGoal = `mutation add($userId:Int,$stepGoals:Int){addStepGoals(userId:$userId,stepGoals:$stepGoals){statusCode body}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_2);

    /**
     * header to normal
     */
    // backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(
      StepsGoal_Api,
      {
        query: getStepsGoal,
        variables: {
          userId: userId,
          stepGoals: isNaN(selectedParam) ? 1000 : selectedParam * 1,
        },
        operationName: 'add',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        // console.log(response);

        if (response.status === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          // backHandleHeaderNormalFun();

          // let {stepsGoal} = response.data.data.getUserCredDetails;
          // console.log('stepsGoal response', response)
        }
      })
      .catch(function (error) {
        console.log(error);

        setIsLoader(false);

        /**
         * Revert back header to normal
         */
        // backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_7);
      });

    /**
     * Update daily step goal in watch
     */
    EVENT_MANAGER.SEND.updateDailyStepGoal();
  };

  /**
   * steps goal Api call
   */
  const getStepsGoal = async () => {

    setIsLoader(true);
    const result = await fetchStepsGoal();
    setIsLoader(false);

    if (!result.success) {
      alert(result.errorMessage);
      return;
    }

    setStepGoal(result.steps);

  };

  useEffect(() => {
    getStepsGoal();

    onImageGet();
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#A4C8ED']}
          />
        }>
        <LinearGradient
          colors={['#f1fbff', '#fff']}
          style={styles.profilePicWrap}>
          <View style={styles.picBox}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => chooseFile()}
              accessible={false}>
              {/* <View style={{ borderWidth:1}}><UIProfilePicAvatar widthParam={120} heightParam={120}/></View> */}

              {imageUploaded !== '' ? (
                <View style={styles.picImageArea}>
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={styles.loaderIcon}
                  />
                  <Image
                    source={{uri: imageUploaded}}
                    style={{width: 100, height: 100}}
                  />
                </View>
              ) : (
                <LinearGradient
                  start={{x: 0, y: 0.4}}
                  end={{x: 0.4, y: 0}}
                  colors={['#0d6bd7', '#01b5ff']}
                  style={styles.picArea}>
                  <IconFont name="user" style={[styles.userIcon]} />
                </LinearGradient>
              )}

              <View style={styles.plusIconWrap}>
                <EnIcon name="plus" style={styles.plusIcon} />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileUserName}>{userName}</Text>
        </LinearGradient>
        <View style={styles.navArea}>
          <List style={styles.listSeperator}>
            <ListItem underlayColor="green" style={styles.listRow}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.listRowTouch}
                accessibilityLabel="profile-acc-info"
                accessible={false}
                onPress={() => navigation.navigate('AccountInfoScreen')}>
                <Left>
                  <Text style={styles.navText}>
                    {contentScreenObj.accountInfo_subMenuTitle}
                  </Text>
                </Left>
                <Right>
                  <MaIcon name="keyboard-arrow-right" style={styles.navIcon} />
                </Right>
              </TouchableOpacity>
            </ListItem>
            <ListItem style={styles.listRow}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.listRowTouch}
                accessibilityLabel="profile-personal-info"
                accessible={false}
                onPress={() =>
                  navigation.navigate('PersonalInfoScreen', {
                    routeFrom: 'ProfileScreen',
                  })
                }>
                <Left>
                  <Text style={styles.navText}>
                    {contentScreenObj.personalInfo_subMenuTitle}
                  </Text>
                </Left>
                <Right>
                  <MaIcon name="keyboard-arrow-right" style={styles.navIcon} />
                </Right>
              </TouchableOpacity>
            </ListItem>
            <ListItem style={styles.listRow}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.listRowTouch}
                accessibilityLabel="profile-medical-info"
                accessible={false}
                onPress={() => navigation.navigate('MedicalInfoScreen')}>
                <Left>
                  <Text style={styles.navText}>
                    {contentScreenObj.medicalInfo_subMenuTitle}
                  </Text>
                </Left>
                <Right>
                  <View style={styles.infoNotification}>
                    <MaIcon
                      name="keyboard-arrow-right"
                      style={styles.navIcon}
                    />
                  </View>
                </Right>
              </TouchableOpacity>
            </ListItem>
            <ListItem style={styles.listRow}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.listRowTouch}
                accessibilityLabel="profile-contacts"
                accessible={false}
                onPress={() => navigation.navigate('ContactsScreen')}>
                <Left>
                  <Text style={styles.navText}>
                    {contentScreenObj.contacts_subMenuTitle}
                  </Text>
                </Left>
                <Right>
                  <MaIcon name="keyboard-arrow-right" style={styles.navIcon} />
                </Right>
              </TouchableOpacity>
            </ListItem>
          </List>
          <View style={styles.stepcountDropdown}>
            <Text style={styles.navText}>
              {contentScreenObj.stepGoal_PickerText}
            </Text>
            <View style={styles.inputPicker}>
              <UIPicker
                mode="dropdown"
                style={{width: '99.5%', paddingRight: '.5%'}}
                textStyle={{
                  color: stepGoal === 'default' ? '#B3B3B3' : '#000',
                  ...Fonts.fontMedium,
                  paddingLeft: 10,
                }}
                iosIcon={
                  <MaIcon
                    name="arrow-drop-down"
                    style={{color: Colors.gray, fontSize: 26}}
                  />
                }
                selectedValue={stepGoal}
                onValueChange={sendStepsGoal}
                mode="dialog">
                <UIPicker.Item label={contentScreenObj.stepGoal_1} value="1000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_2} value="2000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_3} value="3000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_4} value="4000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_5} value="5000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_6} value="6000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_7} value="7000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_8} value="8000" />
                <UIPicker.Item label={contentScreenObj.stepGoal_9} value="9000" />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_10}
                  value="10000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_11}
                  value="11000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_12}
                  value="12000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_13}
                  value="13000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_14}
                  value="14000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_15}
                  value="15000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_16}
                  value="16000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_17}
                  value="17000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_18}
                  value="18000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_19}
                  value="19000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_20}
                  value="20000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_21}
                  value="21000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_22}
                  value="22000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_23}
                  value="23000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_24}
                  value="24000"
                />
                <UIPicker.Item
                  label={contentScreenObj.stepGoal_25}
                  value="25000"
                />
              </UIPicker>
            </View>
            <UIButton
              style={[styles.bttnArea, styles.cancelBttn]}
              mode="outlined"
              accessibilityLabel="signOut-button"
              onPress={modalFunCombined}>
              {contentScreenObj.signOut_ButtonText}
            </UIButton>
          </View>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <UIModal
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.signOut_PopUpText}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
                mode="outlined"
                accessibilityLabel="signOut-ok-button"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={logout}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
              <UIButton
                style={GlobalStyle.bttnArea}
                mode="contained"
                accessibilityLabel="signOut-cancel-button"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={() => setModalVisible(!modalVisible)}>
                {contentScreenObj.cancel_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
