import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../Theme';
import * as Animatable from 'react-native-animatable';
import GlobalStyle from '../../../Theme/GlobalStyle';
import MaterialCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/Feather';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

export function UIGenericPlaceholder({
  visiblity,
  noInternetIcon,
  noDataIcon,
  errorIcon,
  loadingIcon,
  message,
  ...props
}) {
  const netInfo = useNetInfo();
  // const [modalVisible, setModalVisible] = useState(true);

  Animatable.initializeRegistryWithDefinitions({
    widthAni: {
      0: {
        opacity: 0.8,
        scale: 0.22,
      },
      0.5: {
        opacity: 0.9,
        scale: 0.25,
      },
      1: {
        opacity: 1,
        scale: 0.25,
      },
    }
  });

  // <Modal
    //   animationType="fade"
    //   transparent={false}
    //   // visible={visiblity || !netInfo.isConnected}
    //   visible={visiblity}
    //   onRequestClose={() => {
    //     Alert.alert("Modal has been closed.");
    //   }}
    // >
  return (
    
      <View style={styles.modalWrap}>
        <View style={styles.modalView}>
          {noInternetIcon &&
            <MaterialCIcon name='signal-off' color={Colors.blue} size={45} />
          }

          {noDataIcon &&
            <MaterialCIcon name='file-alert-outline' color={Colors.gray} size={45} />
          }

          {loadingIcon &&
            <FaIcon name='loader' color={Colors.blue} size={45} />
          }

          {errorIcon &&
            <FaIcon name='alert-circle' color={Colors.red} size={45} />
          }

          <Text style={[GlobalStyle.modalSubHeading, { marginTop: 20, color: Colors.gray, borderBottomWidth:0 }]}>{message}</Text>
        </View>
      </View>
    // </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: '#fff'
  },
  modalView: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    // paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 0
  },
});