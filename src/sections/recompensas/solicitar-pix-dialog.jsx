'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';

import { fCurrency } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { solicitarPix } from 'src/actions/recompensas';

// ----------------------------------------------------------------------

const schema = zod.object({
  valor: zod
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(1000000, 'Valor muito alto'),
  chavePix: zod.string().min(1, 'Chave PIX é obrigatória'),
});

const defaultValues = {
  valor: 0,
  chavePix: '',
};

// ----------------------------------------------------------------------

export function SolicitarPixDialog({ open, onClose, onSuccess, saldoDisponivel }) {
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const valor = watch('valor');

  const onSubmit = handleSubmit(async (data) => {
    if (data.valor > saldoDisponivel) {
      toast.error('Valor solicitado é maior que o saldo disponível');
      return;
    }

    try {
      setLoading(true);
      await solicitarPix({
        valor: data.valor,
        chavePix: data.chavePix,
      });

      toast.success('PIX solicitado com sucesso! Aguarde a aprovação.');
      methods.reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao solicitar PIX:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao solicitar PIX';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <Iconify icon="solar:card-receive-bold" width={24} sx={{ mr: 1, verticalAlign: 'middle' }} />
          Solicitar PIX
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Field.Text
              name="valor"
              label="Valor"
              type="number"
              helperText={`Saldo disponível: ${fCurrency(saldoDisponivel)}`}
            />

            <Field.Text
              name="chavePix"
              label="Chave PIX"
              helperText="Email, CPF, CNPJ ou chave aleatória"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
            disabled={!valor || valor > saldoDisponivel}
          >
            Solicitar
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
