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
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
  Modal,
  Keyboard,
} from 'react-native';

import IconFont from 'react-native-vector-icons/FontAwesome';
import EvilFont from 'react-native-vector-icons/EvilIcons';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import {Label} from 'native-base';

import LinearGradient from 'react-native-linear-gradient';
import {Fonts, Get_master_Api, Update_User_Api, Colors} from '../../Theme';
import {UITextInput, UIButton, UILoader, UIModal, UIPicker} from '../../Components/UI';
import FeatherFont from 'react-native-vector-icons/Feather';

import styles from './styles';
import {API} from '../../Services/API';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStyle from '../../Theme/GlobalStyle';
import {refreshTokenApi, appSyncApiKey} from '../../Services/AuthService';
import {Translate, useTranslation} from '../../Services/Translate';
import {postWithAuthorization} from "../../Services/graphqlApi";

/**
 *
 * @param {*} param0
 */
const DeleteContactScreen = ({navigation, ...props}) => {
  console.log('props', props, navigation);
  let {
    emailId: emailIdProp,
    id: idProp,
    name: nameProp,
    phone: phoneProp,
    type: typeProps,
    typeId: typeIdProp,
  } = props.route.params.itemProps;

  const [name, setName] = useState('');
  const [nameWarning, setNameWarning] = useState('');
  const [type, setType] = useState('default');
  const [email, setEmail] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);
  const [userEmailWarning, setUserEmailWarning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saveChangeModal, setSaveChangeModal] = useState(false);
  const [relationTypeArray, setRelationTypeArray] = useState([]);
  const [loggedInEmail, setLoggedInEmail] = useState('');

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('deleteContactScreen');

  /** ############################ */

  let continueBtnDisableState;
  let email_reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  let nameWarningTxt;
  if (nameWarning) {
    nameWarningTxt = (
      <View style={{flexDirection: 'row'}}>
        <IconFont
          name="warning"
          style={{color: 'red', fontSize: 16, marginRight: 8}}
        />
        <Text style={styles.warnText}> The First Name cannot be empty.</Text>
      </View>
    );
  }

  const emailValidate = async (text) => {
    // console.log(text);
    // let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // const userEmailId = await AsyncStorage.getItem('user_emailid');
    // console.log('userEmailId', userEmailId);

    if (email === '') {
      setEmailWarning(true);
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
        <Text style={styles.warnText} accessibilityLabel="editContact-errorMsg">
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
        <Text style={styles.warnText}>
          You cann't use your registered email id. Please provide a different
          email id to save the contact.
        </Text>
      </View>
    );
  }

  const deleteAContactAlert = () => {
    Alert.alert(
      contentScreenObj.errorMsg_1,
      '',
      [
        {
          text: contentScreenObj.cancel_ButtonText,
          // onPress: () => console.log("Cancel Pressed"),
          style: 'cancel',
        },
        {
          text: contentScreenObj.OK_PopUpButtonText,
          //  onPress: () => console.log("OK Pressed")
        },
      ],
      {cancelable: false},
    );
  };

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
      headerLeft: (props) => (
        <HeaderBackButton
          {...props}
          // onPress={() => { }}
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
   * edit contact Api call
   */
  const editContactApi = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = `mutation edit($userId:Int,$contactId:Int,$emailId:String,$name:String,$phone:String,$type:Int){editContact(userId:$userId,contactId:$contactId,emailId:$emailId,name:$name,phone:$phone,type:$type){statusCode body}}`;

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
        query: getAgreementUserState,
        variables: {
          userId: userIdAsync,
          contactId: idProp,
          emailId: email,
          name: name.trim(),
          phone: phoneNumber,
          type: type,
        },
        operationName: 'edit',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('edit info editContactApi', response);

        if (response.data.data.editContact.statusCode === 200) {
          setIsLoader(false);

          //   /**
          //    * Revert back header to normal
          //    */
          props.route.params.callback();
          backHandleHeaderNormalFun();
          setSaveChangeModal(!saveChangeModal);
        } else if (response.data.data.editContact.statusCode === 502) {
          Keyboard.dismiss();

          setIsLoader(false);

          backHandleHeaderNormalFun();

          /**
           * Show alert if somingthing wrong from api side
           */
          alert(`${JSON.parse(response.data.data.editContact.body).message}`);
        } else if (
          response.data.data.editContact.statusCode === 303 ||
          response.data.data.editContact.statusCode === 302
        ) {
          // missing 302 and expired 303

          setIsLoader(true);

          await refreshTokenApi(navigation);

          // call relevant api if needed
          editContactApi();
        } else {
          Keyboard.dismiss();

          setIsLoader(false);

          backHandleHeaderNormalFun();

          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_3);
        }
      })
      .catch(function (error) {
        console.log('err 1', error.response);
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

  /**
   * delete contact Api call
   */
  const getDeleteContact = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = `mutation delete($userId:Int!,$contactId:Int!){deleteContact(userId:$userId,contactId:$contactId){statusCode body}}`;

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
          userId: Number(userIdAsync),
          contactId: idProp,
        },
        operationName: 'delete',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log('delete info', response);
        if (response.data.data.deleteContact.statusCode === 200) {
          setIsLoader(false);
          backHandleHeaderNormalFun();
          setModalVisible(!modalVisible);
          props.route.params.callback();
          setTimeout(() => {
            navigation.navigate('ContactsScreen');
          }, 300);
        } else if (
          response.data.data.deleteContact.statusCode === 303 ||
          response.data.data.deleteContact.statusCode === 302
        ) {
          // missing 302 and expired 303

          setIsLoader(true);

          await refreshTokenApi(navigation, getDeleteContact);

          // call relevant api if needed
          // getDeleteContact();
        } else {
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(contentScreenObj.errorMsg_3);
        }
      })
      .catch(async (error) => {
        console.log('err 1', error);
        if (error.response.status === 401) {
          // again setting gpl_token to async
          await appSyncApiKey();

          // call relevant api if needed
          getDeleteContact();
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

  const modalFunCombined = () => {
    //autoMeasureToggleSwitch();
    setModalVisible(!modalVisible);
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
        console.log('err', error);
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
    if (props.route.params.type === 'Edit') {
      setName(nameProp);
      setType(typeIdProp.toString());
      setEmail(emailIdProp);
      setPhoneNumber(phoneProp);
      getRelationTypeList();

      const getUseremail = async () => {
        const userEmailId = await AsyncStorage.getItem('user_emailid');
        if (userEmailId !== '') {
          setLoggedInEmail(userEmailId);
          console.log('userEmailId', setLoggedInEmail);
        }
      };
      getUseremail();

      console.log('r-------------------------', emailIdProp, phoneProp);
    }
  }, []);

  if (
    name !== '' &&
    // email.trim() !== '' ||
    email.trim() !== '' &&
    email_reg.test(email) !== false &&
    email !== '' &&
    // emailWarning !== true &&
    // userEmailWarning !== true &&
    email !== loggedInEmail &&
    type !== 'default'
  ) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
  }

  if (name === '') {
    continueBtnDisableState = true;
  }

  const firstNameValidateFun = (textParam) => {
    if (textParam === '') {
      setNameWarning(true);
    } else {
      setNameWarning(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
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
            <View style={styles.contactHeagingWrap}>
              <Text
                style={styles.contactHeading}
                accessibilityLabel="contact-edit-heading">
                {contentScreenObj.heading_1} {`${nameProp}'s`}{' '}
                {contentScreenObj.heading_2}
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                labelText={contentScreenObj.fullName_InputText}
                value={name}
                placeholder={contentScreenObj.fullName_InputText}
                accessibilityLabel="edit-name"
                // onChangeText={(text) => setName(text)}
                onChangeText={(text) => {
                  // setName(text)
                  setName((pre) => {
                    if (pre !== text) {
                      // setIsVisibleUpdateBtn(true);
                      return text.replace(/[^A-Za\s]/gi, '');
                    } else {
                      // setIsVisibleUpdateBtn(false);
                    }
                  });
                  firstNameValidateFun(text);
                }}
                // accessibilityLabel="contact-edit-name"
              />
              {nameWarningTxt}
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
                  placeholder={contentScreenObj.selectOne}
                  accessibilityLabel="relation-type"
                  onValueChange={(selectedItem) => {
                    console.log('selectedItem', selectedItem);
                    if (selectedItem === 'default') {
                      // alert('Please select type')
                    } else {
                      setType(selectedItem);
                    }
                  }}
                  mode={'dialog'}
                  accessibilityLabel="contact-edit-type">
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
                accessibilityLabel="contact-edit-email"
                // onBlur={(text) => emailValidate(text)}
                // onChangeText={(text) => setEmail(text)}
                onChangeText={(text) => {
                  // setName(text)
                  setEmail((pre) => {
                    if (pre !== text) {
                      // setIsVisibleUpdateBtn(true);
                      return text.replace(/ /g, '');
                    } else {
                      // setIsVisibleUpdateBtn(false);
                    }
                  });
                  // emailValidate(text);
                }}
                onEndEditing={(text) => {
                  // alert('hi')
                  emailValidate(text);
                }}
              />
              {emailWarningTxt}
              {/* {user_emailWarningTxt} */}
            </View>
            <View style={styles.inputWrap}>
              <UITextInput
                accessibilityLabel="contact-edit-phoneNo"
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
              accessibilityLabel="edit-contact-message">
              {contentScreenObj.info}
            </Text>
            <View>
              <TouchableOpacity
                accessibilityLabel="delete-contact"
                accessible={false}
                style={styles.deleteRow}
                onPress={() => modalFunCombined()}
              >
                <EvilFont name="trash" style={styles.deleteContactIcon} />
                <Text style={styles.deleteContactText}>
                  {contentScreenObj.deleteContact_ButtonText}
                </Text>
              </TouchableOpacity>
            </View>
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
            mode="contained"
            labelStyle={{color: '#fff'}}
            accessibilityLabel="edit-contact-save-change"
            onPress={() => editContactApi()}>
            {contentScreenObj.editContact_ButtonText}
          </UIButton>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        // onRequestClose={() => {
        //   Alert.alert("Modal has been closed.");
        // }}
      >
        <UIModal
          modalClose={() => setModalVisible(!modalVisible)}
          title={
            <Text
              style={GlobalStyle.modalHeading}
              accessibilityLabel="delete-contact-asking-confirmation-button">
              {contentScreenObj.errorMsg_1}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
                mode="outlined"
                labelStyle={{...Fonts.fontSemiBold}}
                accessibilityLabel="delete-ok-button"
                onPress={getDeleteContact}>
                {contentScreenObj.OK_PopUpButtonText}
              </UIButton>
              <UIButton
                style={GlobalStyle.bttnArea}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold}}
                accessibilityLabel="delete-cancel-button"
                onPress={() => setModalVisible(!modalVisible)}>
                {contentScreenObj.cancel_ButtonText}
              </UIButton>
            </View>
          }
        />
      </Modal>
      {/* Save change modal */}
      <Modal animationType="fade" transparent={false} visible={saveChangeModal}>
        <UIModal
          Icon={
            <FeatherFont
              name="check-circle"
              style={GlobalStyle.iconStyle}
              color="green"
            />
          }
          modalClose={() => navigation.goBack()}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.popUpMsg_2}
            </Text>
          }
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.WrapForSlinglebttn]}
                mode="contained"
                accessibilityLabel="save-sucess-ok"
                labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
                onPress={() => {
                  navigation.goBack();
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

export default DeleteContactScreen;
