'use client';

import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';

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

import { useRecompensas } from 'src/hooks/use-recompensas';
import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const DescontoSchema = zod.object({
  contratoId: zod.string().min(1, { message: 'Selecione um contrato' }),
  valor: zod.string().min(1, { message: 'Informe o valor' }).transform((val) => {
    const cleaned = val.replace(/\D/g, '');
    return parseFloat(cleaned) / 100;
  }).refine((val) => val > 0, { message: 'O valor deve ser maior que zero' }),
});

// ----------------------------------------------------------------------

export function SolicitarDescontoDialog({ open, onClose, saldoDisponivel }) {
  const { solicitarDesconto, buscarConta } = useRecompensas();
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(DescontoSchema),
    defaultValues: {
      contratoId: '',
      valor: '', 
    },
  });

  const valorRaw = watch('valor');
  const contratoIdWatch = watch('contratoId');

  // Valor numérico para cálculos de interface (prévia e botão de desabilitar)
  const valorNumerico = useMemo(() => {
    if (!valorRaw) return 0;
    const cleaned = String(valorRaw).replace(/\D/g, '');
    return parseFloat(cleaned) / 100;
  }, [valorRaw]);

  const contratoSelecionado = useMemo(() => 
    (Array.isArray(contratos) ? contratos.find((c) => c._id === contratoIdWatch) : null)
  , [contratos, contratoIdWatch]);

  useEffect(() => {
    if (open) {
      buscarConta(); // Mantendo sincronizado se necessário
      const fetchContratos = async () => {
        try {
          setLoadingContratos(true);
          const token = Cookies.get('jwt_access_token');
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}recompensa/contratos/cliente`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setContratos(response.data.contratos || []);
        } catch (err) {
          console.error('Erro ao buscar contratos:', err);
        } finally {
          setLoadingContratos(false);
        }
      };
      fetchContratos();
    }
  }, [open, buscarConta]);

  const handleValorChange = (event) => {
    const { value } = event.target;
    const apenasNumeros = value.replace(/\D/g, '');
    if (!apenasNumeros) {
      setValue('valor', '');
      return;
    }
    const formatado = (parseFloat(apenasNumeros) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue('valor', formatado, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validação baseada na prop saldoDisponivel (igual ao SolicitarPixDialog)
      if (data.valor > saldoDisponivel) {
        setError('valor', { message: 'Saldo insuficiente' });
        return;
      }

      if (contratoSelecionado && data.valor > contratoSelecionado.valor) {
        setError('valor', { message: 'Desconto não pode ser maior que o valor da parcela' });
        return;
      }

      await solicitarDesconto(data.contratoId, data.valor);
      handleClose();
    } catch (err) {
      console.error('Erro ao solicitar desconto:', err);
    }
  });

  const handleUseMaxValue = () => {
    // Se o saldo for maior que o contrato, o "máximo" deve ser o valor do contrato
    const limite = contratoSelecionado && saldoDisponivel > contratoSelecionado.valor 
      ? contratoSelecionado.valor 
      : saldoDisponivel;

    const formatado = limite.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue('valor', formatado, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar Desconto</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Use seu saldo de recompensas para abater o valor da sua próxima fatura.
          </Typography>

          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ p: 2, borderRadius: 1, bgcolor: 'success.lighter' }}
          >
            <Typography variant="subtitle2" color="success.darker">Saldo disponível:</Typography>
            <Typography variant="h6" color="success.darker">{fCurrency(saldoDisponivel)}</Typography>
          </Stack>

          <TextField
            select
            {...register('contratoId')}
            label="Selecione o Contrato"
            fullWidth
            disabled={loadingContratos}
            error={!!errors.contratoId}
            helperText={errors.contratoId?.message}
          >
            {contratos.map((contrato) => (
              <MenuItem key={contrato._id} value={contrato._id}>
                {contrato.titulo || `Contrato ${contrato._id.substring(0, 8)}`} - ({fCurrency(contrato.valor)})
              </MenuItem>
            ))}
          </TextField>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Valor do abatimento</Typography>
              <Button 
                size="small" 
                onClick={handleUseMaxValue}
                disabled={saldoDisponivel === 0 || !contratoIdWatch}
              >
                Usar máximo
              </Button>
            </Stack>

            <TextField
              {...register('valor')}
              label="Valor"
              fullWidth
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              error={!!errors.valor}
              helperText={errors.valor?.message}
              InputLabelProps={{ shrink: !!valorRaw }}
            />

            {valorNumerico > saldoDisponivel && (
              <Typography variant="caption" color="error">
                Saldo insuficiente (Disponível: {fCurrency(saldoDisponivel)})
              </Typography>
            )}
          </Stack>

          {contratoSelecionado && valorNumerico > 0 && valorNumerico <= contratoSelecionado.valor && (
            <Stack
              spacing={1}
              sx={{ p: 2, borderRadius: 1, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}
            >
              <Typography variant="subtitle2" color="info.darker">📋 Resumo do Desconto</Typography>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Valor original:</Typography>
                  <Typography variant="body2">{fCurrency(contratoSelecionado.valor)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="success.main">Abatimento solicitado:</Typography>
                  <Typography variant="body2" color="success.main">- {fCurrency(valorNumerico)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, mt: 1, borderTop: '1px dashed', borderColor: 'info.main' }}>
                  <Typography variant="subtitle2">Valor final da fatura:</Typography>
                  <Typography variant="h6" color="info.darker">{fCurrency(contratoSelecionado.valor - valorNumerico)}</Typography>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <LoadingButton
          variant="contained"
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={valorNumerico > saldoDisponivel || valorNumerico === 0 || !contratoIdWatch}
        >
          Solicitar Desconto
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}