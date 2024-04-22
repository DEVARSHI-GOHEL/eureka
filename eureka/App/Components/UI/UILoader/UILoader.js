import React from 'react';
import {View, Text} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {UILoaderSvgIcon} from '../UISvgIcon';
import { Colors, Fonts } from '../../../Theme';
export function UILoader({
  title,
  ...props
}) {
  Animatable.initializeRegistryWithDefinitions({
    widthAni: {
      0: {
        opacity: 0.8,
        scale: 0.22,
      },
      0.5: {
        opacity: 0.9,
        scale: 0.25,
      },
      1: {
        opacity: 1,
        scale: 0.25,
      },
    },
  });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,1)',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 999,
      }}>
      <Animatable.View
        animation={'widthAni'}
        iterationCount="infinite"
        easing="linear"
        direction="alternate"
        style={{marginTop: -120}}>
        <View>
          <UILoaderSvgIcon fill={'#08C2F9'} />
        </View>
      </Animatable.View>
        <View style={{ position:'absolute', top:'50%', width:'100%', paddingHorizontal:'10%', alignItems:'center'}}><Text style={{ fontSize:21, color: Colors.gray, ...Fonts.fontMedium, textAlign:'center'}}>{title}</Text></View>
    </View>
  );
}
