import React from 'react';
import PhoneInput from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';

export function CustomPhoneInput({ value, onChange, error, helperText, ...props }) {
  return (
    <div>
      <PhoneInput value={value} onChange={onChange} {...props} />
      {helperText && <p>{helperText}</p>}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
