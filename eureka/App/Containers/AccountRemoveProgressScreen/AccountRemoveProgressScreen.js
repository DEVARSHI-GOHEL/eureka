import React from 'react';
import {SafeAreaView} from 'react-native';
import {UILoader} from "../../Components/UI";
import ModalSuccess from "../../Components/ModalSuccess/ModalSuccess";
import ModalFail from "../../Components/ModalFail/ModalFail";
import {removeUserAuthDetails} from "../../Services/AuthService";
import NavigationService from "../../Navigators/NavigationService";
import {useSelector} from "react-redux";
import {dispatch} from "../../../store/store";
import {hideRemoveAccountModals} from "./redux/actions";
import {getAccountRemoveStore} from "./redux/selectors";

const AccountRemoveProgressScreen = () => {
    const {successVisible,failVisible, errorMessage} = useSelector(getAccountRemoveStore);

    return (<SafeAreaView style={{height: '100%'}}>
        <UILoader title={"Cancelling account"}/>
        <ModalSuccess
            modalVisible={successVisible}
            title={"Your account was cancelled"}
            onClose={()=>{
                dispatch(hideRemoveAccountModals());
                removeUserAuthDetails();
                NavigationService.reset({
                    index: 0,
                    routes: [{name: 'SignInScreen'}],
                });
            }}
        />
        <ModalFail
            modalVisible={failVisible}
            title={"Account cancelling failed"}
            content={errorMessage}
            onClose={()=>{
                dispatch(hideRemoveAccountModals());
                NavigationService.reset({
                    index: 0,
                    routes: [{name: 'HomeTab'}],
                });
            }}
        />
    </SafeAreaView>);
}

export default AccountRemoveProgressScreen;
