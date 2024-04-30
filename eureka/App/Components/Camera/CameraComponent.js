import React, {useState, useRef} from 'react';
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import LifePlusModuleExport from '../../../LifePlusModuleExport';
import {Colors, Fonts} from '../../Theme';
import GradientBackground from '../GradientBackground';

const {CustomModule} = LifePlusModuleExport;
const {width, height} = Dimensions.get('window');

const CameraComponent = ({navigation}) => {
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const [croppedWrist, setCroppedWrist] = useState(null);
  const [croppedStrip, setCroppedStrip] = useState(null);

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
        console.log('Display image result:', imageResult);
        // navigation.navigate({
        //   name: 'PersonalInfoScreen',
        //   params: {
        //     skinType: 6,
        //   },
        //   merge: true,
        // });
        extractRectangles(data.uri);
      } catch (error) {
        console.log('error in sending data to native module', error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      setIsLoading(false);
    }
  };

  const extractRectangles = async imageUri => {
    try {
      const cropRegion1 = {
        originX: rect1Dimensions.x,
        originY: rect1Dimensions.y,
        width: rect1Dimensions.width,
        height: rect1Dimensions.height,
      };
      // RNPhotoManipulator.crop(imageUri, cropRegion1, )
      //   .then(data => console.log('data1', data))
      //   .catch(error => console.log('error', error));
      console.log('crop', cropRegion1, 'imageURI', imageUri);
      RNPhotoManipulator.crop(imageUri, cropRegion1, {
        height: 200,
        width: 150,
      }).then(path => {
        console.log(`Result image path: ${path}`);
      });

      const cropRegion2 = {
        originX: rect2Dimensions.x,
        originY: rect2Dimensions.y,
        width: rect2Dimensions.width,
        height: rect2Dimensions.height,
      };
      RNPhotoManipulator.crop(imageUri, cropRegion2)
        .then(data => console.log('data2', data))
        .catch(error => console.log('error', error));
      // const strip = ImageEditor.cropImage(imageUri, cropRegion2);
      // console.log('wrist', wrist);
      // console.log('strip', strip);
      // setCroppedWrist(ImageEditor.cropImage(imageUri, cropRegion1));
      // setCroppedStrip(ImageEditor.cropImage(imageUri, cropRegion2));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error extracting rectangles:', error);
    }
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

      {/* Render the cropped images */}
      {croppedWrist && (
        <Image
          source={{uri: croppedWrist}}
          style={{width: 100, height: 100, resizeMode: 'cover'}}
        />
      )}
      {croppedStrip && (
        <Image
          source={{uri: croppedStrip}}
          style={{width: 100, height: 100, resizeMode: 'cover'}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  camera: {
    flex: 0.9,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rectangle: {
    width: width * 0.9,
    height: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.blue,
  },
  gradientBackground: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  captureButtonInner: {
    borderWidth: 2,
    borderColor: Colors.ButtonColor,
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  fontStyleST: {
    ...Fonts.fontMedium,
    ...Fonts.large,
    textAlign: 'center',
    marginVertical: 2,
    color: Colors.blue,
  },
});

export default CameraComponent;
