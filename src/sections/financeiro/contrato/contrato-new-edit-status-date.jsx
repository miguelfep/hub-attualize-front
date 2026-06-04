import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Formata o percentual de reajuste em pt-BR com sinal explícito (ex.: +0,47% / -0,30%)
const formatPercentualReajuste = (value) => {
  if (value == null) return '—';
  const formatted = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sinal = value < 0 ? '-' : '+';
  return `${sinal}${formatted}%`;
};

export function ContratoNewEditStatusDate({ currentContrato }) {
  const { watch } = useFormContext();

  const possuiReajusteAnual = watch('possuiReajusteAnual');

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

      {/* Emissão de NF após toggles */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Switch name="emitirNotaFiscal" label="Emitir Nota Fiscal" />
      </Stack>

      {watch('emitirNotaFiscal') && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Field.Select
            fullWidth
            name="momentoEmissaoNota"
            label="Momento de Emissão"
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="pagamento">Após pagamento</MenuItem>
          </Field.Select>
        </Stack>
      )}

      {/* Reajuste anual (percentual fixo do contrato) */}
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <Field.Switch name="possuiReajusteAnual" label="Possui reajuste anual" />

        {possuiReajusteAnual && (
          <Field.Text
            type="number"
            name="percentualReajusteAnual"
            label="Percentual anual de reajuste"
            placeholder="6"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            sx={{ maxWidth: { sm: 240 } }}
          />
        )}
      </Stack>

      {possuiReajusteAnual && (
        <>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Ao completar 12 meses desde o início do contrato (ou desde o último reajuste), o valor da
            mensalidade é reajustado automaticamente pelo percentual configurado acima.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <Field.DatePicker
              name="dataUltimoReajuste"
              label="Data do último reajuste"
              slotProps={{
                textField: {
                  fullWidth: false,
                  helperText:
                    'Preencha para contratos que já tiveram reajuste mas não foi registrado — o próximo reajuste contará 12 meses a partir desta data.',
                },
                field: { clearable: true },
              }}
              sx={{ maxWidth: { sm: 280 } }}
            />

            {currentContrato?.percentualUltimoReajuste != null && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Percentual aplicado no último reajuste
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                    color:
                      currentContrato.percentualUltimoReajuste < 0 ? 'error.main' : 'success.main',
                  }}
                >
                  {formatPercentualReajuste(currentContrato.percentualUltimoReajuste)}
                </Typography>
              </Box>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
