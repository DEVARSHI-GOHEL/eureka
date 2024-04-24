import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {styles} from './SkinTonePicker.styles';

export const SKIN_TONE_DUMMY_ID = -1;

const SKIN_TONES = [
  {id: 1, color: '#F0E5CA'},
  {id: 2, color: '#E1BE92'},
  {id: 3, color: '#DEBD98'},
  {id: 4, color: '#B1926A'},
  {id: 5, color: '#835533'},
  {id: 6, color: '#4D3F39'},
];

// TODO: this should be tested, but jest is not configured now.
export const isValidSkinToneId = id =>
  0 <= SKIN_TONES.findIndex(skinToneItem => skinToneItem.id == id);

/**
 *
 * @param selectedId id of selected skin tone (to highlight)
 * @param setSkinTone function for setting action skin tone
 * @return {JSX.Element}
 * @constructor
 */
const SkinTonePicker = ({selectedId, setSkinTone}) => {
  return (
    <View style={styles.container}>
      {SKIN_TONES.map(skinTone => (
        <View key={`skin-tone-${skinTone.id}`} style={styles.itemContainer}>
          <View
            key={`skin-tone-touch-${skinTone.id}`}
            testID={`skin-tone-touch-${skinTone.id} ${
              skinTone.id == selectedId ? 'selected' : ''
            }`}
            // onPress={() => {
            //   setSkinTone?.(skinTone.id);
            // }}
            accessible={false}>
            <View
              accessibilityLabel={`skin-tone-touch-${skinTone.id} ${
                skinTone.id == selectedId ? 'selected' : ''
              }`}
              style={[
                styles.itemColorContent,
                {
                  backgroundColor: skinTone.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default SkinTonePicker;
