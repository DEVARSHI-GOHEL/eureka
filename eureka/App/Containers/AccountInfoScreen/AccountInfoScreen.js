/**
 * Sample React Native App
 * https://github.com/fac e bo ok /react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {
  SafeAreaView,
  Modal,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
  RefreshControl,
} from 'react-native';

import EnIcon from 'react-native-vector-icons/Entypo';
import FeatherFont from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Fonts} from '../../Theme';
import {
  UITextInput,
  UILoader,
  UIButton,
  UIModal,
  UIGenericPlaceholder,
} from '../../Components/UI';
import {API} from '../../Services/API';
import styles from './styles';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {useNetInfo} from '@react-native-community/netinfo';
import GlobalStyle from '../../Theme/GlobalStyle';
import {useSelector, useDispatch} from 'react-redux';
import {Update_User_Api} from '../../Theme';
import {useNetStatus} from '../../Services/Hooks';
import {setUserStateAction} from '../SignInScreen/action';
import IconFont from 'react-native-vector-icons/FontAwesome';
import {DB_STORE} from '../../storage/DbStorage';
import {
  removeUserAuthDetails,
  refreshTokenApi,
  appSyncApiKey,
} from '../../Services/AuthService';
import {Translate, useTranslation} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";
import {ButtonPrimary} from "../../Components/UI/UIButton";

let password_reg = /((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})/;

const AccountInfoScreen = ({navigation}) => {
  const netInfo = useNetInfo();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassSecureVisibility, setCurrentPassSecureVisibility] =
    useState(true);
  const [newPassSecureVisibility, setNewPassSecureVisibility] = useState(true);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nameWarning, setNameWarning] = useState('');
  const [lastNameWarning, setLastNameWarning] = useState('');
  const [newPasswordWarning, setNewPasswordWarning] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [netVisibility, setNetVisibility] = useNetStatus(false);
  const [isVisibleUpdateBtn, setIsVisibleUpdateBtn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('accountInfoScreen');
  /** ############################ */

  /**
   * Disable back button during api call
   */
  let updatePasswordDisabledState;
  if (currentPassword !== '' && newPassword !== '' && isNewPasswordValid()) {
    updatePasswordDisabledState = false;
  } else {
    updatePasswordDisabledState = true;
  }
  // console.log('isVisibleUpdateBtn',isVisibleUpdateBtn);

  let updateAccInfoBtnDisableState;
  if (name !== '' && lastName !== '' && isVisibleUpdateBtn === true) {
    // console.warn('if');

    updateAccInfoBtnDisableState = false;
  } else {
    // console.warn('else');
    updateAccInfoBtnDisableState = true;
  }

  let nameWarningTxt;
  if (nameWarning) {
    nameWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>
          {contentScreenObj.firstName_ErrorText}
        </Text>
      </View>
    );
  }

  let lastNameWarningTxt;
  if (lastNameWarning) {
    lastNameWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}>
          {contentScreenObj.lastName_ErrorText}
        </Text>
      </View>
    );
  }

  const firstNameValidateFun = (textParam) => {
    if (textParam === '') {
      setNameWarning(true);
    } else {
      setNameWarning(false);
    }
  };

  const lastNameValidateFun = (textParam) => {
    if (textParam === '') {
      setLastNameWarning(true);
    } else {
      setLastNameWarning(false);
    }
  };

  function isNewPasswordValid() {
    let isNewPasswordValid = true;

    if (!newPassword || !password_reg.test(newPassword)) {
      isNewPasswordValid = false;
    } else {
      isNewPasswordValid = true;
    }

    console.log(isNewPasswordValid);
    return isNewPasswordValid;
  }

  const newPasswordValidate = (text) => {
    let isNewPasswordValid = true;

    if (newPassword === '') {
      setNewPasswordWarning(false);
    } else if (password_reg.test(newPassword) === false) {
      setNewPasswordWarning(true);
    } else {
      setNewPasswordWarning(false);
    }
  };

  let passwordWarningTxt;
  if (newPasswordWarning) {
    passwordWarningTxt = (
      <View style={styles.wranWrap}>
        <IconFont name="warning" style={Fonts.fontWarning} />
        <Text
          style={Fonts.fontWarning}
          accessibilityLabel="new-password-error-text">
          New password must contain at least 8 characters with at least one
          capital letter, one small letter, one number and one special
          character.
        </Text>
      </View>
    );
  }

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

  // const backHandleHeaderDisableFun = ({navigation}) => {
  //   setIsBackEnable(true); //block user to back press
  //   navigation.setOptions({
  //     headerLeft: ({}) => (
  //       // <IconFont name='home'/>
  //       <IconFont name='angle-left'  color='gray' size={36} style={{marginLeft:5}} onPress={() => navigation.goBack()}/>
  //     ),
  //   });
  // };

  // /**
  //  * revert header and hardware back back to normal state and user can able to back
  //  */
  // const backHandleHeaderNormalFun = () => {
  //   setIsBackEnable(false);
  //   navigation.setOptions({
  //     headerLeft: ({navigation}) => {
  //       return (
  //         <IconFont name='angle-left' size={36} style={{marginLeft:5}} onPress={() => navigation.goBack(null)}/>
  //         // <HeaderBackButton
  //         //   onPress={() => navigation.goBack(null)}
  //         //   tintColor={'black'}
  //         //   title='test'
  //         // />
  //       );
  //     },
  //   });
  // };

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
   * get user info Api call
   */
  const getUserAccInfo = async () => {
    // if(netInfo.isConnected!==true){
    //   return false;
    // }
    /**
     * Store unique UserId in async storage
     */
    let userId = await AsyncStorage.getItem('user_id');

    const getUserCredDetails = `query user{getUserCredDetails(userId:${userId}){ statusCode body{ success message data{userId emailId userTypeId userType creationDate updationDate firstName lastName verified}}}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);
    setLoaderText(contentScreenObj.loaderMsg_1);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    postWithAuthorization(
      Update_User_Api,
      {
        query: getUserCredDetails,
        variables: null,
        operationName: 'user',
      },
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('respo--------', response);
        if (response.status === 200) {
          if (
            response.data.data.getUserCredDetails.statusCode === 200 &&
            response.data.data.getUserCredDetails !== null
          ) {
            setIsLoader(false);
            setLoaderText('');

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            let {emailId, firstName, lastName} =
              response.data.data.getUserCredDetails.body.data;

            setName(firstName);
            setLastName(lastName);
            setEmail(emailId);
          } else if (
            response.data.data.getUserCredDetails.statusCode === 303 ||
            response.data.data.getUserCredDetails.statusCode === 302
          ) {
            // invalid auth token + expired auth token
            // missing 302 and expired 303

            setIsLoader(true);
            setLoaderText(contentScreenObj.loaderMsg_1);

            await refreshTokenApi(navigation, getUserAccInfo);

            // call relevant api if needed
          } else {
            setIsLoader(false);
            setLoaderText('');
            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            /**
             * Show alert if somingthing wrong from api side
             */
            alert(contentScreenObj.errorMsg_5);
          }
        }
      })
      .catch(async (error) => {
        console.log(
          'acc info error--------------------------------',
          error.response,
        );
        if (error.response.status === 401) {
          await appSyncApiKey();

          // call relevant api if needed
          getUserAccInfo();
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_5);
        }
      });
  };

  // const rename = async() =>{
  //   alert('hi')
  //   // await AsyncStorage.setItem('test', 'testName' );
  //   let testname = await AsyncStorage.getItem("test");
  //   console.log('tryyyyyyy------------', testname)
  // }

  /**
   * commented for netinfo issue xcode
   */
  useEffect(() => {
    console.log('netInfo', netInfo);
    // rename()
    // if(netInfo.isConnected!==true){
    //   setNetVisibility(true);
    // }
    if (netInfo.isConnected) getUserAccInfo();
  }, [netInfo.isConnected]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getUserAccInfo();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  /**
   * update password Api call
   */
  const updateUserAccPassword = async () => {
    /**
     * internet connection chekc
     */

    if (netInfo.isConnected !== true) {
      Alert.alert(contentScreenObj.errorMsg_1, contentScreenObj.errorMsg_2, [
        {text: contentScreenObj.OK_PopUpButtonText},
      ]);
      return false;
    }
    let userId = await AsyncStorage.getItem('user_id');
    /**
     * Store unique UserId in async storage
     */

    const getPasswordUserState = `mutation password{resetPassword(userId:${userId},oldPassword:\"${currentPassword}\",newPassword:\"${newPassword}\"){statusCode body}}`;

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
      Update_User_Api,
      {
        query: getPasswordUserState,
        variables: null,
        operationName: 'password',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('response', response);
        if (
          response.data.data.resetPassword.statusCode === 200 &&
          response.data.data.resetPassword.body.data !== null
        ) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          /**
           * Show alert if email or password or both are wrong
           */
          setPasswordModalVisible(!passwordModalVisible);
        } else if (
          response.data.data.resetPassword.statusCode === 303 ||
          response.data.data.resetPassword.statusCode === 302
        ) {
          // missing 302 and expired 303

          setIsLoader(true);

          await refreshTokenApi(navigation, updateUserAccPassword);

          // call relevant api if needed
        } else if (response.data.data.resetPassword.statusCode === 502) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          alert('Old password is invalid.');

          /**
           * Show alert if email or password or both are wrong
           */
          // setPasswordModalVisible(!passwordModalVisible);
        } else if (response.data.data.resetPassword.statusCode === 503) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          alert(contentScreenObj.errorMsg_4);
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          alert(contentScreenObj.errorMsg_5);
        }
      })
      .catch(async (error) => {
        console.log(error);
        if (error.response.status === 401) {
          await appSyncApiKey();

          // call relevant api if needed
          updateUserAccPassword();
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_5);
        }
      });
  };

  /**
   * update acc info Api call
   */
  const updateUserAccInfo = async () => {
    setIsVisibleUpdateBtn(false);
    /**
     * internet connection chekc
     */
    if (netInfo.isConnected !== true) {
      Alert.alert(contentScreenObj.errorMsg_1, contentScreenObj.errorMsg_2, [
        {text: contentScreenObj.OK_PopUpButtonText},
      ]);
      return false;
    }
    /**
     * Store unique UserId in async storage
     */

    let userFullName = `${name.trim()} ${lastName.trim()}`;
    let userId = await AsyncStorage.getItem('user_id');

    await DB_STORE.UPDATE.userInfo({
      id: userId,
      name: "'" + userFullName + "'",
    });

    const updateInfoState = `mutation edit{editAdminUser(userId:${userId},firstName:\"${name.trim()}\",lastName:\"${lastName.trim()}\"){statusCode body}}`;

    console.log('updateInfoState', updateInfoState);

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
      Update_User_Api,
      {
        query: updateInfoState,
        variables: null,
        operationName: 'edit',
      }
    )
      .then(async (response) => {
        console.log('acc info password', response);
        if (
          response.data.data.editAdminUser.statusCode === 200 &&
          response.data.data.editAdminUser.body.data !== null
        ) {
          setIsLoader(false);
          setLoaderText('');
          dispatch(setUserStateAction(true, userId, userFullName));
          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          /**
           * Show alert if email or password or both are wrong
           */
          setModalVisible(!modalVisible);
        } else if (
          response.data.data.editAdminUser.statusCode === 303 ||
          response.data.data.editAdminUser.statusCode === 302
        ) {
          // missing 302 and expired 303

          setIsLoader(true);
          setLoaderText(contentScreenObj.loaderMsg_2);
          await refreshTokenApi(navigation, updateUserAccInfo);

          // call relevant api if needed
        } else if (response.data.data.editAdminUser.statusCode === 502) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          /**
           * Show alert if email or password or both are wrong
           */
          setModalVisible(!modalVisible);
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          alert(contentScreenObj.errorMsg_5);
        }
      })
      .catch(async (error) => {
        console.log(error);
        if (error.response.status === 401) {
          await appSyncApiKey();

          // call relevant api if needed
          updateUserAccInfo();
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_5);
        }
      });
  };

  const okModalFun = () => {
    setModalVisible(!modalVisible);
  };

  const logout = async () => {
    await removeUserAuthDetails();

    navigation.reset({
      index: 0,
      routes: [{name: 'SignInScreen'}],
    });
  };

  if (netInfo.isConnected !== true) {
    return (
      <UIGenericPlaceholder
        // visiblity={netVisibility}
        // errorIcon={true}
        noInternetIcon={true}
        // noDataIcon={true}
        // loadingIcon={true}
        message="No Internet Connection"
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <KeyboardAvoidingView
        behavior="padding"
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 66 : -500}>
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
              <UITextInput
                labelText={contentScreenObj.firstName_InputText}
                value={name}
                placeholder={contentScreenObj.firstName_InputText}
                onChangeText={(text) => {
                  // setName(text)
                  setName((pre) => {
                    if (pre !== text) {
                      setIsVisibleUpdateBtn(true);
                      return text.replace(/[^A-Za\s]/gi, '');
                    } else {
                      setIsVisibleUpdateBtn(false);
                    }
                  });
                  firstNameValidateFun(text);
                }}
                accessibilityLabel="first-name"
                // onBlur={firstNameValidateFun}
              />
              {nameWarningTxt}
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.lastName_InputText}
                placeholder={contentScreenObj.lastName_InputText}
                value={lastName}
                onChangeText={(text) => {
                  // setLastName(text);
                  // lastNameValidateFun(text)

                  setLastName((pre) => {
                    if (pre !== text) {
                      setIsVisibleUpdateBtn(true);
                      return text.replace(/[^A-Za\s]/gi, '');
                    } else {
                      setIsVisibleUpdateBtn(false);
                    }
                  });
                  lastNameValidateFun(text);
                }}
                accessibilityLabel="last-name"
                // onBlur={lastNameValidateFun}
              />
              {lastNameWarningTxt}
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.email_InputText}
                placeholder={contentScreenObj.email_InputText}
                value={email}
                onChangeText={(text) => setEmail(text)}
                editable={false}
                accessibilityLabel="email"
                style={{color: Colors.gray}}
              />
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.currentPassword_InputText}
                placeholder={contentScreenObj.currentPassword_InputText}
                secureTextEntry={currentPassSecureVisibility}
                value={currentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
                accessibilityLabel="current-password"
                iconsRight={
                  <EnIcon
                    accessibilityLabel="current-password-eyeIcon"
                    onPress={() =>
                      setCurrentPassSecureVisibility(
                        !currentPassSecureVisibility,
                      )
                    }
                    name={currentPassSecureVisibility ? 'eye-with-line' : 'eye'}
                    style={styles.inputIcon}
                  />
                }
              />
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.newPassword_InputText}
                placeholder={contentScreenObj.newPassword_InputText}
                secureTextEntry={newPassSecureVisibility}
                error={newPasswordWarning}
                value={newPassword}
                onBlur={(text) => newPasswordValidate(text)}
                onChangeText={(text) => setNewPassword(text)}
                accessibilityLabel="new-password"
                iconsRight={
                  <EnIcon
                    accessibilityLabel="new-password-eyeIcon"
                    onPress={() =>
                      setNewPassSecureVisibility(!newPassSecureVisibility)
                    }
                    name={newPassSecureVisibility ? 'eye-with-line' : 'eye'}
                    style={styles.inputIcon}
                  />
                }
              />
              {passwordWarningTxt}
            </View>
            <View style={styles.inputWrap}>
              <ButtonPrimary
                  onPress={()=>{navigation.navigate('AccountRemoveScreen')}}
                  accessibilityLabel="delete-account">
                {contentScreenObj.deleteAccount}
              </ButtonPrimary>
            </View>
          </LinearGradient>
        </ScrollView>
        <View style={[GlobalStyle.bttnWrap, GlobalStyle.withBorder]}>
          <UIButton
            mode="contained"
            labelStyle={{...Fonts.fontSemiBold}}
            accessibilityLabel="update-password"
            disabled={updatePasswordDisabledState}
            style={
              updatePasswordDisabledState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            labelStyle={{color: '#fff'}}
            onPress={updateUserAccPassword}>
            {contentScreenObj.updatePassword_ButtonText}
          </UIButton>
          <UIButton
            // style={(updatePasswordDisabledState === true) ? { backgroundColor: '#A4C8ED' } : {}}
            mode="outlined"
            disabled={updateAccInfoBtnDisableState}
            style={[
              GlobalStyle.bttnArea,
              GlobalStyle.borderColor,
              updateAccInfoBtnDisableState === true
                ? {borderColor: '#A4C8ED'}
                : {},
            ]}
            labelStyle={[
              {...Fonts.fontSemiBold},
              updateAccInfoBtnDisableState === true ? {color: '#A4C8ED'} : {},
            ]}
            accessibilityLabel="update-acc-info"
            onPress={updateUserAccInfo}>
            {contentScreenObj.updateAccInfo_ButtonText}
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
          modalClose={(val) => okModalFun(val)}
          title={
            <Text
              style={GlobalStyle.modalHeading}
              accessibilityLabel="profile-update-heading">
              Your profile has been updated.
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                accessibilityLabel="update-acc-info-ok"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={(val) => okModalFun(val)}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={passwordModalVisible}>
        <UIModal
          Icon={
            <FeatherFont
              name="check-circle"
              style={GlobalStyle.iconStyle}
              color="green"
            />
          }
          modalClose={logout}
          title={
            <Text
              style={GlobalStyle.modalHeading}
              accessibilityLabel="password-update-heading">
              Your password has been updated successfully. Press OK to sign in
              with your new password.
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                accessibilityLabel="logout-ok"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={logout}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default AccountInfoScreen;
