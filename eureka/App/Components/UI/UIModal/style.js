import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../Theme';

export default StyleSheet.create({
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor:'#F1FAFE'
  },
  modalView: {
    paddingVertical:20,
    marginHorizontal:20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalTopArea:{
    paddingHorizontal:5,
    marginBottom:10,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  closeIconWrap:{
    alignItems:'flex-end',
    marginBottom:5,
    marginRight:10,
  },
  closeIcon:{
    ...Fonts.medium,
    color:Colors.blue
  },
});
