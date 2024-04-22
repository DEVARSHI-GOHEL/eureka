import {refreshTokenApi} from "./AuthService";
import {API} from "./API";
import {Profile_Pic_Upload_Api, Update_User_Api} from "../Theme";
import { getHeadersWithToken, NO_API_KEY } from "./headers";
import LifePlusModuleExport from '../../LifePlusModuleExport';

/**
 * Function gets tokens from async storage and sends query to backend.
 * It assumes, that tokens are valid - that's why this function optimistic.
 *
 * @param graphQlTokenKey
 * @param url
 * @param data
 * @param options
 * @return {Promise<AxiosResponse<any>>}
 */
const optimisticQueryWithToken = async (graphQlTokenKey, url, data , options={}) => {
  const headers = await getHeadersWithToken(graphQlTokenKey);
  // merge headers
  const resultOptions = {...options};
  resultOptions.headers = {...headers, ...resultOptions?.headers};

  return API.postApi(
    url,
    data,
    resultOptions,
  );
}

const isInvalidToken = (statusCode) => (statusCode == 303 || statusCode == 302);

const isCriticalGraphGlRequestError = (responseStatus) => {
  const status = Number(responseStatus);
  return !Number.isNaN(status) && status >= 400 && status <= 599;
};

const handleGraphQlErrorReport = (
  { status: graphQlStatusCode, key: graphQlKey, response }
) => {
  const { body = {} } = response.data?.data?.[graphQlKey];

  const graphQlErrorMessage = typeof body === 'string'
    ? JSON.parse(body)?.message ?? body
    : body?.message ?? JSON.stringify(body);
  
  const { url = '', data = '', headers = {} } = response?.config || {};
  const graphQlQuery = JSON.parse(data)?.query || '';
  LifePlusModuleExport.apiError(JSON.stringify({
    url,
    headers: Object.getOwnPropertyNames(headers),
    graphQlKey,
    graphQlStatusCode,
    graphQlErrorMessage,
    graphQlQuery,
  }));
};

/**
 * Find invalid auth token. Because many functions are returning it in different levels (or in json as string),
 * this function will search for response code in many places.
 *
 * Function will return first found auth-invalid status code.
 *
 * @param response
 * @return {number}
 */
const getResponseStatusCode = (response) => {
  let statusCode;
  // Search for status code in response objects.
  // If there is at least one problem with token, it will ask backend for new token
  // and call this query again.
  Object.keys(response.data?.data || {}).forEach(key => { 
    const currentStatusCode = response.data?.data?.[key]?.statusCode;

    if (isInvalidToken(currentStatusCode)){
      statusCode=currentStatusCode;
    }

    if (isCriticalGraphGlRequestError(currentStatusCode)) {
      handleGraphQlErrorReport({
        status: currentStatusCode,
        key,
        response
      });
    }
  });

  if (statusCode) return statusCode;
  if (isInvalidToken(response.data?.body?.statusCode)) return response.data?.body?.statusCode;
  if (isInvalidToken(response.data?.data?.body?.statusCode)) return response.data?.data?.body?.statusCode;
  if (typeof response.data?.body === 'string') {
    const stringBody = JSON.parse(response.data?.body);
    if (isInvalidToken(stringBody.statusCode)) return stringBody.statusCode;
  }

  return 0;
}

/**
 * This function is querying backend with authorization token. If query fails, because of token expiration,
 * function will ask for new token and then it will send the query to the backand again.
 *
 * @param url
 * @param data
 * @param options
 * @return {Promise<AxiosResponse<any>>}
 */
export const postWithAuthorization = async (url, data , options = {}) => {
  let graphQlTokenKey = 'graphql_token'
  if (url.startsWith(Update_User_Api)){
    graphQlTokenKey = 'gpl_token';
  }

  if (url.startsWith(Profile_Pic_Upload_Api)){
    graphQlTokenKey = NO_API_KEY;
  }

  let response = await optimisticQueryWithToken(graphQlTokenKey,url, data , options);
  let statusCode = getResponseStatusCode(response);

  if (isInvalidToken(statusCode)) {

    await refreshTokenApi();
    response = await optimisticQueryWithToken(graphQlTokenKey,url, data , options);
  };

  return response;
}
