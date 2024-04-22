import {StyleSheet} from "react-native";
import {Fonts} from "../../../../Theme";

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    header: {
        ...Fonts.fontBold,
        ...Fonts.large,
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 15,
        alignSelf: 'flex-start',
    },
    description: {
        marginLeft: 20,
        alignSelf: 'flex-start',
        width: '90%',
        textAlign: 'left',
        ...Fonts.fontSemiBold,
        ...Fonts.medium,
    },
    text: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    flatList: {
        flex: 1,
    },
    buttonContainer: {
        marginHorizontal: 15,
    },
    dotContainer: {
        marginBottom: 30,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    itemContainer: {
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
        borderRadius: 20,
    },
});
