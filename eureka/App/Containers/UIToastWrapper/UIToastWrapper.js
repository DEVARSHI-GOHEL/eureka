/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity
} from 'react-native';

import { UIToast } from '../../Components/UI';
import IconFont from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import {translateError} from "../../Services/Translate";

const UIToastWrapper = ({ navigation }) => {
  const {
    toastType, // 0 error, 1 success
    message,
    isVisible
  } = useSelector(
    state => ({
      toastType: state.toast.toastType,
      message: state.toast.message,
      isVisible: state.toast.isVisible
    })
  );
  return (<>
    {isVisible &&
      <UIToast
        typeProperty={toastType}
        message={(toastType === 1)?message:translateError(message)}
        leftIcon={
          (toastType === 1) ?
            <IconFont name='thumbs-o-up' style={{ fontSize: 20 }} />
            :
            <IconFont name='thumbs-o-down' style={{ fontSize: 20 }} />
        }
      />
    }
  </>
  );
};

export default UIToastWrapper;
