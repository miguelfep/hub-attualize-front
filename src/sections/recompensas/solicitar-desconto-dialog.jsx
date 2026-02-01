'use client';

import { useState, useEffect } from 'react';
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

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { solicitarDesconto } from 'src/actions/recompensas';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const schema = zod.object({
  contratoId: zod.string().min(1, 'Selecione um contrato'),
  valor: zod
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(1000000, 'Valor muito alto'),
});

const defaultValues = {
  contratoId: '',
  valor: 0,
};

// ----------------------------------------------------------------------

export function SolicitarDescontoDialog({ open, onClose, onSuccess, saldoDisponivel }) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(true);

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

  useEffect(() => {
    if (open && user?.userId) {
      const carregarContratos = async () => {
        try {
          setLoadingContratos(true);
          const response = await axios.get(`${endpoints.contratos.cliente}/${user.userId}`);
          setContratos(response.data?.data || response.data || []);
        } catch (error) {
          console.error('Erro ao carregar contratos:', error);
          toast.error('Erro ao carregar contratos');
        } finally {
          setLoadingContratos(false);
        }
      };
      carregarContratos();
    }
  }, [open, user?.userId]);

  const onSubmit = handleSubmit(async (data) => {
    if (data.valor > saldoDisponivel) {
      toast.error('Valor solicitado é maior que o saldo disponível');
      return;
    }

    try {
      setLoading(true);
      await solicitarDesconto({
        contratoId: data.contratoId,
        valor: data.valor,
      });

      toast.success('Desconto solicitado com sucesso!');
      methods.reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao solicitar desconto:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao solicitar desconto';
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
          <Iconify icon="solar:tag-price-bold" width={24} sx={{ mr: 1, verticalAlign: 'middle' }} />
          Solicitar Desconto
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Field.Select
              name="contratoId"
              label="Contrato"
              disabled={loadingContratos}
              placeholder={loadingContratos ? 'Carregando contratos...' : 'Selecione um contrato'}
            >
              {contratos.map((contrato) => (
                <option key={contrato._id} value={contrato._id}>
                  {contrato.nome || contrato.descricao || `Contrato ${contrato._id}`}
                </option>
              ))}
            </Field.Select>

            <Field.Text
              name="valor"
              label="Valor do Desconto"
              type="number"
              helperText={`Saldo disponível: ${fCurrency(saldoDisponivel)}`}
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
