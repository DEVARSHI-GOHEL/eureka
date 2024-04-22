import { StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../Theme';

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.white
    },
    scrollContainer: {
        backgroundColor: '#F2FBFF',
        flex: 1,
    },
    headerIconWrap: {
      marginHorizontal: 15,
      padding:5
    },
    
    headerMenuIcon: {
      fontSize: 30,
    },
    bttnWrap: {
        borderTopWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderTopColor: '#D2D3D6',
      },
      feedbackTextfield:{
        paddingVertical:10,
        height:100,
      },
      
      healthOverviewBox:{
        marginTop:15,
      width:'100%',
      paddingLeft:0,
      marginLeft:0,
      overflow:'hidden',
      borderRadius:5,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 1,
      position:'relative',
      backgroundColor:'#fff',
      flex:1,
      marginHorizontal:20,
      marginLeft:20,
    },
    title:{
        marginTop: 25,
        marginBottom:15,
        paddingBottom:20,
        marginHorizontal:20,
        borderBottomWidth:1, 
        borderColor:'#E1EAED',
      },
      row:{
          marginHorizontal:20,
          flexDirection:'row',
          justifyContent:'space-between',
          alignItems:'center',
          
        borderBottomWidth:2, 
        borderColor:Colors.black,
        padding:10,

      },
      titleText:{
          ...Fonts.h3,
          ...Fonts.fontBold,
          flex:1
      },
      rowValue:{
          
        marginHorizontal:20,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:10,

        
      borderBottomWidth:1, 
      borderColor:'#E1EAED',

      },
});

export default styles;