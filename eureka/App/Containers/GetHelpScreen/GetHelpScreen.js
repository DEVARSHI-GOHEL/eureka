import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
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
import {useTranslation} from "../../Services/Translate";

const slides = [
  {
    key: '1',
    title: 'stepTitle',
    subTitle: 'step1subTitle',
    text: 'step1Text',
    image: require('../../assets/images/connecting_help_step_1.png'),
  },
  {
    key: '2',
    title: 'stepTitle',
    subTitle: 'step2subTitle',
    text: 'step2Text',
    image: require('../../assets/images/connecting_help_step_2.png'),
  },
  {
    key: '3',
    title: 'stepTitle',
    subTitle: 'step3subTitle',
    text: 'step3Text',
    image: require('../../assets/images/connecting_help_step_3.png'),
    backgroundColor: '#22bcb5',
  },
  {
    key: '4',
    title: 'stepTitle',
    subTitle: 'step4subTitle',
    text: 'step4Text',
    image: require('../../assets/images/connecting_help_step_4.png'),
    backgroundColor: '#22bcb5',
  }
];

var sliderIndex = 0;
const GetHelpScreen = ({ navigation, ...props }) => {
  const trn = useTranslation('getHelpScreen');
  const slider = useRef();
  const [showRealApp, setShowRealApp] = useState(false);
  const slideToNext = () => {
    sliderIndex += 1;
    slider.current.goToSlide(sliderIndex);
  };
  const _renderItem = ({ item }) => {
    return (
      <View style={styles.sliderWrap}>
        <Text style={styles.heading}>{trn[item.title]}</Text>
        <View style={styles.imageContent}>
          <Image source={item.image} style={styles.imageItemDimensions} />
        </View>
          <Text style={styles.subHeading}>{trn[item.subTitle]}</Text>
          <Text style={styles.description}>{trn[item.text]}</Text>
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
          <UIButton mode="contained" onPress={() => navigation.goBack(null)}>{trn.btnGotIt}</UIButton>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GetHelpScreen;
