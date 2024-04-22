import React, {useMemo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';


const Dots = ({size, activeIndex, enabled, onDotPress}) => {
    const items = useMemo(() => {
        return [...Array(size).keys()]
    }, [size]);

    return (
        <View style={styles.container}>

            {items?.map((itm, index) => {
                return (
                    <TouchableOpacity key={itm} enabled={enabled} style={styles.touch} onPress={() => {
                        onDotPress?.(index);
                    }}>
                        <View
                              style={[styles.dot, (activeIndex === index) ? styles.active : styles.inactive]}/>
                    </TouchableOpacity>

                )
            })}
        </View>);
}

export default Dots;
