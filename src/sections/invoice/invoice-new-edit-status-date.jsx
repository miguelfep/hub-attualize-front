import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function InvoiceNewEditStatusDate() {
  const { watch } = useFormContext();

  const values = watch();

  const statusOptions = [
    { value: 'pago', label: 'Pago' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'perdida', label: 'Perdida' },
    { value: 'orcamento', label: 'Orçamento' },
  ];

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <Field.Select fullWidth name="status" label="Status" InputLabelProps={{ shrink: true }}>
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Select>

      <Field.DatePicker name="createdDate" label="Data Criação" disabled />
      <Field.DatePicker name="dataVencimento" label="Vencimento" />
    </Stack>
  );
}
