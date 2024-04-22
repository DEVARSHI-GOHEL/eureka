import {Platform, StyleSheet} from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: 100,
        height: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    touch: {
        flex: 1,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    active: {
        backgroundColor: '#1A74D4',
        borderWidth: 1,
        borderColor: '#1A74D4'
    },
    inactive: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#1A74D4'
    },
})
