import { StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacer, Alignment, Border } from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  mainScrollView:{
    ...Alignment.fill,
    backgroundColor:Colors.white
  },
  gradientContainer:{
    ...Alignment.fill,
    ...Spacer.horizontalPadding
  },
  createAccHeading:{
    ...Fonts.fontBold,
    ...Fonts.h4,
    marginTop:25,
    marginBottom:8,
  },
  subHeading:{
    ...Fonts.h2,
    ...Fonts.fontMedium,
  },
  iconsRightText:{
    fontSize:18,
    color:'#7f7e7e',
  },
  iconsRightTextWeight:{
    fontSize:17,
    color:'#7f7e7e',
  },
  inputLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    marginBottom:5,
  },
  countryLabel:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
    color:'#605E5E',
    flex:1,
  },
  inputPicker2:{
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
  countrydropIcon:{
    color:'#605E5E',
    fontSize:10,
    justifyContent:'flex-end'
  },
  pickerList:{
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomColor: '#E4EAEC',
    borderBottomWidth: 1,
  },
  pickerText:{
    ...Fonts.fontMedium,
    ...Fonts.h2,
  },
  countryPickerWrap:{
    borderWidth:1,
    borderColor:'#c8c8c8',
    paddingVertical:15,
    paddingLeft:10,
    paddingRight:24,
    marginBottom:20,
  },
  countrypicker:{
    backgroundColor:Colors.white,
    // height:40,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  Countrytext:{
    color:'#605E5E',
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
  inputPicker:{
    ...Platform.select({
      ios: {
        backgroundColor:'#fff',
        paddingVertical:2,
        marginBottom:15,
        borderTopWidth:1,
        borderLeftWidth:1,
        borderRightWidth:1,
        borderBottomWidth:1,
        borderColor:'#c8c8c8',
        borderRadius:2,
      },
      android: {
        backgroundColor:'#fff',
        paddingVertical:0,
        paddingHorizontal:10,
        marginBottom:15,
        borderTopWidth:1,
        borderLeftWidth:1,
        borderRightWidth:1,
        borderBottomWidth:1,
        borderColor:'#c8c8c8',
        borderRadius:2,
        flex:1
      }
    })
  },
  weightTab:{
    flexDirection:'row',
    backgroundColor:'#ebeff3',
    borderWidth:1,
    borderColor:'#c8c8c8',
    borderRadius:3,
    marginBottom:10,
  },
  lbBttn:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  kgBttn:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  bttnText:{
    flex:1,
    fontSize:15,
    paddingVertical:5,
    alignSelf:'center',
  },
  buttonSelectedLeft:{
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#c8c8c8',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  buttonSelectedRight:{
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#c8c8c8',
    borderTopLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  bttnWrap: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: '#D2D3D6'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  warnText:{
    ...Fonts.sub,
    ...Fonts.fontMedium,
    color:Colors.red,
    marginBottom:10,
    // paddingRight:20,
    flexShrink: 1
  }
})