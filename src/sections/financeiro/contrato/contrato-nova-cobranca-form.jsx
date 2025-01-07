import dayjs from 'dayjs';
import { toast } from 'sonner';
import { z as zod } from 'zod';
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

import { today } from 'src/utils/format-time';

import { atualizarCobrancaPorId, criarCobrancasPorContrato } from 'src/actions/financeiro';

const cobrancaSchema = zod.object({
  observacoes: zod.string().min(1, 'Descrição é obrigatória'),
  valor: zod.string().min(1, 'Valor é obrigatório'),
  dataVencimento: zod.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
});

const formatCurrency = (value) => {
  const numberValue = Number(value.replace(/[^\d]/g, '')) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrency = (formattedValue) => {
  const sanitizedValue = formattedValue.replace(/[R$\s]/g, '');
  const normalizedValue = sanitizedValue.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalizedValue);
};

const NovaCobrancaForm = ({ open, handleClose, contrato, fetchCobrancas, cobrancaAtual }) => {
  const [observacoes, setObservacoes] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [dataVencimento, setDataVencimento] = useState(dayjs(today()));
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
          cobrancaAtual?.valor?.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          }) || ''
        );
        setDataVencimento(
          cobrancaAtual?.dataVencimento ? dayjs(cobrancaAtual.dataVencimento) : dayjs(today())
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
      toast.error(
        `Erro ao criar/editar cobrança: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
      fullWidth
    >
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
              rows={6}
              label="Descrição"
              error={!observacoes}
              helperText={!observacoes && 'Descrição é obrigatória'}
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
                  error={!dataVencimento}
                  helperText={!dataVencimento && 'Data de vencimento é obrigatória'}
                  disabled={!!cobrancaAtual?.boleto}
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
              error={!formattedValue}
              helperText={!formattedValue && 'Valor é obrigatório'}
              disabled={!!cobrancaAtual?.boleto}
            />
          </Grid>

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
          disabled={!observacoes || !formattedValue || !dataVencimento}
        >
          {cobrancaAtual ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NovaCobrancaForm;
