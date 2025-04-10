import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function ContratoNewEditStatusDate() {
  const { watch } = useFormContext();

  const values = watch();

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Encerrado' },
  ];

  const metodoCobrancaOptions = [
    { value: 'boleto', label: 'Boleto' },
    { value: 'cartao', label: 'Cartão' },
  ];

  const vencimentoOptions = [
    { value: 10, label: 'Dia 10' },
    { value: 15, label: 'Dia 15' },
    { value: 20, label: 'Dia 20' },
    { value: 30, label: 'Dia 30' },
  ];

  return (
    <Stack spacing={2} sx={{ p: 3, bgcolor: 'background.neutral' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Select fullWidth name="status" label="Status" InputLabelProps={{ shrink: true }}>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>

        <Field.DatePicker name="dataInicio" label="Data Inicio" />

        <Field.Select
          fullWidth
          name="dataVencimento"
          label="Vencimento"
          InputLabelProps={{ shrink: true }}
        >
          {vencimentoOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>

        <Field.Select
          fullWidth
          name="metodoCobranca"
          label="Metodo de Cobrança"
          InputLabelProps={{ shrink: true }}
        >
          {metodoCobrancaOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>
      </Stack>

      {/* New Toggles Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Switch name="cobrancaContabil" label="Cobrança Contábil" />
        <Field.Switch name="possuiDecimoTerceiro" label="Possui Décimo Terceiro" />
      </Stack>
    </Stack>
  );
}
