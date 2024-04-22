import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Theme';

export default StyleSheet.create({
    row:{
        flexDirection:'row',
        padding:10,
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#fff',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#2819213d',
        marginHorizontal:20,
        
    },
    textStyle:{
        flex:1
    },
    titleStyles:{
        flex:1,
        color:Colors.black,
        fontWeight:'bold'
    },dailyList:{

        backgroundColor:'#fff',
    },
    dailyItem:{
        height:40,
        flexDirection:'row',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#2819213d',

        alignItems:'center',
        paddingHorizontal:10
    },
    title:{
        marginHorizontal:20,
        height:40,
        flexDirection:'row',
        borderBottomWidth:2,
        
        borderBottomColor:'#000000',
        alignItems:'center',
        paddingHorizontal:10
    },
    yearlyItemsContainer:{
        
    },divider:{
        marginHorizontal :10,
        height:1,
        flex:1,
        backgroundColor:Colors.gray
    },selectedMonth:{
        backgroundColor: '#e8f1ff',
        borderBottomWidth:2,
        borderBottomColor:Colors.gray
    }
})