import React from 'react';
import {StyleSheet} from "react-native";
import {UIButton} from "./UIButton";
import {Fonts} from "../../../Theme";
import GlobalStyle from "../../../Theme/GlobalStyle";

const styles = StyleSheet.create({
    primaryButton: {
        ...GlobalStyle.WrapForSlinglebttn,
        marginTop: 13,
    }
});

export const ButtonPrimary = ({style,children, disabled, onPress, ...rest }) => {

    return (<UIButton
            style={[
                styles.primaryButton,
                disabled ? {backgroundColor: '#A4C8ED'} : {},
                style]}
            onPress={()=> {
                if (disabled) return;
                onPress?.()}
            }
            mode="contained"
            labelStyle={{...Fonts.fontSemiBold, ...Fonts.medium}}
            {...rest}>
            {children}
        </UIButton>
    )
}

export const ButtonSecondary = ({style,children, disabled, onPress, ...rest }) => {
    return (<UIButton
            style={[
                styles.primaryButton,
                GlobalStyle.borderColor,
                disabled ? {borderColor: '#A4C8ED'} : {},
                style]}
            onPress={()=> {
                if (disabled) return;
                onPress?.()}
            }
            mode="outlined"
            labelStyle={[Fonts.fontSemiBold, Fonts.medium, disabled ? {color: '#A4C8ED'} : {}]}
            {...rest}>
            {children}
        </UIButton>
    )
}
