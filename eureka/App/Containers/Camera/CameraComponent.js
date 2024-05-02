import React, {useState, useRef} from 'react';
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Modal,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import LifePlusModuleExport from '../../../LifePlusModuleExport';
import {Alignment, Colors, Fonts, GlobalStyle} from '../../Theme';
import GradientBackground from '../../Components/GradientBackground';
import {UIButton} from '../../Components/UI';
import styles from './styles';

const SKIN_TONES = [
  {id: 1, color: '#F0E5CA'},
  {id: 2, color: '#E1BE92'},
  {id: 3, color: '#DEBD98'},
  {id: 4, color: '#B1926A'},
  {id: 5, color: '#835533'},
  {id: 6, color: '#4D3F39'},
];

const CameraComponent = ({navigation}) => {
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isShowModal, setIsShowModal] = useState(false);

  const [selectedSkinToneId, setSelectedSkinToneId] = useState('');

  const [rect1Dimensions, setRect1Dimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [rect2Dimensions, setRect2Dimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  function getColorById(id) {
    const skinTone = SKIN_TONES.find(tone => tone.id === id);
    return skinTone ? skinTone.color : null;
  }

  const onRect1Layout = event => {
    const {width, height, x, y} = event.nativeEvent.layout;
    setRect1Dimensions({width, height, x, y});
  };

  const onRect2Layout = event => {
    const {width, height, x, y} = event.nativeEvent.layout;
    setRect2Dimensions({width, height, x, y});
  };

  const takePicture = async () => {
    try {
      setIsLoading(true);
      const options = {quality: 0.5, base64: true};
      const data = await cameraRef.current.takePictureAsync(options);
      // console.log(data); // Image URI

      try {
        const imageResult = await LifePlusModuleExport.displayImage(
          data.base64,
        );
        setSelectedSkinToneId(imageResult);
        setIsLoading(false);
        setIsShowModal(true);
      } catch (error) {
        console.log('error in sending data to native module', error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      setIsLoading(false);
    }
  };

  const handleContinuePress = () => {
    setIsShowModal(false);
    navigation.navigate({
      name: 'PersonalInfoScreen',
      params: {
        skinType: selectedSkinToneId,
      },
      merge: true,
    });
  };

  const handleTryAgainPress = () => {
    setIsShowModal(false);
  };

  return (
    <View style={{flex: 1}}>
      {isLoading && (
        <ActivityIndicator
          size={25}
          color={Colors.ButtonColor}
          style={styles.activityIndicator}
        />
      )}
      <View style={styles.camera}>
        <RNCamera
          ref={cameraRef}
          style={{flex: 1}}
          type={RNCamera.Constants.Type.back}
          autoFocus={RNCamera.Constants.AutoFocus.on}
        />
        <View style={styles.overlayContainer}>
          <Text style={styles.fontStyleST}>Wrist</Text>
          <View style={styles.rectangle} onLayout={onRect1Layout}></View>
          <Text style={[styles.fontStyleST, {marginTop: 30}]}>Strip</Text>
          <View style={styles.rectangle} onLayout={onRect2Layout}></View>
        </View>
      </View>
      <GradientBackground style={styles.gradientBackground}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={takePicture}>
            <View style={styles.captureButton}>
              <View style={styles.captureButtonInner}></View>
            </View>
          </TouchableOpacity>
        </View>
      </GradientBackground>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isShowModal}
        onRequestClose={() => setIsShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.bottomSheet}>
            <Text
              style={[
                styles.fontStyleST,
                {color: Colors.black, ...Fonts.fontSemiBold},
              ]}>
              Selected Skin Tone
            </Text>
            <View style={styles.colorViewContainer}>
              {selectedSkinToneId === 0 ? (
                <Text
                  style={[
                    styles.fontStyleST,
                    {color: Colors.black, ...Fonts.fontSemiBold, fontSize: 18},
                  ]}>
                  Error in fetching skin tone
                </Text>
              ) : (
                <>
                  <View
                    style={[
                      styles.colorView,
                      {backgroundColor: getColorById(selectedSkinToneId)},
                    ]}
                  />
                  <View style={{marginLeft: 20}}>
                    <Text
                      style={[
                        styles.fontStyleST,
                        {
                          color: Colors.black,
                          ...Fonts.fontSemiBold,
                          fontSize: 18,
                        },
                      ]}>
                      Skin Tone {selectedSkinToneId}
                    </Text>
                    <Text>details</Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.bttnWrap}>
              <UIButton
                // style={styles.bttnArea}
                style={styles.bttnArea}
                mode="contained"
                labelStyle={styles.buttonText}
                onPress={() => handleContinuePress()}>
                Continue
              </UIButton>
              <UIButton
                style={[styles.bttnArea, styles.cancelBttn]}
                mode="outlined"
                labelStyle={{...Fonts.fontSemiBold}}
                onPress={() => handleTryAgainPress()}>
                Try Again
              </UIButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CameraComponent;
