import {StyleSheet} from 'react-native';
import {Colors, Fonts, Alignment} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: 'red',
  },
  gradientContainer: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  sliderWrap: {
    flex: 1,
    //backgroundColor:'red'
  },
  paginationDots: {
    //backgroundColor:'green',
    // position:'absolute',
    // left:0,
    // bottom:-5,
    // width:'100%',
    height: 10,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  imageContent: {
    marginBottom: 15,
    flex: 1,
  },
  getStartedView: {
    alignItems: 'center',
  },
  imageItemDimensions: {
    resizeMode: 'contain',
    height: 280,
    width: '100%',
  },
  heading: {
    ...Fonts.fontBold,
    ...Fonts.h4,
    textAlign: 'center',
    marginBottom: 15,
    flex: 1,
  },
  sliderbttomText: {
    //backgroundColor:'green',
    flex: 4,
    height: 140,
  },
  subHeading: {
    ...Fonts.fontBold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    textAlign: 'center',
  },
  startBttnWrap: {
    width: '100%',
    marginTop: 20,
    // alignItems: 'center',
  },
  calibrateBttn: {
    flex: 1,
  },
  linkTextStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  rightText: {
    ...Fonts.h3,
    ...Fonts.fontMedium,
    color: Colors.ButtonColor,
    marginLeft: 5,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.ButtonColor,
  },
  btnRow: {
    ...Alignment.fillRowCenter,
    marginTop: 5,
  },
  leftMargin: {
    marginLeft: 10,
  },
});

// export default StyleSheet.create({
//   mainContainer:{
//     flex:1,
//   },
//   mainScrollView:{
//     flex:1,
//     backgroundColor:Colors.white
//   },
//   gradientContainer:{
//     flex:1,
//     paddingTop:30,
//     paddingBottom:20,
//     paddingHorizontal:15,

//   },
// })
