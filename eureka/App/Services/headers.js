import AsyncStorage from '@react-native-async-storage/async-storage';
export const NO_API_KEY = 'NO_API_KEY';

/**
 * Prepare header with tokens from async storage
 * @param graphQlTokenKey
 * @return {Promise<{Authorization: string, "Content-Type": string}>}
 */
export const getHeadersWithToken = async (graphQlTokenKey) => {
  const auth_token = await AsyncStorage.getItem('auth_token');

  if (!auth_token){
    console.warn('getHeadersWithToken: auth_token is empty');
  }
  let result = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth_token}`,
  };

  /**
   * if no apy key is needed, do not add it, eg. at uploading picture..
   */
  if (graphQlTokenKey!==NO_API_KEY) {
    result['x-api-key'] = await AsyncStorage.getItem(graphQlTokenKey);
    if (!result['x-api-key']){
      console.warn(`Api key for  ${graphQlTokenKey} is empty!`);
    }
  }

  return result
};
