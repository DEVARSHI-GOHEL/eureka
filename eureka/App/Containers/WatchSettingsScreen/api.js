import {postWithAuthorization} from "../../Services/graphqlApi";
import {Config} from "../../Theme";

const getWatchSettingsMutation = `query MyQuery($userId: Int) {getSettings(userId: $userId) {statusCode body {message success data {autoMeasure autoMeasureFrequency cgmUnit cgmDebug updationDate}}}}`;

/**
 * Api call - get watch settings
 *
 * @param userId
 * @return {Promise<AxiosResponse<*>>}
 */
export const getWatchSettingsAPI = async (userId) => {

    return postWithAuthorization(
        Config.EUREKA_GRAPHQL_BASE_URL,
        {
            query: getWatchSettingsMutation,
            variables: {
                userId: Number(userId),
            },
        }
    );
}

/**
 * Return data of watch settings. If anything goes wrong, log warnign and return empty object.
 *
 * @param userId
 * @return {Promise<{}|*>}
 */
export const getWatchSettingsData = async (userId) => {
    try {
        const response = await getWatchSettingsAPI(userId);

        if (response.data.data.getSettings.statusCode !== 200) {
            console.warn('getWatchSettingsData (status code): ', JSON.stringify(response.data.data.getSettings));
            return {};
        }
        const {body} = response.data.data.getSettings;
        if (!body.success) {
            console.warn('getWatchSettingsData (success = fail): ', body.message);
            return {};
        }
        if (!body.data) {
            console.warn('getWatchSettingsData (body.data) is empty, see body: ', JSON.stringify(body));
            return {};
        }

        return body.data;

    } catch (error) {
        console.log('Error in getting watch settings: ')
        console.warn(error);
    }

    return {};
}
