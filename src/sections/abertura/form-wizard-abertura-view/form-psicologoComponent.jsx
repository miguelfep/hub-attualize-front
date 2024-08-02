import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, MenuItem, TextField, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function PsicologoComponent() {
  const { control } = useFormContext();

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Informações para o segmento de Psicologia
      </Typography>

      <Box mb={3}>
        <Controller
          name="stepThree.cidade"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Qual sua cidade?"
              variant="filled"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Box>

      <Box mb={3}>
        <Controller
          name="stepThree.faturamentoMedio"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Qual sua média de faturamento atual?"
              variant="filled"
              fullWidth
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { min: 0 } }} // Para garantir que o valor não seja negativo
            />
          )}
        />
      </Box>

      <Box mb={3}>
        <Controller
          name="stepThree.despesasMedias"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Qual sua média de despesas?"
              variant="filled"
              fullWidth
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { min: 0 } }} // Para garantir que o valor não seja negativo
            />
          )}
        />
      </Box>

      <Box mb={3}>
        <Controller
          name="stepThree.formaAtuacao"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Qual sua forma de atuação?"
              variant="filled"
              fullWidth
              select
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="emCasa">Em casa</MenuItem>
              <MenuItem value="sublocaEspaco">Subloca espaço</MenuItem>
              <MenuItem value="clinicaPropria">Clínica própria</MenuItem>
              <MenuItem value="outro">Outro</MenuItem>
            </TextField>
          )}
        />
      </Box>
    </Box>
  );
}
