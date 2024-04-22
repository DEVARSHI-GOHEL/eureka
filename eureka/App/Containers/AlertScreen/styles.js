import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerIconWrap: {
    marginHorizontal: 15,
    padding: 5,
  },

  headerMenuIcon: {
    fontSize: 30,
  },
  mainScrollView: {
    flex: 1,
  },
  tabArea: {
    flex: 1,
  },
  tabGraphAreaWrap: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  bellArea: {
    position: 'absolute',
    top: -15,
    left: -15,
    zIndex: 99999,
    height: 70,
    width: 70,
    borderRadius: 35,
  },
  alertCard: {
    width: '100%',

    paddingLeft: 0,
    overflow: 'hidden',
    borderRadius: 5,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    backgroundColor: Colors.white,
    marginVertical: 5,

  },
  healthOverviewWrap: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    height: 50,
  },
  isNew: {
    position: "absolute",
    top: 0,
    left: -7,
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: Colors.blue,
    borderColor: Colors.white,
    borderWidth: 2,
    elevation: 2,
  },
  isNewEdit: {
    left: 53,
  },
  addRedColor: {
    backgroundColor: Colors.redAlert,
    flex: 1,
    borderWidth: 8,
    borderColor: Colors.redAlertBorder,
    borderRadius: 65,
    paddingLeft: 9,
    paddingTop: 13,
  },
  addYellowColor: {
    backgroundColor: Colors.yellowAlert,
    flex: 1,
    borderWidth: 8,
    borderColor: Colors.border,
    borderRadius: 65,
    paddingLeft: 9,
    paddingTop: 13,
  },
  addOrangeColor: {
    backgroundColor: Colors.orangeAlert,
    flex: 1,
    borderWidth: 8,
    borderColor: Colors.orangeAlertBorder,
    borderRadius: 65,
    paddingLeft: 9,
    paddingTop: 13,
  },
  bttnWrap: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: Colors.borderColor,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly'
  },
  checkboxColor: {
    borderColor: Colors.checkBoxBorderColor,
    borderRadius: 3,
  },
  renderAlertItemView: {
    alignItems: 'center',
    width: '100%',
  },
  pickerView: {
    maxWidth: 150,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  flex1: {
    flex: 1
  },
  row: {
    width: '100%',
    flexDirection: 'row'
  },
  renderAlertsView: {
    backgroundColor: Colors.homeBackground,
    flex: 1,
  }
});
