import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFTextField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={
            type === 'number'
              ? field.value === undefined || field.value === null || Number.isNaN(field.value) || field.value === 0
                ? ''
                : field.value
              : (field.value ?? '')
          }
          onChange={(event) => {
            if (type === 'number') {
              const raw = event.target.value;
              field.onChange(raw === '' ? 0 : Number(raw));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputProps={{
            autoComplete: 'off',
          }}
          {...other}
        />
      )}
    />
  );
}
