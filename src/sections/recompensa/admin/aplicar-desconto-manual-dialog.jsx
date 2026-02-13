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
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const DescontoManualSchema = zod.object({
  contratoId: zod.string().min(1, { message: 'Selecione um contrato' }),
  valor: zod.number().min(0.01, { message: 'Valor deve ser maior que zero' }),
  descricao: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function AplicarDescontoManualDialog({ open, onClose, onConfirm, loading }) {
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
    resolver: zodResolver(DescontoManualSchema),
    defaultValues: {
      contratoId: '',
      valor: 0,
      descricao: '',
    },
  });

  const contratoIdWatch = watch('contratoId');
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


          setContratos(response.data.contratos || []);
        } catch (error) {
          console.error('Erro ao buscar contratos:', error);
        } finally {
          setLoadingContratos(false);
        }
      };

      fetchContratos();
    } else {
      reset();
    }
  }, [open, reset]);

  const contratoSelecionado = contratos.find((c) => c._id === contratoIdWatch);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onConfirm(data.contratoId, data.valor, data.descricao || '');
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao aplicar desconto manual:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aplicar Desconto Manual</DialogTitle>

      <DialogContent>
        <form onSubmit={onSubmit} id="desconto-manual-form">
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Aplique um desconto diretamente em uma cobrança sem consumir saldo de recompensa.
            </Typography>

            <TextField
              {...register('contratoId')}
              select
              label="Contrato"
              fullWidth
              required
              error={!!errors.contratoId}
              helperText={errors.contratoId?.message}
              disabled={loadingContratos}
            >
              {loadingContratos ? (
                <MenuItem disabled>Carregando contratos...</MenuItem>
              ) : (
                contratos.map((contrato) => (
                  <MenuItem key={contrato._id} value={contrato._id}>
                    {contrato.titulo || `Contrato ${contrato._id.slice(-6)}`}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              {...register('valor', { valueAsNumber: true })}
              label="Valor do Desconto"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              error={!!errors.valor}
              helperText={errors.valor?.message}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
              }}
            />

            <TextField
              {...register('descricao')}
              label="Descrição (opcional)"
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Desconto promocional especial"
              error={!!errors.descricao}
              helperText={errors.descricao?.message}
            />

            {contratoSelecionado && valorWatch > 0 && (
              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  O desconto será aplicado na próxima cobrança pendente do contrato selecionado.
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Valor do desconto: {fCurrency(valorWatch)}
                </Typography>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              ⚠️ Este desconto não consome saldo de recompensa do cliente.
            </Typography>
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || isSubmitting}>
          Cancelar
        </Button>
        <LoadingButton
          type="submit"
          form="desconto-manual-form"
          variant="contained"
          color="primary"
          loading={loading || isSubmitting}
        >
          Aplicar Desconto
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
