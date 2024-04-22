import React, {useState, useEffect, useRef} from 'react';
import {
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {DB_STORE} from '../../storage/DbStorage';
import {HeaderBackButton} from '@react-navigation/stack';
import {Sign_In_Api} from '../../Theme';
import {getTermsHTML} from '../../assets/LifeLeaf-Terms-of-Service';
import {Translate} from '../../Services/Translate';
import {UILoader, UIButton} from '../../Components/UI';
import {USER_REGISTRATION_STATE} from '../../constants/AppDataConstants';

import {postWithAuthorization} from '../../Services/graphqlApi';
import {removeUserAuthDetails} from '../../Services/AuthService';
import {useFocusEffect} from '@react-navigation/native';
import {useNetInfo} from '@react-native-community/netinfo';

import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowTermsPage from 'react-native-autoheight-webview';
import styles from './styles';

const CONTENT_VERTICAL_PADDING = 50;
const CUSTOM_STYLE = `
* {
  font-family: 'sans-serif';
}
p {
  font-size: 19px;
  line-height: 150%;
}
`;

const TermConditionScreen = ({navigation, ...props}) => {
  const netInfo = useNetInfo();
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [loaderText, setLoaderText] = useState('');

  /** ############# Language Related codes ############### */
  const [contentScreenObj, setContentScreenObj] = useState({});

  useEffect(() => {
    if (!_.isEmpty(Translate('termConditionScreen'))) {
      const termConditionScreenContentObject = Translate('termConditionScreen');
      setContentScreenObj(termConditionScreenContentObject);
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
   * accept agreement Api call
   */
  const onAcceptTerm = async (userIdParam) => {
    if (!buttonEnabled) return;
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

    let userId = await AsyncStorage.getItem('user_id');

    const getAgreementUserState = `mutation create{setUserTerms(userCredId:${userId},hipaaTerms:\"APP\",termsOfService:\"APP\"){statusCode body}}`;

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
    postWithAuthorization(Sign_In_Api, {
      query: getAgreementUserState,
      variables: null,
      operationName: 'create',
    })
      /**
       * Get response from Api and call async storage
       */
      .then(async (response) => {

        if (response.data.data.setUserTerms.statusCode === 200) {
          setIsLoader(true);
          setLoaderText(contentScreenObj.loaderMsg_1);
          /**
           * Store unique UserId in async storage
           */
          let userId = await AsyncStorage.getItem('user_id');
          await AsyncStorage.setItem(
            'user_state',
            USER_REGISTRATION_STATE.HAS_NOT_FILLED_PERSONAL_INFO + '',
          );
          //ASMIT CHANGE
          //SHOULD UPDATE LOCAL DB STATE OF USER
          await DB_STORE.UPDATE.userInfo({
            id: userId,
            registration_state:
              USER_REGISTRATION_STATE.HAS_NOT_FILLED_PERSONAL_INFO,
          });
          /**
           * After success redirect to next page
           */
          if (userId !== undefined) {
            navigation.reset({
              index: 0,
              routes: [{name: 'PersonalInfoScreen'}],
            });
          }
        } else if (response.data.data.setUserTerms.statusCode === 201) {
          setIsLoader(false);
          setLoaderText('');
          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            contentScreenObj.errorMsg_3,
            contentScreenObj.errorMsg_4,
            [{text: contentScreenObj.OK_ButtonText}],
          );
        } else {
          setIsLoader(false);
          setLoaderText('');

          /**
           * Revert back header to normal
           */
          backHandleHeaderNormalFun();
          /**
           * Show alert if email or password or both are wrong
           */
          Alert.alert(
            contentScreenObj.errorMsg_5,
            contentScreenObj.errorMsg_6,
            [{text: contentScreenObj.OK_ButtonText}],
          );
        }
      })
      .catch(function (error) {
        console.log(error);
        setIsLoader(false);
        setLoaderText('');
        /**
         * Revert back header to normal
         */
        backHandleHeaderNormalFun();
        /**
         * Show alert if somingthing wrong from api side
         */
        alert(contentScreenObj.errorMsg_6);
      });
  };
  /**
   * LogOut Api call
   */
  const logout = async () => {
    await removeUserAuthDetails();
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInScreen'}],
    });
  };

  const isCloseToBottom = ({ nativeEvent:
    { layoutMeasurement, contentOffset, contentSize }
  }) => {
    if (buttonEnabled) return;
    setButtonEnabled(
      layoutMeasurement.height + contentOffset.y + CONTENT_VERTICAL_PADDING > contentSize.height
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isLoader && <UILoader title={loaderText} />}
      <View
        style={styles.scrollingContent}
      >
        <ScrollView
          scrollEventThrottle={200}
          onScroll={isCloseToBottom}
          >
          <View style={styles.container} >
            <Text style={styles.createAccHeading}>
              {contentScreenObj.heading}
            </Text>
            <ShowTermsPage
              scrollEnabled={false}
              automaticallyAdjustContentInsets={false}
              scalesPageToFit={false}
              source={{html: getTermsHTML()}}
              viewportContent={'width=device-width, user-scalable=no'}
              customStyle={CUSTOM_STYLE}
              style={styles.web}
            />
          </View>
        </ScrollView>
      </View>


      <View style={{
        ...styles.bttnWrap,
      }}>
        <UIButton
          style={[styles.bttnArea, styles.cancelBttn]}
          mode="outlined"
          accessibilityLabel="agreement-cancel-button"
          onPress={logout}>
          {contentScreenObj.cancel_ButtonText}
        </UIButton>
        <UIButton
          disabled={!buttonEnabled}
          style={styles.bttnArea}
          mode="contained"
          accessibilityLabel="agreement-agree-button"
          onPress={onAcceptTerm}>
          {contentScreenObj.agree_ButtonText}
        </UIButton>
      </View>
    </SafeAreaView>
  );
};

export default TermConditionScreen;
