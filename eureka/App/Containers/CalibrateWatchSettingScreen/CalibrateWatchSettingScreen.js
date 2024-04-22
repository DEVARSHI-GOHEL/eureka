import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';
import { UIButton } from '../../Components/UI';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { Translate } from '../../Services/Translate';

var sliderIndex = 0;
const CalibrateWatchSettingScreen = ({ navigation, ...props }) => {
  const slides = [
    {
      key: '1',
      CalibrateTitle: Translate("calibrateHelpScreen.heading_slider1"),// 'How calibration\nworks',
      MeasureTitle: 'How measure\nworks',
      subTitle: Translate("calibrateHelpScreen.subHeading_slider1"),
      text: Translate("calibrateHelpScreen.description_slider1"),
      image: require('../../assets/images/calibration_step_1.png'),
    },
    {
      key: '2',
      CalibrateTitle: Translate("calibrateHelpScreen.heading_slider2"), //'How calibration\nworks'
      MeasureTitle: 'How measure\nworks',
      subTitle: Translate("calibrateHelpScreen.subHeading_slider2"),
      text: Translate("calibrateHelpScreen.description_slider2"),
      image: require('../../assets/images/calibration_step_2.png'),
    },
    {
      key: '3',
      CalibrateTitle: Translate("calibrateHelpScreen.heading_slider3"), //'How calibration\nworks'
      MeasureTitle: 'How measure\nworks',
      subTitle: Translate("calibrateHelpScreen.subHeading_slider3"),
      text: Translate("calibrateHelpScreen.description_slider3"),
      image: require('../../assets/images/connecting_help_step_2.png'),
      backgroundColor: '#22bcb5',
    },
    {
      key: '4',
      CalibrateTitle: Translate("calibrateHelpScreen.heading_slider4"), //'How calibration\nworks'
      MeasureTitle: 'How measure\nworks',
      subTitle: Translate("calibrateHelpScreen.subHeading_slider4"),
      text: Translate("calibrateHelpScreen.description_slider4"),
      image: require('../../assets/images/connecting_help_step_4.png'),
      backgroundColor: '#22bcb5',
    }
  ];
  
  const slider = useRef();
  const [showRealApp, setShowRealApp] = useState(false);
  const slideToNext = () => {
    sliderIndex += 1;
    slider.current.goToSlide(sliderIndex);
  };
  
  const _renderItem = ({ item }) => {
    return (
      <View style={styles.sliderWrap}>
        <Text style={styles.heading} accessibilityLabel="calibration-heading-text">
          { 
            item.CalibrateTitle
          }
          </Text>
        <View style={styles.imageContent}>
          <Image source={item.image} style={styles.imageItemDimensions} />
        </View>
          <Text style={styles.subHeading} accessibilityLabel="calibration-steps-text">{item.subTitle}</Text>
          <Text style={styles.description}>{item.text}</Text>
      </View>
    );
  };

  const _renderPagination = (activeIndex) => {
    return (
      <View style={styles.paginationDots}>
        {slides.length > 1 &&
          slides.map((_, i) => (
            <TouchableOpacity
            accessibilityLabel="calibration-pegination"
              key={i}
              style={[
                styles.dot,
                i === activeIndex
                  ? { backgroundColor: '#1A74D4', borderWidth:1, borderColor:'#1A74D4' }
                  : { backgroundColor: '#fff', borderWidth:1, borderColor:'#1A74D4' },
              ]}
              onPress={() => slider.current.goToSlide(i, true)}
            />
          ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.mainContainer} contentInsetAdjustmentBehavior="automatic">
      <ScrollView>
      <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 0, y: .3 }} colors={['#f1fbff', '#fff']} style={styles.gradientContainer}>
          <AppIntroSlider
            renderItem={_renderItem}
            data={slides}
            showDoneButton={false}
            activeDotStyle={styles.activeDot}
            renderPagination={_renderPagination}
            ref={slider}
          />
      </LinearGradient>

      <View style={styles.getStartedView}>
        <View style={styles.startBttnWrap}>
          <UIButton mode="contained" onPress={() => navigation.goBack()} accessibilityLabel="calibration-got-it-button">{Translate("calibrateHelpScreen.gotIt")}</UIButton>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalibrateWatchSettingScreen;

