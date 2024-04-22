import React from 'react';
import {
  Text
} from 'react-native';

import {Fonts} from '../../Theme'

const defaultState = {
    show : false,
    date: '--',
  }
  
  export default class TabReadingMonth extends React.Component {
  
    constructor(props) {
      super(props);
      this.state = (props && props.initData ) ? this.getNextState(props.initData) : defaultState;
    
    }
  
    setReading = (attr) => {
  
      let nextState = this.getNextState(attr);
  
      this.setState(nextState);
      //attr.show = true;
      //this.setState({...this.state, ...attr});
    }
  
    getNextState = (attr) => {

      return {
        show : true, 
        date : attr
      };
    }
  
    render () {
        if(!this.state.show)
          return <Text />;
  
        return (
          <>
            <Text style={{ ...Fonts.fontSemiBold, ...Fonts.medium, }}>{this.state.date}</Text>
          </>
        );
    }
  }