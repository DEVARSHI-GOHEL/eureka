import React from 'react';
import {Tab} from 'native-base';
import styles from './style';

/**
 * 
 * @param {*} param0 
 * @param {*} ref 
 */

function UITab(

  {
    iconsRight = null,
    labelText = null,
    iconsText = null,
    error = false,
    placeholder,
    active,
    ...props
  },
  ref
) {
  return (<Tab 
    {...props}
    >
     {props.children}
    </Tab>
  )
}

export { UITab };
