import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../Theme/Constant/Constant';
import {postWithAuthorization} from "../Services/graphqlApi";

/**
 * check debug log and set asyncStorage value
 */
export const getDebugState = async (userId) => {
  const getDebugStateQuery = `query MyQuery($userId: Int) {getDebugState(userId: $userId) {statusCode body {message success data {debugLog}}}}`;
  postWithAuthorization(
    Config.EUREKA_GRAPHQL_BASE_URL,
    {
      query: getDebugStateQuery,
      variables: {
        userId: Number(userId),
      },
    }
  ).then(async (response) => {
    if (response.data.data.getDebugState.body.data.debugLog) {
      AsyncStorage.setItem('debug_log_enabled', JSON.stringify(true));
    } else {
      AsyncStorage.setItem('debug_log_enabled', JSON.stringify(false));
    }
  })
};
