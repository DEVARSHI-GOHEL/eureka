import React from 'react';
import { View, Platform } from 'react-native';
import {UITextSemiBold} from '../UIText';
import * as Animatable from 'react-native-animatable';

Animatable.initializeRegistryWithDefinitions({
  toastAnimation: {
    from: {
      opacity: 0,
      height:0,
    },
    to: {
      opacity: 1,
      height:36,
    },
  },
  toastAnimationOut: {
    from: {
      opacity: 1,
      height:36,
    },
    to: {
      opacity: 0,
      height:0,
    },
  }
});


export function UIToast({ 
  children, 
  rightIcon,
  message,
  leftIcon,
  isVisibleProperty,
  BgColor,
  typeProperty = 'lightgray',
  textColor,
  animateName = 'toastAnimation',
  isTimeOut = false,
  ...props 
}) {

  const [animateNameState, setAnimateNameState] = React.useState('toastAnimation')
  React.useEffect(()=>{
    
  },[])

  return (
    <Animatable.View 
    // animation={animateNameState} 
    animation="slideInDown"
    iterationCount={1}
    style={[{
      backgroundColor:(typeProperty && typeProperty===1)? '#1AA65E' : '#ff4d4d',
      // marginTop:10,
      position:'relative',
      paddingHorizontal: 15,
      paddingVertical:5,
      alignItems:'center',
      zIndex:9999,
      width:'100%',
      flexDirection:'row',
      // height:90
    }, props.style]}
    accessibilityLabel="toast-message"
  >
    { leftIcon &&
      <View style={{ flexDirection:'row', marginRight:10,}}>
        {leftIcon} 
      </View>
    }
    
    {
      Platform.OS == "ios" ? (
        <UITextSemiBold
          numberOfLines={2} 
          adjustsFontSizeToFit
          style={{
            fontSize: 15,
            color: '#000',
            flex:1,
            paddingRight:10
          }}
        >
          {message} 
        </UITextSemiBold>
      ) :
      (<UITextSemiBold
          style={{
            fontSize: 15,
            color: '#000',
            flex:1,
            paddingRight:10
          }}
        >
          {message} 
        </UITextSemiBold>)
    }
    
      { rightIcon &&
        <View style={{ flexDirection:'row', marginRight:10,}}>
          {rightIcon}
        </View>
      }
  </Animatable.View>
  );
}
