import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Fonts, Alignment} from '../../Theme';
const {width} = Dimensions.get('window');

export default styles = StyleSheet.create({
  activityIndicator: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  camera: {
    flex: 0.9,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rectangle: {
    width: width * 0.9,
    height: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.blue,
  },
  gradientBackground: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  captureButtonInner: {
    borderWidth: 2,
    borderColor: Colors.ButtonColor,
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  fontStyleST: {
    ...Fonts.fontMedium,
    ...Fonts.large,
    textAlign: 'center',
    marginVertical: 2,
    color: Colors.blue,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorViewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  colorView: {
    width: 90,
    height: 90,
    backgroundColor: Colors.ButtonColor,
  },
  bttnWrap: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    // marginTop:10,
    paddingVertical: 15,
    paddingHorizontal: 7,
  },
  bttnArea: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingLeft: 0,
    paddingRight: 0,
    ...Alignment.fill,
  },
  buttonText: {
    ...Fonts.fontSemiBold,
    color: '#fff',
    ...Fonts.h2,
    // hack with negative margin:
    // without this, text is wrapper with ellipsis even when it should not
    // 0 margin, 0 padding in parent button component didn't help
    marginLeft: -5,
    marginRight: -5,
  },
  cancelBttn: {
    borderWidth: 1,
    borderColor: Colors.blue,
    color: Colors.blue,
  },
});
