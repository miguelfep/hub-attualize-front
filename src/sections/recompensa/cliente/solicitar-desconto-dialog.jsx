'use client';

import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios from 'src/utils/axios';

import { fCurrency } from 'src/utils/format-number';

import { useRecompensas } from 'src/hooks/use-recompensas';

// ----------------------------------------------------------------------

const DescontoSchema = zod.object({
  contratoId: zod.string().min(1, { message: 'Selecione um contrato' }),
  valor: zod.number().min(1, { message: 'Valor deve ser maior que zero' }),
});

// ----------------------------------------------------------------------

export function SolicitarDescontoDialog({ open, onClose, saldoDisponivel }) {
  const { solicitarDesconto, temSaldoSuficiente } = useRecompensas();
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(DescontoSchema),
    defaultValues: {
      contratoId: '',
      valor: 0,
    },
  });

  const valorWatch = watch('valor');

  // Buscar contratos ativos
  useEffect(() => {
    if (open) {
      const fetchContratos = async () => {
        try {
          setLoadingContratos(true);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}contratos/all`, {
            params: { status: 'ativo' },
          });
          setContratos(response.data || []);
        } catch (error) {
          console.error('Erro ao buscar contratos:', error);
        } finally {
          setLoadingContratos(false);
        }
      };

      fetchContratos();
    }
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!temSaldoSuficiente(data.valor)) {
        throw new Error('Saldo insuficiente');
      }

      await solicitarDesconto(data.contratoId, data.valor);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao solicitar desconto:', error);
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
      <DialogTitle>Solicitar Desconto</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Use seu saldo de recompensas para obter desconto na próxima cobrança de um contrato ativo.
          </Typography>

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

          <TextField
            select
            {...register('contratoId')}
            label="Contrato"
            fullWidth
            disabled={loadingContratos}
            error={!!errors.contratoId}
            helperText={errors.contratoId?.message || 'Selecione o contrato onde deseja aplicar o desconto'}
          >
            {contratos.map((contrato) => (
              <MenuItem key={contrato._id} value={contrato._id}>
                {contrato.titulo || `Contrato ${contrato._id.substring(0, 8)}`}
              </MenuItem>
            ))}
          </TextField>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Valor do desconto</Typography>
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
          Solicitar Desconto
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
