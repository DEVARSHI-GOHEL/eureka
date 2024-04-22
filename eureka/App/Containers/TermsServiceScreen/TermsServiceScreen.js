import React, {useCallback, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {getTermsHTML} from "../../assets/LifeLeaf-Terms-of-Service";
import {WebView} from 'react-native-webview';

const TermsServiceScreen = ({ navigation }) => {
  const [peferredLanguage, setPreferredLanguage] = useState('');
  const handleMessage = useCallback((event) => {
    const message = event.nativeEvent.data;
    if (message === 'showEnglish') {
      setPreferredLanguage('en')
    }
  }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
          <WebView source={{html: getTermsHTML(peferredLanguage)}} style={{flex: 1}}
                   onMessage={handleMessage}
          />
        </SafeAreaView>
      );
    };
    

export default TermsServiceScreen;
