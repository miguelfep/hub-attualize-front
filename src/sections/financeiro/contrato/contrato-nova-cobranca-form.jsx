import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Dialog,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { atualizarCobrancaPorId, criarCobrancasPorContrato } from 'src/actions/financeiro';

import { getUser } from 'src/auth/context/jwt';

const user = getUser();

const formatCurrency = (value) => {
  const numberValue = Number(value.replace(/[^\d]/g, '')) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrency = (formattedValue) => {
  const sanitizedValue = formattedValue.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(sanitizedValue);
};

const NovaCobrancaForm = ({ open, handleClose, contrato, fetchCobrancas, cobrancaAtual }) => {
  const [observacoes, setObservacoes] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [dataVencimento, setDataVencimento] = useState(dayjs());
  const [status, setStatus] = useState('EMABERTO');

  useEffect(() => {
    if (open) {
      if (contrato.tipoContrato === 'parceiroid') {
        const descricaoObservacoes = contrato.items
          .map((item) => item.descricao)
          .join('\n');
        const valorTotal = contrato.items.reduce(
          (acc, item) => acc + item.valorUnitario * item.quantidade,
          0
        );
        setObservacoes(descricaoObservacoes);
        setFormattedValue(valorTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }));
      } else {
        setObservacoes(cobrancaAtual?.observacoes || '');
        setFormattedValue(
          cobrancaAtual?.valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }) || ''
        );
        setDataVencimento(
          cobrancaAtual?.dataVencimento ? dayjs(cobrancaAtual.dataVencimento) : dayjs()
        );
        setStatus(cobrancaAtual?.status || 'EMABERTO');
      }
    }
  }, [open, contrato, cobrancaAtual]);

  const handleValorChange = (event) => {
    const rawValue = event.target.value;
    setFormattedValue(formatCurrency(rawValue));
  };

  const handleCreateOrUpdate = async () => {
    try {
      const parsedValue = parseCurrency(formattedValue);
      const data = {
        observacoes,
        valor: parsedValue,
        dataVencimento: dataVencimento.toDate(),
        contrato: contrato._id,
        status,
      };

      if (cobrancaAtual && cobrancaAtual.boleto && status === cobrancaAtual.status) {
        toast.error('Não é possível alterar os detalhes de uma cobrança com boleto gerado.');
        return;
      }

      if (cobrancaAtual) {
        await atualizarCobrancaPorId(cobrancaAtual._id, data);
        toast.success('Cobrança atualizada com sucesso!');
      } else {
        await criarCobrancasPorContrato(data);
        toast.success('Cobrança criada com sucesso!');
      }

      await fetchCobrancas();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar/editar cobrança:', error);
      toast.error(`Erro ao criar/editar cobrança: ${error.response?.data?.message || error.message}`);
    }
  };

  const isAdmin = user.role === 'admin';
  const isFinanceiro = user.role === 'financeiro';

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" fullWidth>
      <DialogTitle id="form-dialog-title">
        {cobrancaAtual ? 'Editar Cobrança' : 'Nova Cobrança'}
      </DialogTitle>
      <DialogContent sx={{ marginTop: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={4}
              label="Descrição"
              disabled={!!cobrancaAtual?.boleto}
            />
          </Grid>

          <Grid item xs={12}>
            <DatePicker
              label="Data de Vencimento"
              value={dataVencimento}
              onChange={(newValue) => setDataVencimento(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  disabled={!isAdmin && !isFinanceiro}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Valor"
              fullWidth
              value={formattedValue}
              onChange={handleValorChange}
              disabled={!isAdmin && !isFinanceiro}
            />
          </Grid>

          {isAdmin && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status da Cobrança</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status da Cobrança"
                >
                  <MenuItem value="RECEBIDO">Pago</MenuItem>
                  <MenuItem value="EMABERTO">Pendente</MenuItem>
                  <MenuItem value="CANCELADO">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleCreateOrUpdate}
          color="primary"
          variant="contained"
          disabled={(!observacoes || !formattedValue || !dataVencimento) || (!isAdmin && !isFinanceiro)}
        >
          {cobrancaAtual ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NovaCobrancaForm;