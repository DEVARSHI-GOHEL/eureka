import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import GradientBackground from "../../Components/GradientBackground";
import {UITextInput} from "../../Components/UI";
import GlobalStyle from "../../Theme/GlobalStyle";
import {ButtonPrimary, ButtonSecondary} from "../../Components/UI/UIButton";
import {deleteAccount} from "../AccountRemoveProgressScreen/redux/richActions";
import NavigationService from "../../Navigators/NavigationService";
import {styles} from "./styles";
import {useTranslation} from "../../Services/Translate";

const AccountRemoveScreen = () => {

    const [confirmText, setConfirmText] = useState('');
    const [okEnabled, setOkEnabled] = useState(false);
    const trn = useTranslation('AccountRemoveScreen');

    useEffect(()=>{
        setOkEnabled?.(confirmText && confirmText.toUpperCase()==='DELETE');
    },[confirmText,setOkEnabled])

    return (<SafeAreaView style={{height: '100%'}}>
        <GradientBackground style={{paddingHorizontal: 0}}>
            <View style={{flex: 1}}>

                <View style={[styles.container, {width: '100%',}]}>
                    <Text style={styles.header}>{trn.title}</Text>
                    <Text style={styles.description}>{trn.text1}</Text>
                    <Text style={styles.description}>{trn.text2}<Text
                        style={styles.strong}>{trn.text2strong}irreversible</Text>{trn.text2end}</Text>
                    <Text style={styles.description}>{trn.text3} <Text style={styles.strong}>{trn.text3strong}</Text>{trn.text3end}</Text>

                </View>
                <View style={{marginHorizontal: 20}}>
                    <UITextInput
                        autoCapitalize = {"characters"}
                        style={{width: '100%', flex: 1}}
                        labelText={' '}
                        placeholder={trn.inputText}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        accessibilityLabel="confirm-deletion"
                    />
                </View>
            </View>

            <View style={[GlobalStyle.bttnWrap, GlobalStyle.withBorder]}>

                <ButtonPrimary
                    accessibilityLabel="confirm-delete"
                    style={{marginHorizontal: 5}}
                    onPress={() => {
                        deleteAccount();
                    }}
                    disabled={!okEnabled}
                >
                    {trn.OK}
                </ButtonPrimary>


                <ButtonSecondary
                    accessibilityLabel="confirm-delete"
                    style={{marginHorizontal: 5}}
                    onPress={() => {
                        NavigationService.goBack();
                    }}
                >
                    {trn.cancel}
                </ButtonSecondary>
            </View>
        </GradientBackground>
    </SafeAreaView>);
}

export default AccountRemoveScreen;
