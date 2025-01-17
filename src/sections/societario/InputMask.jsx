import InputMask from 'react-input-mask';
import React, { forwardRef } from 'react';

import { TextField } from '@mui/material';

// Encapsulador do InputMask com forwardRef
const MaskedInput = forwardRef((props, ref) => {
  const { mask, value, onChange, ...rest } = props;

  return (
    <InputMask mask={mask} value={value} onChange={onChange} {...rest}>
      {(inputProps) => <TextField {...inputProps} inputRef={ref} />}
    </InputMask>
  );
});

export default MaskedInput;
