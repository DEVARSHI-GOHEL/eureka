import React from 'react';
import {Label} from 'native-base';
import {TextInput, View} from 'react-native';
import styles from './style';

/**
 *
 * @param {*} param0
 * @param {*} ref
 */

export const UITextInput = React.forwardRef(
  (
    {
      containerStyle,
      iconsRight = null,
      labelText = null,
      labelEmptyLabelText = false,
      iconsText = null,
      error = false,
      placeholder,
      inputRef,
      ...props
    },
    ref,
  ) => {
    return (
      <View style={[styles.textInputWrap,containerStyle]}>
        {labelText && (
          <View style={styles.inputLabelWrap}>
            <Label style={[styles.inputLabel, error && {color: 'red'},{...props.labelStyles}]}>
              {labelText}
            </Label>
          </View>
        )}
        {/* {labelEmptyLabelText &&
        <View style={styles.inputLabelWrap}/>
      } */}
        <View style={[styles.textInputIconWrap, error && {borderColor: 'red'}]}>
          <TextInput
            {...props}
            ref={ref}
            placeholder={placeholder}
            placeholderTextColor="gray"
            style={[
              styles.inputFields,
              error && {color: 'red'},
              {...props.style},
              iconsRight ? {paddingRight: 15} : {},
              iconsText ? {paddingRight: 15} : {},
            ]}
          />

          {iconsRight && <View style={styles.inputIconWrap}>{iconsRight}</View>}

          {iconsText && <View style={styles.inputTextWrap}>{iconsText}</View>}
        </View>
      </View>
    );
  },
);

// const UITextInput = React.forwardRef(UIInput);

// export { UITextInput };
