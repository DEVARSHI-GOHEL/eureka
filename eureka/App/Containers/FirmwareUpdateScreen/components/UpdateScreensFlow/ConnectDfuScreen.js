import React from 'react';
import {Image, Text, View} from 'react-native';
import {styles} from "./styles";
import {CONNECT_DFU_STEP} from "./config";

const ConnectDfuScreen = () => {
const {description, image}= CONNECT_DFU_STEP;
  return (<View style={[styles.container, {flex: 1, paddingTop: '30%', paddingBottom: '20%'}]}>
    <Text style={styles.description}>{description}</Text>
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={image} width={200} height={300}/>
    </View>
  </View>
  )
}

export default ConnectDfuScreen;
