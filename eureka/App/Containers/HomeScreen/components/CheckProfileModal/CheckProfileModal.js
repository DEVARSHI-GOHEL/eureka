import React, {useEffect, useState} from 'react';
import {Modal, Text, View} from 'react-native';
import {UIButton, UIModal} from "../../../../Components/UI";
import FeatherFont from "react-native-vector-icons/Feather";
import GlobalStyle from "../../../../Theme/GlobalStyle";
import {Fonts, Update_User_Api} from "../../../../Theme";
import {Translate} from "../../../../Services/Translate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {DB_STORE} from "../../../../storage/DbStorage";
import {validateSkinTone} from "../../../../utils/validators/user";
import {prepareAllUserInfoQuery} from "../../../PersonalInfoScreen/api";
import {postWithAuthorization} from "../../../../Services/graphqlApi";


/**
 * Indication if user was checked - check only once per application run
 * @type {boolean}
 */
let profileChecked = false;

/**
 * Also reset checking on user logout. This function should be called on logout.
 */
export const resetProfileCheck = () => {
  profileChecked=false;
}

const CheckProfileModal = ({navigation}) => {

  /**
   * This is the error message. If it is empty, the modal is not shown.
   * So to open the modal just "setErrorMessage" to some non empty string.
   */
  const [errorMessage, setErrorMessage] = useState('');
  const checkProfileModal = Translate('checkProfileModal');

  const navigateToProfile = () =>{
    navigation.navigate('PersonalInfoScreen', {
      routeFrom: 'ProfileScreen',
    })
  }

  const checkProfile = async (checkProfileModal) => {
    if (profileChecked) return;
    profileChecked = true;

    const user_id = await AsyncStorage.getItem('user_id');
    const userDbData = await DB_STORE.GET.userInfo(user_id);
    const thisUser = userDbData?.rows[0] || {};

    if (!validateSkinTone(thisUser.skin_tone_id)) {
      // data in storage may not be initialized, so get data from backend
      const getAgreementUserState = prepareAllUserInfoQuery(user_id);

      try {
        const response = await postWithAuthorization(
          Update_User_Api,
          {
            query: getAgreementUserState,
            variables: null,
            operationName: 'patient',
          },
        );

        const { skinToneId }  = response?.data?.data?.getUserDetails?.body?.data || {}

        if (!validateSkinTone(skinToneId)) {
          // skin tone is not even set in backend
          setErrorMessage(checkProfileModal.missing_skin_tone);
        }

      } catch(error) {
        console.warn(error)
      }
    }
    // here is the space for further fields checking
    // just use "setErrorMessage" to show the error in modal
  }

  useEffect(()=>{
    checkProfile(checkProfileModal);
  },[]);

  return (
    <Modal animationType="fade" transparent={false} visible={!!errorMessage}>
      <UIModal
        Icon={
          <FeatherFont
            name="info"
            style={GlobalStyle.iconStyle}
            color="#000"
          />
        }
        title={
          <Text style={GlobalStyle.modalHeading}>
            {errorMessage}
          </Text>
        }
        modalClose={() => setErrorMessage('')}
        buttons={
          <View style={GlobalStyle.bttnWrap}>
            <UIButton
              style={[GlobalStyle.WrapForSlinglebttn]}
              mode="contained"
              accessibilityLabel="logout-ok"
              labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
              onPress={() => {
                setErrorMessage('');
                navigateToProfile();
              }}>
              {checkProfileModal.OK_button}
            </UIButton>
          </View>
        }
      />
    </Modal>

  );
};

export default CheckProfileModal;
