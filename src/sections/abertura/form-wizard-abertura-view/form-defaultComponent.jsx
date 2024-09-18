import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, Radio, TextField, Typography, RadioGroup, FormControlLabel } from '@mui/material';

import EstadoCidadeSelect from 'src/components/abertura/componente-estados-brasil';

// ----------------------------------------------------------------------

export default function DefaultComponent() {
  const { control } = useFormContext();

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Informações Gerais
      </Typography>

      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Como gostaria de receber o orçamento?
        </Typography>
        <Controller
          name="stepThree.receberOrcamento"
          control={control}
          render={({ field }) => (
            <RadioGroup row {...field}>
              <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
              <FormControlLabel value="email" control={<Radio />} label="Email" />
            </RadioGroup>
          )}
        />
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Onde irá ficar seu negócio?
      </Typography>

      {/* Espaço entre EstadoCidadeSelect e Observações */}
      <Box mb={3}>
        <EstadoCidadeSelect />
      </Box>

      {/* Campo para observações */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Fale um pouco sobre seu negocio!
        </Typography>
        <Box mb={3}>
          <Controller
            name="stepThree.observacoes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Historia"
                variant="filled"
                fullWidth
                multiline
                rows={4}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}
