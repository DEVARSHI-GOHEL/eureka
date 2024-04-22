import React from 'react'
import { View,StyleSheet,TouchableOpacity,Text } from 'react-native'
import  GlobalStyle  from '../../Theme/GlobalStyle'

export const CustomTab = ({tab1,tab2,onPressTab,selected}) => {
    return(
        <View style={[{flex:1, margin: 10 }]}>
            <View style={[styles.row,GlobalStyle.tabContainerCusStyle]}>
                <TouchableOpacity
                    style={[styles.tab,selected===0?GlobalStyle.activeTabCusStyle:GlobalStyle.tabCusStyle]}
                    onPress={()=>onPressTab(0)}
                    accessible={false}
                >
                    <Text
                    style={selected===0?GlobalStyle.activeTextCusStyle:GlobalStyle.textCusStyle}
                    >{tab1}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab,selected===1?GlobalStyle.activeTabCusStyle:GlobalStyle.tabCusStyle]}
                    onPress={()=>onPressTab(1)}
                    accessible={false}
                >
                    <Text
                    style={selected===1?GlobalStyle.activeTextCusStyle:GlobalStyle.textCusStyle}
                    >{tab2}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles=StyleSheet.create({
    row:{
        flexDirection:'row',
        flex:1,
        justifyContent:'space-evenly'
    },
    tab:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    }
})
