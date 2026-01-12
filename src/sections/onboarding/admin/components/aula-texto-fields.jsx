'use client';

import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

export function AulaTextoFields({ register, watch, setValue, errors }) {
  const conteudo = watch('conteudo') || {};
  const texto = conteudo.texto || '';

  return (
    <TextField
      label="Conteúdo do Texto"
      value={texto}
      onChange={(e) => {
        setValue('conteudo.texto', e.target.value, { shouldValidate: true });
      }}
      error={!!errors.conteudo?.texto}
      helperText={errors.conteudo?.texto?.message}
      fullWidth
      multiline
      rows={10}
      required
    />
  );
}

