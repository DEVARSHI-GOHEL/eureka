import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../Theme';
import * as Animatable from 'react-native-animatable';
import GlobalStyle from '../../../Theme/GlobalStyle';
import MaterialCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/Feather';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

export function UICommingSoon({
}) {
  return (
      <View style={styles.modalWrap}>
        <View style={styles.modalView}>
          <Text style={[GlobalStyle.modalHeading, { marginTop: 20, color: Colors.gray }]}>THIS FEATURE WILL COME SOON</Text>
          <Text style={[GlobalStyle.modalSubHeading, { paddingVertical:0, color: Colors.gray, borderBottomWidth:0, }]}>Lifeplus is striving to bring you the best because you deserve it. We will update you soon on this feature.</Text>
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
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    elevation: 0
  },
});