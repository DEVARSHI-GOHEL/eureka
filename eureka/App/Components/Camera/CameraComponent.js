import React, {useState, useRef, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {RNCamera} from 'react-native-camera';
import LifePlusModuleExport from '../../../LifePlusModuleExport';
import {Colors} from '../../Theme';
import GradientBackground from '../GradientBackground';

// TODO: to send data to native module

const {CustomModule} = LifePlusModuleExport;

const CameraComponent = ({navigation}) => {
  const cameraRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async () => {
    try {
      const options = {quality: 0.5, base64: true};
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri); // Image URI

      // Call the skinToneDetectionMethod
      // const result = await CustomModule.skinToneDetectionMethod();
      // console.log('Skin tone detection result:', result);

      // Call the displayImage method
      setIsLoading(true);
      try {
        const imageResult = await LifePlusModuleExport.displayImage(
          data.base64,
        );
        console.log('Display image result:', imageResult);
        navigation.navigate({
          name: 'PersonalInfoScreen',
          params: {
            skinType: 6,
          },
          merge: true,
        });

        setIsLoading(false);
      } catch (error) {
        console.log('error in sending data to native module', error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      {isLoading && (
        <ActivityIndicator
          size={25}
          color={Colors.ButtonColor}
          style={{
            position: 'absolute',
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
          }}
        />
      )}
      <RNCamera
        ref={cameraRef}
        style={{flex: 0.9}}
        type={RNCamera.Constants.Type.back}
        autoFocus={RNCamera.Constants.AutoFocus.on}
      />
      <GradientBackground style={{flex: 0.1}}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={takePicture}>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: Colors.ButtonColor,
                  borderRadius: 50,
                  width: 50,
                  height: 50,
                }}></View>
            </View>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    </View>
  );
};

export default CameraComponent;
