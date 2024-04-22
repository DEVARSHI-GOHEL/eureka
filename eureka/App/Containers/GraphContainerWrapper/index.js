/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useLayoutEffect} from 'react';

import {SafeAreaView, ScrollView, View, Text} from 'react-native';
import {Tab, Tabs} from 'native-base';

import {VITAL_CONSTANTS, PERIOD_NAME} from '../../Chart/AppConstants/VitalDataConstants';
import {
  DayGraphComponent,
  DayStepsGraphComponent,
} from '../../Components/DayGraphComponent';
import {MonthGraphComponent} from '../../Components/MonthGraphComponent';
import {WeekGraphComponent} from '../../Components/WeekGraphComponent';
import {YearGraphComponent} from '../../Components/YearGraphComponent';
import {StepsGraphComponent} from '../../Components/GraphComponent';

const MonthStepsGraphComponent = StepsGraphComponent(PERIOD_NAME.month);
const WeekStepsGraphComponent = StepsGraphComponent(PERIOD_NAME.week);
const YearStepsGraphComponent = StepsGraphComponent(PERIOD_NAME.year);

import {GlobalStyle} from '../../Theme';
import {Translate} from '../../Services/Translate';
import styles from '../BloodGlucoseScreen/styles';

const GraphContainerWrapper = function ({
  disabledHeaderIcon,
  headerAccessibilityLabel,
  headerIcon,
  navigation,
  title,
  vitalType,
}) {
  const [tabIndex, setTabIndex] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTileWrap}>
          {tabIndex < 1 ? headerIcon : disabledHeaderIcon}
          <Text
            style={styles.headerTextStyle}
            accessibilityLabel={headerAccessibilityLabel}>
            {title}
          </Text>
        </View>
      ),
      headerBackTitleVisible: false,
    });
  }, [title, navigation, tabIndex]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.tabArea}>
        <Tabs
          locked={true}
          tabContainerStyle={GlobalStyle.tabContainerCusStyle}
          tabBarUnderlineStyle={GlobalStyle.tabBarUnderlineCusStyle}
          onChangeTab={({i}) => setTabIndex(i)}>
          <Tab
            activeTabStyle={GlobalStyle.activeTabCusStyle}
            tabStyle={GlobalStyle.tabCusStyle}
            textStyle={GlobalStyle.textCusStyle}
            activeTextStyle={GlobalStyle.activeTextCusStyle}
            heading={Translate('commonHomeDetails.tab1')}>
            <ScrollView style={styles.mainScrollView}>
              {VITAL_CONSTANTS.KEY_STEPS == vitalType ? (
                <DayStepsGraphComponent />
              ) : (
                <DayGraphComponent
                  vitalType={vitalType}
                  navigation={navigation}
                />
              )}
            </ScrollView>
          </Tab>

          <Tab
            activeTabStyle={GlobalStyle.activeTabCusStyle}
            tabStyle={GlobalStyle.tabCusStyle}
            textStyle={GlobalStyle.textCusStyle}
            activeTextStyle={GlobalStyle.activeTextCusStyle}
            heading={Translate('commonHomeDetails.tab2')}>
            <ScrollView style={styles.mainScrollView}>
              {VITAL_CONSTANTS.KEY_STEPS == vitalType ? (
                <WeekStepsGraphComponent />
              ) : (
                <WeekGraphComponent
                  vitalType={vitalType}
                  navigation={navigation}
                />
              )}
            </ScrollView>
          </Tab>

          <Tab
            activeTabStyle={GlobalStyle.activeTabCusStyle}
            tabStyle={GlobalStyle.tabCusStyle}
            textStyle={GlobalStyle.textCusStyle}
            activeTextStyle={GlobalStyle.activeTextCusStyle}
            heading={Translate('commonHomeDetails.tab3')}>
            <ScrollView style={styles.mainScrollView}>
              {VITAL_CONSTANTS.KEY_STEPS == vitalType ? (
                <MonthStepsGraphComponent />
              ) : (
                <MonthGraphComponent
                  vitalType={vitalType}
                  navigation={navigation}
                />
              )}
            </ScrollView>
          </Tab>

          <Tab
            activeTabStyle={GlobalStyle.activeTabCusStyle}
            tabStyle={GlobalStyle.tabCusStyle}
            textStyle={GlobalStyle.textCusStyle}
            activeTextStyle={GlobalStyle.activeTextCusStyle}
            heading={Translate('commonHomeDetails.tab4')}>
            <ScrollView style={styles.mainScrollView}>
              {VITAL_CONSTANTS.KEY_STEPS == vitalType ? (
                <YearStepsGraphComponent />
              ) : (
                <YearGraphComponent
                  vitalType={vitalType}
                  navigation={navigation}
                />
              )}
            </ScrollView>
          </Tab>
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

export default GraphContainerWrapper;
