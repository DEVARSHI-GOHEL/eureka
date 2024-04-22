import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  profilePicWrap:{
    ...Alignment.fill,
    ...Spacer.mediumVerticalPadding,
    ...Alignment.center
  },
  picBox:{
    position:'relative',
  },
  picArea:{
    backgroundColor:'blue',
    width:100, 
    height:100,
    borderRadius: 100/ 2,
    overflow:'hidden',
    justifyContent:'center',
    alignItems:'center',
  },
  picImageArea:{
    borderWidth:1,
    borderColor:Colors.blue,
    backgroundColor:Colors.white,
    // position:'relative',
    width:100, 
    height:100,
    borderRadius: 100/ 2,
    overflow:'hidden',
    justifyContent:'center',
    alignItems:'center',
    // zIndex:9999
  },
  loaderIcon:{
    position:'absolute',
    top:40,
    left:40,
  },
  userIcon:{
    fontSize:55,
    color:'#fff',
  },
  plusIconWrap:{
    backgroundColor:'#136bd7',
    width:40,
    height:40,
    borderRadius: 40/ 2,
    overflow:'hidden',
    borderWidth:5,
    borderColor:'#fff',
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
    right:-15,
    bottom:0,
  },
  plusIcon:{
    color:'#fff',
    fontSize:25,
  },
  backgroundGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  profileUserName:{
    ...Fonts.fontBold,
    ...Fonts.large,
    marginTop:15
    // textTransform:'capitalize'
  },
  navArea:{
    borderTopWidth:1,
    borderTopColor:'#d9dadd',
    marginHorizontal:15,
  },
  listRow:{
    marginLeft:0,
    marginRight:0,
    paddingRight:0,
    paddingLeft:0,
    borderBottomColor:'#d9dadd',
    borderBottomWidth:1,
    //backgroundColor:'red'
  },
  listRowTouch:{flex:1, flexDirection:'row'},
  navIcon:{
    fontSize:30,
  },
  navText:{
    ...Fonts.fontSemiBold,
    ...Fonts.medium,
  },
  infoNotification:{
    flexDirection:'row',
    alignItems:'center'
  },
  infoNotificationIcon:{
    ...Fonts.sub,
    color:'#0d6bd7',
    marginRight:3,
  },
  stepcountDropdown:{
    marginTop:15,
  },
  inputPicker:{
    backgroundColor:'#fff',
    paddingVertical:2,
    marginTop:12,
    borderTopWidth:1, 
    borderLeftWidth:1, 
    borderRightWidth:1, 
    borderBottomWidth:1, 
    borderColor:'#c8c8c8',
    borderRadius:2,
    ...Platform.select({
      ios: {
        marginBottom:12
      },
      android: {
        ...Spacer.smallHorizontalPadding,
        marginBottom:25,
      }
    })
  },
  bttnArea:{
    ...Spacer.mediumBottomMargin
  },
  cancelBttn:{
    borderWidth:1,
    borderColor:Colors.ButtonColor,
    color:Colors.ButtonColor,
  }
})