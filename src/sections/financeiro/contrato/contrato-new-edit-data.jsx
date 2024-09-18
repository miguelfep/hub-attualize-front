import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function ContratoNewEditData() {
  const { watch } = useFormContext();

  // Observar o valor atual de tipoContrato no formulário
  const tipoContratoValue = watch('tipoContrato');

  return (
    <Stack
      spacing={1}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <Field.Text name="titulo" label="Titulo" helperText="Digite o titulo aqui" />

      <Field.Select
        name="tipoContrato"
        label="Tipo de Contrato"
        value={tipoContratoValue || ''}
        InputLabelProps={{ shrink: true }} // Manter o label sobre o select quando houver valor
      >
        <MenuItem value="normal">Normal</MenuItem>
        <MenuItem value="parceiroid">Parceiro ID</MenuItem>
      </Field.Select>
    </Stack>
  );
}
