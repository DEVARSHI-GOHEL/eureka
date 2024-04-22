import React from 'react';
import {
  Text
} from 'react-native';

import {Fonts} from '../../Theme'

const defaultState = {
    show : false,
    date: '--',
  }
  
  export default class TabReadingDate extends React.Component {
  
    constructor(props) {
      super(props);
      
      this.state = (props && props.initData && props.initData.meta) ? this.getNextState(props.initData) : defaultState;
    }
  
    setReading = (attr) => {
  
      let nextState = this.getNextState(attr);
  
      this.setState(nextState);
      //attr.show = true;
      //this.setState({...this.state, ...attr});
    }
  
    getNextState = (attr) => {

      let date = attr.meta.dayOfTheWeekInWordsShort + ", " + attr.meta.dateInWordsShort

      return {
        show : true, 
        date 
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