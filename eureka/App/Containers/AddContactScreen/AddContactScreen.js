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
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import IconFont from 'react-native-vector-icons/FontAwesome';
import {Label} from 'native-base';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts, Update_User_Api, Get_master_Api, Colors} from '../../Theme';
import {Config} from '../../Theme/Constant/Constant';
import {API} from '../../Services/API';
import {UITextInput, UIButton, UILoader, UIPicker} from '../../Components/UI';
import styles from './styles';
import {refreshTokenApi, appSyncApiKey} from '../../Services/AuthService';
import {useTranslation} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

const AddContactScreen = ({navigation, route}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('default');
  const [email, setEmail] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);
  const [userEmailWarning, setUserEmailWarning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [relationTypeArray, setRelationTypeArray] = useState([]);
  const [loggedInEmail, setLoggedInEmail] = useState('');

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('addContactScreen');

  /** ############################ */

  let continueBtnDisableState;
  let email_reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const emailValidate = async (text) => {
    console.log(text);
    // let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (email === '') {
      setEmailWarning(false);
    } else if (reg.test(email) === false) {
      setEmailWarning(true);
    } else if (email === loggedInEmail) {
      setEmailWarning(true);
    } else {
      setEmailWarning(false);
    }
  };

  let emailWarningTxt;
  if (emailWarning) {
    emailWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text accessibilityLabel="addContact-errorMsg" style={styles.warnText}>
          {contentScreenObj.email_ErrorText}
        </Text>
      </View>
    );
  }

  let user_emailWarningTxt;
  if (userEmailWarning) {
    user_emailWarningTxt = (
      <View style={{flexDirection: 'row', flex: 1}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText} accessibilityLabel="addContact-errorMsg">
          You can't use your registered email id. Please provide a different
          email id to save the contact.
        </Text>
      </View>
    );
  }

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

  /**
   * Disable header and hardware back during after any api call
   */
  const backHandleHeaderDisableFun = () => {
    setIsBackEnable(true); //block user to back press
    navigation.setOptions({
      headerLeft: ({navigation}) => (
        <HeaderBackButton tintColor={'lightgray'} />
      ),
    });
  };

  /**
   * revert header and hardware back back to normal state and user can able to back
   */
  const backHandleHeaderNormalFun = () => {
    setIsBackEnable(false);
    navigation.setOptions({
      headerLeft: ({}) => {
        return (
          <HeaderBackButton
            onPress={() => navigation.goBack(null)}
            tintColor={'black'}
          />
        );
      },
    });
  };

  /**
   * add user contact list Api call
   */
  const addContactApi = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = `mutation add($userId:Int,$name:String,$emailId:String,$phone:String,$type:Int){addContact(userId:$userId,name:$name,emailId:$emailId,phone:$phone,type:$type){statusCode body}}`;

    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);

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
        query: getAgreementUserState,
        variables: {
          userId: userIdAsync,
          name: `${name}`,
          emailId: `${email}`,
          phone: `${phoneNumber}`,
          type: Number(type),
        },
        operationName: 'add',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('add contact list info', response);
        if (response && response.status === 200 && response.data.data) {
          if (response.data.data.addContact.statusCode === 200) {
            setIsLoader(false);

            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();

            setTimeout(() => {
              route.params.callback();
              navigation.goBack();
            }, 300);
          } else if (
            response.data.data.addContact.statusCode === 303 ||
            response.data.data.addContact.statusCode === 302
          ) {
            // invalid auth token + expired auth token
            // missing 302 and expired 303

            setIsLoader(true);

            await refreshTokenApi(navigation, addContactApi);

            // call relevant api if needed
            // addContactApi()data.data.addContact data.data.addContact.statusCode
          } else if (response.data.data.addContact.statusCode === 502) {
            setIsLoader(false);
            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            /**
             * Show alert if somingthing wrong from api side
             */

            alert(`${JSON.parse(response.data.data.addContact.body).message}`);
            // alert('Email Id is already exists.')
            // alert(errorMsgParse)
          } else if (response.data.errors[0].errorType === 'Lambda:Unhandle') {
            setIsLoader(false);
            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            /**
             * Show alert if somingthing wrong from api side
             */
            alert(contentScreenObj.errorMsg_3);
          } else {
            setIsLoader(false);
            /**
             * Revert back header to normal
             */
            backHandleHeaderNormalFun();
            /**
             * Show alert if somingthing wrong from api side
             */
            alert(contentScreenObj.errorMsg_3);
          }
        }
      })
      .catch(async (error) => {
        console.log('err 1=================add', error.response);

        // if gpl_token is wrong
        if (error.response.status === 401) {
          // again setting gpl_token to async
          await appSyncApiKey();

          // call relevant api if needed
          addContactApi();
        } else {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_3);
        }
      });
  };

  /**
   * get relationtype list Api call
   */
  const getRelationTypeList = async () => {
    /**
     * Show loader after sign in button press
     */
    setIsLoader(true);

    /**
     * header to normal
     */
    backHandleHeaderDisableFun();

    /**
     * Api call
     */
    API.postApi(
      Get_master_Api,
      {
        dataType: 'getContactType',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      /**
       * Get response from Api and call async storage
       */
      .then((response) => {
        console.log('relation type', response);
        if (response.data.statusCode === 200) {
          setIsLoader(false);

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          /**
           * setting the ethinicity value to array state
           */
          setRelationTypeArray(response.data.body.data.master_data_list);
        }
      })
      .catch(function (error) {
        console.log('err------------------relation', error);
        setIsLoader(false);

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

  useEffect(() => {
    getRelationTypeList();
    const getUseremail = async () => {
      const userEmailId = await AsyncStorage.getItem('user_emailid');
      if (userEmailId !== '') {
        setLoggedInEmail(userEmailId);
        console.log('userEmailId', setLoggedInEmail);
      }
    };
    getUseremail();
  }, []);

  if (
    name !== '' &&
    // email !== '' ||
    email.trim() !== '' &&
    email_reg.test(email) !== false &&
    // emailWarning !== true &&
    // userEmailWarning !== true &&
    email !== loggedInEmail &&
    // phoneNumber !== '' &&
    type !== 'default'
  ) {
    console.log('if');
    continueBtnDisableState = false;
  } else {
    console.log('else');
    continueBtnDisableState = true;
  }

  // console.warn(loggedInEmai)

  if (isLoader) {
    return <UILoader />;
    // return (<Text style={styles.contactHeading}>Add Contact loader</Text>)
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* {isLoader && <UILoader />} */}
      {/* <Text>{loggedInEmail}</Text> */}
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
        <ScrollView style={styles.mainScrollView}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.3}}
            colors={['#f1fbff', '#fff']}
            style={styles.gradientContainer}>
            <Text
              style={styles.createAccHeading}
              accessibilityLabel="add-contact-heading">
              {contentScreenObj.heading}
            </Text>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.fullName_InputText}
                value={name}
                placeholder={contentScreenObj.fullName_InputText}
                accessibilityLabel="full-name"
                onChangeText={(text) => {
                  // setName(text)
                  setName((pre) => {
                    if (pre !== text) {
                      return text.replace(/[^A-Za\s]/gi, '');
                    }
                  });
                  // firstNameValidateFun(text);
                }}
                // onChangeText={(text) => setName(text)}
              />
            </View>
            <View style={styles.inputWrap}>
              <Label style={styles.inputLabel}>
                {contentScreenObj.type_PickerText}
              </Label>
              <View style={styles.inputPicker}>
                <UIPicker
                  mode="dropdown"
                  style={{width: '99.5%', paddingRight: '.5%'}}
                  textStyle={{
                    color: type === 'default' ? '#B3B3B3' : '#000',
                    ...Fonts.fontMedium,
                    paddingLeft: 10,
                  }}
                  iosIcon={
                    <MaIcon
                      name="arrow-drop-down"
                      style={{color: Colors.gray, fontSize: 26}}
                    />
                  }
                  selectedValue={type}
                  accessibilityLabel="relation-type"
                  onValueChange={(selectedItem) => {
                    console.log('selectedItem', selectedItem);
                    if (selectedItem === 'default') {
                      // alert('Please select type')
                    } else {
                      setType(selectedItem);
                    }
                  }}
                  mode={'dialog'}>
                  <UIPicker.Item
                    label={contentScreenObj.selectOne}
                    value={'default'}
                    color="#999"
                  />
                  {relationTypeArray.map((item, itemId) => {
                    return (
                      <UIPicker.Item
                        label={item.value}
                        value={item.id.toString()}
                        key={item.id}
                      />
                    );
                  })}
                </UIPicker>
              </View>
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.email_InputText}
                placeholder={contentScreenObj.email_InputText}
                value={email}
                error={emailWarning}
                autoCapitalize={'none'}
                accessibilityLabel="email-contact"
                keyboardType="email-address"
                onChangeText={(text) => {
                  setEmail((pre) => {
                    if (pre !== text) {
                      return text.replace(/ /g, '');
                    }
                  });
                }}
                onEndEditing={emailValidate}
              />
              {emailWarningTxt}
              {/* {user_emailWarningTxt} */}
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                accessibilityLabel="phone-no"
                keyboardType="phone-pad"
                labelText={contentScreenObj.ph_InputText}
                maxLength={15}
                onChangeText={setPhoneNumber}
                placeholder={contentScreenObj.ph_InputText}
                value={phoneNumber}
              />
            </View>
            <Text
              style={styles.leftText}
              accessibilityLabel="add-contact-message">
              {contentScreenObj.info}
            </Text>
          </LinearGradient>
        </ScrollView>
        <View style={styles.bttnWrap}>
          <UIButton
            style={
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {}
            }
            disabled={continueBtnDisableState}
            labelStyle={{color: '#fff'}}
            mode="contained"
            accessibilityLabel="add-contact-button"
            onPress={addContactApi}>
            {contentScreenObj.addContact_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddContactScreen;
