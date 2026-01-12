'use client';

import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

export function AulaArquivoFields({ register, watch, setValue, errors }) {
  const conteudo = watch('conteudo') || {};
  const urlArquivo = conteudo.urlArquivo || '';

  return (
    <TextField
      label="URL do Arquivo"
      value={urlArquivo}
      onChange={(e) => {
        setValue('conteudo.urlArquivo', e.target.value, { shouldValidate: true });
      }}
      error={!!errors.conteudo?.urlArquivo}
      helperText={errors.conteudo?.urlArquivo?.message || 'Cole a URL do arquivo para download'}
      fullWidth
      required
    />
  );
}

