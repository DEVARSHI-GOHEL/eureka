import { StyleSheet } from 'react-native';
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
    ...Spacer.horizontalPadding,
    ...Spacer.mediumVerticalPadding
  },
  topArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E3E6'
  },
  arrowIcon: {
    ...Fonts.medium,
    color: '#BDBDBD'
  },
  activeIcon: {
    color: Colors.black
  },
  dateText: {
    ...Fonts.fontSemiBold,
    ...Fonts.h3,
  },
  mealRow: {
    flex: 1,
  },
  mealBox: {
    paddingHorizontal:15,
    paddingTop:15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom:10
  },
  deletemealIcon: {
    fontSize: 24,
    color: Colors.blue,
  },
  inputPicker: {
    ...Platform.select({
      ios: {
        backgroundColor: '#fff',
        paddingVertical: 2,
        marginBottom: 10,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#c8c8c8',
        borderRadius: 2,
      },
      android: {
        backgroundColor: '#fff',
        paddingVertical: 0,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#c8c8c8',
        borderRadius: 2,
      }
    })
  },
  bttnWrap: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: '#D2D3D6'
  },

  dropdownWrap: {
    borderWidth: 1,
    // padding:10
  },
  modalDropdownStyle: {
    width: '92%',
    // borderWidth:1
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#dddddd',
    borderBottomWidth: 0,
    shadowColor: '#777777',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    marginLeft:-10,
    // top:0,
    // position:'absolute'
  },
  modalDropdownTxtStyle: {
    color: '#000000',
    fontSize: 14
  },
  selectedModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:10,
    // borderWidth: 1,
    // height: 50
  },
  modalItem: {
    backgroundColor:'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:10,
    paddingVertical:5,
    // borderTopWidth: 1,
    // height: 50
  },
  iconStyle:{
    justifyContent:'center',
    alignItems:'center',
    height:20,
    marginTop:10,
    // borderWidth:1
  },
  selectedArrowWrap:{
    // borderWidth:1,
    flex:1,
    justifyContent:'flex-end',
    alignItems:'flex-end',
  },
  selectedTxt:{
    ...Fonts.fontBold,
    fontSize:16
  },
  emptyContent:{
    ...Fonts.fontBold,
    fontSize:30,
    marginHorizontal:15, 
    marginVertical:20
  }
});
