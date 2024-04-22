import { StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../Theme';

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer:{
    flex:1,
    backgroundColor: Colors.white
  },
  scrollContainer:{
    backgroundColor: Colors.homeBackground,
    flex:1,
  },
  cardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  cardText1: {
    color: Colors.gray
  },
  cardText2: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 16
  },
  cardText3: {
    color: Colors.black,
    fontWeight: '700'
  },
  headerIconWrap: {
    marginHorizontal: 15,
    padding:5
  },
  
  headerMenuIcon: {
    fontSize: 30,
  },
  feedbackTextfield:{
    paddingVertical:10,
    height:100,
  },
  healthOverviewBox:{
    backgroundColor: Colors.white,
    borderRadius: 5,
    elevation: 1,
    flex: 1,
    marginBottom: 5,
    marginHorizontal: 20,
    marginTop: 15,
    overflow: 'hidden',
    paddingLeft: 0,
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: {
      height: 0,
      width: 0
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%'
  },
  addRedColor:{
    backgroundColor: Colors.redAlert,
    flex:1,
    borderWidth:8,
    borderColor: Colors.redAlertBorder,
    borderRadius:65,
    paddingLeft:9,
    paddingTop:13,
  },
  addYellowColor:{
    backgroundColor: Colors.yellowAlert,
    flex:1,
    borderWidth:8,
    borderColor: Colors.border,
    borderRadius:65,
    paddingLeft:9,
    paddingTop:13,
  },
  addOrangeColor:{
    backgroundColor: Colors.orangeAlert,
    flex:1,
    borderWidth:8,
    borderColor: Colors.orangeAlertBorder,
    borderRadius:65,
    paddingLeft:9,
    paddingTop:13,
  },
  bellArea:{
    position:'absolute',
    top:-15,
    left:-15,
    zIndex:99999,
    height:70,
    width:70,
    borderRadius:35,
  },
  bttnWrap: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: Colors.borderColor,
  },
  calibrateTopText:{
    marginHorizontal:15,
    flexDirection:'row',
    paddingLeft:10,
    paddingRight:20,
    borderRadius:5,
    backgroundColor:Colors.white,
    marginBottom:15,
  },
  infoIcon:{
    ...Fonts.h3,
    width:30,
  },
  subHeading:{
    ...Fonts.h3,
    ...Fonts.fontSemiBold,
    paddingLeft:10,
    marginHorizontal:10,
    paddingBottom:10,
    borderBottomWidth:1, 
    borderColor: Colors.secondLightGray,
  },
  viewStyle:{
    paddingLeft:10,
    marginHorizontal:10,
    flex:1,
  },
  subHeading2:{
    ...Fonts.h3,
    ...Fonts.fontBold,
    marginBottom:10
    
  },
  title:{
    marginStart: 75, 
    marginTop: 25,
    marginBottom:15,
    paddingBottom:20,
    marginEnd:20,
    borderBottomWidth:1, 
    borderColor: Colors.secondLightGray,
  },row:{
    flexDirection:'row',
    flex:1,
  },
  dot:{
    ...Fonts.h3,
    width:10,
    height:10,
    borderRadius:5,
    backgroundColor:Colors.black,
    marginEnd:10,
    marginTop:6,
  },
  text:{
    ...Fonts.h3,
    ...Fonts.fontSemiBold,
    flex:1,
  },
  buttonsView: {
    padding: 20
  }
})

export default styles;
