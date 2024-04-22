import { Card } from 'react-native-paper'

import React from 'react'
import { useState,useLayoutEffect } from 'react';
import { View, ScrollView, Text,TouchableOpacity,Modal } from 'react-native';
import { UIButton, UIModal, UITextInput } from '../../Components/UI';
import styles from './style'
import { Colors, Fonts, GlobalStyle } from '../../Theme';
import MaIcon from 'react-native-vector-icons/MaterialIcons';


export const InsightsDetailScreen = ({ navigation }) => {

    const [notes, setNotes] = useState('')
    const [modalVisible, setModalVisible] = useState([])

    
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerIconWrap}
          onPress={() => {
            setModalVisible(true)
          }}
          accessible={false}
        >
          <MaIcon
            name="delete"
            style={[styles.headerMenuIcon, styles.seetingIcon, { color: '#000' }]}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

    const renderCard = () => {
        return (
            <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
                flex: 1,
            }}>
                <Card style={[styles.healthOverviewBox, { marginVertical: 5,paddingBottom:20 }]}>

                    <View style={styles.title}>

                        <Text style={{ color: Colors.gray }}>December 4, 2019 at 12:00 Pm</Text>

                        <Text style={{ color: Colors.black, fontWeight: 'bold', fontSize: 16 }}>Blood glucose is too high</Text>
                        <Text style={{ color: Colors.black, fontWeight: '700' }}>{'<70 mg/dl'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.titleText}>Vital</Text>
                        <Text style={styles.titleText}>Days in Range</Text>
                    </View>
                    <View style={styles.rowValue}>
                        <Text style={styles.titleText}>Blue Glucose</Text>
                        <Text style={styles.titleText}>4 in Range</Text>
                    </View>
                    <View style={styles.rowValue}>
                        <Text style={styles.titleText}>Blue Glucose</Text>
                        <Text style={styles.titleText}>4 in Range</Text>
                    </View>
                    <View style={styles.rowValue}>
                        <Text style={styles.titleText}>Blue Glucose</Text>
                        <Text style={styles.titleText}>4 in Range</Text>
                    </View>
                </Card>
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={styles.scrollContainer}
            >
                {renderCard()}
                <View style={{ padding: 20 }}>
                    <UITextInput
                        labelText={'Notes'}
                        value={notes}
                        style={styles.feedbackTextfield}
                        labelStyles={{
                            fontWeight: 'bold'
                        }}
                        placeholder={'Add notes'}
                        multiline={true}
                        textAlignVertical={'top'}
                        accessibilityLabel="symptom-text-input"
                        onChangeText={(text) => setNotes(text)}
                    />
                </View>
            </ScrollView>

            <View style={styles.bttnWrap}>
                <UIButton
                    mode="contained"
                    labelStyle={{ color: '#fff' }}
                    onPress={() => {

                    }}
                    >
                    Share alert
                </UIButton>
            </View>
            
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        // onRequestClose={() => {
        //   Alert.alert('Modal has been closed.');
        //   }}
        >
        <UIModal
          modalClose={() => setModalVisible(!modalVisible)}
          title={<Text style={GlobalStyle.modalHeading}>Are you sure?</Text>}
          buttons={
            <View style={GlobalStyle.bttnWrap}>
              <UIButton
                style={[GlobalStyle.bttnArea, GlobalStyle.borderColor]}
                mode="outlined"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={()=>{
                  setModalVisible(false)
                }}>
                OK
              </UIButton>
              <UIButton
                style={GlobalStyle.bttnArea}
                mode="contained"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={() => setModalVisible(!modalVisible)}>
                Cancel
              </UIButton>
            </View>
          }
        />
      </Modal>

        </View>
    )
}
