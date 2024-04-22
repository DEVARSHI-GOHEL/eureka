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

const slides = [
  {
    key: '1',
    CalibrateTitle: 'How calibration\nworks',
    MeasureTitle: 'How measure\nworks',
    subTitle: 'Step 1',
    text: 'The watch in On and worn properly.',
    image: require('../../assets/images/calibration_step_1.png'),
  },
  {
    key: '2',
    CalibrateTitle: 'How calibration\nworks',
    MeasureTitle: 'How measure\nworks',
    subTitle: 'Step 2',
    text: 'The devices (watch and phone)\nare connected.',
    image: require('../../assets/images/calibration_step_2.png'),
  },
  {
    key: '3',
    CalibrateTitle: 'How calibration\nworks',
    MeasureTitle: 'How measure\nworks',
    subTitle: 'Step 3',
    text: 'The watch has more than 10% charge.',
    image: require('../../assets/images/connecting_help_step_2.png'),
    backgroundColor: '#22bcb5',
  },
  {
    key: '4',
    CalibrateTitle: 'How calibration\nworks',
    MeasureTitle: 'How measure\nworks',
    subTitle: 'Step 4',
    text: 'If all of the above are checked OK, please\nrestart the watch and the phone and open the \nApp on the phone and try again.',
    image: require('../../assets/images/connecting_help_step_4.png'),
    backgroundColor: '#22bcb5',
  }
];

var sliderIndex = 0;
const HelpScreen = ({ navigation, ...props }) => {
  const slider = useRef();
  const [showRealApp, setShowRealApp] = useState(false);
  const slideToNext = () => {
    sliderIndex += 1;
    slider.current.goToSlide(sliderIndex);
  };
  
  const _renderItem = ({ item }) => {
    return (
      <View style={styles.sliderWrap}>
        <Text style={styles.heading} accessibilityLabel="measure-heading-text">
          { 
            item.MeasureTitle
          }
          </Text>
        <View style={styles.imageContent}>
          <Image source={item.image} style={styles.imageItemDimensions} />
        </View>
          <Text style={styles.subHeading}>{item.subTitle}</Text>
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
          <UIButton mode="contained" onPress={() => navigation.goBack()} accessibilityLabel="measure-got-it-button">Got it</UIButton>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;
