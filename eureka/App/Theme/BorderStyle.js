/**
 * This file contains metric values that are global to the application.
 */
import Colors from './Colors';
import Spacer from './SpacerStyle';
import Alignment from './AlignmentStyle';

export default {
  borderBottom:{
    borderBottomWidth:1
  },
  borderTop:{
    borderTopWidth:1
  },

  commonBorder:{
    borderWidth:1
  },
  alertBorder:{
    borderWidth:8
  },

  buttonBorderWrap:{
    ...Spacer.horizontalPadding,
    borderTopWidth:1,
    borderTopColor: Colors.borderColor,
    ...Spacer.verticalPadding
  },
  doubleButtonWrap:{
    backgroundColor:Colors.white,
    ...Alignment.row,
    borderTopWidth:1, 
    paddingVertical:15, 
    paddingHorizontal:7.5,
    borderTopColor:'#D2D3D6'
  },

  commonDropdownStyle:{
    backgroundColor:'#fff',
    paddingVertical:2,
    marginTop:5,
    borderTopWidth:1, 
    borderLeftWidth:1, 
    borderRightWidth:1, 
    borderBottomWidth:1, 
    borderColor:'#c8c8c8',
    borderRadius:2,
  },


  tinyRadious:{
    borderRadius:3
  },
  smallRadious:{
    borderRadius:5
  },
  alertRadious:{
    borderRadius:65
  },

  textUnderline:{
    textDecorationLine:'underline'
  }
};
