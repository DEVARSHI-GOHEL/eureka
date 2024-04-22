import {createStackNavigator} from "@react-navigation/stack";
import {useDispatch} from "react-redux";
import AlertScreen from "../../../Containers/AlertScreen";
import {Fonts} from "../../../Theme";
import {View} from "react-native";
import {WatchWornStatus} from "../../../Components/WatchWornStatus";
import {watchConnectPopupAction, watchSyncAction, watchWornPopupAction} from "../../../Containers/HomeScreen/action";
import {WatchConnectionStatus} from "../../../Components/WatchConnectionStatus";
import {OFFLINE_SYNC_STATE} from "../../../constants/AppDataConstants";
import {AlertDetailScreen} from "../../../Containers/AlertDetailScreen/AlertDetailScreen";
import {InsightsDetailScreen} from "../../../Containers/InsightsDetailsScreen/InsightsDetailScreen";
import React from "react";
import {styles} from "../../AppNavigator.styles";
import {Translate} from "../../../Services/Translate";
import {GeneralRightNavigation} from "../GeneralRightNavigation/GeneralRightNavigation";

const AlertStack = createStackNavigator();

const AlertStackScreen = (props) => {
  const dispatch = useDispatch();
  const navNames = Translate('screenNavigation')
  return (
    <AlertStack.Navigator>
      <AlertStack.Screen
        name="Alert"
        component={AlertScreen}
        options={({navigation, route}) => ({
          headerTitle: navNames.alerts,
          headerTitleStyle: {
            ...Fonts.fontBold,
            alignSelf: 'center',
          },

          headerRight: () => ( <GeneralRightNavigation {...{navigation}} />)
        })}
      />
      <AlertStack.Screen
        name="AlertDetails"
        component={AlertDetailScreen}
        options={({navigation, route}) => ({
          title: '',
          headerTitleStyle: {
            ...Fonts.fontBold,
            // alignSelf: "center",
          },

          headerTintColor: '#000',
          gestureEnabled: false,
          headerBackTitleVisible: false,
        })}
      />
      <AlertStack.Screen
        name="InsightsDetailScreen"
        component={InsightsDetailScreen}
        options={({navigation, route}) => ({
          title: '',
          headerTitleStyle: {
            ...Fonts.fontBold,
            // alignSelf: "center",
          },

          headerTintColor: '#000',
          gestureEnabled: false,
          headerBackTitleVisible: false,
        })}
      />
    </AlertStack.Navigator>
  );
};

export default AlertStackScreen;
