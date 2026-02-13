'use client';

import * as zod from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useRecompensas } from 'src/hooks/use-recompensas';

import { fCurrency } from 'src/utils/format-number';
import { formatChavePix } from 'src/utils/formatters';
import { validarChavePix, getPlaceholderChavePix } from 'src/utils/validators';

// ----------------------------------------------------------------------

const TIPOS_CHAVE_PIX = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'Email' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

const PixSchema = zod.object({
  valor: zod.number().min(1, { message: 'Valor deve ser maior que zero' }),
  tipoChave: zod.string().min(1, { message: 'Selecione o tipo de chave' }),
  chavePix: zod.string().min(1, { message: 'Chave PIX é obrigatória' }),
});

// ----------------------------------------------------------------------

export function SolicitarPixDialog({ open, onClose, saldoDisponivel }) {
  const { solicitarPix, temSaldoSuficiente, buscarConta, conta } = useRecompensas();

  useEffect(() => {
    if (open) {
      buscarConta();
    }
  }, [open, buscarConta]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(PixSchema),
    defaultValues: {
      valor: 0,
      tipoChave: 'email',
      chavePix: '',
    },
  });

  const valorWatch = watch('valor');
  const tipoChaveWatch = watch('tipoChave');
  const chavePixWatch = watch('chavePix');

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Use a prop saldoDisponivel diretamente. É mais garantido!
      if (data.valor > saldoDisponivel) {
        setError('valor', { message: 'Saldo insuficiente' });
        return;
      }
  
      // Validar chave PIX conforme tipo
      if (!validarChavePix(data.chavePix, data.tipoChave)) {
        setError('chavePix', { 
          message: `Chave PIX inválida para o tipo ${TIPOS_CHAVE_PIX.find(t => t.value === data.tipoChave)?.label}` 
        });
        return;
      }
  
      await solicitarPix(data.valor, data.chavePix);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao solicitar PIX:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUseMaxValue = () => {
    setValue('valor', saldoDisponivel);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar PIX</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Solicite o pagamento do seu saldo de recompensas via PIX. Após a aprovação, o valor será transferido para sua chave PIX.
          </Typography>

          <Alert severity="warning">
            A solicitação ficará pendente até ser aprovada por um administrador.
          </Alert>

          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: 'success.lighter',
            }}
          >
            <Typography variant="subtitle2" color="success.darker">
              Saldo disponível:
            </Typography>
            <Typography variant="h6" color="success.darker">
              {fCurrency(saldoDisponivel)}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Valor a receber</Typography>
              <Button 
                size="small" 
                onClick={handleUseMaxValue}
                disabled={saldoDisponivel === 0}
              >
                Usar máximo
              </Button>
            </Stack>

            <TextField
              {...register('valor', { valueAsNumber: true })}
              label="Valor"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={!!errors.valor}
              helperText={errors.valor?.message}
            />

            {valorWatch > saldoDisponivel && (
              <Typography variant="caption" color="error">
                Valor maior que o saldo disponível
              </Typography>
            )}
          </Stack>

          <TextField
            {...register('tipoChave')}
            select
            label="Tipo de Chave PIX"
            fullWidth
            error={!!errors.tipoChave}
            helperText={errors.tipoChave?.message}
          >
            {TIPOS_CHAVE_PIX.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            {...register('chavePix')}
            label="Chave PIX"
            fullWidth
            placeholder={getPlaceholderChavePix(tipoChaveWatch)}
            error={!!errors.chavePix}
            helperText={errors.chavePix?.message || 'Informe a chave PIX onde deseja receber o valor'}
            onChange={(e) => {
              const formatted = formatChavePix(e.target.value, tipoChaveWatch);
              setValue('chavePix', formatted);
              clearErrors('chavePix');
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={valorWatch > saldoDisponivel || valorWatch === 0}
        >
          Solicitar PIX
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
