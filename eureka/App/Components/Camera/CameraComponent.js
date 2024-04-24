import React, {useState, useRef, useEffect} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import LifePlusModuleExport from '../../../LifePlusModuleExport';

// TODO: to send data to native module

const {CustomModule} = LifePlusModuleExport;

const CameraComponent = ({handleCloseCamera}) => {
  const cameraRef = useRef(null);

  const takePicture = async () => {
    try {
      const options = {quality: 0.5, base64: true};
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri); // Image URI
      console.log(Object.keys(data));

      // Call the skinToneDetectionMethod
      // const result = await CustomModule.skinToneDetectionMethod();
      // console.log('Skin tone detection result:', result);

      // Call the displayImage method
      // const imageResult = await LifePlusModuleExport.displayImage(data.base64);
      // console.log('Display image result:', imageResult);
      handleCloseCamera();
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };
  // const takePicture = async () => {
  //   if (cameraRef.current) {
  //     const options = {quality: 0.5, base64: true};
  //     const data = await cameraRef.current.takePictureAsync(options);
  //     console.log(data.uri);
  //   }
  // };

  useEffect(() => {
    console.log('entered module');
  }, []);

  return (
    <View style={{flex: 1}}>
      <RNCamera
        ref={cameraRef}
        style={{flex: 1}}
        type={RNCamera.Constants.Type.back}
        autoFocus={RNCamera.Constants.AutoFocus.on}
      />
      <View style={{position: 'absolute', bottom: 20, alignSelf: 'center'}}>
        <TouchableOpacity onPress={takePicture}>
          <View
            style={{
              borderWidth: 2,
              borderColor: 'white',
              borderRadius: 50,
              padding: 20,
              marginBottom: 20,
            }}>
            <View
              style={{
                borderWidth: 2,
                borderColor: 'black',
                borderRadius: 50,
                padding: 5,
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={handleCloseCamera}
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
        }}>
        <Text style={{color: 'black'}}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CameraComponent;
