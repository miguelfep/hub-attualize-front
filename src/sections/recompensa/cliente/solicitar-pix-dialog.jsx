'use client';

import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

import { useRecompensas } from 'src/hooks/use-recompensas';

// ----------------------------------------------------------------------

const PixSchema = zod.object({
  valor: zod.number().min(1, { message: 'Valor deve ser maior que zero' }),
  chavePix: zod.string().min(1, { message: 'Chave PIX é obrigatória' }),
});

// ----------------------------------------------------------------------

export function SolicitarPixDialog({ open, onClose, saldoDisponivel }) {
  const { solicitarPix, temSaldoSuficiente } = useRecompensas();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(PixSchema),
    defaultValues: {
      valor: 0,
      chavePix: '',
    },
  });

  const valorWatch = watch('valor');

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!temSaldoSuficiente(data.valor)) {
        throw new Error('Saldo insuficiente');
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
            {...register('chavePix')}
            label="Chave PIX"
            fullWidth
            placeholder="Email, CPF, CNPJ ou chave aleatória"
            error={!!errors.chavePix}
            helperText={errors.chavePix?.message || 'Informe a chave PIX onde deseja receber o valor'}
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
