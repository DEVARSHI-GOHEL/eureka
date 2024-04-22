import {dispatch} from "../../../../store/store";
import {hideRemoveAccountModals, showCancelAccountFail, showCancelAccountSuccess} from "./actions";
import NavigationService from "../../../Navigators/NavigationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {postWithAuthorization} from "../../../Services/graphqlApi";
import {Update_User_Api} from "../../../Theme";

export const deleteAccount = async () => {
    dispatch(hideRemoveAccountModals());
    NavigationService.reset({
        index: 0,
        routes: [{name: 'AccountRemoveProgressScreen'}],
    });

    const userId = await AsyncStorage.getItem('user_id');
    const query  = 'mutation DeleteUser($userId: Int) {deleteUserCredUser(userId: $userId) {body statusCode}}'

    try{
        const response = await postWithAuthorization(
            Update_User_Api,
            {
                query,
                variables: {
                    userId: Number(userId),
                },
            }
        );

        const resData=response.data?.data?.deleteUserCredUser || {};
        if (resData.statusCode === 200) {
            dispatch(showCancelAccountSuccess());
            return;
        }
        const resCode = resData.statusCode || 404;

        const body = JSON.parse(resData.body|| '{}');
        const errorMessage = body.message || 'Response parsing error';
        dispatch(showCancelAccountFail(`${resCode}: ${errorMessage}`));

    } catch(e) {
        console.log('edit MealError', e);
        dispatch(showCancelAccountFail("Problem with contacting server"));

    }

}
