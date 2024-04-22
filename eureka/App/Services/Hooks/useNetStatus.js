import { useState } from 'react';

export const useNetStatus = initialValue => {
  const [value, setValue] = useState(initialValue);
  console.log('value',value);
  
  if (value !== false && value.name === 'Error') {
    setValue(true)
  }
  return [value, setValue];
};
