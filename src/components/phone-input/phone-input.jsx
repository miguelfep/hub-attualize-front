import { useState, useEffect, forwardRef } from 'react';
import PhoneNumberInput from 'react-phone-number-input/input';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { getCountryCode } from './utils';
import { CountryListPopover } from './list';

// ----------------------------------------------------------------------

export const PhoneInput = forwardRef(
  ({ value, onChange, placeholder, country: inputCountryCode, disableSelect, ...other }, ref) => {
    const defaultCountryCode = getCountryCode(value, inputCountryCode);

    const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);

    useEffect(() => {
      const nextCountry = getCountryCode(value, inputCountryCode);
      setSelectedCountry((prev) => (prev === nextCountry ? prev : nextCountry));
    }, [value, inputCountryCode]);

    return (
      <PhoneNumberInput
        ref={ref}
        country={selectedCountry}
        inputComponent={CustomInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'Digite o numero'}
        InputProps={
          disableSelect
            ? undefined
            : {
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <CountryListPopover
                    countryCode={selectedCountry}
                    onClickCountry={(code) => {
                      setSelectedCountry(code);
                      if (code !== selectedCountry && value && onChange) {
                        onChange('');
                      }
                    }}
                  />
                </InputAdornment>
              ),
            }
        }
        {...other}
      />
    );
  }
);

// ----------------------------------------------------------------------

const CustomInput = forwardRef(({ ...props }, ref) => <TextField inputRef={ref} {...props} />);
