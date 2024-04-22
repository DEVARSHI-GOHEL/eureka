import React from 'react';
import {Text, StyleSheet, Modal} from 'react-native';
import {Colors} from '../../../Theme';
import {UIModal} from '../../../Components/UI/UIModal';
import GlobalStyle from '../../../Theme/GlobalStyle';
import {useTranslation} from "../../../Services/Translate";

export function UITimeRangeModal({
  visiblity,
  timeRangeModalCloseFun,
}) {
  const trn = useTranslation('UITimeRangeModal');
  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visiblity}
    >
      <UIModal
        modalClose={timeRangeModalCloseFun}
        title={<Text style={GlobalStyle.modalSubHeading}>{trn.title}</Text>}
        content={
          <>
          {[trn.text1,trn.text2,trn.text3 ].map(text => (
                <Text style={GlobalStyle.modalContent}>
                  {text}
              </Text>))
          }
          </>
        }
      />
    </Modal>
  );
}
