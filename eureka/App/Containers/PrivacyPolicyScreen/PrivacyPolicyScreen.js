import React from 'react';
import {SafeAreaView, Linking} from 'react-native';
import {getPolicyHTML} from "../../assets/LifePlus-Privacy-Policy";
import {WebView} from 'react-native-webview';

const PrivacyPolicyScreen = ({navigation}) => {
    const onShouldStartLoadWithRequest = (event) => {
        if (event.url.slice(0, 4) === 'http' || event.url.slice(0, 7) === 'mailto:') {
            Linking.openURL(event.url);
            return false
        }
        return true
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <WebView source={{html: getPolicyHTML()}}
                     style={{flex: 1}}
                     onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            />
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;
