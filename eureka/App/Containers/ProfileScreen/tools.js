import AsyncStorage from "@react-native-async-storage/async-storage";
import {DB_STORE} from "../../storage/DbStorage";
import {postWithAuthorization} from "../../Services/graphqlApi";
import {StepsGoal_Api} from "../../Theme";
import NetInfo from "@react-native-community/netinfo";

/**
 * Get goal steps from local database.
 * If internet connection is available, fetch goal steps from backend.
 * If they are different, use data from backend as the source of truth.
 *
 * @return {Promise<{success: boolean, steps: string}|{success: boolean, errorMessage: string}>}
 */
export const fetchStepsGoal = async () => {

    const networkState = await NetInfo.fetch();
    const connected = networkState.isConnected;

    const userId = await AsyncStorage.getItem('user_id');
    const userDbData = await DB_STORE.GET.userInfo(userId);

    const successResult = {
        success: true,
        steps: '1000',
    }

    if (userDbData && userDbData.rows[0]) {
        successResult.steps = isNaN(userDbData.rows[0].step_goal) ? '1000' : `${userDbData.rows[0].step_goal}`;
    }

    let updateDbStoreGoals = false;

    /**
     * If internet connection is up, fetch data from backend.
     */
    if (!connected) {
        return successResult;
    }

    const getStepsGoal = `query stepGoal($userId:Int!){getStepGoals(userId:$userId){statusCode body{success message stepGoals}}}`;

    try {

        const response = await postWithAuthorization(
            StepsGoal_Api,
            {
                query: getStepsGoal,
                variables: {
                    userId: userId,
                },
                operationName: 'stepGoal',
            }
        );
        if (response.status === 200) {

            const stepsGoal = response.data?.data?.getStepGoals?.body?.stepGoals;

            /**
             * If goal steps from backend and from db-store is different,
             * it will be updated in db-store.
             */
            if (stepsGoal !== undefined && stepsGoal !== null) {
                if (successResult.steps !== stepsGoal.toString()) {
                    successResult.steps = stepsGoal.toString();
                    updateDbStoreGoals = true;
                }
            }
        }
        
    } catch (error) {
        console.log(error);
        return {
            success: false,
            errorMessage: 'Lifeplus servers faced an internal error while getting goal steps. Please try again later',
        };
    }


    if (updateDbStoreGoals) {
        /**
         * update the steps in db store
         */
        await DB_STORE.UPDATE.userInfo({
            id: userId,
            step_goal: successResult.steps * 1,
        });
    }

    return successResult;
}
