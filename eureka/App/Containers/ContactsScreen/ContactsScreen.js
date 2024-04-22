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
  BackHandler,
  FlatList,
  Share,
  Modal,
  RefreshControl,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

import {UIButton, UIGenericPlaceholder} from '../../Components/UI';
import MaIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherFont from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {List, ListItem, Left, Right, Body, CheckBox} from 'native-base';
import {Fonts, Update_User_Api} from '../../Theme';
import {
  UIProfileSvgIcon,
  UILoader,
  UICommingSoon,
  UIModal,
} from '../../Components/UI';
import styles from './styles';
import {API} from '../../Services/API';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import {Config} from '../../Theme/Constant/Constant';
import {refreshTokenApi, appSyncApiKey} from '../../Services/AuthService';
import GlobalStyle from '../../Theme/GlobalStyle';
import {
  showSuccessToast,
  showErrorToast,
} from '../../Components/UI/UIToast/UIToastHandler';
import {createStackNavigator} from '@react-navigation/stack';
import {Translate, useTranslation} from '../../Services/Translate';
import {useNetInfo} from '@react-native-community/netinfo';
import {postWithAuthorization} from "../../Services/graphqlApi";

const ContactsScreen = ({navigation, ...props}) => {
  if (
    props.route.params &&
    props.route.params.routeFrom === 'ShareDataScreen'
  ) {
    navigation.setOptions({
      headerTitle: Translate('allScreenTitle.shareData_title'),
    });
  }
  const netInfo = useNetInfo();
  const isFocused = useIsFocused();
  const {userId, userName} = useSelector((state) => ({
    userId: state.auth.userId,
    userName: state.auth.userName,
  }));

  const [alertVisibility, setAlertVisibility] = useState(false);
  const [chkBox, setChkBox] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [contactList, setContactList] = useState([]);
  const [knownDiseaseArray, setKnownDiseaseArray] = useState([]);
  const [emailArray, setEmailArray] = useState([]);
  const [dataSendModal, setDataSendModal] = useState(false);
  const [animateState, setAnimateState] = useState('toastAnimation');
  const [refreshing, setRefreshing] = React.useState(false);

  /** ############# Language Related codes ############### */
  const contentScreenObj = useTranslation('contactsScreen');
  /** ############################ */

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getContactList();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  let {rangeProp, detailsProp} =
    props.route.params !== undefined && props.route.params;

  console.log('prop', props);

  let disableText;
  if (
    props.route.params &&
    props.route.params.routeFrom === 'ShareDataScreen'
  ) {
    disableText = true;
  } else {
    disableText = false;
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
   * get user contact list Api call
   */
  const getContactList = async () => {
    /**
     * Store unique UserId in async storage
     */

    let userIdAsync = await AsyncStorage.getItem('user_id');
    // console.warn(userId, 'userId........')

    //   const email = await AsyncStorage.getItem('emailId');

    // console.log('email==============', email)

    const getContactListState = `query contact($userId:Int!){getContact(userId:$userId){statusCode body{success message data{id name emailId phone type typeId}}}}`;

    /**
     * Show loader after sign in button press
     */
    // setIsLoader(true);

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
        query: getContactListState,
        variables: {
          userId: userIdAsync,
        },
        operationName: 'contact',
      }
    )
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {
        console.log(
          'contact list info response ======================',
          response,
        );
        if (response.status === 200) {
          setIsLoader(false);
          setLoaderText('');
          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          if (
            response.data.data.getContact.statusCode === 200 &&
            response.data.data.getContact.body.data !== null
          ) {
            let nameSorting = response.data.data.getContact.body.data.sort(
              (itemA, itemB) => {
                let a = itemA.name.toUpperCase();
                let b = itemB.name.toUpperCase();

                return a.localeCompare(b);
              },
            );

            console.log('conn----------', nameSorting);
            /**
             * ###### inserting checked true by default
             */
            let checkedTrueArray = nameSorting.map((item, ind) => {
              let newCheckedArrayVar = [];

              // object of array item
              item['checked'] = true;

              console.log('item', item);

              newCheckedArrayVar = item;

              return newCheckedArrayVar;
            });

            console.log('checkedTrueArray', checkedTrueArray);

            setContactList(checkedTrueArray);

            /**####### email array of checked item starts */
            let emailFinder = checkedTrueArray.filter((i, ind) => {
              return i.checked === true;
            });

            console.log('emailFinder', emailFinder);

            // create array nd push mails
            let newArray = [];

            /**
             * pushing email field to new array
             */
            emailFinder.map((i, ind) => {
              return newArray.push(i.emailId);
            });

            console.log('newArray', newArray);
            // set state of emailArray
            setEmailArray(newArray);

            /**
             * ######## email array of checked item ends
             */
          } else if (
            response.data.data.getContact.statusCode === 303 ||
            response.data.data.getContact.statusCode === 302
          ) {
            // missing 302 and expired 303

            setIsLoader(true);
            setLoaderText(contentScreenObj.loaderMsg_1);

            await refreshTokenApi(navigation, getContactList);
          } else {
            /**
             * Show alert if somingthing wrong from api side
             */
            alert(
              'Lifeplus servers faced an error while completing this request. Please try again later.',
            );
          }
        }
      })
      .catch(async (error) => {
        console.log('err 1-------------contact screen', error);
        if (error.response.status === 401) {
          await appSyncApiKey();

          // call relevant api if needed
          getContactList();
        } else {
          setIsLoader(false);
          setLoaderText('');
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if somingthing wrong from api side
           */
          alert(
            'Lifeplus servers faced an error while completing this request. Please try again later.',
          );
        }
      });
  };

  const updateCheckbox = (emailIdParam, idParam, checkedParam) => {
    console.log(
      'emailIdParam, idParam, checkedParam',
      emailIdParam,
      idParam,
      checkedParam,
    );
    //

    // newArray.push(...emailIdParam)
    // let newUpdatedArray =  [...newArray, emailIdParam]

    // console.log('newArray', newArray)
    /**
     * knownDiseaseArray - map
     */
    contactList.map((item, index) => {
      /**
       * checking clicked item.id === listed item.id
       */
      if (item.id === idParam) {
        /**
         * copy of state
         */
        let oldObjArray = contactList;

        /**
         * if checkbox is true then toogle to false else toggle to true
         */
        if (checkedParam) {
          oldObjArray[index].checked = false;
          // removed/unchecked / array should remove
          // console.log('if item.email', item.emailId);
          // console.log('if index', index);
          // console.log('if contactList[index]', contactList[index])
        } else {
          oldObjArray[index].checked = true;
          //added/ checked/ array should add
          // console.log('else item.email', item.emailId)
          // console.log('else index', index)
          // console.log('else contactList[index]', contactList[index])
        }

        // console.log(contactList)

        /**
         * cloning updated object array to new variable
         * if it's not done then state will mutate
         * so for updating it's important
         */
        let newObject = [...oldObjArray];

        console.log('idParam', idParam);
        console.log('checkedParam', checkedParam);
        console.log('newObject', newObject);

        let emailFinder = newObject.filter((i, ind) => {
          return i.checked === true;
        });

        console.log('emailFinder', emailFinder);

        // create array nd push mails
        let newArray = [];

        emailFinder.map((i, ind) => {
          return newArray.push(i.emailId);
        });

        console.log('newArray', newArray);
        // set state of emailArray
        setEmailArray(newArray);

        /**
         * updating the contactList array state with new checked and unchecked items
         * it will rerender the screen and checkboxes will shown checked/unchecked
         */
        setContactList(newObject);
      }
    });
  };

  console.log('emailArray', emailArray);

  useEffect(() => {
    if (netInfo.isConnected) {
      setIsLoader(true);
      setLoaderText(contentScreenObj.loaderMsg_1);

      getContactList();
    }
  }, [navigation, netInfo.isConnected]);

  /**
   * Share data function
   */
  const sendApiFun = async () => {
    if (!netInfo.isConnected) {
      return;
    }
    /**
     * Show loader
     */
    setIsLoader(true);
    setLoaderText(
      'Please wait your health data is being shared to your contact.',
    );
    /**
     * header to lock
     */
    backHandleHeaderDisableFun();

    let q = `mutation share($userId: Int,$range: String,$contacts: [String],$details: String){shareData(userId:$userId,range:$range,contacts:$contacts,details:$details){statusCode body}}`;

    let userIdAsync = await AsyncStorage.getItem('user_id');
    postWithAuthorization(
      Config.EUREKA_GRAPHQL_BASE_URL,
      {
        query: q,
        variables: {
          userId: Number(userIdAsync),
          range: rangeProp,
          contacts: emailArray,
          details: detailsProp,
        },
        operationName: 'share',
      }
    )
      .then((res) => {
        console.log('sendApiFun res', res);
        if (res.status === 200) {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();

          if (res.data.data.shareData.statusCode === 200) {
            showSuccessToast('Health data sent successfully.');
            navigation.navigate('Home');
          } else if (res.data.data.shareData.statusCode === 502) {
            alert(`${JSON.parse(res.data.data.shareData.body).message}`);
          }
        }
      })
      .catch((err) => {
        console.log('sendApiFun err', err.response);
        setIsLoader(false);
        setLoaderText('');
        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
      });
  };

  if (isLoader) {
    return <UILoader title={loaderText} />;
  }

  let continueBtnDisableState;
  if (emailArray.length > 0) {
    continueBtnDisableState = false;
  } else {
    continueBtnDisableState = true;
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
          colors={['#f1fbff', '#fff']}
          style={styles.gradientContainer}>
          <View style={styles.contactHeagingWrap}>
            <Text
              style={styles.contactHeading}
              accessibilityLabel="contact-heading">
              {contentScreenObj.heading}
            </Text>
            <Text
              style={styles.contactSubHeading}
              accessibilityLabel="contact-subHeading">
              {contentScreenObj.subHeading}
            </Text>
          </View>
        </LinearGradient>
        <View style={styles.contactList}>
          <View style={{flex: 1, marginTop: 30}}>
            {contactList.length === 0 && (
              <Text
                style={styles.emptyContent}
                accessibilityLabel="noContact-text">
                {contentScreenObj.noContactText}
              </Text>
            )}
          </View>
          <FlatList
            data={contactList}
            // initialNumToRender={1}
            renderItem={({item}) => {
              return (
                <ListItem avatar style={styles.listRow}>
                  <Left style={styles.userIcon}>
                    <UIProfileSvgIcon fill={'#fff'} />
                  </Left>
                  <Body style={styles.nameWrap}>
                    {/* {`${item.name[0].toUpperCase()}${item.name.slice(1)}`} */}
                    <Text
                      style={styles.contactName}
                      accessibilityLabel="contact-name">
                      {item.name}
                    </Text>
                    <Text
                      note
                      style={styles.contactRelation}
                      accessibilityLabel="contact-relation-type">
                      ( {item.type} )
                    </Text>
                  </Body>
                  <Right style={{paddingRight: 0, borderBottomWidth: 0}}>
                    {disableText ? (
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
                        onPress={() =>
                          updateCheckbox(item.emailId, item.id, item.checked)
                        }
                        value={item.id.toString()}
                        key={item.id}
                        accessibilityLabel="contact-checkBox"
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('DeleteContactScreen', {
                            itemProps: item,
                            type: 'Edit',
                            callback: getContactList,
                          })
                        }
                        accessible={false}
                      >
                        <MaIcon
                          name="pencil-outline"
                          style={styles.editIcon}
                          accessibilityLabel="contact-edit-icon"
                        />
                      </TouchableOpacity>
                    )}
                  </Right>
                </ListItem>
              );
            }}
          />

          <List />
        </View>

        {disableText ? (
          <View style={styles.settingsBottomrow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddContactScreen', {
                  type: 'Add',
                  callback: getContactList,
                })
              }
              accessibilityLabel="add-new-contactText"
              accessible={false}
            >
              <Text style={styles.settingsLinkText}>
                + {contentScreenObj.addContact_ButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      {disableText ? (
        <View style={styles.bttnWrap}>
          <UIButton
            style={[styles.bttnArea, styles.nextBttn]}
            mode="outlined"
            labelStyle={{...Fonts.fontSemiBold}}
            accessibilityLabel="contact-cancel-button"
            onPress={() => navigation.goBack(null)}>
            {contentScreenObj.cancel_ButtonText}
          </UIButton>
          <UIButton
            style={styles.bttnArea}
            mode="contained"
            disabled={continueBtnDisableState}
            accessibilityLabel="contact-send-button"
            labelStyle={[
              {...Fonts.fontSemiBold},
              continueBtnDisableState === true ? {color: '#fff'} : {},
            ]}
            style={[
              styles.bttnArea,
              // GlobalStyle.borderColor,
              continueBtnDisableState === true
                ? {backgroundColor: '#A4C8ED'}
                : {},
            ]}
            onPress={sendApiFun}>
            {contentScreenObj.send_ButtonText}
          </UIButton>
        </View>
      ) : (
        <View style={styles.bttnWrapContact}>
          <UIButton
            mode="contained"
            labelStyle={{color: '#fff'}}
            accessibilityLabel="add-contact"
            onPress={() =>
              navigation.navigate('AddContactScreen', {
                callback: getContactList,
              })
            }>
            {contentScreenObj.addContact_ButtonText}
          </UIButton>
        </View>
      )}

      <Modal animationType="fade" transparent={false} visible={dataSendModal}>
        <UIModal
          Icon={
            <FeatherFont
              name="check-circle"
              style={GlobalStyle.iconStyle}
              color="green"
            />
          }
          modalClose={() => navigation.navigate('Home')}
          title={
            <Text style={GlobalStyle.modalHeading}>
              {contentScreenObj.loaderMsg_3}
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
                  navigation.navigate('Home');
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

export default ContactsScreen;
